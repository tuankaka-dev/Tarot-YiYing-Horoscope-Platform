import { prisma } from '@/lib/prisma';
import { buildDefaultTarotCards } from '@/lib/tarot-default-cards';

let bootstrapPromise: Promise<void> | null = null;
let tarotReadyCache = false;

async function ensureTarotTables() {
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS tarot_cards (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            name_vi TEXT NOT NULL,
            meaning TEXT NOT NULL,
            image_url TEXT,
            card_type TEXT NOT NULL,
            suit TEXT,
            number INTEGER,
            keywords TEXT NOT NULL,
            created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS tarot_readings (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL,
            question TEXT NOT NULL,
            spread_type TEXT NOT NULL,
            card_ids JSONB NOT NULL,
            ai_response TEXT NOT NULL,
            created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'tarot_readings_user_id_fkey'
            ) THEN
                ALTER TABLE tarot_readings
                ADD CONSTRAINT tarot_readings_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES profiles(id)
                ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
        END
        $$;
    `);
}

async function seedTarotCardsIfNeeded() {
    const defaults = buildDefaultTarotCards();

    const existingRows = await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id FROM tarot_cards
    `;
    const existingIds = new Set(existingRows.map((row) => row.id));
    const missingCards = defaults.filter((card) => !existingIds.has(card.id));

    if (missingCards.length === 0) {
        return;
    }

    for (const card of missingCards) {
        await prisma.$executeRaw`
            INSERT INTO tarot_cards (id, name, name_vi, meaning, image_url, card_type, suit, number, keywords, created_at, updated_at)
            VALUES (
                ${card.id},
                ${card.name},
                ${card.name_vi},
                ${card.meaning},
                ${card.image_url},
                ${card.card_type},
                ${card.suit},
                ${card.number},
                ${card.keywords},
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING
        `;
    }
}

async function backfillTarotImageUrlsIfMissing() {
    const defaults = buildDefaultTarotCards();
    const imageById = new Map(defaults.map((card) => [card.id, card.image_url] as const));

    const rows = await prisma.$queryRaw<Array<{ id: number; image_url: string | null }>>`
        SELECT id, image_url
        FROM tarot_cards
        WHERE image_url IS NULL
        ORDER BY id ASC
    `;

    if (rows.length === 0) {
        return;
    }

    for (const row of rows) {
        const imageUrl = imageById.get(row.id);

        if (!imageUrl) {
            continue;
        }

        await prisma.$executeRaw`
            UPDATE tarot_cards
            SET image_url = ${imageUrl}, updated_at = NOW()
            WHERE id = ${row.id} AND image_url IS NULL
        `;
    }
}

export async function ensureTarotInfrastructure() {
    if (tarotReadyCache) {
        return;
    }

    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            await ensureTarotTables();
            await seedTarotCardsIfNeeded();
            await backfillTarotImageUrlsIfMissing();
            tarotReadyCache = true;
        })().finally(() => {
            bootstrapPromise = null;
        });
    }

    await bootstrapPromise;
}
