import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * Helper function to verify admin role
 * Uses Prisma to bypass Supabase RLS
 */
export async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Check role directly from database using Prisma (bypasses RLS)
    try {
        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (!profile || profile.role !== 'admin') {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Admin verification error:', error);
        return null;
    }
}