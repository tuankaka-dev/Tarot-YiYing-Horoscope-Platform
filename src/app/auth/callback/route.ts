import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session?.user) {
            try {
                // Ensure profile exists. If not, POST to /api/profile will create it.
                await fetch(`${origin}/api/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: data.session.user.id,
                        email: data.session.user.email,
                        full_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
                    }),
                });
            } catch (e) {
                console.error('Lỗi khi tạo profile lúc callback:', e);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
