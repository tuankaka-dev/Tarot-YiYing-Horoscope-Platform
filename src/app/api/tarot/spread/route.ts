import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { checkAndResetCredits } from '@/lib/credits';
import { divineRateLimiter } from '@/lib/rate-limit';
import { ensureTarotInfrastructure } from '@/lib/tarot-bootstrap';

type TarotCardRow = {
    id: number;
    name: string;
    name_vi: string;
    meaning: string;
    image_url: string | null;
    card_type: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    keywords: string;
};

type SpreadType = 1 | 3 | 5;

const SPREAD_LABEL: Record<SpreadType, string> = {
    1: 'one_card',
    3: 'three_card',
    5: 'five_card',
};

function getBasicMessage(cards: Array<TarotCardRow & { is_reversed: boolean }>) {
    const highlights = cards
        .map((card) => {
            const orientation = card.is_reversed ? 'ngược' : 'thuận';
            return `${card.name_vi} (${orientation}): ${card.keywords}`;
        })
        .join(' | ');

    return `Thông điệp cơ bản: ${highlights}`;
}

export async function POST(request: NextRequest) {
    try {
        await ensureTarotInfrastructure();

        try {
            divineRateLimiter.checkNext(request, 5);
        } catch {
            return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentSession = await supabase.auth.getSession();
        if (!currentSession.data.session) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        const body = await request.json();
        const question = typeof body.question === 'string' ? body.question.trim() : '';
        const spreadCount = Number(body.spreadCount) as SpreadType;

        if (question.length < 10) {
            return NextResponse.json({ error: 'Câu hỏi phải có ít nhất 10 ký tự.' }, { status: 400 });
        }

        if (question.length > 500) {
            return NextResponse.json({ error: 'Câu hỏi không được vượt quá 500 ký tự.' }, { status: 400 });
        }

        if (![1, 3, 5].includes(spreadCount)) {
            return NextResponse.json({ error: 'Số lá bài phải là 1, 3 hoặc 5.' }, { status: 400 });
        }

        await checkAndResetCredits(user.id);

        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            select: { credits: true, is_pro: true },
        });

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const cards = await prisma.$queryRaw<TarotCardRow[]>`
            SELECT id, name, name_vi, meaning, image_url, card_type, suit, number, keywords
            FROM tarot_cards
            ORDER BY RANDOM()
            LIMIT ${spreadCount}
        `;

        if (cards.length !== spreadCount) {
            throw new Error('Not enough tarot cards in database');
        }

        const drawnCards = cards.map((card, index) => ({
            ...card,
            position: index + 1,
            is_reversed: Math.random() < 0.5,
        }));

        const cardPayload = drawnCards.map((card) => ({
            id: card.id,
            reversed: card.is_reversed,
        }));

        const readingId = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO tarot_readings (id, user_id, question, spread_type, card_ids, ai_response, created_at)
            VALUES (
                ${readingId}::uuid,
                ${user.id}::uuid,
                ${question},
                ${SPREAD_LABEL[spreadCount]},
                ${JSON.stringify(cardPayload)}::jsonb,
                '',
                NOW()
            )
        `;

        return NextResponse.json({
            readingId,
            cards: drawnCards,
            basicMessage: getBasicMessage(drawnCards),
        });
    } catch (error) {
        console.error('Tarot spread error:', error);

        return NextResponse.json({ error: 'Không thể trải bài lúc này. Vui lòng thử lại sau.' }, { status: 500 });
    }
}
