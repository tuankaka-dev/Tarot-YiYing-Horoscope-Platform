import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function normalizeHost(host: string) {
    return host.toLowerCase().split(':')[0];
}

function getRequestProtocol(request: NextRequest) {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    if (forwardedProto) {
        return forwardedProto.split(',')[0].trim();
    }
    return request.nextUrl.protocol.replace(':', '');
}

function getRequestHost(request: NextRequest) {
    return request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
}

export async function middleware(request: NextRequest) {
    const { method } = request;
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    const isWebhook =
        request.nextUrl.pathname.startsWith('/api/payment/webhook') ||
        request.nextUrl.pathname.startsWith('/api/payos/webhook');

    // CSRF Protection: Verify Origin matches Host for state-changing requests
    if (isMutation && !isWebhook) {
        const origin = request.headers.get('origin') || request.headers.get('referer');
        const host = getRequestHost(request);

        if (!origin || !host) {
            return NextResponse.json({ error: 'Missing Origin or Host header' }, { status: 403 });
        }

        try {
            const originUrl = new URL(origin);
            if (normalizeHost(originUrl.host) !== normalizeHost(host)) {
                return NextResponse.json({ error: 'CSRF token mismatch or Invalid Origin' }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ error: 'Invalid Origin Header' }, { status: 403 });
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
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });
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

        // 1. Check admin role via JWT claims
        let isAdmin = false;
        const userMetaRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role.toLowerCase() : '';
        const appMetaRole = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role.toLowerCase() : '';

        if (userMetaRole === 'admin' || appMetaRole === 'admin') {
            isAdmin = true;
        }

        // 2. Nếu JWT không có quyền admin, gọi qua API trung gian chạy bằng Prisma (vì Prisma không hỗ trợ chạy trực tiếp trên Edge Middleware và tài khoản DB hiện tại đang chặn truy cập thẳng từ PostgREST)
        if (!isAdmin) {
            try {
                const protocol = getRequestProtocol(request);
                const host = getRequestHost(request);
                const res = await fetch(`${protocol}://${host}/api/check-admin-role`, {
                    headers: {
                        cookie: request.headers.get('cookie') || '',
                        'x-forwarded-proto': protocol,
                        'x-forwarded-host': host,
                    },
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.isAdmin === true) {
                        isAdmin = true;
                    }
                }
            } catch (err) {
                console.error('Lỗi khi gọi API check-admin-role từ middleware:', err);
            }
        }

        // 3. Nếu cả JWT và database đều không phải admin thì mới không cho vô thật
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
