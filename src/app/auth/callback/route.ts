import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OAUTH_EXCHANGE_TIMEOUT_MS = 10000;

function getAppOrigin(request: Request) {
    const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (
        configuredBase &&
        /^https?:\/\//i.test(configuredBase) &&
        !(process.env.NODE_ENV === 'production' && configuredBase.includes('localhost'))
    ) {
        return configuredBase.replace(/\/$/, '');
    }

    const url = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim();
    const host = forwardedHost || request.headers.get('host') || url.host;
    const protocol = forwardedProto || url.protocol.replace(':', '');
    return `${protocol}://${host}`;
}

function sanitizeNextPath(next: string | null) {
    if (!next || !next.startsWith('/')) {
        return '/dashboard';
    }
    if (next.startsWith('//')) {
        return '/dashboard';
    }
    if (!next.startsWith('/dashboard')) {
        return '/dashboard';
    }
    return next;
}

async function exchangeCodeWithTimeout(code: string) {
    const supabase = await createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
        return await Promise.race([
            supabase.auth.exchangeCodeForSession(code),
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error('OAuth code exchange timeout')), OAUTH_EXCHANGE_TIMEOUT_MS);
            }),
        ]);
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
}

export async function GET(request: Request) {
    const requestId = crypto.randomUUID();

    try {
        const { searchParams } = new URL(request.url);
        const appOrigin = getAppOrigin(request);
        const code = searchParams.get('code');
        const next = sanitizeNextPath(searchParams.get('next'));

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error(`[OAuth ${requestId}] Missing Supabase env vars for OAuth callback`);
            return NextResponse.redirect(`${appOrigin}/login?error=missing_supabase_env`);
        }

        if (code) {
            const exchangeResult = await exchangeCodeWithTimeout(code);

            const { data, error } = exchangeResult;
            if (!error && data.session?.user) {
                return NextResponse.redirect(`${appOrigin}${next}`);
            }

            if (error) {
                console.error(`[OAuth ${requestId}] OAuth code exchange failed:`, error.message);
            }
        }

        return NextResponse.redirect(`${appOrigin}/login?error=auth_error`);
    } catch (error) {
        console.error(`[OAuth ${requestId}] OAuth callback crashed:`, error);
        const appOrigin = getAppOrigin(request);
        return NextResponse.redirect(`${appOrigin}/login?error=auth_callback_failed&id=${requestId}`);
    }
}
