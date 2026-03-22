import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPayOS } from '@/lib/payos';

export async function GET() {
    return NextResponse.json({ ok: true, endpoint: 'payos-webhook' });
}

export async function HEAD() {
    return new NextResponse(null, { status: 200 });
}

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
        
        // Anti-Replay: Check webhook age if timestamp is provided
        const extractTimestamp = body.timestamp || body.data?.timestamp;
        if (extractTimestamp) {
            const webhookTimestamp = new Date(extractTimestamp);
            const now = new Date();
            const timeDiff = Math.abs(now.getTime() - webhookTimestamp.getTime());
            
            // 5 minute expiration window
            if (timeDiff > 5 * 60 * 1000) {
                console.error('Webhook expired / Replay attempt blocked');
                return NextResponse.json({ error: 'Webhook expired' }, { status: 400 });
            }
        }

        const orderCode = webhookData.orderCode.toString();

        // Find the transaction
        const transaction = await prisma.transaction.findUnique({
            where: { payos_order_id: orderCode },
        });

        if (!transaction) {
            console.warn('Transaction not found for orderCode:', orderCode);
            // Always ACK unknown order codes so provider URL verification does not fail.
            return NextResponse.json({ success: true, ignored: 'transaction_not_found' });
        }

        // Already processed
        if (transaction.status === 'success') {
            return NextResponse.json({ success: true });
        }

        // Check if payment was successful (code "00" means success)
        if (webhookData.code === '00') {
            // Payment success — update transaction + profile
            const isPro = transaction.type === 'pro_monthly';
            const premiumUntil = new Date();
            
            if (isPro) {
                premiumUntil.setDate(premiumUntil.getDate() + 30); // 30 days for PRO monthly
            } else {
                premiumUntil.setDate(premiumUntil.getDate() + 7); // 7 days premium for weekly
            }

            const creditsChange = typeof transaction.credits_change === 'number' 
                ? transaction.credits_change 
                : 0;
                
            try {
                await prisma.$transaction([
                    // Update transaction status
                    prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'success' },
                    }),
                    // Update user profile: set premium/pro and add credits
                    prisma.profile.update({
                        where: { id: transaction.user_id },
                        data: {
                            is_pro: isPro ? true : undefined,
                            is_premium: !isPro ? true : undefined,
                            premium_until: premiumUntil,
                            credits: !isPro && creditsChange > 0 ? { increment: creditsChange } : undefined,
                        },
                    }),
                ]);
            } catch (txError) {
                console.error('Failed to update subscription status inside transaction:', txError);
                throw new Error('Database transaction failed during webhook processing');
            }

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
