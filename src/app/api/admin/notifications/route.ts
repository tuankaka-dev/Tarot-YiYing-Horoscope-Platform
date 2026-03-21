import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { id: user.id },
                select: { role: true }
            });
            isAdmin = profile?.role === 'admin';
        } catch (e) {
            console.error('Admin API DB fallback error:', e);
        }
    }
    if (!isAdmin) return null;

    return user;
}

export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const notifications = await prisma.systemNotification.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Admin Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, content, is_active } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const notification = await prisma.systemNotification.create({
            data: {
                title,
                content,
                is_active: is_active !== undefined ? is_active : true,
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Admin Create notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
