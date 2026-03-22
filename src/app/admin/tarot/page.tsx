'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

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
};

export default function AdminTarotPage() {
    const [cards, setCards] = useState<TarotCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [editingCard, setEditingCard] = useState<TarotCard | null>(null);

    const fetchCards = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/tarot-cards');
            if (!res.ok) {
                throw new Error('Không thể tải danh sách lá Tarot');
            }
            const data = await res.json();
            setCards(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi tải dữ liệu Tarot');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const filteredCards = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return cards;

        return cards.filter((card) =>
            card.id.toString().includes(q) ||
            card.name.toLowerCase().includes(q) ||
            card.name_vi.toLowerCase().includes(q) ||
            card.keywords.toLowerCase().includes(q) ||
            (card.suit || '').toLowerCase().includes(q)
        );
    }, [cards, search]);

    const handleSeed = async () => {
        if (!confirm('Khởi tạo/cập nhật bộ 78 lá Tarot mặc định?')) return;

        setIsSeeding(true);
        try {
            const res = await fetch('/api/admin/tarot-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seed-default-78' }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Seed thất bại');
            }

            const data = await res.json();
            toast.success(`Đã đồng bộ ${data.total || 78} lá Tarot`);
            await fetchCards();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Seed thất bại');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCard) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/tarot-cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCard),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Lưu thất bại');
            }

            const updated = await res.json();
            setCards((prev) => prev.map((card) => (card.id === updated.id ? updated : card)));
            toast.success('Đã cập nhật lá bài');
            setEditingCard(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lưu thất bại');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow">Quản Lý 78 Lá Tarot</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý dữ liệu lá bài, từ khóa, mô tả và ảnh hiển thị.
                    </p>
                </div>
                <Button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="gap-2 bg-gradient-to-r from-fuchsia-700 to-violet-700 hover:from-fuchsia-600 hover:to-violet-600 text-white"
                >
                    {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Seed 78 Lá Mặc Định
                </Button>
            </div>

            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Tổng lá bài: {cards.length}</CardTitle>
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo id, tên, suit, keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-10 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border/50 overflow-hidden">
                            <table className="w-full min-w-[980px]">
                                <thead className="bg-background/60 border-b border-border/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">ID</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Tên lá</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Loại</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Keyword</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Ảnh</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCards.map((card) => (
                                        <tr key={card.id} className="border-b border-border/30 align-top">
                                            <td className="px-3 py-3 font-semibold text-mystic-gold">{card.id}</td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium">{card.name_vi}</p>
                                                <p className="text-xs text-muted-foreground">{card.name}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge variant="outline" className="capitalize">
                                                    {card.card_type}
                                                    {card.suit ? ` / ${card.suit}` : ''}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3 text-sm text-muted-foreground max-w-[320px] truncate" title={card.keywords}>
                                                {card.keywords}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-muted-foreground">
                                                {card.image_url ? 'Đã có ảnh' : 'Chưa có ảnh'}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5"
                                                    onClick={() => setEditingCard(card)}
                                                >
                                                    <Wand2 className="w-3.5 h-3.5" />
                                                    Sửa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCards.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                                                Không có lá bài phù hợp bộ lọc.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
                <DialogContent className="sm:max-w-[680px] bg-card/95 backdrop-blur-xl border-mystic-gold/20">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle className="text-mystic-gold">
                                Cập nhật lá {editingCard?.id}: {editingCard?.name_vi}
                            </DialogTitle>
                            <DialogDescription>
                                Chỉnh tên, mô tả, từ khóa và URL ảnh của lá Tarot.
                            </DialogDescription>
                        </DialogHeader>

                        {editingCard && (
                            <div className="grid gap-4 py-4 max-h-[62vh] overflow-y-auto px-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name_vi">Tên tiếng Việt</Label>
                                        <Input
                                            id="name_vi"
                                            value={editingCard.name_vi}
                                            onChange={(e) => setEditingCard({ ...editingCard, name_vi: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Tên tiếng Anh</Label>
                                        <Input
                                            id="name"
                                            value={editingCard.name}
                                            onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keywords">Keywords</Label>
                                    <Input
                                        id="keywords"
                                        value={editingCard.keywords}
                                        onChange={(e) => setEditingCard({ ...editingCard, keywords: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image_url">URL ảnh (Google Drive hoặc URL trực tiếp)</Label>
                                    <Input
                                        id="image_url"
                                        value={editingCard.image_url || ''}
                                        onChange={(e) => setEditingCard({ ...editingCard, image_url: e.target.value || null })}
                                        placeholder="https://drive.google.com/file/d/.../view"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meaning">Mô tả / Ý nghĩa</Label>
                                    <Textarea
                                        id="meaning"
                                        value={editingCard.meaning}
                                        onChange={(e) => setEditingCard({ ...editingCard, meaning: e.target.value })}
                                        rows={8}
                                        className="resize-y"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingCard(null)}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="gap-2 bg-gradient-to-r from-mystic-gold to-yellow-600 hover:from-mystic-gold/90 hover:to-yellow-600/90 text-black"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Lưu
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
