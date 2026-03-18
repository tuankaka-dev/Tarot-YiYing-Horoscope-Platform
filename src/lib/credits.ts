import { prisma } from '@/lib/prisma';

const FREE_DAILY_CREDITS = 10;
const PREMIUM_DAILY_CREDITS = 100;

/**
 * Lazy Reset: Check if user's credits need to be reset for a new day.
 * Also checks if premium has expired.
 * Called every time a user fetches their profile.
 */
export async function checkAndResetCredits(userId: string) {
    const profile = await prisma.profile.findUnique({
        where: { id: userId },
    });

    if (!profile) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastReset = new Date(profile.last_reset_date);
    const lastResetDay = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());

    let needsUpdate = false;
    const updateData: {
        credits?: number;
        is_premium?: boolean;
        last_reset_date?: Date;
    } = {};

    // Check if premium has expired
    if (profile.is_premium && profile.premium_until && new Date(profile.premium_until) < now) {
        updateData.is_premium = false;
        needsUpdate = true;
    }

    // Check if we need to reset credits (new day)
    const isPremiumNow = updateData.is_premium !== undefined
        ? updateData.is_premium
        : profile.is_premium;

    if (today.getTime() > lastResetDay.getTime()) {
        if (isPremiumNow) {
            updateData.credits = PREMIUM_DAILY_CREDITS;
            updateData.last_reset_date = now;
            needsUpdate = true;
        } else if (profile.last_reset_date.getTime() !== today.getTime() && profile.is_premium) {
            // Edge case: if they just lost premium today, we should probably record that we noticed
            // but we don't give them daily credits anymore.
            updateData.last_reset_date = now;
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        const updated = await prisma.profile.update({
            where: { id: userId },
            data: updateData,
        });
        return updated;
    }

    return profile;
}
