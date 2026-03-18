import { prisma } from '@/lib/prisma';
import { DivinationSession } from '@/components/organisms/DivinationSession';
import type { Hexagram } from '@/types';

export default async function DivinePage() {
    // Fetch all hexagrams server-side for efficient lookup
    let hexagrams: Hexagram[] = [];

    try {
        hexagrams = await prisma.hexagram.findMany({
            orderBy: { id: 'asc' },
        });
    } catch {
        // If DB is not set up yet, use empty array
        hexagrams = [];
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <DivinationSession hexagrams={hexagrams} />
            </div>
        </div>
    );
}
