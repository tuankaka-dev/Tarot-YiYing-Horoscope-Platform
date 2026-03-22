import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ensureTarotInfrastructure } from '@/lib/tarot-bootstrap';

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await ensureTarotInfrastructure();

        const { id } = await params;
        const type = request.nextUrl.searchParams.get('type');

        if (!id) {
            return NextResponse.json({ error: 'Missing history id' }, { status: 400 });
        }

        if (type === 'tarot') {
            const deleted = await prisma.$executeRaw`
                DELETE FROM tarot_readings
                WHERE id = ${id}::uuid
            `;

            if (deleted === 0) {
                return NextResponse.json({ error: 'History not found' }, { status: 404 });
            }
        } else {
            await prisma.userHistory.delete({
                where: { id },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin history delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
