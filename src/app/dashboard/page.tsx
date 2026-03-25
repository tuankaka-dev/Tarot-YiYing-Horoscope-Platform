'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { History, Trash2, ChevronDown, ChevronUp, BookOpen, Coins, Sun, Bell, Calendar, Crown, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

interface NotificationItem {
    id: string;
    title: string;
    content: string | null;
    created_at: string;
}

interface LunarCalendarData {
    solar: {
        fullDate: string;
    };
    lunar: {
        day: number;
        month: number;
        year: number;
        leap: number;
        canChiDay: string;
        canChiMonth: string;
        canChiYear: string;
    };
    dayRating: {
        level: 'Đại Cát' | 'Cát' | 'Bình' | 'Hung';
        description: string;
    };
    truc: string;
    goodHours: string[];
    goodActivities: string[];
    badActivities: string[];
}

interface HistoryItem {
    id: string;
    history_type: 'iching' | 'tarot';
    question: string;
    ai_response: string;
    changing_lines: number[] | null;
    created_at: string;
    main_hexagram: {
        id: number;
        name: string;
        chinese_name: string;
        meaning: string;
    } | null;
    changing_hexagram: {
        id: number;
        name: string;
        chinese_name: string;
        meaning: string;
    } | null;
    tarot_spread_type: string | null;
    tarot_cards: Array<{ id: number; reversed?: boolean }> | null;
}

export default function DashboardPage() {
    const { profile } = useAuthStore();
    const [histories, setHistories] = useState<HistoryItem[]>([]);
    const [systemNotifs, setSystemNotifs] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
    const [lunarData, setLunarData] = useState<LunarCalendarData | null>(null);

    useEffect(() => {
        const loadAll = async () => {
            await Promise.all([fetchHistory(), fetchNotifs(), fetchLunarCalendar()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    const fetchLunarCalendar = async () => {
        try {
            const res = await fetch('/api/lunar-calendar', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setLunarData(data);
            }
        } catch {
            setLunarData(null);
        }
    };

    const fetchNotifs = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) setSystemNotifs(await res.json());
        } catch { }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const data = await res.json();
                setHistories(data);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử:', error);
        }
    };

    const deleteHistory = async (id: string, historyType: 'iching' | 'tarot') => {
        try {
            const res = await fetch(`/api/history?id=${id}&type=${historyType}`, { method: 'DELETE' });
            if (res.ok) {
                setHistories((prev) => prev.filter((h) => h.id !== id));
                toast.success('Đã xóa bản ghi lịch sử');
            }
        } catch {
            toast.error('Xoá thất bại');
        }
    };

    const handleUpgrade = async (tier: 'premium_weekly' | 'pro_monthly' = 'premium_weekly', e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (upgradingTier) return;
        setUpgradingTier(tier);
        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    toast.error('Giao diện thanh toán chưa được khởi tạo. Vui lòng thử lại.');
                }
            } else {
                const err = await res.json().catch(() => null);
                toast.error(err?.error || 'Lỗi tạo link thanh toán. Kiểm tra lại Key PayOS.');
            }
        } catch {
            toast.error('Lỗi kết nối, vui lòng thử lại.');
        } finally {
            setUpgradingTier(null);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}


                {/* Dashboard Grid Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                    {/* Box 1: Xu & Gói */}
                    <Card
                        className="bg-card/30 backdrop-blur border-mystic-gold/20 flex flex-col min-h-[220px] hover:border-mystic-gold/40 transition-all duration-300 relative overflow-hidden shadow-sm group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-mystic-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="pb-2 pt-5 px-5">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-mystic-gold">
                                <Coins className="w-5 h-5 inline-block -mt-1 mr-1" />
                                Xu & Gói Đăng Ký
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-5 pt-2">
                            {/* Top row: Balance */}
                            <div className="flex items-end justify-between mb-3">
                                <div className="flex items-baseline gap-1.5">
                                    <span className={`font-bold text-foreground tracking-tight ${profile?.is_pro ? 'text-2xl md:text-3xl uppercase text-amber-500' : 'text-4xl md:text-5xl'}`}>
                                        {profile?.is_pro ? 'Vô hạn' : (profile?.credits || 0)}
                                    </span>
                                    <span className="text-sm text-mystic-gold font-bold uppercase tracking-widest bg-mystic-gold/10 px-2 py-1 rounded-md">Xu</span>
                                </div>
                            </div>

                            {/* Free Tier daily text */}
                            <p className="text-xs text-muted-foreground mb-4 font-medium px-1">
                                {profile?.is_pro ? (
                                    <span>Bạn đang sử dụng gói <strong className="text-amber-500 font-bold uppercase">Gói Tháng (PRO)</strong></span>
                                ) : profile?.is_premium ? (
                                    <span>Bạn đang sử dụng gói <strong className="text-mystic-gold font-bold">Gói Tuần (Premium)</strong></span>
                                ) : (
                                    <>Bạn đang sử dụng <strong>Gói Miễn Phí</strong>. Gieo quẻ, lập lá số Tử Vi và trải Tarot cơ bản đều miễn phí; chỉ luận giải chuyên sâu mới tốn xu.</>
                                )}
                            </p>

                            {/* Bottom area: Premium CTA */}
                            <div className="mt-auto bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/20 shadow-inner">
                                {profile?.is_pro ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Gói Tháng (PRO)</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                                            Đặc quyền Vô hạn: Mọi tính năng đều khả dụng mà không tốn xu.
                                        </p>
                                    </div>
                                ) : profile?.is_premium ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Gói Tuần (Premium)</span>
                                            </div>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                className="h-6 text-[9px] text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 p-1 font-bold uppercase bg-amber-500/5 border border-amber-500/20"
                                                onClick={(e) => handleUpgrade('pro_monthly', e)}
                                                disabled={!!upgradingTier}
                                            >
                                                {upgradingTier === 'pro_monthly' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Lên PRO'}
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                                            Bạn đang nhận 100 xu/ngày. Nâng cấp Gói Tháng (PRO) để dùng Vô hạn!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {/* Premium Box */}
                                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-3 relative overflow-hidden group/box">
                                            <div className="flex items-center gap-2 text-amber-600/80">
                                                <Crown className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Gói Tuần</span>
                                            </div>
                                            <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                                                Nhận ngay <strong className="text-amber-600">100 xu</strong> mỗi ngày & gieo quẻ thoải mái hơn.
                                            </p>
                                            <Button
                                                size="sm"
                                                onClick={(e) => handleUpgrade('premium_weekly', e)}
                                                disabled={!!upgradingTier}
                                                className="w-full bg-gradient-to-r from-mystic-gold to-amber-500 hover:from-amber-400 hover:to-mystic-gold text-black font-bold text-[10px] uppercase tracking-widest shadow-sm h-10 transition-all active:scale-[0.98]"
                                            >
                                                {upgradingTier === 'premium_weekly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                                                Đăng Ký 50k/tuần
                                            </Button>
                                        </div>

                                        {/* PRO Box */}
                                        <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-xl space-y-3 relative overflow-hidden group/box">
                                            <div className="flex items-center gap-2 text-orange-600/80">
                                                <Zap className="w-4 h-4 text-orange-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Gói Tháng</span>
                                            </div>
                                            <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                                                Dùng <strong className="text-orange-600">Vô Hạn</strong> không tốn xu & Luận giải AI chuyên sâu.
                                            </p>
                                            <Button
                                                size="sm"
                                                onClick={(e) => handleUpgrade('pro_monthly', e)}
                                                disabled={!!upgradingTier}
                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-md h-10 gold-glow transition-all active:scale-[0.98]"
                                            >
                                                {upgradingTier === 'pro_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                Đăng Ký 100k/tháng
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Box 2: Ngày đẹp giờ đẹp */}
                    <Card className="bg-card/30 backdrop-blur border-mystic-purple/20 flex flex-col min-h-[220px] hover:border-mystic-purple/40 transition-colors relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-mystic-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="pb-2 pt-5 px-5">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-mystic-purple">
                                <Sun className="w-5 h-5 inline-block -mt-1 mr-1" />
                                Ngày Giờ Tốt Hôm Nay
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-5 pt-2">
                            <div className="flex items-center gap-4 mb-4 bg-background/30 p-4 rounded-xl border border-mystic-purple/10">
                                <div className="p-3 bg-mystic-purple/10 rounded-full shrink-0">
                                    <Calendar className="w-6 h-6 text-mystic-purple" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm leading-tight text-foreground/90">
                                        {lunarData?.solar.fullDate || new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs font-medium text-mystic-gold mt-1 uppercase tracking-wider">
                                        {lunarData
                                            ? `${lunarData.dayRating.level} • Trực ${lunarData.truc}`
                                            : 'Đang cập nhật lịch phương Đông'}
                                    </p>
                                    {lunarData && (
                                        <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
                                            Âm lịch {lunarData.lunar.day}/{lunarData.lunar.month}/{lunarData.lunar.year} • Ngày {lunarData.lunar.canChiDay}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-background/50 p-4 rounded-xl border border-border/50 flex flex-col justify-center flex-1 shadow-inner">
                                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2 uppercase tracking-widest">
                                    <Sun className="w-3 h-3 text-amber-500" />
                                    Giờ Đẹp Hợp Với Bạn
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(lunarData?.goodHours || []).slice(0, 6).map((hour) => (
                                        <Badge key={hour} variant="outline" className="text-xs font-medium border-mystic-gold/30 bg-mystic-gold/10 text-mystic-gold py-1">
                                            {hour}
                                        </Badge>
                                    ))}
                                    {!lunarData && (
                                        <span className="text-xs text-muted-foreground">Đang tải dữ liệu giờ hoàng đạo...</span>
                                    )}
                                </div>

                                {lunarData && (
                                    <div className="mt-3 grid grid-cols-1 gap-2 text-[11px]">
                                        <p className="text-emerald-600/90">
                                            <strong>Nên làm:</strong> {lunarData.goodActivities.join(', ')}
                                        </p>
                                        <p className="text-rose-600/90">
                                            <strong>Nên tránh:</strong> {lunarData.badActivities.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Box 3: Thông báo */}
                    <Card className="bg-card/30 backdrop-blur border-border/40 flex flex-col min-h-[220px] hover:border-border/80 transition-colors relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="pb-3 pt-5 px-5">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground/90">
                                <Bell className="w-5 h-5 inline-block -mt-1 mr-1 text-amber-500" />
                                Thông Báo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-5 pt-0">
                            {systemNotifs.length > 0 ? (
                                <div className="space-y-4 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                                    {systemNotifs.map((n, i) => (
                                        <div key={n.id} className={`flex gap-3 bg-background/40 p-3 rounded-xl border border-border/50 transition-all hover:bg-background/70 ${i > 0 && n.title.length < 50 ? 'opacity-85' : ''}`}>
                                            <div className="w-2 h-2 rounded-full bg-mystic-gold mt-1.5 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold line-clamp-2 leading-tight text-foreground/90" title={n.content || ''}>{n.title}</p>
                                                <p className="text-[11px] font-medium text-mystic-gold/80 mt-1 uppercase tracking-wider">
                                                    {new Date(n.created_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center flex-col gap-2 text-muted-foreground/50">
                                    <Bell className="w-8 h-8 opacity-20" />
                                    <p className="text-sm font-medium">Không có thông báo mới</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                            <History className="w-6 h-6 md:w-8 md:h-8" />
                            Lịch Sử Trải Nghiệm
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            {histories.length} bản ghi Kinh Dịch và Tarot
                        </p>
                    </div>
                    <div className="w-full sm:w-auto flex gap-2">
                        <Link href="/divine" className="w-full sm:w-auto">
                            <Button className="w-full gap-2 bg-gradient-to-r from-mystic-gold to-amber-600 text-white">
                                Gieo Quẻ Mới
                            </Button>
                        </Link>
                        <Link href="/tarot" className="w-full sm:w-auto">
                            <Button className="w-full gap-2 bg-gradient-to-r from-fuchsia-700 to-violet-700 text-white">
                                Trải Tarot
                            </Button>
                        </Link>
                    </div>
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
                        <h3 className="text-xl font-semibold mb-2">Chưa có lịch sử nào</h3>
                        <p className="text-muted-foreground mb-6">
                            Bắt đầu gieo quẻ hoặc trải Tarot để lưu lại hành trình của bạn.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Link href="/divine">
                                <Button className="gap-2 bg-gradient-to-r from-mystic-gold/90 to-yellow-600/90 text-black font-semibold">
                                    Gieo Quẻ Đầu Tiên
                                </Button>
                            </Link>
                            <Link href="/tarot">
                                <Button className="gap-2 bg-gradient-to-r from-fuchsia-700 to-violet-700 text-white font-semibold">
                                    Trải Tarot Đầu Tiên
                                </Button>
                            </Link>
                        </div>
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
                                                    {item.history_type === 'iching' && item.main_hexagram ? (
                                                        <>
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
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Badge variant="outline" className="border-fuchsia-500/30 text-fuchsia-600">
                                                                Tarot
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                Trải {item.tarot_spread_type === 'one_card' ? '1 lá' : item.tarot_spread_type === 'three_card' ? '3 lá' : '5 lá'}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {item.tarot_cards?.length || 0} lá đã rút
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
                                                        {item.ai_response || 'Chưa có thông điệp chuyên sâu cho lần trải này.'}
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteHistory(item.id, item.history_type);
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
