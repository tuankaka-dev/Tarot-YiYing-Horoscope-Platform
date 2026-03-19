import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const notifications = await prisma.systemNotification.findMany({
            where: { is_active: true },
            orderBy: { created_at: 'desc' },
            take: 5, // Get latest 5 active notifications
        });
        return NextResponse.json(notifications);
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
