'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PriceTag } from '@/components/atoms/PriceTag';
import { useAuthStore } from '@/stores/auth-store';

type SpreadCount = 1 | 3 | 5;

type TarotCard = {
    id: number;
    name: string;
    name_vi: string;
    meaning: string;
    image_url: string | null;
    card_type: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    keywords: string;
    is_reversed: boolean;
    position: number;
};

function getDriveEmbedUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1200`;
    }

    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1200`;
    }

    return url;
}

function DeckBack({ className }: { className?: string }) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-fuchsia-300/40 bg-gradient-to-br from-violet-900 via-fuchsia-800 to-rose-700 shadow-[0_10px_30px_rgba(90,0,120,0.45)] ${className || ''}`}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_40%)]" />
            <div className="absolute inset-2 rounded-xl border border-white/20" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl text-amber-200/90">✦</div>
        </div>
    );
}

export function TarotSession() {
    const { user, profile, fetchProfile, isLoading: authLoading } = useAuthStore();

    const [question, setQuestion] = useState('');
    const [spreadCount, setSpreadCount] = useState<SpreadCount>(3);
    const [cards, setCards] = useState<TarotCard[]>([]);
    const [readingId, setReadingId] = useState<string | null>(null);
    const [basicMessage, setBasicMessage] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isSpreading, setIsSpreading] = useState(false);
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [flippedCount, setFlippedCount] = useState(0);

    const trimmedQuestion = question.trim();

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error('Vui lòng đăng nhập để xem Tarot.');
            window.location.href = '/login';
        }
    }, [authLoading, user]);

    useEffect(() => {
        if (!cards.length) {
            setFlippedCount(0);
            return;
        }

        setFlippedCount(0);
        const timer = window.setInterval(() => {
            setFlippedCount((prev) => {
                if (prev >= cards.length) {
                    window.clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 260);

        return () => window.clearInterval(timer);
    }, [cards]);

    const deckFan = useMemo(() => Array.from({ length: 11 }, (_, i) => i), []);

    const handleSpread = async () => {
        if (trimmedQuestion.length < 10) {
            toast.error('Câu hỏi phải có ít nhất 10 ký tự.');
            return;
        }

        setIsSpreading(true);
        setAiResponse('');
        setCards([]);
        setReadingId(null);
        setBasicMessage('');

        try {
            const res = await fetch('/api/tarot/spread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: trimmedQuestion,
                    spreadCount,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (res.status === 402) {
                    toast.error(data.error || 'Không đủ xu để trải bài.');
                } else {
                    toast.error(data.error || 'Không thể trải bài lúc này.');
                }
                return;
            }

            setCards(data.cards || []);
            setReadingId(data.readingId || null);
            setBasicMessage(data.basicMessage || '');
            fetchProfile();
            toast.success('Đã trải bài thành công.');
        } catch {
            toast.error('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsSpreading(false);
        }
    };

    const handleDeepInterpret = async () => {
        if (!readingId) return;

        setIsInterpreting(true);
        try {
            const res = await fetch('/api/tarot/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readingId }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 402) {
                    toast.error(data.error || 'Không đủ xu để nhận thông điệp chuyên sâu.');
                } else {
                    toast.error(data.error || 'Không thể nhận thông điệp chuyên sâu lúc này.');
                }
                return;
            }

            const text = await res.text();
            setAiResponse(text);
            fetchProfile();
            toast.success('Đã nhận thông điệp chuyên sâu.');
        } catch {
            toast.error('Lỗi kết nối AI. Vui lòng thử lại sau.');
        } finally {
            setIsInterpreting(false);
        }
    };

    const handleReset = () => {
        setQuestion('');
        setSpreadCount(3);
        setCards([]);
        setReadingId(null);
        setBasicMessage('');
        setAiResponse('');
        setFlippedCount(0);
    };

    return (
        <div className="space-y-8">
            <Card className="bg-white/85 backdrop-blur border-mystic-gold/20 shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-5">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-mystic-gold text-gold-glow">✦ Xem Tarot ✦</h1>
                        <p className="text-muted-foreground">Đặt câu hỏi, chọn số lá và trải bài. Mỗi lượt trải tốn 10 xu.</p>
                    </div>

                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={3}
                        placeholder="Ví dụ: Chuyện tình cảm của tôi trong tháng này sẽ diễn biến ra sao?"
                        className="bg-background/50 border-mystic-purple/20 focus:border-mystic-gold/50 resize-none"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            {[1, 3, 5].map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={spreadCount === value ? 'default' : 'outline'}
                                    className={spreadCount === value ? 'bg-gradient-to-r from-fuchsia-700 to-violet-700 text-white' : ''}
                                    onClick={() => setSpreadCount(value as SpreadCount)}
                                >
                                    {value} lá
                                </Button>
                            ))}
                        </div>

                        <Button
                            onClick={handleSpread}
                            disabled={isSpreading || trimmedQuestion.length < 10}
                            className="gap-2 bg-gradient-to-r from-fuchsia-700 to-violet-700 hover:from-fuchsia-600 hover:to-violet-600 text-white font-semibold"
                        >
                            {isSpreading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            <span className="flex items-center gap-2">
                                Trải Bài
                                <PriceTag isPro={profile?.is_pro} price={10} />
                            </span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 p-6 md:p-8 bg-[linear-gradient(145deg,#1e103a_0%,#3e1b65_45%,#6a2f7f_100%)] shadow-[0_18px_65px_rgba(70,20,110,0.45)]">
                <div className="absolute -top-24 -left-12 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-8 h-44 w-44 rounded-full bg-indigo-300/20 blur-3xl" />

                {!cards.length && (
                    <div className="relative h-[340px] flex items-center justify-center">
                        <div className="relative w-[320px] h-[240px]">
                            {deckFan.map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute left-1/2 top-1/2 h-44 w-28"
                                    style={{
                                        transformOrigin: 'bottom center',
                                    }}
                                    animate={{
                                        rotate: -38 + i * 7.6,
                                        x: -120 + i * 24,
                                        y: Math.abs(5 - i) * 2,
                                    }}
                                    transition={{ type: 'spring', stiffness: 180, damping: 22, delay: i * 0.02 }}
                                >
                                    <DeckBack className="h-full w-full" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {!!cards.length && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="space-y-6"
                        >
                            {basicMessage && (
                                <div className="rounded-xl border border-violet-200/20 bg-white/10 backdrop-blur px-4 py-3 text-sm text-violet-50">
                                    {basicMessage}
                                </div>
                            )}

                            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                                {cards.map((card, index) => {
                                    const isFlipped = index < flippedCount;
                                    const imageUrl = getDriveEmbedUrl(card.image_url);

                                    return (
                                        <motion.div
                                            key={`${card.id}-${index}`}
                                            initial={{ opacity: 0, y: 20, rotate: -6 + index * 2 }}
                                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className="rounded-2xl border border-violet-200/20 bg-white/10 p-3 backdrop-blur"
                                        >
                                            <div className="mx-auto w-full max-w-[210px]">
                                                {isFlipped && imageUrl ? (
                                                    <div className="overflow-hidden rounded-xl border border-white/20 bg-black/20">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={imageUrl}
                                                            alt={card.name_vi}
                                                            className="w-full aspect-[3/5] object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <DeckBack className="w-full aspect-[3/5]" />
                                                )}
                                            </div>

                                            <div className="mt-3 text-center space-y-1">
                                                <p className="text-sm font-semibold text-violet-100">
                                                    Lá {card.position}: {card.name_vi}
                                                </p>
                                                <p className="text-xs text-violet-200/90">
                                                    {card.is_reversed ? 'Chiều ngược' : 'Chiều thuận'}
                                                </p>
                                                <p className="text-[11px] text-violet-100/80 line-clamp-2">{card.keywords}</p>
                                                <p className="text-[11px] text-violet-100/70 line-clamp-3">{card.meaning}</p>
                                            </div>

                                            {isFlipped && !imageUrl && (
                                                <div className="mt-3 rounded-xl border border-violet-200/25 bg-violet-950/35 px-3 py-2 text-left">
                                                    <p className="text-[10px] uppercase tracking-widest text-violet-200/80 mb-1">Mô tả lá bài</p>
                                                    <p className="text-[11px] leading-relaxed text-violet-100/85 whitespace-pre-wrap">
                                                        {card.meaning}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!!cards.length && (
                <Card className="bg-card/60 backdrop-blur border-mystic-gold/20">
                    <CardContent className="p-6 space-y-4">
                        {!aiResponse && (
                            <Button
                                onClick={handleDeepInterpret}
                                disabled={isInterpreting}
                                className="gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 hover:from-mystic-gold hover:to-yellow-600 text-black font-semibold"
                            >
                                {isInterpreting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span className="flex items-center gap-2">
                                    Nhận thông điệp chuyên sâu
                                    <PriceTag isPro={profile?.is_pro} price={10} />
                                </span>
                            </Button>
                        )}

                        {aiResponse && (
                            <div className="rounded-xl border border-mystic-gold/25 bg-background/70 p-5">
                                <h3 className="text-lg font-semibold text-mystic-gold mb-3">Thông điệp chuyên sâu</h3>
                                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
                                    {aiResponse}
                                </div>
                            </div>
                        )}

                        <Button variant="outline" onClick={handleReset} className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Trải Bài Mới
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
