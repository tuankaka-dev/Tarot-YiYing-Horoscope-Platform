import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cleanupStaleEmptyHistories } from '@/lib/history-cleanup';

export async function POST(request: NextRequest) {
    try {
        cleanupStaleEmptyHistories().catch((error) => {
            console.error('Auto cleanup stale history failed:', error);
        });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { question, mainHexagramId, changingHexagramId, changingLines } = body;

        if (!mainHexagramId || typeof question !== 'string') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const normalizedQuestion = question.trim();
        if (normalizedQuestion.length < 10) {
            return NextResponse.json({ error: 'Question must be at least 10 characters' }, { status: 400 });
        }

        const history = await prisma.userHistory.create({
            data: {
                user_id: user.id,
                question: normalizedQuestion,
                main_hexagram_id: mainHexagramId,
                changing_hexagram_id: changingHexagramId,
                changing_lines: changingLines || [],
                ai_response: "", // Empty initial response
            },
        });

        return NextResponse.json({ success: true, id: history.id });
    } catch (error) {
        console.error('Save history error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
