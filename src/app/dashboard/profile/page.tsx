'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Save, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, profile, fetchProfile } = useAuthStore();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Handle payment redirects from PayOS
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        
        if (paymentStatus === 'success') {
            toast.success('Thanh toán thành công! Bạn đã nâng cấp Premium.');
            fetchProfile(); // Refresh to get new credits and premium status
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'cancel') {
            toast.error('Giao dịch đã bị hủy.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [fetchProfile]);

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName }),
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

                {/* Profile Form Card */}
                <Card className="bg-card/30 backdrop-blur border-mystic-purple/20">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-mystic-purple/30 relative">
                                <AvatarFallback className="bg-mystic-purple/20 text-mystic-purple text-xl">
                                    {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle>{profile?.full_name || 'Người dùng'}</CardTitle>
                                    {profile?.is_pro ? (
                                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Gói Tháng (PRO)
                                        </Badge>
                                    ) : profile?.is_premium ? (
                                        <Badge className="bg-mystic-gold/10 text-mystic-gold border-mystic-gold/20 flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Gói Tuần
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">Gói Miễn Phí</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
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

                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-mystic-purple to-mystic-indigo text-white shadow-md"
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
