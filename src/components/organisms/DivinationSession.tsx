'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HexagramDisplay } from '@/components/molecules/HexagramDisplay';
import { DivinationTube } from '@/components/molecules/DivinationTube';
import { PriceTag } from '@/components/atoms/PriceTag';
import { useAuthStore } from '@/stores/auth-store';
import { tossThreeCoins, buildDivination } from '@/lib/divination';
import type { Hexagram, LineType, CoinTossResult } from '@/types';
import { Loader2, RotateCcw, Send, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

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
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return url;
}

interface DivinationSessionProps {
    hexagrams: Hexagram[];
}

type Phase = 'question' | 'shaking' | 'tossing' | 'result' | 'interpreting' | 'complete';

function ImageWatermarkOverlay() {
    const rows = Array.from({ length: 3 }, (_, i) => i);

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent" />
            <div className="absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] space-y-5">
                {rows.map((row) => (
                    <div
                        key={row}
                        className="whitespace-nowrap text-[10px] md:text-xs font-semibold tracking-[0.34em] text-white/24 text-center"
                    >
                        GIEOQUE.APP GIEOQUE.APP GIEOQUE.APP
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DivinationSession({ hexagrams }: DivinationSessionProps) {
    const { user, profile, fetchProfile, isLoading: authLoading } = useAuthStore();

    const [question, setQuestion] = useState('');
    const [tosses, setTosses] = useState<CoinTossResult[]>([]);
    const [aiResponse, setAiResponse] = useState('');
    const [phase, setPhase] = useState<Phase>('question');
    const [currentToss, setCurrentToss] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [historyId, setHistoryId] = useState<string | null>(null);
    const trimmedQuestion = question.trim();

    // Redirect if unauthenticated after loading finishes
    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Vui lòng đăng nhập để gieo quẻ.');
            window.location.href = '/login';
        }
    }, [authLoading, user]);

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
    const startShaking = async () => {
        if (isShaking) return;

        if (trimmedQuestion.length < 10) {
            toast.error('Câu hỏi phải có ít nhất 10 ký tự.');
            return;
        }

        if (!user) {
            toast.error('Vui lòng đăng nhập để gieo quẻ.');
            window.location.href = '/register';
            return;
        }

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

        const doToss = async () => {
            if (toss >= 6) {
                // Save history immediately after casting the hexagram
                const finalDivResult = buildDivination(results);
                try {
                    const res = await fetch('/api/history/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            question: trimmedQuestion,
                            mainHexagramId: finalDivResult.mainHexagramNumber,
                            changingHexagramId: finalDivResult.changingHexagramNumber || null,
                            changingLines: finalDivResult.changingLinePositions
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.id) setHistoryId(data.id);
                    }
                } catch {
                    // Ignore fail, at worst history won't be saved here
                }

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
    }, [trimmedQuestion]);

    // Request AI interpretation
    const requestInterpretation = async () => {
        if (!mainHexagram || !divResult) return;

        // Check credits before proceeding
        if (!profile?.is_pro && profile && profile.credits < 10) {
            toast.error('Không đủ xu để giải quẻ chuyên sâu. Vui lòng nâng cấp gói đăng ký.');
            setTimeout(() => {
                window.location.href = '/#pricing';
            }, 1500);
            return;
        }

        // Optimistic UI update for credits (deduct 10 xu immediately)
        if (profile && profile.is_pro) {
            // PRO users have unlimited usage - skip deduction
        } else if (profile && profile.credits >= 10) {
            useAuthStore.setState({ profile: { ...profile, credits: profile.credits - 10 } });
        }

        setIsInterpreting(true);

        try {
            const res = await fetch('/api/divine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    question: trimmedQuestion,
                    mainHexagramId: mainHexagram.id,
                    changingHexagramId: changingHexagram?.id || null,
                    changingLines: divResult.changingLinePositions,
                    lineValues: tosses.map((t) => t.value),
                    historyId,
                }),
            });

            if (res.ok) {
                // Sync credits immediately
                fetchProfile();

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
            } else {
                // Revert optimistic update on failure by refetching actual credits
                fetchProfile();

                if (res.status === 402) {
                    toast.error('Không đủ xu để giải quẻ chuyên sâu. Vui lòng nâng cấp gói đăng ký.');
                    setTimeout(() => {
                        window.location.href = '/#pricing';
                    }, 1500);
                }
                const errData = await res.json().catch(() => null);
                setAiResponse(errData?.error || 'Xin lỗi, không thể kết nối với AI giải quẻ. Vui lòng thử lại sau.');
            }
        } catch {
            setAiResponse('Đã xảy ra lỗi khi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleReset = () => {
        setQuestion('');
        setTosses([]);
        setAiResponse('');
        setPhase('question');
        setCurrentToss(0);
        setHistoryId(null);
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

                {/* Show loading state while auth is initializing */}
                {authLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-mystic-gold" />
                    </div>
                ) : (
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
                                        placeholder={"VD:  Hôm nay có nên khai trương văn phòng không?"}
                                        rows={4}
                                        className="bg-background/50 border-mystic-purple/20 focus:border-mystic-gold/50 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Câu hỏi cần có ít nhất 10 ký tự.
                                    </p>

                                    <Button
                                        onClick={startShaking}
                                        disabled={trimmedQuestion.length < 10 || isShaking}
                                        className="w-full gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 hover:from-mystic-gold hover:to-yellow-600 text-black font-semibold h-12 text-lg gold-glow"
                                    >
                                        {isShaking ? 'Đang chuẩn bị...' : 'Bắt Đầu Gieo Quẻ'}
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
                                    <div className="text-center space-y-3">
                                        <h2 className="text-2xl font-bold text-mystic-gold text-gold-glow">
                                            Quẻ Đã Thành
                                        </h2>
                                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                                                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                                <span className="font-bold text-green-600">Đại Cát</span>
                                                <span className="text-muted-foreground">- Rất tốt</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
                                                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                                <span className="font-bold text-green-500">Cát</span>
                                                <span className="text-muted-foreground">- Thuận lợi</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                                <Minus className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-bold text-blue-500">Bình Hòa</span>
                                                <span className="text-muted-foreground">- Cân bằng</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">
                                                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                                <span className="font-bold text-red-500">Hung</span>
                                                <span className="text-muted-foreground">- Thận trọng</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
                                        {/* Main hexagram */}
                                        <div className="flex flex-1 w-full flex-col text-center">
                                            <div className="space-y-3 flex-1">
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
                                                            Quẻ {mainHexagram.id}: {mainHexagram.name}
                                                        </p>
                                                        <p className="text-sm font-medium text-foreground/70">
                                                            {mainHexagram.trigram_above} / {mainHexagram.trigram_below}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">{mainHexagram.meaning}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{mainHexagram.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {mainHexagram?.image_url && (
                                                <div className="mt-4 flex justify-center">
                                                    <div className="relative rounded-md w-full max-w-[450px] overflow-hidden border border-mystic-gold/20 shadow-sm">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={getDriveEmbedUrl(mainHexagram.image_url) || ''}
                                                            alt={mainHexagram.name}
                                                            className="w-full h-auto object-contain"
                                                        />
                                                        <ImageWatermarkOverlay />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Changing hexagram */}
                                        {changingHexagram && (
                                            <>
                                                <div className="text-3xl text-mystic-purple animate-pulse self-center md:self-start md:mt-20">→</div>
                                                <div className="flex flex-1 w-full flex-col text-center">
                                                    <div className="space-y-3 flex-1">
                                                        <p className="text-sm text-muted-foreground">Quẻ Biến</p>
                                                        <div className="w-40 mx-auto">
                                                            <HexagramDisplay lines={changingHexLines} animated={true} />
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-bold text-mystic-gold">
                                                                Quẻ {changingHexagram.id}: {changingHexagram.name}
                                                            </p>
                                                            <p className="text-sm font-medium text-foreground/70">
                                                                {changingHexagram.trigram_above} / {changingHexagram.trigram_below}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">{changingHexagram.meaning}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{changingHexagram.description}</p>
                                                        </div>
                                                    </div>
                                                    {changingHexagram.image_url && (
                                                        <div className="mt-4 flex justify-center">
                                                            <div className="relative rounded-md w-full max-w-[450px] overflow-hidden border border-mystic-gold/20 shadow-sm">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={getDriveEmbedUrl(changingHexagram.image_url) || ''}
                                                                    alt={changingHexagram.name}
                                                                    className="w-full h-auto object-contain"
                                                                />
                                                                <ImageWatermarkOverlay />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {changingLines.length > 0 && (
                                        <p className="text-center text-sm text-mystic-purple">
                                            Hào động: {changingLines.map((l) => `hào ${l}`).join(', ')}
                                        </p>
                                    )}

                                    {/* AI Response Section Inline */}
                                    {isInterpreting && (
                                        <div className="mt-8 p-8 text-center space-y-4 rounded-xl bg-mystic-purple/5 border border-mystic-purple/20">
                                            <Loader2 className="w-8 h-8 animate-spin text-mystic-gold mx-auto" />
                                            <p className="text-sm text-mystic-gold animate-pulse">Đang kết nối tâm linh, hãy đợi 1 phút...</p>
                                        </div>
                                    )}

                                    {aiResponse && !isInterpreting && (
                                        <div className="mt-8 p-6 rounded-xl bg-card/50 backdrop-blur border border-mystic-gold/30 mystic-glow text-left">
                                            <h3 className="text-lg font-semibold text-mystic-gold mb-4 flex items-center justify-center gap-2">
                                                Lời Giải Quẻ
                                            </h3>
                                            <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                                                {aiResponse}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                        {!aiResponse && !isInterpreting && (
                                            <Button
                                                onClick={requestInterpretation}
                                                className="gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 hover:from-mystic-gold hover:to-yellow-600 text-black font-semibold h-12 px-8 text-lg gold-glow"
                                            >
                                                <Send className="w-5 h-5" />
                                                <span className="flex items-center gap-2">
                                                    Giải quẻ chuyên sâu
                                                    <PriceTag isPro={profile?.is_pro} price={10} />
                                                </span>
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={handleReset} className="gap-2 h-12 px-8 text-lg">
                                            <RotateCcw className="w-4 h-4" />
                                            {aiResponse ? 'Gieo Quẻ Mới' : 'Gieo Lại'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
                )}
            </div>
        </div>
    );
}
