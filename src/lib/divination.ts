// ============================================================
// I Ching Divination Logic
// ============================================================
// Implements the traditional three-coin method for I Ching divination.
// Each coin toss produces a line value:
//   3 heads (3×3=9) = Old Yang (changing solid line)
//   2 heads + 1 tail (3+3+2=8) = Young Yin (stable broken line)
//   1 head + 2 tails (3+2+2=7) = Young Yang (stable solid line)
//   3 tails (2+2+2=6) = Old Yin (changing broken line)

import type { CoinFace, LineValue, CoinTossResult, DivinationResult, LineType } from '@/types';

// ============================================================
// Trigram & Hexagram Lookup Tables
// ============================================================

/** 
 * Binary trigram representation: 1 = yang (solid), 0 = yin (broken)
 * Bottom line first → [bottom, middle, top]
 * Mapping to trigram numbers (used in the King Wen sequence lookup)
 */
const TRIGRAM_MAP: Record<string, number> = {
    '111': 1, // ☰ Qian (Heaven)
    '000': 2, // ☷ Kun (Earth)
    '100': 3, // ☳ Zhen (Thunder)
    '010': 4, // ☵ Kan (Water)
    '001': 5, // ☶ Gen (Mountain)
    '011': 6, // ☴ Xun (Wind)
    '101': 7, // ☲ Li (Fire)
    '110': 8, // ☱ Dui (Lake)
};

/**
 * King Wen sequence lookup: [upper trigram][lower trigram] → hexagram number
 * Row = upper (outer) trigram, Column = lower (inner) trigram
 */
const KING_WEN_SEQUENCE: number[][] = [
    //  Qian  Kun  Zhen  Kan  Gen  Xun  Li   Dui
    [1, 11, 34, 5, 26, 9, 14, 43], // Qian (upper)  
    [12, 2, 16, 8, 23, 20, 35, 45], // Kun  
    [25, 24, 51, 3, 27, 42, 21, 17], // Zhen
    [6, 7, 40, 29, 4, 59, 64, 47], // Kan
    [33, 15, 62, 39, 52, 53, 56, 31], // Gen
    [44, 46, 32, 48, 18, 57, 50, 28], // Xun
    [13, 36, 55, 63, 22, 37, 30, 49], // Li
    [10, 19, 54, 60, 41, 61, 38, 58], // Dui
];

// ============================================================
// Core Functions
// ============================================================

/** Toss a single coin — returns heads or tails */
export function tossCoin(): CoinFace {
    return Math.random() < 0.5 ? 'heads' : 'tails';
}

/** Convert a coin face to its numerical value: heads = 3, tails = 2 */
function coinValue(face: CoinFace): number {
    return face === 'heads' ? 3 : 2;
}

/** Toss three coins and determine the line value */
export function tossThreeCoins(): CoinTossResult {
    const coins: [CoinFace, CoinFace, CoinFace] = [tossCoin(), tossCoin(), tossCoin()];
    const value = (coinValue(coins[0]) + coinValue(coins[1]) + coinValue(coins[2])) as LineValue;

    const lineType: LineType = value === 7 || value === 9 ? 'yang' : 'yin';
    const isChanging = value === 6 || value === 9;

    return { coins, value, lineType, isChanging };
}

/** Convert a line value to its binary representation (1=yang, 0=yin) */
function lineToBinary(value: LineValue): number {
    return value === 7 || value === 9 ? 1 : 0;
}

/** Flip a changing line to its opposite */
function flipLine(value: LineValue): number {
    if (value === 9) return 0; // Old Yang → Yin
    if (value === 6) return 1; // Old Yin → Yang
    return lineToBinary(value);
}

/**
 * Convert 6 line values to a trigram pair and look up the hexagram number.
 * Lines are ordered bottom to top (line[0] = bottom line).
 */
function linesToHexagramNumber(binaryLines: number[]): number {
    // Lower trigram = lines 0-2, Upper trigram = lines 3-5
    const lowerKey = binaryLines.slice(0, 3).join('');
    const upperKey = binaryLines.slice(3, 6).join('');

    const upperIdx = TRIGRAM_MAP[upperKey] - 1;
    const lowerIdx = TRIGRAM_MAP[lowerKey] - 1;

    return KING_WEN_SEQUENCE[upperIdx][lowerIdx];
}

/**
 * Perform a complete divination from 6 line results.
 * Returns the main hexagram, changing hexagram (if any), and changing line positions.
 */
export function buildDivination(lines: CoinTossResult[]): DivinationResult {
    if (lines.length !== 6) {
        throw new Error('Exactly 6 lines are required for a hexagram');
    }

    // Build main hexagram binary
    const mainBinary = lines.map((l) => lineToBinary(l.value));
    const mainHexagramNumber = linesToHexagramNumber(mainBinary);

    // Find changing lines
    const changingLinePositions = lines
        .map((l, i) => (l.isChanging ? i + 1 : -1))
        .filter((p) => p !== -1);

    // Build changing hexagram (if there are changing lines)
    let changingHexagramNumber: number | null = null;
    if (changingLinePositions.length > 0) {
        const changingBinary = lines.map((l) => flipLine(l.value));
        changingHexagramNumber = linesToHexagramNumber(changingBinary);
    }

    return {
        lines,
        mainHexagramNumber,
        changingHexagramNumber,
        changingLinePositions,
    };
}

/**
 * Get trigram name from three binary digits.
 */
export function getTrigramName(binary: string): string {
    const names: Record<string, string> = {
        '111': '☰ Qian (Heaven)',
        '000': '☷ Kun (Earth)',
        '100': '☳ Zhen (Thunder)',
        '010': '☵ Kan (Water)',
        '001': '☶ Gen (Mountain)',
        '011': '☴ Xun (Wind)',
        '101': '☲ Li (Fire)',
        '110': '☱ Dui (Lake)',
    };
    return names[binary] || 'Unknown';
}
