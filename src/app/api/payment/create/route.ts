import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { getPayOS } from '@/lib/payos';

const PREMIUM_WEEKLY_PRICE = 50000;
const PRO_MONTHLY_PRICE = 100000;
const PREMIUM_CREDITS_BONUS = 100;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const tier = body.tier || 'premium_weekly'; // Default to weekly
        const validTiers = ['premium_weekly', 'pro_monthly'];
        if (!validTiers.includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isPro = tier === 'pro_monthly';
        const price = isPro ? PRO_MONTHLY_PRICE : PREMIUM_WEEKLY_PRICE;
        const description = isPro ? 'Goi PRO 1 thang - GieoQue' : 'Premium 7 ngay - GieoQue';

        // Generate a unique order code (timestamp-based + random)
        const orderCode = Number(`${Date.now()}`.slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0'));

        // Create pending transaction
        const transaction = await prisma.transaction.create({
            data: {
                user_id: user.id,
                amount_vnd: price,
                credits_change: isPro ? 0 : PREMIUM_CREDITS_BONUS, // Pro doesn't need credits
                status: 'pending',
                type: tier,
                payos_order_id: orderCode.toString(),
            },
        });

        // Determine URLs
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const returnUrl = `${baseUrl}/dashboard?payment=success`;
        const cancelUrl = `${baseUrl}/dashboard?payment=cancel`;

        // Create PayOS payment link via v2 SDK
        const paymentLink = await getPayOS().paymentRequests.create({
            orderCode,
            amount: price,
            description,
            returnUrl,
            cancelUrl,
        });

        return NextResponse.json({
            checkoutUrl: paymentLink.checkoutUrl,
            transactionId: transaction.id,
        });
    } catch (error) {
        console.error('Payment create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
