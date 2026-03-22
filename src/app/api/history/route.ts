import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cleanupStaleEmptyHistories } from '@/lib/history-cleanup';
import { ensureTarotInfrastructure } from '@/lib/tarot-bootstrap';

type CombinedHistoryItem = {
    id: string;
    history_type: 'iching' | 'tarot';
    question: string;
    ai_response: string;
    created_at: string;
    changing_lines: unknown;
    main_hexagram: unknown;
    changing_hexagram: unknown;
    tarot_spread_type: string | null;
    tarot_cards: unknown;
};

// GET /api/history — Get user's divination history
export async function GET(request: NextRequest) {
    try {
        await ensureTarotInfrastructure();

        cleanupStaleEmptyHistories().catch((error) => {
            console.error('Auto cleanup stale history failed:', error);
        });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limitParam = request.nextUrl.searchParams.get('limit');
        const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 50;
        const limit = Number.isFinite(parsedLimit)
            ? Math.min(Math.max(parsedLimit, 1), 100)
            : 50;

        const histories = await prisma.$queryRaw<CombinedHistoryItem[]>`
            SELECT *
            FROM (
                SELECT
                    uh.id,
                    'iching'::text AS history_type,
                    uh.question,
                    uh.ai_response,
                    uh.created_at,
                    uh.changing_lines,
                    jsonb_build_object(
                        'id', mh.id,
                        'name', mh.name,
                        'chinese_name', mh.chinese_name,
                        'meaning', mh.meaning
                    ) AS main_hexagram,
                    CASE
                        WHEN ch.id IS NULL THEN NULL
                        ELSE jsonb_build_object(
                            'id', ch.id,
                            'name', ch.name,
                            'chinese_name', ch.chinese_name,
                            'meaning', ch.meaning
                        )
                    END AS changing_hexagram,
                    NULL::text AS tarot_spread_type,
                    NULL::jsonb AS tarot_cards
                FROM user_histories uh
                INNER JOIN hexagrams mh ON mh.id = uh.main_hexagram_id
                LEFT JOIN hexagrams ch ON ch.id = uh.changing_hexagram_id
                WHERE uh.user_id = ${user.id}::uuid

                UNION ALL

                SELECT
                    tr.id,
                    'tarot'::text AS history_type,
                    tr.question,
                    tr.ai_response,
                    tr.created_at,
                    NULL::jsonb AS changing_lines,
                    NULL::jsonb AS main_hexagram,
                    NULL::jsonb AS changing_hexagram,
                    tr.spread_type AS tarot_spread_type,
                    tr.card_ids AS tarot_cards
                FROM tarot_readings tr
                WHERE tr.user_id = ${user.id}::uuid
            ) merged
            ORDER BY merged.created_at DESC
            LIMIT ${limit}
        `;

        return NextResponse.json(histories);
    } catch (error) {
        console.error('History fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/history?id=xxx — Delete a history entry
export async function DELETE(request: NextRequest) {
    try {
        await ensureTarotInfrastructure();

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = request.nextUrl.searchParams.get('id');
        const type = request.nextUrl.searchParams.get('type');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        if (type === 'tarot') {
            const deleted = await prisma.$executeRaw`
                DELETE FROM tarot_readings
                WHERE id = ${id}::uuid AND user_id = ${user.id}::uuid
            `;

            if (deleted === 0) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
        } else {
            const history = await prisma.userHistory.findFirst({
                where: { id, user_id: user.id },
            });

            if (!history) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            await prisma.userHistory.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('History delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
