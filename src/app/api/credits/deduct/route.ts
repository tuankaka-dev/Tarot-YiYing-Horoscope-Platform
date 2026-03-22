import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { checkAndResetCredits } from '@/lib/credits';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Ensure credits are up to date before checking
        await checkAndResetCredits(user.id);

        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { credits: true, is_premium: true, is_pro: true }
        });

        // PRO users have unlimited usage - skip deduction
        if (profile && profile.is_pro) {
            return NextResponse.json({ 
                success: true, 
                credits: profile.credits,
                is_pro: true
            });
        }

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const updated = await prisma.profile.updateMany({
            where: { 
                id: user.id,
                credits: { gte: amount }
            },
            data: {
                credits: { decrement: amount }
            }
        });

        if (updated.count === 0) {
            return NextResponse.json({ 
                error: 'Insufficient credits', 
                current_credits: profile.credits 
            }, { status: 402 });
        }

        // Return calculated credits for immediate UI feedback
        return NextResponse.json({ 
            success: true, 
            credits: profile.credits - amount 
        });
    } catch (error) {
        console.error('Credit deduction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
