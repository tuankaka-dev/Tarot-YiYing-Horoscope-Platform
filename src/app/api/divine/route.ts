import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { divineRateLimiter } from '@/lib/rate-limit';

// GET /api/divine — not used, POST only
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// POST /api/divine — Get AI interpretation
export async function POST(request: NextRequest) {
    try {
        try {
            // Apply rate limit: Max 5 requests per minute per IP/token
            divineRateLimiter.checkNext(request, 5);
        } catch {
            return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.' }, { status: 429 });
        }

        // Verify authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentSession = await supabase.auth.getSession();
        if (!currentSession.data.session) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        // Pre-check and deduct 10 xu for deep AI interpretation
        const currentProfile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { credits: true, is_pro: true }
        });

        if (!currentProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // PRO users don't need credits and don't get deducted
        if (!currentProfile.is_pro) {
            const updated = await prisma.profile.updateMany({
                where: {
                    id: user.id,
                    credits: { gte: 10 }
                },
                data: { credits: { decrement: 10 } }
            });

            if (updated.count === 0) {
                return NextResponse.json(
                    { error: 'Không đủ xu để giải quẻ chuyên sâu. Vui lòng mua thêm xu hoặc nâng cấp Gói' },
                    { status: 402 }
                );
            }
        }

        const body = await request.json();
        let { mainHexagramId, changingHexagramId, question } = body;
        const { changingLines, historyId } = body;

        mainHexagramId = parseInt(mainHexagramId);
        if (isNaN(mainHexagramId) || mainHexagramId < 1 || mainHexagramId > 64) {
            return NextResponse.json({ error: 'Invalid hexagram ID' }, { status: 400 });
        }

        if (changingHexagramId !== undefined && changingHexagramId !== null) {
            const parsed = parseInt(changingHexagramId);
            if (isNaN(parsed) || parsed < 1 || parsed > 64) {
                return NextResponse.json({ error: 'Invalid changing hexagram ID' }, { status: 400 });
            }
            changingHexagramId = parsed;
        }

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
            return NextResponse.json({ error: 'Hệ thống đang bảo trì, vui lòng thử lại sau.' }, { status: 500 });
        }

        // Decrypt the api_key before using it
        apiConfig.api_key = decrypt(apiConfig.api_key);

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

            aiResponseText = sanitizeInterpretationText(aiResponseText);
        } catch (aiError) {
            console.error('Divine API AI call error for user:', {
                userId: user.id,
                timestamp: new Date().toISOString(),
                error: aiError instanceof Error ? aiError.message : String(aiError),
            });

            // Refund 10 xu ONLY if user is not PRO
            if (!currentProfile.is_pro) {
                await prisma.profile.update({
                    where: { id: user.id },
                    data: { credits: { increment: 10 } }
                });
            }

            return NextResponse.json(
                { error: 'Kết nối tâm linh đang bị gián đoạn. Tín chủ vui lòng đợi 1 phút và thử lại.' },
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
        console.error('Divine API critical error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'Hệ thống đang bận. Tín chủ vui lòng thử lại sau giây lát.' },
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
    let prompt = `Bạn là một bậc thầy Kinh Dịch uyên thâm, am hiểu sâu sắc triết học Trung Hoa, Đạo giáo và trí tuệ cổ xưa. Bạn đưa ra những lời giải quẻ sâu sắc, uyên bác nhưng dễ hiểu và gần gũi. Hãy trả lời hoàn toàn bằng tiếng Việt. Xưng là tôi và gọi người cầu quẻ là tín chủ thân mến

Một người cầu quẻ đã tung đồng xu và nhận được kết quả gieo quẻ như sau:

📋 Câu hỏi: "${question}"

☰ Quẻ Chính: ${mainHex.name} (${mainHex.chinese_name})
- Thượng quái: ${mainHex.trigram_above}
- Hạ quái: ${mainHex.trigram_below}
- Ý nghĩa cốt lõi: ${mainHex.meaning}
- Mô tả: ${mainHex.description}`;

    if (changingHex && changingLines.length > 0) {
        prompt += `

🔄 Hào động: Hào ${changingLines.join(', ')} đang biến đổi.

☰ Quẻ Biến: ${changingHex.name} (${changingHex.chinese_name})
- Ý nghĩa cốt lõi: ${changingHex.meaning}
- Mô tả: ${changingHex.description}`;
    }

    prompt += `

Hãy đưa ra lời giải quẻ Kinh Dịch toàn diện bằng tiếng Việt, bao gồm:

1. Tổng Quan Tình Hình — Quẻ chính nói gì về câu hỏi của người cầu quẻ?
2. Những Lời Chỉ Dẫn Sâu Sắc — Trí tuệ và bài học sâu xa từ quẻ này.${changingHex ? '\n3. Sự Chuyển Hóa — Các hào động có ý nghĩa gì? Tình hình đang chuyển biến thế nào từ quẻ chính sang quẻ biến?' : ''
        }
${changingHex ? '4' : '3'}. Lời Khuyên — Hướng dẫn cụ thể, thiết thực mà người cầu quẻ có thể áp dụng.
${changingHex ? '5' : '4'}. Lời Kết — Một câu châm ngôn hoặc lời dạy cổ xưa bao quát tinh hoa của quẻ này.

Sử dụng giọng văn ấm áp, uyên bác. Kết hợp chiều sâu triết học với sự rõ ràng thực tế.

Định dạng bắt buộc:
- Chỉ trả về văn bản thuần (plain text), KHÔNG dùng Markdown.
- Không dùng ký tự #, **, *, -, • để tạo tiêu đề hoặc bullet.
- Viết thành các đoạn rõ ràng, mỗi mục bắt đầu bằng tên mục dạng văn xuôi (ví dụ: "Tổng quan tình hình:").`;

    return prompt;
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...customHeaders,
                },
                body,
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
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
                detail = errBody.substring(0, 200);
            }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
        response = await fetch(url, {
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
                    { role: 'system', content: 'You are a wise master of the I Ching.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 2048,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
    } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') throw new Error('API request timeout sau 25 giây');
        throw fetchErr;
    }

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
        response = await fetch(config.base_url, {
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
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
    } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') throw new Error('API request timeout sau 25 giây');
        throw fetchErr;
    }

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
