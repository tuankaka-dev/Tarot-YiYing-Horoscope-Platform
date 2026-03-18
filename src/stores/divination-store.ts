import { create } from 'zustand';
import type { CoinTossResult } from '@/types';
import { tossThreeCoins, buildDivination } from '@/lib/divination';

interface DivinationState {
    // Session state
    question: string;
    currentRound: number; // 0-based, 0-5
    lines: CoinTossResult[];
    isAnimating: boolean;
    isComplete: boolean;

    // Results
    mainHexagramNumber: number | null;
    changingHexagramNumber: number | null;
    changingLines: number[];

    // AI
    aiResponse: string;
    isLoadingAI: boolean;

    // Actions
    setQuestion: (q: string) => void;
    tossCoins: () => CoinTossResult;
    addLine: (result: CoinTossResult) => void;
    setAnimating: (v: boolean) => void;
    submitForInterpretation: () => Promise<void>;
    reset: () => void;
}

const initialState = {
    question: '',
    currentRound: 0,
    lines: [] as CoinTossResult[],
    isAnimating: false,
    isComplete: false,
    mainHexagramNumber: null,
    changingHexagramNumber: null,
    changingLines: [] as number[],
    aiResponse: '',
    isLoadingAI: false,
};

export const useDivinationStore = create<DivinationState>((set, get) => ({
    ...initialState,

    setQuestion: (question) => set({ question }),

    tossCoins: () => {
        return tossThreeCoins();
    },

    addLine: (result) => {
        const { lines } = get();
        const newLines = [...lines, result];

        if (newLines.length === 6) {
            const divination = buildDivination(newLines);
            set({
                lines: newLines,
                currentRound: newLines.length,
                isComplete: true,
                mainHexagramNumber: divination.mainHexagramNumber,
                changingHexagramNumber: divination.changingHexagramNumber,
                changingLines: divination.changingLinePositions,
            });
        } else {
            set({
                lines: newLines,
                currentRound: newLines.length,
            });
        }
    },

    setAnimating: (isAnimating) => set({ isAnimating }),

    submitForInterpretation: async () => {
        const { mainHexagramNumber, changingHexagramNumber, changingLines, question } = get();
        if (!mainHexagramNumber) return;

        set({ isLoadingAI: true, aiResponse: '' });

        try {
            const response = await fetch('/api/divine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mainHexagramId: mainHexagramNumber,
                    changingHexagramId: changingHexagramNumber,
                    changingLines,
                    question,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get interpretation');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let fullText = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;
                    set({ aiResponse: fullText });
                }
            }
        } catch (error) {
            console.error('AI interpretation error:', error);
            set({ aiResponse: 'Unable to get interpretation. Please try again later.' });
        } finally {
            set({ isLoadingAI: false });
        }
    },

    reset: () => set(initialState),
}));
