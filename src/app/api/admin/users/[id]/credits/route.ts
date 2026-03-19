import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        isAdmin = profile?.role === 'admin';
    }
    if (!isAdmin) return null;

    return user;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { amount } = body;

        if (typeof amount !== 'number' || isNaN(amount)) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const updated = await prisma.profile.update({
            where: { id },
            data: {
                credits: { increment: amount }, // allows positive for addition, negative for subtraction
            },
        });

        // Optional: you could log this in a Transaction table for admin actions, 
        // but for now just updating Profile is sufficient.

        return NextResponse.json({ credits: updated.credits });
    } catch (error) {
        console.error('Update credits error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
