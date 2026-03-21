import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

// Helper to verify admin
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { id: user.id },
                select: { role: true }
            });
            isAdmin = profile?.role === 'admin';
        } catch (e) {
            console.error('Admin API DB fallback error:', e);
        }
    }
    if (!isAdmin) return null;

    return user;
}

export async function POST(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'Missing config ID' }, { status: 400 });

        const config = await prisma.apiConfig.findUnique({ where: { id } });
        if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

        const apiKey = decrypt(config.api_key);
        const customHeaders = config.headers && typeof config.headers === 'object' ? config.headers as Record<string, string> : {};

        let isSuccess = false;
        let message = '';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            if (config.provider === 'gemini') {
                const url = `${config.base_url}/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...customHeaders },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Reply "OK"' }] }],
                        generationConfig: { maxOutputTokens: 5 }
                    }),
                    signal: controller.signal
                });
                
                if (res.ok) {
                    isSuccess = true;
                    message = 'Kết nối thành công!';
                } else {
                    const err = await res.text();
                    message = `Lỗi (${res.status}): ${err.substring(0, 150)}`;
                }
            } else if (config.provider === 'openai') {
                const url = `${config.base_url}/chat/completions`;
                
                // Dynamically infer model for deepseek/groq or default gpt-4o-mini
                const model = config.base_url.includes('deepseek') ? 'deepseek-chat' :
                             config.base_url.includes('groq') ? 'llama3-8b-8192' : 'gpt-4o-mini';
                             
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        ...customHeaders
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: 'Say exactly "OK"' }],
                        max_tokens: 5
                    }),
                    signal: controller.signal
                });
                
                if (res.ok) {
                    isSuccess = true;
                    message = 'Kết nối thành công!';
                } else {
                    const err = await res.text();
                    message = `Lỗi (${res.status}): ${err.substring(0, 150)}`;
                }
            } else {
                message = 'Trình kiểm tra chưa hỗ trợ Custom provider';
            }
        } catch (fetchErr: any) {
            message = fetchErr.name === 'AbortError' ? 'Lỗi: Timeout không phản hồi' : `Lỗi mạng: ${fetchErr.message}`;
        } finally {
            clearTimeout(timeoutId);
        }

        return NextResponse.json({ success: isSuccess, message });

    } catch (error: any) {
        console.error('Test API error:', error);
        return NextResponse.json({ error: error.message || 'Lỗi hệ thống' }, { status: 500 });
    }
}
