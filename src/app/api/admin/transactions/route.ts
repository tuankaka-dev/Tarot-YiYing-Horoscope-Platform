import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Helper to verify admin
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { id: user.id },
                select: { role: true }
            });
            isAdmin = profile?.role === 'admin';
        } catch (e) {
            console.error('Admin API DB fallback error:', e);
        }
    }
    if (!isAdmin) return null;

    return user;
}

// GET /api/admin/transactions — List all transactions + stats
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Get only successful transactions with user profile
        const transactions = await prisma.transaction.findMany({
            where: { status: 'success' },
            orderBy: { created_at: 'desc' },
            take: 100,
            include: {
                profile: {
                    select: {
                        email: true,
                        full_name: true,
                    },
                },
            },
        });

        // Calculate aggregate stats (all are successful)
        const totalRevenue = transactions.reduce((sum, t) => sum + t.amount_vnd, 0);
        const totalSuccess = transactions.length;

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalSuccess,
            },
            transactions,
        });
    } catch (error) {
        console.error('Admin transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
