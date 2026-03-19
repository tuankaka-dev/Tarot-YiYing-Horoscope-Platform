import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile || profile.role !== 'admin') return null;
    return user;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const body = await request.json();
        const { title, content, is_active } = body;

        const updated = await prisma.systemNotification.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(content !== undefined && { content }),
                ...(is_active !== undefined && { is_active }),
            },
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        await prisma.systemNotification.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
