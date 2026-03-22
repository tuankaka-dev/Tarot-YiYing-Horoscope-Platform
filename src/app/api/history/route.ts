import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cleanupStaleEmptyHistories } from '@/lib/history-cleanup';

// GET /api/history — Get user's divination history
export async function GET(request: NextRequest) {
    try {
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

        const histories = await prisma.userHistory.findMany({
            where: { user_id: user.id },
            include: {
                main_hexagram: true,
                changing_hexagram: true,
            },
            orderBy: { created_at: 'desc' },
            take: limit,
        });

        return NextResponse.json(histories);
    } catch (error) {
        console.error('History fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/history?id=xxx — Delete a history entry
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        // Ensure user owns this history entry
        const history = await prisma.userHistory.findFirst({
            where: { id, user_id: user.id },
        });

        if (!history) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.userHistory.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('History delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
