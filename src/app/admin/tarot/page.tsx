'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface TarotCard {
    id: number;
    name: string;
    name_vi: string;
    meaning: string;
    image_url: string | null;
    card_type: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    keywords: string;
}

export default function AdminTarotPage() {
    const [cards, setCards] = useState<TarotCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Partial<TarotCard> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await fetch('/api/admin/tarot');
            if (res.ok) {
                const data = await res.json();
                setCards(data);
            }
        } catch (error) {
            console.error('Error fetching tarot cards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingCard) return;

        setIsSaving(true);
        try {
            const method = editingCard.id ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/tarot', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCard),
            });

            if (res.ok) {
                toast.success(editingCard.id ? 'Cập nhật thành công' : 'Thêm thành công');
                setIsDialogOpen(false);
                setEditingCard(null);
                fetchCards();
            } else {
                toast.error('Lỗi khi lưu');
            }
        } catch {
            toast.error('Lỗi kết nối');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Xác nhận xóa lá bài này?')) return;

        try {
            const res = await fetch(`/api/admin/tarot?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Đã xóa');
                fetchCards();
            }
        } catch {
            toast.error('Lỗi khi xóa');
        }
    };

    const filteredCards = cards.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.name_vi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <Sparkles className="w-8 h-8" />
                    Quản Lý Bài Tarot
                </h1>
                <p className="text-muted-foreground mt-2">Quản lý bộ bài Tarot 78 lá</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm lá bài..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    onClick={() => {
                        setEditingCard({
                            name: '',
                            name_vi: '',
                            meaning: '',
                            image_url: '',
                            card_type: 'major',
                            suit: null,
                            number: null,
                            keywords: '',
                        });
                        setIsDialogOpen(true);
                    }}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                    <Plus className="w-4 h-4" />
                    Thêm Lá Bài
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-mystic-gold" />
                </div>
            ) : (
                <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                    <CardHeader>
                        <CardTitle>Danh Sách Bài Tarot ({filteredCards.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Tên (EN)</TableHead>
                                        <TableHead>Tên (VI)</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Bộ</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCards.map((card) => (
                                        <TableRow key={card.id}>
                                            <TableCell>{card.id}</TableCell>
                                            <TableCell className="font-medium">{card.name}</TableCell>
                                            <TableCell>{card.name_vi}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${card.card_type === 'major' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                                    {card.card_type === 'major' ? 'Major Arcana' : 'Minor Arcana'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{card.suit || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingCard(card);
                                                            setIsDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(card.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCard?.id ? 'Chỉnh Sửa Lá Bài' : 'Thêm Lá Bài Mới'}</DialogTitle>
                    </DialogHeader>
                    {editingCard && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tên (Tiếng Anh)</Label>
                                    <Input
                                        value={editingCard.name || ''}
                                        onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                                        placeholder="The Fool"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tên (Tiếng Việt)</Label>
                                    <Input
                                        value={editingCard.name_vi || ''}
                                        onChange={(e) => setEditingCard({ ...editingCard, name_vi: e.target.value })}
                                        placeholder="Kẻ Ngốc"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Loại Bài</Label>
                                    <Select
                                        value={editingCard.card_type || 'major'}
                                        onValueChange={(value) =>
                                            setEditingCard({ ...editingCard, card_type: value as 'major' | 'minor' })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="major">Major Arcana</SelectItem>
                                            <SelectItem value="minor">Minor Arcana</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Bộ (Minor only)</Label>
                                    <Select
                                        value={editingCard.suit || 'none'}
                                        onValueChange={(value) =>
                                            setEditingCard({ ...editingCard, suit: value === 'none' ? null : value })
                                        }
                                        disabled={editingCard.card_type === 'major'}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không</SelectItem>
                                            <SelectItem value="wands">Wands</SelectItem>
                                            <SelectItem value="cups">Cups</SelectItem>
                                            <SelectItem value="swords">Swords</SelectItem>
                                            <SelectItem value="pentacles">Pentacles</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Số</Label>
                                    <Input
                                        type="number"
                                        value={editingCard.number || ''}
                                        onChange={(e) =>
                                            setEditingCard({ ...editingCard, number: parseInt(e.target.value) || null })
                                        }
                                        placeholder="0-21 hoặc 1-14"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>URL Hình Ảnh</Label>
                                <Input
                                    value={editingCard.image_url || ''}
                                    onChange={(e) => setEditingCard({ ...editingCard, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Từ Khóa (phân cách bằng dấu phẩy)</Label>
                                <Input
                                    value={editingCard.keywords || ''}
                                    onChange={(e) => setEditingCard({ ...editingCard, keywords: e.target.value })}
                                    placeholder="khởi đầu, ngây thơ, phiêu lưu"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Ý Nghĩa</Label>
                                <Textarea
                                    value={editingCard.meaning || ''}
                                    onChange={(e) => setEditingCard({ ...editingCard, meaning: e.target.value })}
                                    rows={4}
                                    placeholder="Mô tả ý nghĩa của lá bài..."
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
