import { prisma } from '@/lib/prisma';

/**
 * Remove stale history records that still have no AI interpretation after 24 hours.
 */
export async function cleanupStaleEmptyHistories() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rows = await prisma.$queryRaw<{ deleted_count: bigint }[]>`
        WITH deleted AS (
            DELETE FROM "user_histories"
            WHERE "created_at" <= ${cutoff}
              AND btrim(coalesce("ai_response", '')) = ''
            RETURNING 1
        )
        SELECT COUNT(*)::bigint AS deleted_count
        FROM deleted;
    `;

    return Number(rows[0]?.deleted_count ?? 0);
}
