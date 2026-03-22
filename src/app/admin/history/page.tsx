'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, History, Trash2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type HistoryItem = {
    id: string;
    history_type: 'iching' | 'tarot';
    user_id: string;
    question: string;
    ai_response: string;
    created_at: string;
    email: string;
    full_name: string | null;
    main_hexagram_id: number | null;
    main_hexagram_name: string | null;
    changing_hexagram_id: number | null;
    changing_hexagram_name: string | null;
    tarot_spread_type: string | null;
    tarot_cards: Array<{ id: number; reversed?: boolean }> | null;
};

type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export default function AdminHistoryPage() {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const hasSelected = selectedIds.length > 0;

    const allVisibleSelected = useMemo(() => {
        if (items.length === 0) return false;
        return items.every((item) => selectedIds.includes(item.id));
    }, [items, selectedIds]);

    const fetchHistory = async (nextPage?: number) => {
        setIsLoading(true);
        try {
            const page = nextPage ?? pagination.page;
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pagination.pageSize),
            });

            if (appliedSearch.trim()) {
                params.set('q', appliedSearch.trim());
            }
            if (fromDate) {
                params.set('from', fromDate);
            }
            if (toDate) {
                params.set('to', toDate);
            }

            const res = await fetch(`/api/admin/history?${params.toString()}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Không thể tải lịch sử');
            }

            const data = await res.json();
            setItems(data.data || []);
            setPagination(data.pagination);
            setSelectedIds([]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedSearch, fromDate, toDate]);

    const handleToggleAll = () => {
        if (allVisibleSelected) {
            setSelectedIds((prev) => prev.filter((id) => !items.some((item) => item.id === id)));
            return;
        }

        setSelectedIds((prev) => {
            const set = new Set(prev);
            items.forEach((item) => set.add(item.id));
            return Array.from(set);
        });
    };

    const handleToggleOne = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleDeleteOne = async (id: string) => {
        if (!confirm('Xóa vĩnh viễn lịch sử này?')) return;

        const item = items.find((entry) => entry.id === id);
        const typeQuery = item?.history_type === 'tarot' ? '?type=tarot' : '?type=iching';

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/history/${id}${typeQuery}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Xóa thất bại');
            }

            toast.success('Đã xóa lịch sử');
            await fetchHistory();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Xóa thất bại');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (!hasSelected) return;
        if (!confirm(`Xóa vĩnh viễn ${selectedIds.length} bản ghi đã chọn?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds.map((id) => {
                        const item = items.find((entry) => entry.id === id);
                        return { id, history_type: item?.history_type || 'iching' };
                    }),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Xóa hàng loạt thất bại');
            }

            const data = await res.json();
            toast.success(`Đã xóa ${data.deletedCount || 0} bản ghi`);
            await fetchHistory();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Xóa hàng loạt thất bại');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <History className="w-8 h-8" />
                    Quản Lý Lịch Sử Người Dùng
                </h1>
                <p className="text-muted-foreground mt-1">
                    Theo dõi, lọc và xóa lịch sử Kinh Dịch và Tarot của người dùng
                </p>
            </div>

            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                <CardHeader className="space-y-4">
                    <CardTitle className="text-lg">Bộ lọc và thao tác</CardTitle>
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="md:col-span-2 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm email, tên, câu hỏi..."
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={() => setAppliedSearch(search)} variant="secondary">
                                Lọc
                            </Button>
                        </div>
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => fetchHistory(1)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Làm mới
                        </Button>
                        <Button
                            variant="destructive"
                            className="gap-2"
                            disabled={!hasSelected || isDeleting}
                            onClick={handleDeleteSelected}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Xóa đã chọn ({selectedIds.length})
                        </Button>
                        <Badge variant="outline" className="ml-auto">
                            Tổng: {pagination.total}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            Không có dữ liệu phù hợp bộ lọc hiện tại
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-border/50">
                                <table className="w-full min-w-[980px]">
                                    <thead className="bg-background/50">
                                        <tr className="border-b border-border/50">
                                            <th className="px-3 py-2 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={allVisibleSelected}
                                                    onChange={handleToggleAll}
                                                    className="w-4 h-4"
                                                />
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Người dùng</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Câu hỏi</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Loại</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Nội dung</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">AI</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Thời gian</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => {
                                            const hasAiResponse = item.ai_response.trim().length > 0;

                                            return (
                                                <tr key={`${item.history_type}-${item.id}`} className="border-b border-border/30 align-top">
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(item.id)}
                                                            onChange={() => handleToggleOne(item.id)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="font-medium">{item.full_name || '—'}</p>
                                                        <p className="text-xs text-muted-foreground">{item.email}</p>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="line-clamp-3 text-sm leading-relaxed max-w-[320px]">{item.question}</p>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Badge
                                                            className={
                                                                item.history_type === 'iching'
                                                                    ? 'bg-mystic-gold/10 text-mystic-gold border-mystic-gold/30'
                                                                    : 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30'
                                                            }
                                                        >
                                                            {item.history_type === 'iching' ? 'Kinh Dịch' : 'Tarot'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {item.history_type === 'iching' ? (
                                                            <>
                                                                <p className="text-sm">{item.main_hexagram_id}. {item.main_hexagram_name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.changing_hexagram_id
                                                                        ? `Biến: ${item.changing_hexagram_id}. ${item.changing_hexagram_name}`
                                                                        : 'Không có quẻ biến'}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm">{item.tarot_spread_type === 'one_card' ? 'Trải 1 lá' : item.tarot_spread_type === 'three_card' ? 'Trải 3 lá' : 'Trải 5 lá'}</p>
                                                                <p className="text-xs text-muted-foreground">{item.tarot_cards?.length || 0} lá đã rút</p>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Badge
                                                            className={hasAiResponse
                                                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}
                                                        >
                                                            {hasAiResponse ? 'Đã có AI' : 'Chưa có AI'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                                                        {new Date(item.created_at).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={isDeleting}
                                                            onClick={() => handleDeleteOne(item.id)}
                                                            className="gap-1.5"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Xóa
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Trang {pagination.page} / {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page <= 1 || isLoading}
                                        onClick={() => fetchHistory(pagination.page - 1)}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={pagination.page >= pagination.totalPages || isLoading}
                                        onClick={() => fetchHistory(pagination.page + 1)}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
