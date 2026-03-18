'use client';

import { motion } from 'framer-motion';
import type { LineType } from '@/types';

interface HexagramLineProps {
    type: LineType;
    isChanging?: boolean;
    index?: number;
    animated?: boolean;
}

export function HexagramLine({
    type,
    isChanging = false,
    index = 0,
    animated = true,
}: HexagramLineProps) {
    const delay = animated ? index * 0.15 : 0;

    return (
        <motion.div
            className="flex items-center justify-center gap-2 w-full relative"
            initial={animated ? { scaleX: 0, opacity: 0 } : undefined}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            {type === 'yang' ? (
                /* Solid line (Yang ━━━━━) */
                <div className="relative w-full h-3">
                    <div
                        className={`w-full h-full rounded-sm ${isChanging
                                ? 'bg-gradient-to-r from-mystic-gold via-yellow-500 to-mystic-gold animate-shimmer'
                                : 'bg-gradient-to-r from-mystic-gold/80 via-mystic-gold to-mystic-gold/80'
                            }`}
                    />
                    {isChanging && (
                        <motion.div
                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-mystic-purple"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}
                </div>
            ) : (
                /* Broken line (Yin ━━ ━━) */
                <>
                    <div
                        className={`flex-1 h-3 rounded-sm ${isChanging
                                ? 'bg-gradient-to-r from-mystic-gold via-yellow-500 to-mystic-gold animate-shimmer'
                                : 'bg-gradient-to-r from-mystic-gold/80 via-mystic-gold to-mystic-gold/80'
                            }`}
                    />
                    <div className="w-4" />
                    <div
                        className={`flex-1 h-3 rounded-sm ${isChanging
                                ? 'bg-gradient-to-r from-mystic-gold via-yellow-500 to-mystic-gold animate-shimmer'
                                : 'bg-gradient-to-r from-mystic-gold/80 via-mystic-gold to-mystic-gold/80'
                            }`}
                    />
                    {isChanging && (
                        <motion.div
                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-mystic-purple"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}
                </>
            )}
        </motion.div>
    );
}
