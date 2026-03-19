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
        const { amount, reason } = body;

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
        if (profile && (profile as any).is_pro) {
            return NextResponse.json({ 
                success: true, 
                credits: profile.credits,
                is_pro: true
            });
        }

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (profile.credits < amount) {
            return NextResponse.json({ 
                error: 'Insufficient credits', 
                current_credits: profile.credits 
            }, { status: 402 });
        }

        // Deduct credits
        const updatedProfile = await prisma.profile.update({
            where: { id: user.id },
            data: {
                credits: {
                    decrement: amount
                }
            }
        });

        // Optionally, we could log the transaction into a generic transaction history table here if it existed.
        // For now, deducting credits is sufficient.

        return NextResponse.json({ 
            success: true, 
            credits: updatedProfile.credits 
        });
    } catch (error) {
        console.error('Credit deduction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
