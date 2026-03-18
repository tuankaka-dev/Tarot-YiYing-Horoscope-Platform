'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Search, Edit, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Hexagram {
    id: number;
    name: string;
    chinese_name: string;
    meaning: string;
    description: string;
    trigram_above: string;
    trigram_below: string;
}

export default function AdminHexagramsPage() {
    const [hexagrams, setHexagrams] = useState<Hexagram[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingHex, setEditingHex] = useState<Hexagram | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchHexagrams();
    }, []);

    const fetchHexagrams = async () => {
        try {
            const res = await fetch('/api/admin/hexagrams');
            if (res.ok) {
                setHexagrams(await res.json());
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error);
            toast.error('Không thể tải danh sách quẻ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHex) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/hexagrams', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingHex),
            });

            if (res.ok) {
                const updated = await res.json();
                setHexagrams((prev) =>
                    prev.map((h) => (h.id === updated.id ? updated : h))
                );
                toast.success('Đã cập nhật quẻ!');
                setEditingHex(null);
            } else {
                toast.error('Cập nhật thất bại');
            }
        } catch {
            toast.error('Đã xảy ra lỗi khi lưu');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredHexagrams = hexagrams.filter((hex) => {
        const query = searchQuery.toLowerCase();
        return (
            hex.name.toLowerCase().includes(query) ||
            hex.id.toString() === query ||
            hex.meaning.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                    <BookOpen className="w-8 h-8" />
                    Quản Lý Quẻ Dịch
                </h1>
                <p className="text-muted-foreground mt-1">
                    Cập nhật ý nghĩa, mô tả của 64 quẻ Kinh Dịch
                </p>
            </div>

            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg">Tất Cả Quẻ ({hexagrams.length})</CardTitle>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm quẻ (tên, số, ý nghĩa)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50 border-input"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                        </div>
                    ) : (
                        <div className="rounded-md border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/50 hover:bg-transparent bg-muted/20">
                                        <TableHead className="w-16">Số</TableHead>
                                        <TableHead>Tên Quẻ</TableHead>
                                        <TableHead className="hidden md:table-cell">Thượng/Hạ</TableHead>
                                        <TableHead className="hidden sm:table-cell">Ý Nghĩa</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHexagrams.map((hex) => (
                                        <TableRow key={hex.id} className="border-border/30">
                                            <TableCell className="font-medium text-mystic-gold">
                                                {hex.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{hex.name}</div>
                                                <div className="text-xs text-muted-foreground">{hex.chinese_name}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-foreground/70">
                                                {hex.trigram_above} / {hex.trigram_below}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-sm truncate max-w-[300px]" title={hex.meaning}>
                                                {hex.meaning}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingHex(hex)}
                                                    className="text-mystic-purple hover:text-mystic-purple/80 hover:bg-mystic-purple/10"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Sửa
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredHexagrams.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Không tìm thấy quẻ nào.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editingHex} onOpenChange={(open) => !open && setEditingHex(null)}>
                <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-mystic-gold/20">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle className="text-xl text-mystic-gold flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Chỉnh sửa quẻ {editingHex?.id}: {editingHex?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Thay đổi nội dung hiển thị của quẻ này.
                            </DialogDescription>
                        </DialogHeader>

                        {editingHex && (
                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Tên Quẻ</Label>
                                        <Input
                                            id="name"
                                            value={editingHex.name}
                                            onChange={(e) => setEditingHex({ ...editingHex, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chinese_name">Tên Hán Việt</Label>
                                        <Input
                                            id="chinese_name"
                                            value={editingHex.chinese_name}
                                            onChange={(e) => setEditingHex({ ...editingHex, chinese_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="trigram_above">Thượng Quái</Label>
                                        <Input
                                            id="trigram_above"
                                            value={editingHex.trigram_above}
                                            onChange={(e) => setEditingHex({ ...editingHex, trigram_above: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trigram_below">Hạ Quái</Label>
                                        <Input
                                            id="trigram_below"
                                            value={editingHex.trigram_below}
                                            onChange={(e) => setEditingHex({ ...editingHex, trigram_below: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meaning">Ý Nghĩa Ngắn Gọn</Label>
                                    <Input
                                        id="meaning"
                                        value={editingHex.meaning}
                                        onChange={(e) => setEditingHex({ ...editingHex, meaning: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô Tả Chi Tiết</Label>
                                    <Textarea
                                        id="description"
                                        rows={5}
                                        value={editingHex.description}
                                        onChange={(e) => setEditingHex({ ...editingHex, description: e.target.value })}
                                        className="resize-y"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setEditingHex(null)}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="gap-2 bg-gradient-to-r from-mystic-gold to-yellow-600 hover:from-mystic-gold/90 hover:to-yellow-600/90 text-black font-semibold"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Lưu Thay Đổi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
