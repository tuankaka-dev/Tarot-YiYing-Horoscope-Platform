'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Trash2, Edit2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationItem {
    id: string;
    title: string;
    content: string | null;
    is_active: boolean;
    created_at: string;
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogData, setDialogData] = useState<Partial<NotificationItem> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications');
            if (res.ok) setNotifications(await res.json());
        } catch {
            toast.error('Lỗi khi tải thông báo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!dialogData?.title) return;
        setIsSaving(true);
        const isEditing = !!dialogData.id;

        try {
            const url = isEditing 
                ? `/api/admin/notifications/${dialogData.id}` 
                : '/api/admin/notifications';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dialogData),
            });

            if (res.ok) {
                const saved = await res.json();
                if (isEditing) {
                    setNotifications(prev => prev.map(n => n.id === saved.id ? saved : n));
                } else {
                    setNotifications(prev => [saved, ...prev]);
                }
                toast.success('Đã lưu thông báo');
                setDialogData(null);
            } else {
                toast.error('Lưu thất bại');
            }
        } catch {
            toast.error('Đã xảy ra lỗi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc xoá thông báo này?')) return;
        try {
            const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success('Đã xoá thông báo');
            }
        } catch {
            toast.error('Xoá thất bại');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                        <Bell className="w-8 h-8" />
                        Quản Lý Thông Báo
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Thêm, sửa, xoá các thông báo hệ thống cho người dùng
                    </p>
                </div>
                <Button 
                    onClick={() => setDialogData({ title: '', content: '', is_active: true })}
                    className="gap-2 bg-gradient-to-r from-mystic-gold to-amber-600 text-white"
                >
                    <Plus className="w-4 h-4" /> Tạo Mới
                </Button>
            </div>

            <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                <CardHeader>
                    <CardTitle className="text-lg">Danh sách thông báo</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead>Tiêu đề & Nội dung</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.map((notif) => (
                                    <TableRow key={notif.id} className="border-border/30">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-mystic-gold">{notif.title}</p>
                                                {notif.content && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-sm">
                                                        {notif.content}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {notif.is_active ? (
                                                <div className="flex items-center gap-1.5 text-green-400 text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Hiển thị
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                    <XCircle className="w-4 h-4" /> Đã ẩn
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDialogData(notif)}
                                                    className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(notif.id)}
                                                    className="w-8 h-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!dialogData} onOpenChange={(open) => !open && setDialogData(null)}>
                <DialogContent className="sm:max-w-xl bg-card border-mystic-gold/20">
                    <DialogHeader>
                        <DialogTitle>{dialogData?.id ? 'Chỉnh Sửa' : 'Tạo Thông Báo'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tiêu đề (ngắn gọn)</label>
                            <Input 
                                value={dialogData?.title || ''} 
                                onChange={e => setDialogData(d => d ? { ...d, title: e.target.value } : null)}
                                placeholder="VD: Ra mắt tính năng mới..."
                                className="bg-background/50 border-border/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nội dung chi tiết (không bắt buộc)</label>
                            <Textarea 
                                value={dialogData?.content || ''} 
                                onChange={e => setDialogData(d => d ? { ...d, content: e.target.value } : null)}
                                placeholder="Mô tả chi tiết..."
                                className="bg-background/50 border-border/50 resize-none h-24"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Switch 
                                checked={dialogData?.is_active ?? true}
                                onCheckedChange={c => setDialogData(d => d ? { ...d, is_active: c } : null)}
                            />
                            <span className="text-sm font-medium text-muted-foreground">Kích hoạt (hiển thị cho user)</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogData(null)} disabled={isSaving}>Hủy</Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={!dialogData?.title || isSaving}
                            className="bg-mystic-gold text-black hover:bg-amber-500"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu thông báo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
