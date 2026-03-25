import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { divineRateLimiter } from '@/lib/rate-limit';

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(request: NextRequest) {
    try {
        try {
            divineRateLimiter.checkNext(request, 5);
        } catch {
            return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.' }, { status: 429 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentSession = await supabase.auth.getSession();
        if (!currentSession.data.session) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

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
                    { error: 'Không đủ xu để luận giải chuyên sâu. Vui lòng mua thêm xu hoặc nâng cấp Gói.' },
                    { status: 402 }
                );
            }
        }

        const body = await request.json();
        const question = typeof body?.question === 'string' ? body.question.trim() : '';
        const chartText = typeof body?.chartText === 'string' ? body.chartText.trim() : '';

        if (!question || question.length < 5) {
            return NextResponse.json({ error: 'Câu hỏi quá ngắn.' }, { status: 400 });
        }

        if (!chartText) {
            return NextResponse.json({ error: 'Thiếu dữ liệu toàn văn lá số.' }, { status: 400 });
        }

        const apiConfig = await prisma.apiConfig.findFirst({ where: { status: 'active' } });
        if (!apiConfig) {
            return NextResponse.json({ error: 'Hệ thống đang bảo trì, vui lòng thử lại sau.' }, { status: 500 });
        }

        apiConfig.api_key = decrypt(apiConfig.api_key);

        const prompt = buildPrompt(question, chartText);

        let aiResponseText = '';
        try {
            if (apiConfig.provider === 'gemini') {
                aiResponseText = await callGeminiAPI(apiConfig, prompt);
            } else if (apiConfig.provider === 'openai') {
                aiResponseText = await callOpenAIAPI(apiConfig, prompt);
            } else {
                aiResponseText = await callCustomAPI(apiConfig, prompt);
            }
            aiResponseText = sanitizeInterpretationText(aiResponseText);
        } catch (aiError) {
            console.error('TuVi deep interpretation AI error:', aiError);

            if (!profile.is_pro) {
                await prisma.profile.update({
                    where: { id: user.id },
                    data: { credits: { increment: 10 } },
                });
            }

            return NextResponse.json(
                { error: 'Kết nối AI đang gián đoạn. Vui lòng thử lại sau.' },
                { status: 502 }
            );
        }

        return new Response(aiResponseText, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('TuVi interpret API critical error:', error);
        return NextResponse.json(
            { error: 'Hệ thống đang bận. Vui lòng thử lại sau.' },
            { status: 500 }
        );
    }
}

function buildPrompt(question: string, chartText: string): string {
    return `Bạn là chuyên gia Tử Vi Đẩu Số. Hãy luận giải CHUYÊN SÂU bằng tiếng Việt, xưng là tôi và gọi người hỏi là bạn.

Dữ liệu lá số toàn văn:
${chartText}

Câu hỏi trọng tâm của người dùng:
${question}

Yêu cầu bắt buộc:
- Luận giải bám sát dữ liệu lá số đã cho, không nói chung chung.
- Ưu tiên trả lời đúng trọng tâm câu hỏi (đặc biệt các câu về đại vận, tiểu vận theo tuổi).
- Có 4 phần rõ ràng: 1) Tổng quan ngắn 2) Luận chi tiết 3) Điểm thuận/lưu ý 4) Gợi ý hành động thực tế.
- Chỉ trả về văn bản thuần, không markdown, không bullet ký hiệu.`;
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

async function callGeminiAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const url = `${config.base_url}/models/gemini-2.0-flash:generateContent?key=${config.api_key}`;

    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? config.headers as Record<string, string>
        : {};

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...customHeaders,
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 2048,
            },
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errBody.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
}

async function callOpenAIAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const url = `${config.base_url}/chat/completions`;

    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? config.headers as Record<string, string>
        : {};

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api_key}`,
            ...customHeaders,
        },
        body: JSON.stringify({
            model: config.base_url.includes('deepseek') ? 'deepseek-chat' :
                config.base_url.includes('groq') ? 'llama-3.1-70b-versatile' : 'gpt-4',
            messages: [
                { role: 'system', content: 'You are an expert Zi Wei Dou Shu consultant.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errBody.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Không có phản hồi từ AI.';
}

async function callCustomAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? config.headers as Record<string, string>
        : {};

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
        const errBody = await response.text();
        throw new Error(`Custom API error (${response.status}): ${errBody.substring(0, 200)}`);
    }

    const data = await response.json();
    return (
        data.response ||
        data.text ||
        data.content ||
        data.choices?.[0]?.message?.content ||
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        JSON.stringify(data)
    );
}
