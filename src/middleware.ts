import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { method } = request;
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    // CSRF Protection: Verify Origin matches Host for state-changing requests
    if (isMutation) {
        const origin = request.headers.get('origin') || request.headers.get('referer');
        const host = request.headers.get('host');

        if (origin && host) {
            try {
                const originUrl = new URL(origin);
                // Don't enforce CSRF on PayOS webhooks
                const isWebhook = request.nextUrl.pathname.startsWith('/api/payment/webhook');
                if (originUrl.host !== host && !isWebhook) {
                    return NextResponse.json({ error: 'CSRF token mismatch or Invalid Origin' }, { status: 403 });
                }
            } catch {
                return NextResponse.json({ error: 'Invalid Origin Header' }, { status: 403 });
            }
        }
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protect /dashboard routes
    if (pathname.startsWith('/dashboard') && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Protect /divine routes  
    if (pathname.startsWith('/divine') && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Protect /admin routes — need to check role in the database
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // Check admin role via API claims rather than DB
        let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';

        if (!isAdmin) {
            // Fallback for existing sessions before claims were implemented
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            isAdmin = profile?.role === 'admin';
        }

        if (!isAdmin) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    // Redirect authenticated users away from auth pages
    if ((pathname === '/login' || pathname === '/register') && user) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
