import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ensureTarotInfrastructure } from '@/lib/tarot-bootstrap';

type HistoryFilters = {
    q?: string;
    from?: Date;
    to?: Date;
};

type CombinedHistoryRow = {
    id: string;
    history_type: 'iching' | 'tarot';
    user_id: string;
    question: string;
    ai_response: string;
    created_at: string;
    email: string;
    full_name: string | null;
    main_hexagram_id: number | null;
    main_hexagram_name: string | null;
    changing_hexagram_id: number | null;
    changing_hexagram_name: string | null;
    tarot_spread_type: string | null;
    tarot_cards: unknown;
};

const baseCombinedSql = Prisma.sql`
    SELECT
        uh.id,
        'iching'::text AS history_type,
        uh.user_id,
        uh.question,
        uh.ai_response,
        uh.created_at,
        p.email,
        p.full_name,
        mh.id AS main_hexagram_id,
        mh.name AS main_hexagram_name,
        ch.id AS changing_hexagram_id,
        ch.name AS changing_hexagram_name,
        NULL::text AS tarot_spread_type,
        NULL::jsonb AS tarot_cards
    FROM user_histories uh
    INNER JOIN profiles p ON p.id = uh.user_id
    INNER JOIN hexagrams mh ON mh.id = uh.main_hexagram_id
    LEFT JOIN hexagrams ch ON ch.id = uh.changing_hexagram_id

    UNION ALL

    SELECT
        tr.id,
        'tarot'::text AS history_type,
        tr.user_id,
        tr.question,
        tr.ai_response,
        tr.created_at,
        p.email,
        p.full_name,
        NULL::int AS main_hexagram_id,
        NULL::text AS main_hexagram_name,
        NULL::int AS changing_hexagram_id,
        NULL::text AS changing_hexagram_name,
        tr.spread_type AS tarot_spread_type,
        tr.card_ids AS tarot_cards
    FROM tarot_readings tr
    INNER JOIN profiles p ON p.id = tr.user_id
`;

function buildWhereClause(filters: HistoryFilters) {
    const conditions: Prisma.Sql[] = [];

    if (filters.q) {
        const like = `%${filters.q}%`;
        conditions.push(
            Prisma.sql`(combined.email ILIKE ${like} OR COALESCE(combined.full_name, '') ILIKE ${like} OR combined.question ILIKE ${like})`
        );
    }

    if (filters.from) {
        conditions.push(Prisma.sql`combined.created_at >= ${filters.from}`);
    }

    if (filters.to) {
        conditions.push(Prisma.sql`combined.created_at <= ${filters.to}`);
    }

    if (conditions.length === 0) {
        return Prisma.empty;
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}

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
        await ensureTarotInfrastructure();

        const { page, pageSize, filters } = parseFilters(request);

        const whereSql = buildWhereClause(filters);
        const offset = (page - 1) * pageSize;

        const [countRows, histories] = await Promise.all([
            prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
                WITH combined AS (${baseCombinedSql})
                SELECT COUNT(*)::bigint AS total
                FROM combined
                ${whereSql}
            `),
            prisma.$queryRaw<CombinedHistoryRow[]>(Prisma.sql`
                WITH combined AS (${baseCombinedSql})
                SELECT *
                FROM combined
                ${whereSql}
                ORDER BY combined.created_at DESC
                LIMIT ${pageSize}
                OFFSET ${offset}
            `),
        ]);

        const total = Number(countRows[0]?.total || 0);

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
        await ensureTarotInfrastructure();

        const body = await request.json();
        const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];

        const normalized = rawIds.reduce<Array<{ id: string; history_type: 'iching' | 'tarot' }>>(
            (acc, item) => {
                if (typeof item === 'string') {
                    acc.push({ id: item, history_type: 'iching' });
                    return acc;
                }

                if (item && typeof item === 'object') {
                    const id = (item as { id?: unknown }).id;
                    const historyType = (item as { history_type?: unknown }).history_type;

                    if (
                        typeof id === 'string' &&
                        id.length > 0 &&
                        (historyType === 'iching' || historyType === 'tarot')
                    ) {
                        acc.push({ id, history_type: historyType });
                    }
                }

                return acc;
            },
            []
        );

        if (normalized.length === 0) {
            return NextResponse.json({ error: 'Missing ids for bulk delete' }, { status: 400 });
        }

        const ichingIds = normalized.filter((item) => item.history_type === 'iching').map((item) => item.id);
        const tarotIds = normalized.filter((item) => item.history_type === 'tarot').map((item) => item.id);

        let deletedCount = 0;

        if (ichingIds.length > 0) {
            const deletedIChing = await prisma.userHistory.deleteMany({
                where: {
                    id: { in: ichingIds },
                },
            });
            deletedCount += deletedIChing.count;
        }

        if (tarotIds.length > 0) {
            const deletedTarot = await prisma.$executeRaw`
                DELETE FROM tarot_readings
                WHERE id::text IN (${Prisma.join(tarotIds)})
            `;
            deletedCount += deletedTarot;
        }

        return NextResponse.json({ success: true, deletedCount });
    } catch (error) {
        console.error('Admin bulk history delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
