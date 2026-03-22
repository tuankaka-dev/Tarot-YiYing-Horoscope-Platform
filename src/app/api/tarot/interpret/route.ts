import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { checkAndResetCredits } from '@/lib/credits';
import { divineRateLimiter } from '@/lib/rate-limit';
import { ensureTarotInfrastructure } from '@/lib/tarot-bootstrap';

type TarotReadingRow = {
    id: string;
    question: string;
    spread_type: string;
    card_ids: unknown;
    ai_response: string;
};

type TarotCardRow = {
    id: number;
    name: string;
    name_vi: string;
    meaning: string;
    image_url: string | null;
    card_type: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    keywords: string;
};

type ParsedReadingCard = {
    id: number;
    reversed: boolean;
};

function parseCardPayload(raw: unknown): ParsedReadingCard[] {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            if (typeof entry === 'number') {
                return { id: entry, reversed: false };
            }

            if (entry && typeof entry === 'object') {
                const maybeId = Number((entry as { id?: unknown }).id);
                const reversed = Boolean((entry as { reversed?: unknown }).reversed);
                if (!Number.isNaN(maybeId) && maybeId > 0) {
                    return { id: maybeId, reversed };
                }
            }

            return null;
        })
        .filter((item): item is ParsedReadingCard => item !== null);
}

function sanitizeInterpretationText(raw: string): string {
    if (!raw) return '';

    return raw
        .replace(/\r\n/g, '\n')
        .replace(/^\s{0,3}#{1,6}\s*/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/^\s*[-*•]+\s+/gm, '')
        .replace(/^\s*\d+[.)]\s+/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function buildTarotPrompt(
    question: string,
    spreadType: string,
    cards: Array<TarotCardRow & { reversed: boolean }>
): string {
    const spreadText =
        spreadType === 'one_card'
            ? 'Trải bài 1 lá'
            : spreadType === 'three_card'
              ? 'Trải bài 3 lá'
              : 'Trải bài 5 lá';

    const cardLines = cards
        .map((card, index) => {
            const orientation = card.reversed ? 'Ngược' : 'Thuận';
            const suitText = card.suit ? `, Bộ: ${card.suit}` : '';
            return `Lá ${index + 1}: ${card.name_vi} (${card.name}) - ${orientation}${suitText}. Từ khóa: ${card.keywords}. Ý nghĩa: ${card.meaning}`;
        })
        .join('\n');

    return `Bạn là chuyên gia Tarot giàu kinh nghiệm, trả lời bằng tiếng Việt, giọng văn rõ ràng, sâu sắc, thực tế.

Câu hỏi của người dùng: "${question}"
Kiểu trải bài: ${spreadText}

Các lá đã rút:
${cardLines}

Hãy đưa ra thông điệp chuyên sâu gồm:
1) Tổng quan năng lượng hiện tại từ trải bài.
2) Điểm thuận lợi và rủi ro cần lưu ý.
3) Hành động cụ thể nên làm trong ngắn hạn.
4) Lời khuyên kết thúc ngắn gọn và dễ áp dụng.

Yêu cầu định dạng:
- Chỉ văn bản thuần.
- Không markdown, không bullet ký tự đặc biệt.`;
}

async function callGeminiAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? (config.headers as Record<string, string>)
        : {};

    const response = await fetch(
        `${config.base_url}/models/gemini-2.0-flash:generateContent?key=${config.api_key}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1600,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAIAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? (config.headers as Record<string, string>)
        : {};

    const response = await fetch(`${config.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
            ...customHeaders,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.8,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
}

async function callCustomAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? (config.headers as Record<string, string>)
        : {};

    const response = await fetch(config.base_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
            ...customHeaders,
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.text || data?.content || data?.response || '';
}

export async function POST(request: NextRequest) {
    let shouldRefund = false;

    try {
        await ensureTarotInfrastructure();

        try {
            divineRateLimiter.checkNext(request, 5);
        } catch {
            return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentSession = await supabase.auth.getSession();
        if (!currentSession.data.session) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        const body = await request.json();
        const readingId = typeof body.readingId === 'string' ? body.readingId : '';

        if (!readingId) {
            return NextResponse.json({ error: 'Missing readingId' }, { status: 400 });
        }

        const readingRows = await prisma.$queryRaw<TarotReadingRow[]>`
            SELECT id, question, spread_type, card_ids, ai_response
            FROM tarot_readings
            WHERE id = ${readingId}::uuid AND user_id = ${user.id}::uuid
            LIMIT 1
        `;

        const reading = readingRows[0];
        if (!reading) {
            return NextResponse.json({ error: 'Không tìm thấy phiên trải bài.' }, { status: 404 });
        }

        if (reading.ai_response && reading.ai_response.trim().length > 0) {
            return new Response(reading.ai_response, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        await checkAndResetCredits(user.id);

        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { credits: true, is_pro: true },
        });

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        if (!profile.is_pro) {
            const updated = await prisma.profile.updateMany({
                where: {
                    id: user.id,
                    credits: { gte: 10 },
                },
                data: { credits: { decrement: 10 } },
            });

            if (updated.count === 0) {
                return NextResponse.json(
                    { error: 'Không đủ xu để nhận thông điệp chuyên sâu.' },
                    { status: 402 }
                );
            }

            shouldRefund = true;
        }

        const parsedCards = parseCardPayload(reading.card_ids);
        if (parsedCards.length === 0) {
            return NextResponse.json({ error: 'Dữ liệu lá bài không hợp lệ.' }, { status: 400 });
        }

        const ids = parsedCards.map((card) => card.id);
        const cardRows = await prisma.$queryRaw<TarotCardRow[]>`
            SELECT id, name, name_vi, meaning, image_url, card_type, suit, number, keywords
            FROM tarot_cards
            WHERE id IN (${Prisma.join(ids)})
        `;

        const cardMap = new Map(cardRows.map((card) => [card.id, card]));
        const orderedCards = parsedCards
            .map((entry) => {
                const card = cardMap.get(entry.id);
                if (!card) return null;
                return { ...card, reversed: entry.reversed };
            })
            .filter((card): card is TarotCardRow & { reversed: boolean } => card !== null);

        if (orderedCards.length === 0) {
            return NextResponse.json({ error: 'Không tải được lá bài để giải nghĩa.' }, { status: 400 });
        }

        const apiConfig = await prisma.apiConfig.findFirst({ where: { status: 'active' } });
        if (!apiConfig) {
            return NextResponse.json({ error: 'Hệ thống AI đang bảo trì.' }, { status: 500 });
        }

        apiConfig.api_key = decrypt(apiConfig.api_key);

        const prompt = buildTarotPrompt(reading.question, reading.spread_type, orderedCards);

        let aiResponseText = '';
        if (apiConfig.provider === 'gemini') {
            aiResponseText = await callGeminiAPI(apiConfig, prompt);
        } else if (apiConfig.provider === 'openai') {
            aiResponseText = await callOpenAIAPI(apiConfig, prompt);
        } else {
            aiResponseText = await callCustomAPI(apiConfig, prompt);
        }

        aiResponseText = sanitizeInterpretationText(aiResponseText);

        await prisma.$executeRaw`
            UPDATE tarot_readings
            SET ai_response = ${aiResponseText}
            WHERE id = ${readingId}::uuid
        `;

        return new Response(aiResponseText, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error) {
        console.error('Tarot interpretation error:', error);

        if (shouldRefund) {
            try {
                const supabase = await createClient();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    await prisma.profile.update({
                        where: { id: user.id },
                        data: { credits: { increment: 10 } },
                    });
                }
            } catch (refundError) {
                console.error('Failed to refund credits after tarot interpretation error:', refundError);
            }
        }

        return NextResponse.json({ error: 'Không thể nhận thông điệp chuyên sâu lúc này.' }, { status: 502 });
    }
}
