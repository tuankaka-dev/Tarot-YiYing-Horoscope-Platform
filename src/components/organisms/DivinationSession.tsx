'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HexagramDisplay } from '@/components/molecules/HexagramDisplay';
import { DivinationTube } from '@/components/molecules/DivinationTube';
import { useAuthStore } from '@/stores/auth-store';
import { tossThreeCoins, buildDivination } from '@/lib/divination';
import type { Hexagram, LineType, CoinTossResult } from '@/types';
import { Loader2, RotateCcw, Send } from 'lucide-react';

function getDriveEmbedUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    let fileId: string | null = null;
    
    // Extract file ID from various Google Drive link formats
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        fileId = fileIdMatch[1];
    } else {
        const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idParamMatch && idParamMatch[1]) {
            fileId = idParamMatch[1];
        } else if (url.includes('drive.google.com') && url.includes('id=')) {
            const extractId = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (extractId && extractId[1]) fileId = extractId[1];
        }
    }

    if (fileId) {
        // Fallback robust endpoint for displaying images (circumvents strict viewing limitations)
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
}

interface DivinationSessionProps {
    hexagrams: Hexagram[];
}

type Phase = 'question' | 'shaking' | 'tossing' | 'result' | 'interpreting' | 'complete';

export function DivinationSession({ hexagrams }: DivinationSessionProps) {
    const { user } = useAuthStore();

    const [question, setQuestion] = useState('');
    const [tosses, setTosses] = useState<CoinTossResult[]>([]);
    const [aiResponse, setAiResponse] = useState('');
    const [phase, setPhase] = useState<Phase>('question');
    const [currentToss, setCurrentToss] = useState(0);
    const [isShaking, setIsShaking] = useState(false);

    // Build hexagram data from tosses
    const lines: LineType[] = tosses.map((t) => t.lineType);
    const divResult = tosses.length === 6 ? buildDivination(tosses) : null;

    const mainHexagram = divResult
        ? hexagrams.find((h) => h.id === divResult.mainHexagramNumber)
        : null;
    const changingHexagram = divResult?.changingHexagramNumber
        ? hexagrams.find((h) => h.id === divResult.changingHexagramNumber)
        : null;
    const changingLines = divResult?.changingLinePositions || [];

    // Start shaking animation then auto-toss
    const startShaking = () => {
        setPhase('shaking');
        setIsShaking(true);

        setTimeout(() => {
            setIsShaking(false);
            setPhase('tossing');
            autoTossAll();
        }, 2500);
    };

    // Auto toss all 6 lines with delays
    const autoTossAll = useCallback(() => {
        const results: CoinTossResult[] = [];
        let toss = 0;

        const doToss = () => {
            if (toss >= 6) {
                setPhase('result');
                return;
            }
            const result = tossThreeCoins();
            results.push(result);
            setTosses([...results]);
            setCurrentToss(toss + 1);
            toss++;
            setTimeout(doToss, 600);
        };
        doToss();
    }, []);

    // Request AI interpretation
    const requestInterpretation = async () => {
        if (!mainHexagram || !divResult) return;

        setPhase('interpreting');

        try {
            const res = await fetch('/api/divine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    question,
                    mainHexagramId: mainHexagram.id,
                    changingHexagramId: changingHexagram?.id || null,
                    changingLines: divResult.changingLinePositions,
                    lineValues: tosses.map((t) => t.value),
                }),
            });

            if (res.ok) {
                // API returns plain text for successful responses
                const contentType = res.headers.get('content-type') || '';
                let text: string;
                if (contentType.includes('application/json')) {
                    const data = await res.json();
                    text = data.interpretation || data.ai_response || data.error || 'Không có phản hồi.';
                } else {
                    text = await res.text();
                }
                setAiResponse(text);
                setPhase('complete');
            } else {
                const errData = await res.json().catch(() => null);
                setAiResponse(errData?.error || 'Xin lỗi, không thể kết nối với AI giải quẻ. Vui lòng thử lại sau.');
                setPhase('complete');
            }
        } catch {
            setAiResponse('Đã xảy ra lỗi khi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
            setPhase('complete');
        }
    };

    const handleReset = () => {
        setQuestion('');
        setTosses([]);
        setAiResponse('');
        setPhase('question');
        setCurrentToss(0);
    };

    // Build changed hexagram lines for display
    const changingHexLines: LineType[] = tosses.map((t) => {
        if (t.isChanging) {
            return t.lineType === 'yang' ? 'yin' : 'yang';
        }
        return t.lineType;
    });

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-mystic-gold text-gold-glow">
                        ☯ Gieo Quẻ Kinh Dịch
                    </h1>
                    <p className="text-muted-foreground">
                        Tĩnh tâm, tập trung vào câu hỏi, và để Kinh Dịch soi sáng
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* PHASE 1: Question */}
                    {phase === 'question' && (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="bg-white/80 backdrop-blur border-mystic-gold/20 shadow-sm">
                                <CardContent className="p-8 space-y-6">
                                    <div className="text-center space-y-3">
                                        <div className="text-6xl">☯</div>
                                        <h2 className="text-xl font-semibold text-mystic-gold">Đặt Câu Hỏi</h2>
                                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                            Hãy tĩnh tâm và suy nghĩ về điều bạn muốn hỏi. Câu hỏi càng rõ ràng,
                                            lời giải đáp càng chính xác.
                                        </p>
                                    </div>

                                    <Textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder={"VD: Con đường sự nghiệp hiện tại có phù hợp không?"}
                                        rows={4}
                                        className="bg-background/50 border-mystic-purple/20 focus:border-mystic-gold/50 resize-none"
                                    />

                                    <Button
                                        onClick={startShaking}
                                        disabled={!question.trim()}
                                        className="w-full gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 hover:from-mystic-gold hover:to-yellow-600 text-black font-semibold h-12 text-lg gold-glow"
                                    >
                                        Bắt Đầu Gieo Quẻ
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PHASE 2: Shaking Box */}
                    {phase === 'shaking' && (
                        <motion.div
                            key="shaking"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="bg-card/30 backdrop-blur border-mystic-gold/30 mystic-glow-strong">
                                <CardContent className="p-8 space-y-6">
                                    <div className="text-center space-y-4">
                                        <h2 className="text-xl font-semibold text-mystic-gold animate-pulse">
                                            Đang gieo quẻ...
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Tĩnh tâm và tập trung vào câu hỏi của bạn
                                        </p>
                                    </div>

                                    {/* Shaking divination box */}
                                    <div className="flex justify-center py-8">
                                        <DivinationTube isShaking={isShaking} />
                                    </div>

                                    {/* Progress dots */}
                                    <div className="flex justify-center gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-3 h-3 rounded-full bg-mystic-gold"
                                                animate={{
                                                    opacity: [0.3, 1, 0.3],
                                                    scale: [0.8, 1.2, 0.8],
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    delay: i * 0.3,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PHASE 3: Tossing */}
                    {phase === 'tossing' && (
                        <motion.div
                            key="tossing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                                <CardContent className="p-8 space-y-6">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-xl font-semibold text-mystic-gold">
                                            Đang Hình Thành Quẻ...
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Hào {currentToss} / 6
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-48">
                                            <HexagramDisplay lines={lines} animated={true} />
                                        </div>
                                    </div>

                                    <div className="w-full bg-background/30 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-mystic-purple to-mystic-gold h-2 rounded-full"
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${(currentToss / 6) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PHASE 4: Result */}
                    {phase === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="bg-card/30 backdrop-blur border-mystic-gold/30 mystic-glow">
                                <CardContent className="p-8 space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-mystic-gold text-gold-glow">
                                            Quẻ Đã Thành
                                        </h2>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                        {/* Main hexagram */}
                                        <div className="text-center space-y-3">
                                            <p className="text-sm text-muted-foreground">Quẻ Chính</p>
                                            <div className="w-40 mx-auto">
                                                <HexagramDisplay
                                                    lines={lines}
                                                    changingLines={changingLines.map((l) => l - 1)}
                                                    animated={true}
                                                />
                                            </div>
                                            {mainHexagram && (
                                                <div>
                                                    <p className="text-2xl font-bold text-mystic-gold">
                                                        {mainHexagram.name}
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground/70">
                                                        {mainHexagram.trigram_above} và {mainHexagram.trigram_below}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">{mainHexagram.meaning}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{mainHexagram.description}</p>
                                                    {mainHexagram.image_url && (
                                                        <div className="mt-4 flex justify-center">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img 
                                                                src={getDriveEmbedUrl(mainHexagram.image_url) || ''} 
                                                                alt={mainHexagram.name}
                                                                className="rounded-md w-auto h-auto max-w-full sm:max-w-[400px] max-h-[500px] object-contain border border-mystic-gold/20 shadow-sm"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Changing hexagram */}
                                        {changingHexagram && (
                                            <>
                                                <div className="text-3xl text-mystic-purple animate-pulse"></div>
                                                <div className="text-center space-y-3">
                                                    <p className="text-sm text-muted-foreground">Quẻ Biến</p>
                                                    <div className="w-40 mx-auto">
                                                        <HexagramDisplay lines={changingHexLines} animated={true} />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-mystic-gold">
                                                            {changingHexagram.name}
                                                        </p>
                                                        <p className="text-sm font-medium text-foreground/70">
                                                            {changingHexagram.trigram_above} và {changingHexagram.trigram_below}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">{changingHexagram.meaning}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{changingHexagram.description}</p>
                                                        {changingHexagram.image_url && (
                                                            <div className="mt-4 flex justify-center">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img 
                                                                    src={getDriveEmbedUrl(changingHexagram.image_url) || ''} 
                                                                    alt={changingHexagram.name}
                                                                    className="rounded-md w-auto h-auto max-w-full sm:max-w-[400px] max-h-[500px] object-contain border border-mystic-gold/20 shadow-sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {changingLines.length > 0 && (
                                        <p className="text-center text-sm text-mystic-purple">
                                            Hào động: {changingLines.map((l) => `hào ${l}`).join(', ')}
                                        </p>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <Button
                                            onClick={requestInterpretation}
                                            className="gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 hover:from-mystic-gold hover:to-yellow-600 text-black font-semibold h-12 px-8 text-lg gold-glow"
                                        >
                                            <Send className="w-5 h-5" />
                                            Giải quẻ chi tiết
                                        </Button>
                                        <Button variant="outline" onClick={handleReset} className="gap-2">
                                            <RotateCcw className="w-4 h-4" />
                                            Gieo Lại
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PHASE 5: Interpreting */}
                    {phase === 'interpreting' && (
                        <motion.div
                            key="interpreting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                                <CardContent className="p-12 text-center space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-mystic-gold mx-auto" />
                                    <h2 className="text-xl font-semibold text-mystic-gold">Đang Luận Giải Quẻ...</h2>
                                    <p className="text-sm text-muted-foreground">
                                        AI đang phân tích quẻ dịch và soạn lời giải cho bạn
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* PHASE 6: Complete */}
                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card className="bg-card/30 backdrop-blur border-mystic-gold/30">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-6">
                                        {mainHexagram && (
                                            <div className="text-center">
                                                <p className="text-3xl font-bold text-mystic-gold">{mainHexagram.name}</p>
                                                <p className="text-sm text-muted-foreground">{mainHexagram.trigram_above} trên {mainHexagram.trigram_below}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{mainHexagram.meaning}</p>
                                            </div>
                                        )}
                                        {changingHexagram && (
                                            <>
                                                <span className="text-xl text-muted-foreground">→</span>
                                                <div className="text-center">
                                                    <p className="text-3xl font-bold text-mystic-gold">{changingHexagram.name}</p>
                                                    <p className="text-sm text-muted-foreground">{changingHexagram.trigram_above} trên {changingHexagram.trigram_below}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{changingHexagram.meaning}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20 mystic-glow">
                                <CardContent className="p-8">
                                    <h3 className="text-lg font-semibold text-mystic-gold mb-4 flex items-center gap-2">
                                        Lời Giải Quẻ
                                    </h3>
                                    <div className="text-foreground/85 whitespace-pre-wrap leading-relaxed">
                                        {aiResponse}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center">
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="gap-2 border-mystic-purple/30 hover:bg-mystic-purple/10"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Gieo Quẻ Mới
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
