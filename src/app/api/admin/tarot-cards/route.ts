import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { buildDefaultTarotCards, type TarotDefaultCard } from '@/lib/tarot-default-cards';
import { ensureTarotInfrastructure } from '@/lib/tarot-bootstrap';

type TarotCardRecord = {
    id: number;
    name: string;
    name_vi: string;
    meaning: string;
    image_url: string | null;
    card_type: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    keywords: string;
    created_at: string;
    updated_at: string;
};

async function upsertManyTarotCards(cards: TarotDefaultCard[]) {
    for (const card of cards) {
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
            ON CONFLICT (id)
            DO UPDATE SET
                name = EXCLUDED.name,
                name_vi = EXCLUDED.name_vi,
                meaning = EXCLUDED.meaning,
                image_url = COALESCE(tarot_cards.image_url, EXCLUDED.image_url),
                card_type = EXCLUDED.card_type,
                suit = EXCLUDED.suit,
                number = EXCLUDED.number,
                keywords = EXCLUDED.keywords,
                updated_at = NOW()
        `;
    }
}

export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await ensureTarotInfrastructure();

        const cards = await prisma.$queryRaw<TarotCardRecord[]>`
            SELECT id, name, name_vi, meaning, image_url, card_type, suit, number, keywords, created_at, updated_at
            FROM tarot_cards
            ORDER BY id ASC
        `;

        return NextResponse.json(cards);
    } catch (error) {
        console.error('Admin tarot cards fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await ensureTarotInfrastructure();

        const body = await request.json();
        const action = body?.action;

        if (action !== 'seed-default-78') {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        const cards = buildDefaultTarotCards();
        await upsertManyTarotCards(cards);

        return NextResponse.json({ success: true, total: cards.length });
    } catch (error) {
        console.error('Admin tarot cards seed error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await ensureTarotInfrastructure();

        const body = await request.json();
        const id = Number(body?.id);

        if (!Number.isFinite(id) || id <= 0) {
            return NextResponse.json({ error: 'Invalid card id' }, { status: 400 });
        }

        const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
        const nameVi = typeof body?.name_vi === 'string' ? body.name_vi.trim() : undefined;
        const meaning = typeof body?.meaning === 'string' ? body.meaning.trim() : undefined;
        const imageUrl = body?.image_url === null || typeof body?.image_url === 'string' ? body.image_url : undefined;
        const keywords = typeof body?.keywords === 'string' ? body.keywords.trim() : undefined;

        if (name !== undefined) {
            await prisma.$executeRaw`UPDATE tarot_cards SET name = ${name}, updated_at = NOW() WHERE id = ${id}`;
        }
        if (nameVi !== undefined) {
            await prisma.$executeRaw`UPDATE tarot_cards SET name_vi = ${nameVi}, updated_at = NOW() WHERE id = ${id}`;
        }
        if (meaning !== undefined) {
            await prisma.$executeRaw`UPDATE tarot_cards SET meaning = ${meaning}, updated_at = NOW() WHERE id = ${id}`;
        }
        if (imageUrl !== undefined) {
            await prisma.$executeRaw`UPDATE tarot_cards SET image_url = ${imageUrl}, updated_at = NOW() WHERE id = ${id}`;
        }
        if (keywords !== undefined) {
            await prisma.$executeRaw`UPDATE tarot_cards SET keywords = ${keywords}, updated_at = NOW() WHERE id = ${id}`;
        }

        const rows = await prisma.$queryRaw<TarotCardRecord[]>`
            SELECT id, name, name_vi, meaning, image_url, card_type, suit, number, keywords, created_at, updated_at
            FROM tarot_cards
            WHERE id = ${id}
            LIMIT 1
        `;

        const updated = rows[0];
        if (!updated) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Admin tarot cards update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
