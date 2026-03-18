'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Settings, Plus, Pencil, Trash2, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface ApiConfigItem {
    id: string;
    name: string;
    provider: string;
    base_url: string;
    api_key: string;
    headers: Record<string, string> | null;
    status: string;
    created_at: string;
}

const emptyForm = {
    name: '',
    provider: 'gemini' as string,
    base_url: '',
    api_key: '',
    headers: '',
    status: 'inactive' as string,
};

export default function AdminApiConfigPage() {
    const [configs, setConfigs] = useState<ApiConfigItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/api-config');
            if (res.ok) {
                setConfigs(await res.json());
            }
        } catch (error) {
            console.error('Lỗi khi tải cấu hình:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.base_url || !form.api_key) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        let parsedHeaders = null;
        if (form.headers.trim()) {
            try {
                parsedHeaders = JSON.parse(form.headers);
            } catch {
                toast.error('JSON headers không hợp lệ');
                return;
            }
        }

        setIsSaving(true);

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = {
                ...(editingId && { id: editingId }),
                name: form.name,
                provider: form.provider,
                base_url: form.base_url,
                api_key: form.api_key,
                headers: parsedHeaders,
                status: form.status,
            };

            const res = await fetch('/api/admin/api-config', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(editingId ? 'Đã cập nhật cấu hình' : 'Đã tạo cấu hình mới');
                setIsDialogOpen(false);
                resetForm();
                fetchConfigs();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Lưu thất bại');
            }
        } catch {
            toast.error('Đã xảy ra lỗi');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteConfig = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/api-config?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setConfigs((prev) => prev.filter((c) => c.id !== id));
                toast.success('Đã xoá cấu hình');
            }
        } catch {
            toast.error('Xoá thất bại');
        }
    };

    const toggleStatus = async (config: ApiConfigItem) => {
        const newStatus = config.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch('/api/admin/api-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: config.id, status: newStatus }),
            });

            if (res.ok) {
                fetchConfigs();
                toast.success(`${config.name} đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hoá'}`);
            }
        } catch {
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const openEdit = (config: ApiConfigItem) => {
        setEditingId(config.id);
        setForm({
            name: config.name,
            provider: config.provider,
            base_url: config.base_url,
            api_key: '',
            headers: config.headers ? JSON.stringify(config.headers, null, 2) : '',
            status: config.status,
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Cấu Hình API
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý kết nối AI cho tính năng giải quẻ
                    </p>
                </div>

                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-gradient-to-r from-mystic-purple to-mystic-indigo text-white">
                    <Plus className="w-4 h-4" />
                    Thêm Nhà Cung Cấp
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogContent className="bg-card border-mystic-purple/20 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-mystic-gold">
                                {editingId ? 'Chỉnh Sửa' : 'Thêm'} Cấu Hình API
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Tên *</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Gemini 1.5 Pro"
                                    className="bg-background/50 border-mystic-purple/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nhà cung cấp *</Label>
                                <Select value={form.provider} onValueChange={(v: string | null) => { if (v) setForm({ ...form, provider: v }); }}>
                                    <SelectTrigger className="bg-background/50 border-mystic-purple/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gemini">Gemini</SelectItem>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="custom">Tuỳ chỉnh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>URL cơ sở *</Label>
                                <Input
                                    value={form.base_url}
                                    onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                                    placeholder="https://generativelanguage.googleapis.com/v1beta"
                                    className="bg-background/50 border-mystic-purple/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Khoá API *</Label>
                                <Input
                                    type="password"
                                    value={form.api_key}
                                    onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                                    placeholder={editingId ? 'Để trống nếu giữ nguyên' : 'Nhập khoá API'}
                                    className="bg-background/50 border-mystic-purple/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Headers tuỳ chỉnh (JSON, tuỳ chọn)</Label>
                                <Textarea
                                    value={form.headers}
                                    onChange={(e) => setForm({ ...form, headers: e.target.value })}
                                    placeholder='{"X-Custom-Header": "value"}'
                                    rows={3}
                                    className="bg-background/50 border-mystic-purple/20 font-mono text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={form.status === 'active'}
                                    onCheckedChange={(checked) =>
                                        setForm({ ...form, status: checked ? 'active' : 'inactive' })
                                    }
                                />
                                <Label>Đặt làm nhà cung cấp chính</Label>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                    Huỷ
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="gap-2 bg-gradient-to-r from-mystic-purple to-mystic-indigo text-white"
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingId ? 'Cập Nhật' : 'Tạo Mới'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Config list */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-mystic-purple" />
                </div>
            ) : configs.length === 0 ? (
                <Card className="bg-card/30 backdrop-blur border-mystic-purple/20 p-12 text-center">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Chưa có cấu hình API</h3>
                    <p className="text-muted-foreground mb-6">
                        Thêm nhà cung cấp AI để kích hoạt tính năng giải quẻ.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {configs.map((config) => (
                        <Card
                            key={config.id}
                            className={`bg-card/30 backdrop-blur transition-all duration-300 ${config.status === 'active'
                                    ? 'border-green-500/30 mystic-glow'
                                    : 'border-mystic-purple/20'
                                }`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${config.status === 'active' ? 'bg-green-400/10' : 'bg-muted'}`}>
                                        <Zap className={`w-4 h-4 ${config.status === 'active' ? 'text-green-400' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{config.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{config.base_url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={config.provider === 'gemini' ? 'default' : 'outline'}
                                        className={
                                            config.provider === 'gemini'
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                : config.provider === 'openai'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : ''
                                        }
                                    >
                                        {config.provider}
                                    </Badge>
                                    <Badge
                                        variant={config.status === 'active' ? 'default' : 'secondary'}
                                        className={
                                            config.status === 'active'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : ''
                                        }
                                    >
                                        {config.status === 'active' ? 'Hoạt động' : 'Tắt'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Khoá: {config.api_key}</span>
                                        <span>Thêm: {new Date(config.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={config.status === 'active'}
                                            onCheckedChange={() => toggleStatus(config)}
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => openEdit(config)} className="gap-1">
                                            <Pencil className="w-3 h-3" />
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteConfig(config.id)}
                                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Xoá
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
