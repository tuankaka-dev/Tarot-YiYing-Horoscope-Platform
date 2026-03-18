'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { History, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface HistoryItem {
    id: string;
    question: string;
    ai_response: string;
    changing_lines: number[];
    created_at: string;
    main_hexagram: {
        id: number;
        name: string;
        chinese_name: string;
        meaning: string;
    };
    changing_hexagram: {
        id: number;
        name: string;
        chinese_name: string;
        meaning: string;
    } | null;
}

export default function DashboardPage() {
    const [histories, setHistories] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const data = await res.json();
                setHistories(data);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHistory = async (id: string) => {
        try {
            const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setHistories((prev) => prev.filter((h) => h.id !== id));
                toast.success('Đã xoá lần gieo quẻ');
            }
        } catch {
            toast.error('Xoá thất bại');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                            <History className="w-6 h-6 md:w-8 md:h-8" />
                            Lịch Sử Gieo Quẻ
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            {histories.length} lần gieo quẻ đã được ghi lại
                        </p>
                    </div>
                    <Link href="/divine" className="w-full sm:w-auto">
                        <Button className="w-full gap-2 bg-gradient-to-r from-mystic-gold to-amber-600 text-white">
                            Gieo Quẻ Mới
                        </Button>
                    </Link>
                </div>

                {/* History list */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 rounded-xl bg-card/30 animate-pulse" />
                        ))}
                    </div>
                ) : histories.length === 0 ? (
                    <Card className="bg-card/30 backdrop-blur border-mystic-purple/20 p-12 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Chưa có lần gieo quẻ nào</h3>
                        <p className="text-muted-foreground mb-6">
                            Bắt đầu gieo quẻ đầu tiên để khám phá trí tuệ Kinh Dịch.
                        </p>
                        <Link href="/divine">
                            <Button className="gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 text-black font-semibold">
                                    Gieo Quẻ Đầu Tiên
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {histories.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-white/80 backdrop-blur border-mystic-gold/15 hover:border-mystic-gold/30 transition-all duration-300 overflow-hidden shadow-sm">
                                    <CardHeader
                                        className="cursor-pointer"
                                        onClick={() =>
                                            setExpandedId(expandedId === item.id ? null : item.id)
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <CardTitle className="text-lg line-clamp-1">
                                                    &quot;{item.question}&quot;
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline" className="border-mystic-gold/30 text-mystic-gold">
                                                        {item.main_hexagram.name}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.main_hexagram.meaning}
                                                    </span>
                                                    {item.changing_hexagram && (
                                                        <>
                                                            <span className="text-muted-foreground">→</span>
                                                            <Badge variant="outline" className="border-mystic-gold/30 text-mystic-gold">
                                                                {item.changing_hexagram.name}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {item.changing_hexagram.meaning}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                                {expandedId === item.id ? (
                                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <AnimatePresence>
                                        {expandedId === item.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <CardContent className="pt-0 space-y-4">
                                                    <Separator className="bg-border/50" />
                                                    <div className="ai-response text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                                        {item.ai_response}
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteHistory(item.id);
                                                            }}
                                                            className="gap-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Xoá
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
