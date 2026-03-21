'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PriceTag } from '@/components/atoms/PriceTag';
import { useAuthStore } from '@/stores/auth-store';
import type { TarotCard } from '@/types';
import { Loader2, RotateCcw, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TarotSessionProps {
    tarotCards: TarotCard[];
}

type Phase = 'question' | 'spreading' | 'result';
type SpreadType = 'one' | 'three' | 'five';

export function TarotSession({ tarotCards }: TarotSessionProps) {
    const { user, profile, fetchProfile, isLoading: authLoading } = useAuthStore();

    const [question, setQuestion] = useState('');
    const [phase, setPhase] = useState<Phase>('question');
    const [spreadType, setSpreadType] = useState<SpreadType>('one');
    const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [aiResponse, setAiResponse] = useState('');

    const spreadCost = { one: 10, three: 10, five: 10 };

    const handleSpread = async (type: SpreadType) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để xem Tarot.');
            window.location.href = '/register';
            return;
        }

        if (!question.trim()) {
            toast.error('Vui lòng nhập câu hỏi trước khi trải bài.');
            return;
        }

        // Check credits
        if (!(profile as any)?.is_pro && profile && profile.credits < spreadCost[type]) {
            toast.error('Không đủ xu để trải bài Tarot. Vui lòng nâng cấp gói đăng ký.');
            setTimeout(() => {
                window.location.href = '/#pricing';
            }, 1500);
            return;
        }

        // Deduct credits
        try {
            const res = await fetch('/api/credits/deduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: spreadCost[type], reason: 'tarot_reading' }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 402) {
                    toast.error('Không đủ xu để trải bài Tarot. Vui lòng nâng cấp gói đăng ký.');
                    setTimeout(() => {
                        window.location.href = '/#pricing';
                    }, 1500);
                } else {
                    toast.error(data.error || 'Trừ xu thất bại.');
                }
                return;
            }

            fetchProfile();
        } catch {
            toast.error('Lỗi kết nối. Vui lòng thử lại.');
            return;
        }

        setSpreadType(type);
        setPhase('spreading');

        // Shuffle and select cards
        const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
        const count = type === 'one' ? 1 : type === 'three' ? 3 : 5;
        const drawn = shuffled.slice(0, count);

        setTimeout(() => {
            setSelectedCards(drawn);
            setTimeout(() => {
                setPhase('result');
            }, 1500);
        }, 2000);
    };

    const requestInterpretation = async () => {
        if (selectedCards.length === 0) return;

        setIsInterpreting(true);

        try {
            const res = await fetch('/api/tarot/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    spreadType,
                    cardIds: selectedCards.map(c => c.id),
                }),
            });

            if (res.ok) {
                const text = await res.text();
                setAiResponse(text);
            } else {
                const errData = await res.json().catch(() => null);
                setAiResponse(errData?.error || 'Xin lỗi, không thể kết nối với AI giải bài. Vui lòng thử lại sau.');
            }
        } catch {
            setAiResponse('Đã xảy ra lỗi khi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleReset = () => {
        setQuestion('');
        setSelectedCards([]);
        setAiResponse('');
        setPhase('question');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-mystic-gold text-gold-glow">
                    🔮 Xem Tarot
                </h1>
                <p className="text-muted-foreground">
                    Để Tarot soi sáng con đường và giải đáp thắc mắc của bạn
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
                                    <div className="text-6xl">🔮</div>
                                    <h2 className="text-xl font-semibold text-mystic-gold">Đặt Câu Hỏi</h2>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                        Hãy tĩnh tâm và suy nghĩ về điều bạn muốn hỏi. Câu hỏi càng rõ ràng,
                                        lời giải đáp càng chính xác.
                                    </p>
                                </div>

                                <Textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="VD: Tình yêu của tôi sẽ như thế nào trong thời gian tới?"
                                    rows={4}
                                    className="bg-background/50 border-mystic-purple/20 focus:border-mystic-gold/50 resize-none"
                                />

                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-center text-foreground/80">Chọn Kiểu Trải Bài</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Button
                                            onClick={() => handleSpread('one')}
                                            disabled={!question.trim()}
                                            className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold h-16 text-base"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            <span className="flex items-center gap-2">
                                                1 Lá
                                                <PriceTag isPro={profile?.is_pro} price={10} />
                                            </span>
                                        </Button>
                                        <Button
                                            onClick={() => handleSpread('three')}
                                            disabled={!question.trim()}
                                            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold h-16 text-base"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            <span className="flex items-center gap-2">
                                                3 Lá
                                                <PriceTag isPro={profile?.is_pro} price={10} />
                                            </span>
                                        </Button>
                                        <Button
                                            onClick={() => handleSpread('five')}
                                            disabled={!question.trim()}
                                            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold h-16 text-base"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            <span className="flex items-center gap-2">
                                                5 Lá
                                                <PriceTag isPro={profile?.is_pro} price={10} />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* PHASE 2: Spreading */}
                {phase === 'spreading' && (
                    <motion.div
                        key="spreading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card className="bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-violet-500/20 backdrop-blur border-purple-500/30 shadow-xl">
                            <CardContent className="p-12 space-y-8">
                                <div className="text-center space-y-4">
                                    <h2 className="text-xl font-semibold text-purple-600 animate-pulse">
                                        Đang trải bài...
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Tĩnh tâm và tập trung vào câu hỏi của bạn
                                    </p>
                                </div>

                                {/* Card Deck Animation */}
                                <div className="flex justify-center items-center min-h-[300px]">
                                    <div className="relative w-32 h-48">
                                        {[...Array(10)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 border-2 border-purple-400 shadow-lg"
                                                style={{
                                                    transformOrigin: 'center bottom',
                                                }}
                                                animate={{
                                                    rotate: [0, -15 + i * 3, 0],
                                                    x: [0, -20 + i * 4, 0],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                }}
                                            >
                                                <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl">
                                                    🔮
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* PHASE 3: Result */}
                {phase === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="bg-card/30 backdrop-blur border-purple-500/30 shadow-xl">
                            <CardContent className="p-8 space-y-8">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-purple-600">
                                        Bài Tarot Của Bạn
                                    </h2>
                                </div>

                                {/* Cards Display */}
                                <div className="flex flex-wrap justify-center gap-6">
                                    {selectedCards.map((card, index) => (
                                        <motion.div
                                            key={card.id}
                                            initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
                                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                            transition={{ delay: index * 0.3, duration: 0.6 }}
                                            className="text-center space-y-3"
                                        >
                                            <div className="w-48 h-72 rounded-xl overflow-hidden border-2 border-purple-400 shadow-lg bg-white">
                                                {card.image_url ? (
                                                    <img
                                                        src={card.image_url}
                                                        alt={card.name_vi}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                                                        <span className="text-6xl">🔮</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-purple-600">{card.name_vi}</p>
                                                <p className="text-xs text-muted-foreground">{card.name}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* AI Response */}
                                {isInterpreting && (
                                    <div className="mt-8 p-8 text-center space-y-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                                        <p className="text-sm text-purple-600 animate-pulse">Đang giải bài Tarot...</p>
                                    </div>
                                )}

                                {aiResponse && !isInterpreting && (
                                    <div className="mt-8 p-6 rounded-xl bg-card/50 backdrop-blur border border-purple-500/30 text-left">
                                        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center justify-center gap-2">
                                            Lời Giải Bài
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
                                            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold h-12 px-8 text-lg"
                                        >
                                            <Send className="w-5 h-5" />
                                            Giải Bài Chuyên Sâu (Miễn phí)
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={handleReset} className="gap-2 h-12 px-8 text-lg">
                                        <RotateCcw className="w-4 h-4" />
                                        {aiResponse ? 'Trải Bài Mới' : 'Trải Lại'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            )}
        </div>
    );
}
