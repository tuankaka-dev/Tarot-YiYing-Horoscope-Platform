'use client';

import { motion } from 'framer-motion';
import { HexagramLine } from '@/components/atoms/HexagramLine';
import type { LineType } from '@/types';

interface HexagramDisplayProps {
    lines: LineType[];
    changingLines?: number[];
    title?: string;
    hexagramName?: string;
    chineseName?: string;
    animated?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function HexagramDisplay({
    lines,
    changingLines = [],
    title,
    hexagramName,
    chineseName,
    animated = true,
    size = 'md',
}: HexagramDisplayProps) {
    const widthClass = size === 'sm' ? 'w-24' : size === 'lg' ? 'w-48' : 'w-36';
    const gapClass = size === 'sm' ? 'gap-1.5' : size === 'lg' ? 'gap-3' : 'gap-2';

    // Lines are drawn from top (line 6) to bottom (line 1)
    const reversedLines = [...lines].reverse();
    const reversedChanging = changingLines.map((i) => lines.length - 1 - i);

    return (
        <motion.div
            className="flex flex-col items-center gap-3"
            initial={animated ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {title && (
                <span className="text-xs text-muted-foreground tracking-widest uppercase mb-1">
                    {title}
                </span>
            )}

            {/* Hexagram lines container */}
            <div className={`${widthClass} flex flex-col ${gapClass}`}>
                {reversedLines.map((lineType, i) => (
                    <HexagramLine
                        key={i}
                        type={lineType}
                        isChanging={reversedChanging.includes(i)}
                        index={i}
                        animated={animated}
                    />
                ))}
            </div>

            {/* Hexagram name */}
            {(hexagramName || chineseName) && (
                <motion.div
                    className="text-center mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    {chineseName && (
                        <div className="text-2xl text-mystic-gold text-gold-glow font-bold mb-1">
                            {chineseName}
                        </div>
                    )}
                    {hexagramName && (
                        <div className="text-sm text-muted-foreground">{hexagramName}</div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
