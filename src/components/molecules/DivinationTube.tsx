import { motion } from 'framer-motion';

interface DivinationTubeProps {
    isShaking: boolean;
}

function normalizedFromSeed(seed: number): number {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

function pickRange(index: number, salt: number, min: number, max: number): number {
    const n = normalizedFromSeed(index + salt);
    return min + n * (max - min);
}

export function DivinationTube({ isShaking }: DivinationTubeProps) {
    // Bamboo sticks configuration
    const sticks = Array.from({ length: 12 }).map((_, i) => {
        const height = pickRange(i, 11, 100, 140);
        const rotate = pickRange(i, 29, -15, 15);
        const left = pickRange(i, 47, 20, 80);
        const shakeY = [
            -pickRange(i, 61, 2, 10),
            pickRange(i, 73, 2, 10),
            -pickRange(i, 89, 6, 15),
            pickRange(i, 97, 1, 6),
            0,
        ];
        const delay = pickRange(i, 113, 0, 0.2);
        return { height, rotate, left, id: i, shakeY, delay };
    });

    return (
        <div className="relative w-48 h-64 mx-auto flex items-end justify-center perspective-1000">
            <motion.div
                className="relative w-32 h-48"
                animate={isShaking ? {
                    rotateZ: [-5, 5, -8, 8, -4, 4, -6, 6, -2, 2, 0],
                    rotateX: [-10, -5, -12, -8, -10, -5, -8, -4, -6, -2, -10], // Tilt forward
                    y: [-2, 2, -4, 4, -2, 2, -3, 3, -1, 1, 0],
                } : {
                    rotateX: -10, // Default slight tilt forward
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: 'bottom center' }}
            >
                {/* Back inside of the tube (Inner opening) */}
                <div className="absolute top-0 left-0 w-full h-8 bg-black/60 rounded-[50%] -translate-y-1/2 -z-20 border border-mystic-gold/20 shadow-[inset_0_-5px_15px_rgba(0,0,0,0.8)]" />

                {/* Bamboo Sticks sticking out */}
                <div className="absolute top-0 left-0 w-full h-full -z-10">
                    {sticks.map((stick) => (
                        <motion.div
                            key={stick.id}
                            className="absolute bottom-full w-2 rounded-t-sm origin-bottom"
                            style={{
                                left: `${stick.left}%`,
                                height: `${stick.height}px`,
                                rotate: `${stick.rotate}deg`,
                                background: 'linear-gradient(to right, #b48555, #d4a574, #b48555)',
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                borderRight: '1px solid rgba(0,0,0,0.3)',
                            }}
                            animate={isShaking ? {
                                y: stick.shakeY,
                                rotate: [stick.rotate - 5, stick.rotate + 5, stick.rotate - 3, stick.rotate + 3, stick.rotate],
                            } : {}}
                            transition={{ duration: 2.5, ease: "easeInOut", delay: stick.delay }}
                        >
                            {/* Red tip on the stick */}
                            <div className="w-full h-2 bg-red-600/80 rounded-t-sm border-b border-black/20" />
                        </motion.div>
                    ))}
                </div>

                {/* Front cylinder body */}
                <div className="absolute top-0 left-0 w-full h-full rounded-b-[50%] overflow-hidden bg-gradient-to-r from-[#4a2e15] via-[#8c5a2b] to-[#4a2e15] border border-mystic-gold/40 shadow-[0_10px_30px_rgba(139,92,246,0.3),inset_0_0_20px_rgba(0,0,0,0.8)]">
                    {/* Golden decorative bands */}
                    <div className="absolute top-4 w-full h-2 bg-gradient-to-r from-yellow-700 via-mystic-gold to-yellow-700 opacity-80" />
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-10 flex items-center justify-center bg-gradient-to-r from-yellow-700/80 via-mystic-gold/80 to-yellow-700/80 border-y border-mystic-gold/50 shadow-[0_0_15px_rgba(212,165,116,0.5)]">
                        {/* Bat quai symbol in the middle */}
                        <div className="w-6 h-6 rounded-full border border-black/50 flex items-center justify-center bg-black/20">
                            ☯
                        </div>
                    </div>
                    <div className="absolute bottom-4 w-full h-2 bg-gradient-to-r from-yellow-700 via-mystic-gold to-yellow-700 opacity-80" />
                    
                    {/* Vertical bamboo texture lines */}
                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.8)_2px,rgba(0,0,0,0.8)_4px)]" />
                </div>

                {/* Front top lip of the tube (Outer opening half) */}
                <div className="absolute top-0 left-0 w-full h-8 bg-transparent rounded-[50%] -translate-y-1/2 border-t border-transparent border-b-2 border-mystic-gold/60 border-l border-r z-10 box-border" />

                {/* Bottom base lip */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-[#2a1a0c] via-[#4a2e15] to-[#2a1a0c] rounded-[50%] translate-y-1/2 -z-10 shadow-[0_15px_20px_rgba(0,0,0,0.8)]" />
                
                {/* Ambient glow underneath */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-3/4 h-4 bg-mystic-gold/30 blur-xl rounded-full" />
            </motion.div>
        </div>
    );
}
