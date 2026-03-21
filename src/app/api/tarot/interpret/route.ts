import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        let { question, spreadType, cardIds } = body;

        const MAX_QUESTION_LENGTH = 500;
        if (typeof question !== 'string' || question.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid question' }, { status: 400 });
        }
        if (question.length > MAX_QUESTION_LENGTH) {
            return NextResponse.json(
                { error: `Question must be less than ${MAX_QUESTION_LENGTH} characters` },
                { status: 400 }
            );
        }
        question = question.trim();

        if (!spreadType || !Array.isArray(cardIds) || cardIds.length === 0) {
            return NextResponse.json({ error: 'Missing req fields or invalid layout' }, { status: 400 });
        }

        // Fetch card data
        const cards = await prisma.tarotCard.findMany({
            where: { id: { in: cardIds } },
        });

        if (cards.length === 0) {
            return NextResponse.json({ error: 'Cards not found' }, { status: 404 });
        }

        // Read active API config
        const apiConfig = await prisma.apiConfig.findFirst({
            where: { status: 'active' },
        });

        if (!apiConfig) {
            return NextResponse.json({ error: 'No active AI configuration found.' }, { status: 500 });
        }

        apiConfig.api_key = decrypt(apiConfig.api_key);

        // Build prompt
        const prompt = buildTarotPrompt(cards, spreadType, question);

        // Call AI API
        let aiResponseText = '';
        try {
            if (apiConfig.provider === 'gemini') {
                aiResponseText = await callGeminiAPI(apiConfig, prompt);
            } else if (apiConfig.provider === 'openai') {
                aiResponseText = await callOpenAIAPI(apiConfig, prompt);
            } else {
                aiResponseText = await callCustomAPI(apiConfig, prompt);
            }
        } catch (aiError) {
            console.error('Tarot API AI call error for user:', {
                userId: user.id,
                timestamp: new Date().toISOString(),
                error: aiError instanceof Error ? aiError.message : String(aiError),
            });
            const message = aiError instanceof Error ? aiError.message : 'Lỗi không xác định';
            return NextResponse.json({ error: `Lỗi khi gọi AI: ${message}` }, { status: 502 });
        }

        // Save to history
        try {
            await prisma.tarotReading.create({
                data: {
                    user_id: user.id,
                    question,
                    spread_type: spreadType,
                    card_ids: cardIds,
                    ai_response: aiResponseText,
                },
            });
        } catch (historyErr) {
            console.error('Failed to save tarot reading:', historyErr);
        }

        return new Response(aiResponseText, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error) {
        console.error('Tarot API critical error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
        return NextResponse.json({ error: `Lỗi máy chủ: ${message}` }, { status: 500 });
    }
}

function buildTarotPrompt(cards: any[], spreadType: string, question: string): string {
    const spreadNames = {
        one: 'Trải 1 Lá (Câu trả lời trực tiếp)',
        three: 'Trải 3 Lá (Quá khứ - Hiện tại - Tương lai)',
        five: 'Trải 5 Lá (Tình huống - Thách thức - Quá khứ - Tương lai - Kết quả)',
    };

    let prompt = `Bạn là một chuyên gia Tarot uyên thâm, am hiểu sâu sắc về biểu tượng và ý nghĩa của từng lá bài. Bạn đưa ra những lời giải bài sâu sắc, uyên bác nhưng dễ hiểu và gần gũi. Hãy trả lời hoàn toàn bằng tiếng Việt.

Một người đã trải bài Tarot và nhận được kết quả như sau:

📋 **Câu hỏi:** "${question}"

🔮 **Kiểu trải bài:** ${spreadNames[spreadType as keyof typeof spreadNames]}

**Các lá bài được rút:**
`;

    cards.forEach((card, index) => {
        const position = spreadType === 'one' 
            ? 'Lá duy nhất'
            : spreadType === 'three'
            ? ['Quá khứ', 'Hiện tại', 'Tương lai'][index]
            : ['Tình huống', 'Thách thức', 'Quá khứ', 'Tương lai', 'Kết quả'][index];

        prompt += `\n${index + 1}. **${position}:** ${card.name_vi} (${card.name})
   - Ý nghĩa: ${card.meaning}
   - Từ khóa: ${card.keywords}
`;
    });

    prompt += `\nHãy đưa ra lời giải bài Tarot toàn diện bằng tiếng Việt, bao gồm:

1. **Tổng Quan** — Bức tranh tổng thể mà các lá bài vẽ nên về câu hỏi.
2. **Giải Thích Từng Lá** — Ý nghĩa chi tiết của từng lá bài trong vị trí của nó.
3. **Thông Điệp Chính** — Lời khuyên và hướng dẫn từ các lá bài.
4. **Lời Kết** — Một câu tóm tắt tinh hoa của bài giải.

Sử dụng giọng văn ấm áp, uyên bác. Kết hợp chiều sâu tâm linh với sự rõ ràng thực tế.`;

    return prompt;
}

async function callGeminiAPI(config: any, prompt: string): Promise<string> {
    const url = `${config.base_url}/models/gemini-2.0-flash:generateContent?key=${config.api_key}`;
    const customHeaders = (config.headers && typeof config.headers === 'object') ? config.headers as Record<string, string> : {};

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...customHeaders },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
    } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
            throw new Error('API request timeout sau 25 giây');
        }
        throw fetchErr;
    }

    if (!response.ok) {
        const errBody = await response.text();
        let detail = '';
        try {
            const errJson = JSON.parse(errBody);
            detail = errJson?.error?.message || '';
        } catch (parseError) {
            detail = errBody.substring(0, 200);
        }
        throw new Error(`Gemini API error (${response.status}): ${detail}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
}

async function callOpenAIAPI(config: any, prompt: string): Promise<string> {
    const url = `${config.base_url}/chat/completions`;
    const customHeaders = (config.headers && typeof config.headers === 'object') ? config.headers as Record<string, string> : {};

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
            ...customHeaders,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a wise Tarot reader.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
}

async function callCustomAPI(config: any, prompt: string): Promise<string> {
    const customHeaders = (config.headers && typeof config.headers === 'object') ? config.headers as Record<string, string> : {};

    const response = await fetch(config.base_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
            ...customHeaders,
        },
        body: JSON.stringify({ prompt, max_tokens: 2048 }),
    });

    if (!response.ok) {
        throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || data.text || data.content || JSON.stringify(data);
}
