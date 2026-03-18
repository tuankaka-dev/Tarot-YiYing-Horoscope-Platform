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
import { User, Save, Loader2, CreditCard, Crown, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, profile, fetchProfile } = useAuthStore();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

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

    const handleUpgradePremium = async () => {
        setIsUpgrading(true);
        try {
            const res = await fetch('/api/payment/create', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl; // Redirect to PayOS
                } else {
                    toast.error('Không thể tạo link thanh toán.');
                }
            } else {
                toast.error('Lỗi khi khởi tạo giao dịch.');
            }
        } catch {
            toast.error('Đã xảy ra lỗi hệ thống.');
        } finally {
            setIsUpgrading(false);
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
                                    {profile?.is_premium ? (
                                        <Badge className="bg-mystic-gold/10 text-mystic-gold border-mystic-gold/20 flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Premium
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">Miễn phí</Badge>
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
                            className="gap-2 bg-gradient-to-r from-mystic-purple to-mystic-indigo text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu Thay Đổi
                        </Button>
                    </CardContent>
                </Card>

                {/* Plan & Credits Card */}
                <Card className="bg-card/30 backdrop-blur border-mystic-gold/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CreditCard className="w-5 h-5 text-mystic-gold" />
                            Tài Khoản & Gói Cước
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/40 p-4 rounded-xl border border-border/50">
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                                    <Coins className="w-4 h-4 text-mystic-gold" /> Số dư Xu
                                </p>
                                <p className="text-3xl font-bold text-mystic-gold">{profile?.credits || 0}<span className="text-lg font-medium text-muted-foreground ml-1">xu</span></p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {profile?.is_premium 
                                        ? "Được +100 xu mỗi ngày" 
                                        : "Tặng 10 xu khi đăng ký. Nâng cấp để nhận xu mỗi ngày."}
                                </p>
                            </div>
                            
                            <div className="bg-background/40 p-4 rounded-xl border border-border/50 relative overflow-hidden">
                                {profile?.is_premium && (
                                    <div className="absolute top-0 right-0 p-2 bg-mystic-gold/10 rounded-bl-xl">
                                        <Crown className="w-4 h-4 text-mystic-gold" />
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground mb-1">Trạng thái gói</p>
                                <p className="text-xl font-bold">
                                    {profile?.is_premium ? (
                                        <span className="text-mystic-gold">Premium</span>
                                    ) : (
                                        <span className="text-foreground/70">Cơ bản</span>
                                    )}
                                </p>
                                {profile?.is_premium && profile?.premium_until && (
                                    <p className="text-xs text-muted-foreground mt-3">
                                        Hết hạn: {new Date(profile.premium_until).toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                                {!profile?.is_premium && (
                                    <p className="text-xs text-muted-foreground mt-3">
                                        Giới hạn 10 xu sử dụng trọn đời
                                    </p>
                                )}
                            </div>
                        </div>

                        {!profile?.is_premium && (
                            <div className="bg-mystic-purple/5 border border-mystic-purple/20 p-5 rounded-xl text-center space-y-3 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-mystic-purple/10 to-mystic-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <h3 className="text-lg font-semibold text-mystic-gold flex items-center justify-center gap-2">
                                    <Crown className="w-5 h-5" /> Nâng cấp Premium
                                </h3>
                                <p className="text-sm text-foreground/80 max-w-sm mx-auto">
                                    Mở khóa đặc quyền: Nhận <strong>100 xu mỗi ngày</strong> để sử dụng tất cả tính năng gieo quẻ AI không giới hạn.
                                </p>
                                <div className="text-2xl font-bold text-white pt-2">
                                    50.000₫ <span className="text-sm font-normal text-muted-foreground">/ tuần</span>
                                </div>
                                
                                <Button 
                                    onClick={handleUpgradePremium}
                                    disabled={isUpgrading}
                                    className="w-full sm:w-auto mt-4 gap-2 bg-gradient-to-r from-mystic-gold to-amber-500 hover:from-amber-400 hover:to-mystic-gold text-black font-semibold"
                                >
                                    {isUpgrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                    Nâng cấp ngay qua PayOS
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
