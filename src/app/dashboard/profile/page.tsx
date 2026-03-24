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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User, Save, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import {
    DAY_OPTIONS,
    MONTH_OPTIONS,
    ZODIAC_BIRTH_HOURS,
    buildIsoBirthDate,
    splitBirthDate,
    validateBirthDateParts,
} from '@/lib/birth-info';
import { getStoredTuViGender, setStoredTuViGender, type TuViGender } from '@/lib/tuvi-gender';

export default function ProfilePage() {
    const { user, profile, fetchProfile } = useAuthStore();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthTime, setBirthTime] = useState(profile?.birth_time || '');
    const [tuViGender, setTuViGender] = useState<TuViGender>('male');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTuViGender(getStoredTuViGender());
    }, []);

    useEffect(() => {
        setFullName(profile?.full_name || '');
        const parts = splitBirthDate(profile?.birth_date);
        setBirthDay(parts.day);
        setBirthMonth(parts.month);
        setBirthYear(parts.year);
        setBirthTime(profile?.birth_time || '');
    }, [profile]);

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

        const birthDateError = validateBirthDateParts({
            day: birthDay,
            month: birthMonth,
            year: birthYear,
        });
        if (birthDateError) {
            toast.error(birthDateError);
            return;
        }

        const birthDateIso = buildIsoBirthDate({ day: birthDay, month: birthMonth, year: birthYear });

        setIsLoading(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    birth_date: birthDateIso,
                    birth_time: birthTime || null,
                }),
            });

            if (res.ok) {
                setStoredTuViGender(tuViGender);
                await fetchProfile();
                toast.success('Cập nhật hồ sơ thành công');
            } else {
                const err = await res.json().catch(() => null);
                toast.error(err?.error || 'Cập nhật thất bại');
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

                        <div className="space-y-2">
                            <Label>Ngày sinh</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Select value={birthDay || null} onValueChange={(value) => setBirthDay(value ?? '')}>
                                    <SelectTrigger className="w-full bg-background/50 border-mystic-purple/20 h-10">
                                        <SelectValue placeholder="Ngày" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAY_OPTIONS.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={birthMonth || null} onValueChange={(value) => setBirthMonth(value ?? '')}>
                                    <SelectTrigger className="w-full bg-background/50 border-mystic-purple/20 h-10">
                                        <SelectValue placeholder="Tháng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTH_OPTIONS.map((month) => (
                                            <SelectItem key={month} value={month}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                    placeholder="Năm"
                                    inputMode="numeric"
                                    className="bg-background/50 border-mystic-purple/20 h-10"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Chọn ngày, tháng và nhập năm sinh (VD: 2006)</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Giờ sinh (12 con giáp)</Label>
                            <Select
                                value={birthTime || null}
                                onValueChange={(value) => setBirthTime(value ?? '')}
                            >
                                <SelectTrigger className="w-full bg-background/50 border-mystic-purple/20 h-10">
                                    <SelectValue placeholder="Chọn giờ sinh" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ZODIAC_BIRTH_HOURS.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Có thể để trống nếu bạn chưa rõ giờ sinh.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Giới tính để lập lá số</Label>
                            <Select
                                value={tuViGender}
                                onValueChange={(value) => setTuViGender((value as TuViGender) ?? 'male')}
                            >
                                <SelectTrigger className="w-full bg-background/50 border-mystic-purple/20 h-10">
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Dùng cho tính toán lá số Tử Vi.
                            </p>
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
