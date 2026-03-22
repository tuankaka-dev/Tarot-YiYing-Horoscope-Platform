import { PrismaClient } from '@prisma/client';
import { buildDefaultTarotCards } from '../src/lib/tarot-default-cards';

const prisma = new PrismaClient();

async function main() {
    const cards = buildDefaultTarotCards();

    for (const card of cards) {
        await prisma.$executeRaw`
            UPDATE tarot_cards
            SET image_url = ${card.image_url}, updated_at = NOW()
            WHERE id = ${card.id}
        `;
    }

    console.log(`Updated image_url for ${cards.length} tarot cards.`);
}

main()
    .catch((error) => {
        console.error('Failed to seed tarot image URLs:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
