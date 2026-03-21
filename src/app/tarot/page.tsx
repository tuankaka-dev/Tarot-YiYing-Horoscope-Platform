import { prisma } from '@/lib/prisma';
import { TarotSession } from '@/components/organisms/TarotSession';
import type { TarotCard } from '@/types';

export default async function TarotPage() {
    let tarotCards: TarotCard[] = [];

    try {
        const cards = await prisma.tarotCard.findMany({
            orderBy: { id: 'asc' },
        });
        tarotCards = cards as TarotCard[];
    } catch {
        tarotCards = [];
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <TarotSession tarotCards={tarotCards} />
            </div>
        </div>
    );
}
