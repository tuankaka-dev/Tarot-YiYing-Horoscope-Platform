import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { getPayOS } from '@/lib/payos';

const PREMIUM_WEEKLY_PRICE = 50000;
const PRO_MONTHLY_PRICE = 100000;
const PREMIUM_CREDITS_BONUS = 100;
const MAX_ORDER_CODE_RETRIES = 3;

function generateOrderCode(): number {
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return Number(timestampPart + randomPart);
}

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

        let orderCode: number | null = null;

        for (let attempt = 0; attempt < MAX_ORDER_CODE_RETRIES; attempt++) {
            const candidate = generateOrderCode();
            const existing = await prisma.transaction.findUnique({
                where: { payos_order_id: candidate.toString() }
            });

            if (!existing) {
                orderCode = candidate;
                break;
            }
        }

        if (!orderCode) {
            return NextResponse.json({ error: 'Unable to generate order code' }, { status: 503 });
        }

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
