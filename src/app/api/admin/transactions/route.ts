import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Helper to verify admin
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile || profile.role !== 'admin') return null;

    return user;
}

// GET /api/admin/transactions — List all transactions + stats
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Get all transactions with user profile
        const transactions = await prisma.transaction.findMany({
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

        // Calculate aggregate stats
        const successTransactions = transactions.filter(t => t.status === 'success');
        const totalRevenue = successTransactions.reduce((sum, t) => sum + t.amount_vnd, 0);
        const totalSuccess = successTransactions.length;
        const totalPending = transactions.filter(t => t.status === 'pending').length;

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalSuccess,
                totalPending,
            },
            transactions,
        });
    } catch (error) {
        console.error('Admin transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
