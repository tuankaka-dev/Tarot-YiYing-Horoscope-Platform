'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DAY_OPTIONS,
    MONTH_OPTIONS,
    ZODIAC_BIRTH_HOURS,
    buildIsoBirthDate,
    splitBirthDate,
    validateBirthDateParts,
} from '@/lib/birth-info';
import { toast } from 'sonner';

export default function TuViPage() {
    const { user, profile, isLoading, fetchProfile } = useAuthStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthTimeInput, setBirthTimeInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const parts = splitBirthDate(profile?.birth_date);
        setBirthDay(parts.day);
        setBirthMonth(parts.month);
        setBirthYear(parts.year);
        if (profile?.birth_time) {
            setBirthTimeInput(profile.birth_time);
        }
    }, [profile?.birth_date, profile?.birth_time]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!user) {
            setIsDialogOpen(false);
            return;
        }

        const hasBirthInfo = Boolean(profile?.birth_date && profile?.birth_time);
        setIsDialogOpen(!hasBirthInfo);
    }, [isLoading, user, profile?.birth_date, profile?.birth_time]);

    const handleSaveBirthInfo = async () => {
        if (!birthTimeInput) {
            toast.error('Vui lòng chọn giờ sinh');
            return;
        }

        const birthDateError = validateBirthDateParts({ day: birthDay, month: birthMonth, year: birthYear });
        if (birthDateError) {
            toast.error(birthDateError);
            return;
        }

        const birthDateIso = buildIsoBirthDate({ day: birthDay, month: birthMonth, year: birthYear });
        if (!birthDateIso) {
            toast.error('Ngày sinh không hợp lệ');
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birth_date: birthDateIso,
                    birth_time: birthTimeInput,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                toast.error(err?.error || 'Không lưu được thông tin ngày/giờ sinh');
                return;
            }

            await fetchProfile();
            setIsDialogOpen(false);
            toast.success('Đã lưu thông tin tử vi');
        } catch {
            toast.error('Đã xảy ra lỗi khi lưu thông tin');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-white">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white border-mystic-gold/20">
                    <DialogHeader>
                        <DialogTitle>Bổ sung thông tin để xem Tử Vi</DialogTitle>
                        <DialogDescription>
                            Bạn chỉ cần nhập một lần. Sau đó hệ thống sẽ dùng lại thông tin này.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ngày sinh</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Select value={birthDay || null} onValueChange={(value) => setBirthDay(value ?? '')}>
                                    <SelectTrigger className="w-full h-10">
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
                                    <SelectTrigger className="w-full h-10">
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
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Giờ sinh (12 con giáp)</Label>
                            <Select
                                value={birthTimeInput || null}
                                onValueChange={(value) => setBirthTimeInput(value ?? '')}
                            >
                                <SelectTrigger className="w-full h-10">
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
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSaveBirthInfo}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-mystic-gold/90 hover:to-amber-600/90 text-white"
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
