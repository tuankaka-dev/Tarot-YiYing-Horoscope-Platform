'use client';

import { motion } from 'framer-motion';
import type { CoinFace } from '@/types';

interface CoinProps {
    face?: CoinFace;
    isFlipping?: boolean;
    delay?: number;
    size?: number;
}

export function Coin({ face = 'heads', isFlipping = false, delay = 0, size = 64 }: CoinProps) {
    return (
        <div className="relative" style={{ width: size, height: size, perspective: 600 }}>
            <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={
                    isFlipping
                        ? {
                            rotateX: [0, 1440 + (face === 'tails' ? 180 : 0)],
                            y: [0, -120, -80, -40, 0],
                        }
                        : {
                            rotateX: face === 'tails' ? 180 : 0,
                        }
                }
                transition={
                    isFlipping
                        ? {
                            rotateX: { duration: 1.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
                            y: {
                                duration: 1.5,
                                delay,
                                times: [0, 0.3, 0.6, 0.8, 1],
                                ease: 'easeOut',
                            },
                        }
                        : { duration: 0.3 }
                }
            >
                {/* Heads Side */}
                <div
                    className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-lg border-2"
                    style={{
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(145deg, #d4a574, #b8860b)',
                        borderColor: '#c4955a',
                        color: '#3d2b1f',
                        fontSize: size * 0.25,
                    }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-xs opacity-70" style={{ fontSize: size * 0.14 }}>陽</span>
                        <span style={{ fontSize: size * 0.3 }}>☰</span>
                    </div>
                </div>

                {/* Tails Side */}
                <div
                    className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-lg border-2"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateX(180deg)',
                        background: 'linear-gradient(145deg, #8b7355, #6b5b45)',
                        borderColor: '#7a6a52',
                        color: '#d4c5a9',
                        fontSize: size * 0.25,
                    }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-xs opacity-70" style={{ fontSize: size * 0.14 }}>陰</span>
                        <span style={{ fontSize: size * 0.3 }}>☷</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
