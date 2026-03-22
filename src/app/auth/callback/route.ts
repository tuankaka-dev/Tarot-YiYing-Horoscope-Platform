import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/dashboard';

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase env vars for OAuth callback');
            return NextResponse.redirect(`${origin}/login?error=missing_supabase_env`);
        }

        if (code) {
            const supabase = await createClient();
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
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
