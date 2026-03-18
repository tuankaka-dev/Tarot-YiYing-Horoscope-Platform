import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/profile?userId=xxx
// Auto-creates profile if it doesn't exist yet
export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        let profile = await prisma.profile.findUnique({
            where: { id: userId },
        });

        // Auto-create profile if it doesn't exist
        if (!profile) {
            // Get user info from Supabase Auth
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user && user.id === userId) {
                profile = await prisma.profile.create({
                    data: {
                        id: user.id,
                        email: user.email || '',
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                        role: 'user',
                    },
                });
            } else {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
            }
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/profile — Create profile
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, email, full_name } = body;

        if (!id || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const profile = await prisma.profile.upsert({
            where: { id },
            update: { email, full_name },
            create: {
                id,
                email,
                full_name: full_name || null,
                role: 'user',
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/profile — Update profile
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, full_name, avatar_url } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const profile = await prisma.profile.update({
            where: { id },
            data: {
                ...(full_name !== undefined && { full_name }),
                ...(avatar_url !== undefined && { avatar_url }),
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
