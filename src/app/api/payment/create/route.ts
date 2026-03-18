import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { getPayOS } from '@/lib/payos';

const PREMIUM_PRICE = 50000; // 50,000 VND
const PREMIUM_CREDITS_BONUS = 100;

export async function POST() {
    try {
        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate a unique order code (timestamp-based + random)
        const orderCode = Number(`${Date.now()}`.slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0'));

        // Create pending transaction
        const transaction = await prisma.transaction.create({
            data: {
                user_id: user.id,
                amount_vnd: PREMIUM_PRICE,
                credits_change: PREMIUM_CREDITS_BONUS,
                status: 'pending',
                type: 'premium_weekly',
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
            amount: PREMIUM_PRICE,
            description: `Premium 7 ngay - GieoQue`,
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
