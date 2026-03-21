import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        const isAdmin = profile?.role === 'admin';

        return NextResponse.json({ 
            isAdmin,
            userId: user.id,
            email: user.email,
            role: profile?.role || null
        });
    } catch (error) {
        console.error('Check admin role error:', error);
        return NextResponse.json({ 
            isAdmin: false, 
            error: 'Database error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}