import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

type HistoryFilters = {
    q?: string;
    from?: Date;
    to?: Date;
};

async function verifyAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { id: user.id },
                select: { role: true },
            });
            isAdmin = profile?.role === 'admin';
        } catch (e) {
            console.error('Admin API DB fallback error:', e);
        }
    }

    return isAdmin ? user : null;
}

function parseFilters(request: NextRequest): { page: number; pageSize: number; filters: HistoryFilters } {
    const { searchParams } = request.nextUrl;

    const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const rawPageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10);
    const q = (searchParams.get('q') || '').trim();
    const fromRaw = searchParams.get('from');
    const toRaw = searchParams.get('to');

    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const pageSize = Number.isFinite(rawPageSize)
        ? Math.min(Math.max(rawPageSize, 5), 100)
        : 20;

    const filters: HistoryFilters = {};

    if (q) {
        filters.q = q;
    }

    if (fromRaw) {
        const parsed = new Date(fromRaw);
        if (!Number.isNaN(parsed.getTime())) {
            parsed.setHours(0, 0, 0, 0);
            filters.from = parsed;
        }
    }

    if (toRaw) {
        const parsed = new Date(toRaw);
        if (!Number.isNaN(parsed.getTime())) {
            parsed.setHours(23, 59, 59, 999);
            filters.to = parsed;
        }
    }

    return { page, pageSize, filters };
}

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { page, pageSize, filters } = parseFilters(request);

        const whereClause = {
            ...(filters.q
                ? {
                    OR: [
                        { profile: { email: { contains: filters.q, mode: 'insensitive' as const } } },
                        { profile: { full_name: { contains: filters.q, mode: 'insensitive' as const } } },
                        { question: { contains: filters.q, mode: 'insensitive' as const } },
                    ],
                }
                : {}),
            ...(filters.from || filters.to
                ? {
                    created_at: {
                        ...(filters.from ? { gte: filters.from } : {}),
                        ...(filters.to ? { lte: filters.to } : {}),
                    },
                }
                : {}),
        };

        const [total, histories] = await Promise.all([
            prisma.userHistory.count({ where: whereClause }),
            prisma.userHistory.findMany({
                where: whereClause,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    profile: {
                        select: {
                            email: true,
                            full_name: true,
                        },
                    },
                    main_hexagram: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    changing_hexagram: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
        ]);

        return NextResponse.json({
            data: histories,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.max(1, Math.ceil(total / pageSize)),
            },
        });
    } catch (error) {
        console.error('Admin history fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const ids = Array.isArray(body?.ids)
            ? body.ids.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
            : [];

        if (ids.length === 0) {
            return NextResponse.json({ error: 'Missing ids for bulk delete' }, { status: 400 });
        }

        const deleted = await prisma.userHistory.deleteMany({
            where: {
                id: { in: ids },
            },
        });

        return NextResponse.json({ success: true, deletedCount: deleted.count });
    } catch (error) {
        console.error('Admin bulk history delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
