import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Helper to verify admin
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
        const { userId, role, is_banned, is_premium, is_pro, premium_until } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Prevent admin from changing their own role
        if (userId === admin.id && role) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        const updateObj: Record<string, any> = {};
        if (role !== undefined) {
            updateObj.role = role;
            
            // Also update Supabase auth metadata so the JWT claim reflects the new role immediately
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: { role }
            });
            
            if (authError) {
                console.error('Failed to update Supabase user metadata:', authError);
                return NextResponse.json({ error: 'Failed to update authentication role' }, { status: 500 });
            }
        }
        if (is_banned !== undefined) updateObj.is_banned = is_banned;
        if (is_premium !== undefined) updateObj.is_premium = is_premium;
        if (is_pro !== undefined) updateObj.is_pro = is_pro;
        if (premium_until !== undefined) updateObj.premium_until = premium_until ? new Date(premium_until) : null;

        const updated = await prisma.profile.update({
            where: { id: userId },
            data: updateObj,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
