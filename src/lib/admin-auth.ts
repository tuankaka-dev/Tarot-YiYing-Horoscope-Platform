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

    // Check JWT claims first (fastest and most secure)
    if (user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin') {
        return user;
    }

    // Fallback: Check role via Supabase Auth client to respect RLS
    try {
        const { data: profile, error } = await supabase
            .from('Profile')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile || profile.role !== 'admin') {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Admin verification error:', error);
        return null;
    }
}