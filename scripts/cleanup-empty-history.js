/**
 * Xoa lich su gieo que chua co AI sau 24h.
 * Chay: node scripts/cleanup-empty-history.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupEmptyHistory() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const result = await prisma.$queryRaw`
            WITH deleted AS (
                DELETE FROM "user_histories"
                WHERE "created_at" <= ${cutoff}
                  AND btrim(coalesce("ai_response", '')) = ''
                RETURNING 1
            )
            SELECT COUNT(*)::bigint AS deleted_count
            FROM deleted;
        `;

        const deletedCount = Number(result?.[0]?.deleted_count ?? 0);

        console.log('✅ Cleanup thanh cong');
        console.log(`🗑️ Da xoa: ${deletedCount} ban ghi`);
        console.log(`🕒 Mốc thoi gian: ${cutoff.toISOString()}`);
    } catch (error) {
        console.error('❌ Cleanup that bai:', error.message || error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

cleanupEmptyHistory();
