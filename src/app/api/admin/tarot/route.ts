import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

// GET /api/admin/tarot — Fetch all tarot cards
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const cards = await prisma.tarotCard.findMany({
            orderBy: [
                { card_type: 'asc' },
                { number: 'asc' },
            ],
        });
        return NextResponse.json(cards);
    } catch (error) {
        console.error('Error fetching tarot cards:', error);
        return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
    }
}

// POST - Create new tarot card
export async function POST(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, name_vi, meaning, image_url, card_type, suit, number, keywords } = body;

        const card = await prisma.tarotCard.create({
            data: {
                name,
                name_vi,
                meaning,
                image_url: image_url || null,
                card_type,
                suit: suit || null,
                number: number || null,
                keywords,
            },
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error('Error creating tarot card:', error);
        return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
    }
}

// PUT - Update tarot card
export async function PUT(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, name, name_vi, meaning, image_url, card_type, suit, number, keywords } = body;

        const card = await prisma.tarotCard.update({
            where: { id },
            data: {
                name,
                name_vi,
                meaning,
                image_url: image_url || null,
                card_type,
                suit: suit || null,
                number: number || null,
                keywords,
            },
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error('Error updating tarot card:', error);
        return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
    }
}

// DELETE - Delete tarot card
export async function DELETE(request: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '');

        await prisma.tarotCard.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tarot card:', error);
        return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
    }
}
