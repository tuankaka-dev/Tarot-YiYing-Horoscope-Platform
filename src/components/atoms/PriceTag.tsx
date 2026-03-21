'use client';

import { Coins } from 'lucide-react';

interface PriceTagProps {
    isPro?: boolean;
    price?: number;
    className?: string;
}

export function PriceTag({ isPro = false, price = 10, className = '' }: PriceTagProps) {
    if (isPro) {
        return (
            <span className={`inline-flex items-center gap-1  from-amber-500/20 to-yellow-500/20 text-white text-lg font-bold ${className}`}>
                Free
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center text-white gap-1 text-purple-300 text-lg font-bold ${className}`}>
            <Coins className="w-3 h-3" />
            {price}
        </span>
    );
}
