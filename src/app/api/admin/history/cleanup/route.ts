import { NextRequest, NextResponse } from 'next/server';
import { cleanupStaleEmptyHistories } from '@/lib/history-cleanup';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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

function hasValidCronSecret(request: NextRequest) {
    const expected = process.env.HISTORY_CLEANUP_SECRET;
    if (!expected) return false;

    const token = request.headers.get('x-cleanup-secret') || request.nextUrl.searchParams.get('secret');
    return token === expected;
}

export async function POST(request: NextRequest) {
    const authorizedBySecret = hasValidCronSecret(request);

    if (!authorizedBySecret) {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    }

    try {
        const deletedCount = await cleanupStaleEmptyHistories();
        return NextResponse.json({ success: true, deletedCount });
    } catch (error) {
        console.error('History cleanup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
