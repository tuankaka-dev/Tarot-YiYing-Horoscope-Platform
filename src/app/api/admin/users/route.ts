import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Helper to verify admin
async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile || profile.role !== 'admin') return null;

    return user;
}

// GET /api/admin/users — List all users
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const users = await prisma.profile.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { histories: true },
                },
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/users — Update user role or ban status
export async function PUT(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { userId, role, is_banned } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Prevent admin from changing their own role
        if (userId === admin.id && role) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        const updated = await prisma.profile.update({
            where: { id: userId },
            data: {
                ...(role !== undefined && { role }),
                ...(is_banned !== undefined && { is_banned }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
