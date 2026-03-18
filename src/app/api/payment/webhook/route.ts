import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPayOS } from '@/lib/payos';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Verify webhook data from PayOS using v2 SDK
        let webhookData;
        try {
            webhookData = await getPayOS().webhooks.verify(body);
        } catch {
            console.error('PayOS webhook verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const orderCode = webhookData.orderCode.toString();

        // Find the transaction
        const transaction = await prisma.transaction.findUnique({
            where: { payos_order_id: orderCode },
        });

        if (!transaction) {
            console.error('Transaction not found for orderCode:', orderCode);
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Already processed
        if (transaction.status === 'success') {
            return NextResponse.json({ success: true });
        }

        // Check if payment was successful (code "00" means success)
        if (webhookData.code === '00') {
            // Payment success — update transaction + profile
            const premiumUntil = new Date();
            premiumUntil.setDate(premiumUntil.getDate() + 7); // 7 days premium

            await prisma.$transaction([
                // Update transaction status
                prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'success' },
                }),
                // Update user profile: set premium and add credits
                prisma.profile.update({
                    where: { id: transaction.user_id },
                    data: {
                        is_premium: true,
                        premium_until: premiumUntil,
                        credits: { increment: transaction.credits_change },
                    },
                }),
            ]);

            console.log(`Payment success: order ${orderCode}, user ${transaction.user_id}`);
        } else {
            // Payment failed
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'failed' },
            });

            console.log(`Payment failed: order ${orderCode}, code ${webhookData.code}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
