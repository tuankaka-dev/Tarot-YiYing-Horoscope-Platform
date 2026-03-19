import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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

// GET /api/admin/hexagrams — List all hexagrams
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const hexagrams = await prisma.hexagram.findMany({
            orderBy: { id: 'asc' },
        });

        return NextResponse.json(hexagrams);
    } catch (error) {
        console.error('Admin hexagrams error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/hexagrams — Update a hexagram
export async function PUT(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, name, chinese_name, meaning, description, trigram_above, trigram_below, image_url } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing hexagram id' }, { status: 400 });
        }

        const updated = await prisma.hexagram.update({
            where: { id: Number(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(chinese_name !== undefined && { chinese_name }),
                ...(meaning !== undefined && { meaning }),
                ...(description !== undefined && { description }),
                ...(trigram_above !== undefined && { trigram_above }),
                ...(trigram_below !== undefined && { trigram_below }),
                ...(image_url !== undefined && { image_url }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin hexagram update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
