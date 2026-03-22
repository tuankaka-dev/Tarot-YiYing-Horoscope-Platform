import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OAUTH_EXCHANGE_TIMEOUT_MS = 10000;

function sanitizeNextPath(next: string | null) {
    if (!next || !next.startsWith('/')) {
        return '/dashboard';
    }
    if (next.startsWith('//')) {
        return '/dashboard';
    }
    return next;
}

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get('code');
        const next = sanitizeNextPath(searchParams.get('next'));

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase env vars for OAuth callback');
            return NextResponse.redirect(`${origin}/login?error=missing_supabase_env`);
        }

        if (code) {
            const supabase = await createClient();

            const exchangeResult = await Promise.race([
                supabase.auth.exchangeCodeForSession(code),
                new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('OAuth code exchange timeout')), OAUTH_EXCHANGE_TIMEOUT_MS);
                }),
            ]);

            const { data, error } = exchangeResult;
            if (!error && data.session?.user) {
                return NextResponse.redirect(`${origin}${next}`);
            }

            if (error) {
                console.error('OAuth code exchange failed:', error.message);
            }
        }

        return NextResponse.redirect(`${origin}/login?error=auth_error`);
    } catch (error) {
        console.error('OAuth callback crashed:', error);
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
}
