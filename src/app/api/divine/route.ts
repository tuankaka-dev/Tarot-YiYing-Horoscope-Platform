import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/divine — not used, POST only
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// POST /api/divine — Get AI interpretation
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Pre-check and deduct 10 xu for deep AI interpretation
        const currentProfile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { credits: true, is_pro: true }
        } as any);

        if (!currentProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // PRO users don't need credits and don't get deducted
        if (!(currentProfile as any).is_pro) {
            if (currentProfile.credits < 10) {
                return NextResponse.json(
                    { error: 'Không đủ xu để giải quẻ chuyên sâu. Vui lòng mua thêm xu hoặc nâng cấp Premium.' },
                    { status: 402 }
                );
            }

            await prisma.profile.update({
                where: { id: user.id },
                data: { credits: { decrement: 10 } }
            });
        }

        const body = await request.json();
        const { mainHexagramId, changingHexagramId, changingLines, question, historyId } = body;

        if (!mainHexagramId || !question) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch hexagram data
        const mainHexagram = await prisma.hexagram.findUnique({ where: { id: mainHexagramId } });
        if (!mainHexagram) {
            return NextResponse.json({ error: 'Hexagram not found' }, { status: 404 });
        }

        let changingHexagram = null;
        if (changingHexagramId) {
            changingHexagram = await prisma.hexagram.findUnique({ where: { id: changingHexagramId } });
        }

        // Read active API config from database
        const apiConfig = await prisma.apiConfig.findFirst({
            where: { status: 'active' },
        });

        if (!apiConfig) {
            return NextResponse.json({ error: 'No active AI configuration found. Please contact admin.' }, { status: 500 });
        }

        // Build prompt
        const prompt = buildPrompt(mainHexagram, changingHexagram, changingLines, question);

        // Call AI API based on provider
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
            console.error('AI API call failed:', aiError);
            
            // Refund 10 xu
            await prisma.profile.update({
                where: { id: user.id },
                data: { credits: { increment: 10 } }
            });

            const message = aiError instanceof Error ? aiError.message : 'Lỗi không xác định';
            return NextResponse.json(
                { error: `Lỗi khi gọi AI: ${message}` },
                { status: 502 }
            );
        }

        // Save to history
        try {
            if (historyId) {
                await prisma.userHistory.update({
                    where: { id: historyId },
                    data: { ai_response: aiResponseText },
                });
            } else {
                await prisma.userHistory.create({
                    data: {
                        user_id: user.id,
                        question,
                        main_hexagram_id: mainHexagramId,
                        changing_hexagram_id: changingHexagramId,
                        changing_lines: changingLines || [],
                        ai_response: aiResponseText,
                    },
                });
            }
        } catch (historyErr) {
            console.error('Failed to update/create history:', historyErr);
            // Non-fatal error, we still return the AI response to user
        }

        // Return as streamed text
        return new Response(aiResponseText, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Divine API error:', error);
        const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
        return NextResponse.json(
            { error: `Lỗi máy chủ: ${message}` },
            { status: 500 }
        );
    }
}

// ============================================================
// Prompt Builder
// ============================================================

function buildPrompt(
    mainHex: { name: string; chinese_name: string; meaning: string; description: string; trigram_above: string; trigram_below: string },
    changingHex: { name: string; chinese_name: string; meaning: string; description: string } | null,
    changingLines: number[],
    question: string
): string {
    let prompt = `Bạn là một bậc thầy Kinh Dịch uyên thâm, am hiểu sâu sắc triết học Trung Hoa, Đạo giáo và trí tuệ cổ xưa. Bạn đưa ra những lời giải quẻ sâu sắc, uyên bác nhưng dễ hiểu và gần gũi. Hãy trả lời hoàn toàn bằng tiếng Việt.

Một người cầu quẻ đã tung đồng xu và nhận được kết quả gieo quẻ như sau:

📋 **Câu hỏi:** "${question}"

☰ **Quẻ Chính:** ${mainHex.name} (${mainHex.chinese_name})
- Thượng quái: ${mainHex.trigram_above}
- Hạ quái: ${mainHex.trigram_below}
- Ý nghĩa cốt lõi: ${mainHex.meaning}
- Mô tả: ${mainHex.description}`;

    if (changingHex && changingLines.length > 0) {
        prompt += `

🔄 **Hào động:** Hào ${changingLines.join(', ')} đang biến đổi.

☰ **Quẻ Biến:** ${changingHex.name} (${changingHex.chinese_name})
- Ý nghĩa cốt lõi: ${changingHex.meaning}
- Mô tả: ${changingHex.description}`;
    }

    prompt += `

Hãy đưa ra lời giải quẻ Kinh Dịch toàn diện bằng tiếng Việt, bao gồm:

1. **Tổng Quan Tình Hình** — Quẻ chính nói gì về câu hỏi của người cầu quẻ?
2. **Những Lời Chỉ Dẫn Sâu Sắc** — Trí tuệ và bài học sâu xa từ quẻ này.${changingHex ? '\n3. **Sự Chuyển Hóa** — Các hào động có ý nghĩa gì? Tình hình đang chuyển biến thế nào từ quẻ chính sang quẻ biến?' : ''
        }
${changingHex ? '4' : '3'}. **Lời Khuyên Thực Tế** — Hướng dẫn cụ thể, thiết thực mà người cầu quẻ có thể áp dụng.
${changingHex ? '5' : '4'}. **Lời Kết** — Một câu châm ngôn hoặc lời dạy cổ xưa bao quát tinh hoa của quẻ này.

Sử dụng giọng văn ấm áp, uyên bác. Kết hợp chiều sâu triết học với sự rõ ràng thực tế. Giữ câu trả lời có cấu trúc rõ ràng nhưng tự nhiên — không quá hình thức.`;

    return prompt;
}

// ============================================================
// AI Provider Implementations
// ============================================================

async function callGeminiAPI(
    config: { base_url: string; api_key: string; headers: unknown },
    prompt: string
): Promise<string> {
    const url = `${config.base_url}/models/gemini-2.0-flash:generateContent?key=${config.api_key}`;

    const customHeaders = (config.headers && typeof config.headers === 'object')
        ? config.headers as Record<string, string>
        : {};

    const body = JSON.stringify({
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
        },
    });

    // Retry up to 3 times for rate limiting (429)
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [5000, 15000, 30000]; // 5s, 15s, 30s — Gemini free tier needs longer waits

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders,
            },
            body,
        });

        if (response.ok) {
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
        }

        const errBody = await response.text();
        console.error(`Gemini API error (attempt ${attempt + 1}/${MAX_RETRIES}, status ${response.status}):`, errBody.substring(0, 300));

        // Rate limited — wait and retry
        if (response.status === 429 && attempt < MAX_RETRIES - 1) {
            console.log(`Gemini rate limited, retrying in ${RETRY_DELAYS[attempt] / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
            continue;
        }

        // Final error handling
        if (response.status === 429) {
            throw new Error('API Gemini đang quá tải (rate limit). Vui lòng đợi 1-2 phút và thử lại.');
        } else if (response.status === 401 || response.status === 403) {
            throw new Error('API key không hợp lệ. Vui lòng kiểm tra cấu hình trong trang Quản Trị > Cấu Hình API.');
        } else if (response.status === 404) {
            throw new Error('Model AI không tồn tại. Vui lòng liên hệ admin.');
        } else {
            // Parse error message from Gemini response
            let detail = '';
            try {
                const errJson = JSON.parse(errBody);
                detail = errJson?.error?.message || '';
            } catch { /* ignore */ }
            throw new Error(`Lỗi Gemini API (${response.status}): ${detail || 'Lỗi không xác định'}`);
        }
    }

    throw new Error('Đã hết số lần thử lại. Vui lòng thử lại sau 1-2 phút.');
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
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a wise master of the I Ching.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('OpenAI API error:', err);
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
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
        body: JSON.stringify({
            prompt,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();
    // Try common response formats
    return (
        data.response ||
        data.text ||
        data.content ||
        data.choices?.[0]?.message?.content ||
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        JSON.stringify(data)
    );
}
