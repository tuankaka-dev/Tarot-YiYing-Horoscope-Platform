'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coin } from '@/components/atoms/Coin';
import type { CoinTossResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

interface CoinTossProps {
    onResult: (result: CoinTossResult) => void;
    roundNumber: number;
    disabled?: boolean;
    tossCoins: () => CoinTossResult;
}

export function CoinToss({ onResult, roundNumber, disabled = false, tossCoins }: CoinTossProps) {
    const [isFlipping, setIsFlipping] = useState(false);
    const [currentResult, setCurrentResult] = useState<CoinTossResult | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleToss = useCallback(() => {
        if (isFlipping || disabled) return;

        setShowResult(false);
        setIsFlipping(true);

        const result = tossCoins();
        setCurrentResult(result);

        // Show coins flipping, then reveal result
        setTimeout(() => {
            setIsFlipping(false);
            setShowResult(true);

            // Emit result after a brief display
            setTimeout(() => {
                onResult(result);
                setCurrentResult(null);
                setShowResult(false);
            }, 800);
        }, 1800);
    }, [isFlipping, disabled, tossCoins, onResult]);

    const lineLabels: Record<number, string> = {
        6: 'Old Yin ⚋ (Changing)',
        7: 'Young Yang ⚊',
        8: 'Young Yin ⚋',
        9: 'Old Yang ⚊ (Changing)',
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Round indicator */}
            <div className="text-center">
                <span className="text-sm text-muted-foreground tracking-widest uppercase">
                    Line {roundNumber} of 6
                </span>
            </div>

            {/* Coins display */}
            <div className="flex items-center gap-6">
                {[0, 1, 2].map((i) => (
                    <Coin
                        key={`${roundNumber}-${i}`}
                        face={currentResult?.coins[i] || 'heads'}
                        isFlipping={isFlipping}
                        delay={i * 0.15}
                        size={72}
                    />
                ))}
            </div>

            {/* Result label */}
            <AnimatePresence>
                {showResult && currentResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center"
                    >
                        <span
                            className={`text-sm font-medium ${currentResult.isChanging ? 'text-mystic-purple text-glow' : 'text-mystic-gold'
                                }`}
                        >
                            {lineLabels[currentResult.value]}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toss button */}
            <Button
                onClick={handleToss}
                disabled={isFlipping || disabled}
                size="lg"
                className="gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 hover:from-mystic-gold hover:to-yellow-600 text-black font-semibold px-8 gold-glow"
            >
                <Coins className="w-5 h-5" />
                {isFlipping ? 'Tossing...' : 'Toss Coins'}
            </Button>
        </div>
    );
}
