import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

        const dbRole = typeof profile?.role === 'string' ? profile.role.toLowerCase() : null;
        const userMetaRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role.toLowerCase() : '';
        const appMetaRole = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role.toLowerCase() : '';
        const isAdmin = dbRole === 'admin' || userMetaRole === 'admin' || appMetaRole === 'admin';

        if (dbRole === 'admin' && userMetaRole !== 'admin') {
            try {
                await supabaseAdmin.auth.admin.updateUserById(user.id, {
                    user_metadata: {
                        ...user.user_metadata,
                        role: 'admin',
                    },
                });
            } catch (syncError) {
                console.warn('Failed to sync admin role into Supabase metadata:', syncError);
            }
        }

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