'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, profile, fetchProfile } = useAuthStore();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, full_name: fullName }),
            });

            if (res.ok) {
                await fetchProfile();
                toast.success('Cập nhật hồ sơ thành công');
            } else {
                toast.error('Cập nhật thất bại');
            }
        } catch {
            toast.error('Đã xảy ra lỗi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-mystic-gold text-gold-glow flex items-center gap-3">
                        <User className="w-8 h-8" />
                        Hồ Sơ Cá Nhân
                    </h1>
                    <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
                </div>

                <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-mystic-purple/30">
                                <AvatarFallback className="bg-mystic-purple/20 text-mystic-purple text-xl">
                                    {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{profile?.full_name || 'Người dùng'}</CardTitle>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Separator className="bg-border/50" />

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và Tên</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-background/50 border-mystic-purple/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email || ''} disabled className="bg-background/30 opacity-50" />
                            <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Input value={profile?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'} disabled className="bg-background/30 opacity-50" />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="gap-2 bg-gradient-to-r from-mystic-purple to-mystic-indigo text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu Thay Đổi
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
