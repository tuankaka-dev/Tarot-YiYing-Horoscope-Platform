'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getStoredTuViGender, setStoredTuViGender, type TuViGender } from '@/lib/tuvi-gender';
import { toast } from 'sonner';

type ChartStar = {
    name: string;
    palace: number;
    brightness?: string;
};

type ChartPalace = {
    index: number;
    branch: string;
    role: string;
    stars: {
        main: ChartStar[];
        minor: ChartStar[];
    };
};

type TuViChart = {
    input?: {
        solar?: {
            day: number;
            month: number;
            year: number;
        };
    };
    preProcessing: {
        lunar: {
            day: number;
            month: number;
            year: number;
            leap?: number;
            yearStemName: string;
            yearChiName: string;
            hourChiName: string;
        };
    };
    core: {
        menh: number;
        than: number;
        menhBranch: string;
        thanBranch: string;
        cuc: {
            name: string;
            value: number;
        };
    };
    cycles?: {
        trangSinhRing?: number[];
    };
    palaces: ChartPalace[];
};

const BRANCH_ELEMENT: Record<string, string> = {
    'Tý': 'Thuỷ',
    'Sửu': 'Thổ',
    'Dần': 'Mộc',
    'Mão': 'Mộc',
    'Thìn': 'Thổ',
    'Tỵ': 'Hoả',
    'Ngọ': 'Hoả',
    'Mùi': 'Thổ',
    'Thân': 'Kim',
    'Dậu': 'Kim',
    'Tuất': 'Thổ',
    'Hợi': 'Thuỷ',
};

const BAD_STAR_KEYWORDS = ['Kình', 'Đà', 'Không', 'Kiếp', 'Kỵ', 'Hổ', 'Sát'];
const PALACE_GRID_ORDER: Array<string | null> = [
    'Tỵ', 'Ngọ', 'Mùi', 'Thân',
    'Thìn', null, null, 'Dậu',
    'Mão', null, null, 'Tuất',
    'Dần', 'Sửu', 'Tý', 'Hợi',
];
const TRANG_SINH_LABELS = ['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
const CENTER_START_INDEX = 5;
const CENTER_SKIP_INDEXES = new Set([6, 9, 10]);
const ELEMENT_STYLE: Record<string, { text: string; border: string; bg: string }> = {
    'Kim': { text: 'text-gray-500', border: '', bg: '' },
    'Mộc': { text: 'text-green-600', border: '', bg: '' },
    'Thuỷ': { text: 'text-slate-900', border: '', bg: '' },
    'Hoả': { text: 'text-red-600', border: '', bg: '' },
    'Thổ': { text: 'text-amber-700', border: '', bg: '' },
};

function classifyMinorStars(stars: ChartStar[]) {
    const good: ChartStar[] = [];
    const bad: ChartStar[] = [];

    stars.forEach((star) => {
        if (star.name.startsWith('Hóa ')) {
            return;
        }

        const isBad = BAD_STAR_KEYWORDS.some((keyword) => star.name.includes(keyword));
        if (isBad) {
            bad.push(star);
            return;
        }
        good.push(star);
    });

    return { good, bad };
}

export default function TuViPage() {
    const router = useRouter();
    const { user, profile, isLoading, fetchProfile } = useAuthStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthTimeInput, setBirthTimeInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [gender, setGender] = useState<TuViGender>('male');
    const [chart, setChart] = useState<TuViChart | null>(null);
    const [chartError, setChartError] = useState('');
    const [isChartLoading, setIsChartLoading] = useState(false);

    const mainStarPlacements = useMemo(() => {
        if (!chart?.palaces?.length) {
            return [];
        }

        return chart.palaces
            .flatMap((palace) =>
                palace.stars.main.map((star) => ({
                    ...star,
                    branch: palace.branch,
                    role: palace.role,
                }))
            )
            .sort((a, b) => a.palace - b.palace || a.name.localeCompare(b.name, 'vi'));
    }, [chart]);

    const palaceByBranch = useMemo(() => {
        const map = new Map<string, ChartPalace>();
        chart?.palaces.forEach((palace) => {
            map.set(palace.branch, palace);
        });
        return map;
    }, [chart]);

    const birthHourLabel = useMemo(() => {
        const value = profile?.birth_time;
        if (!value) {
            return 'Chưa có';
        }

        const item = ZODIAC_BIRTH_HOURS.find((hour) => hour.value === value);
        return item?.label ?? value;
    }, [profile?.birth_time]);

    const solarBirthText = useMemo(() => {
        const solar = chart?.input?.solar;
        if (!solar) {
            return profile?.birth_date
                ? new Date(profile.birth_date).toLocaleDateString('vi-VN')
                : 'Chưa có';
        }

        return `${solar.day}/${solar.month}/${solar.year}`;
    }, [chart?.input?.solar, profile?.birth_date]);

    const trangSinhLabelByPalace = useMemo(() => {
        const map = new Map<number, string>();
        const ring = chart?.cycles?.trangSinhRing;
        if (!ring || ring.length !== 12) {
            return map;
        }

        ring.forEach((palaceIndex, stageIndex) => {
            const label = TRANG_SINH_LABELS[stageIndex] ?? '';
            if (label) {
                map.set(palaceIndex, label);
            }
        });

        return map;
    }, [chart]);

    useEffect(() => {
        setGender(getStoredTuViGender());
    }, []);

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

    useEffect(() => {
        if (isLoading || isDialogOpen || !profile?.birth_date || !profile?.birth_time) {
            return;
        }

        void fetchChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, isDialogOpen, profile?.birth_date, profile?.birth_time, gender]);

    const fetchChart = async () => {
        setIsChartLoading(true);
        setChartError('');

        try {
            const response = await fetch(`/api/tuvi/chart?gender=${gender}`);
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                setChart(null);
                setChartError(payload?.error || 'Không thể lập lá số tử vi');
                return;
            }

            setChart((payload?.chart as TuViChart | null) ?? null);
        } catch {
            setChart(null);
            setChartError('Không thể kết nối tới API tử vi');
        } finally {
            setIsChartLoading(false);
        }
    };

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
            setStoredTuViGender(gender);

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
        <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-mystic-gold">Lá Số Tử Vi</h1>
                        <p className="text-sm text-muted-foreground">
                            Hệ thống đang lập lá số từ ngày sinh và giờ sinh đã lưu trong hồ sơ.
                        </p>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button className="h-10" onClick={fetchChart} disabled={isChartLoading || isDialogOpen}>
                            {isChartLoading ? 'Đang lập...' : 'Lập lại lá số'}
                        </Button>
                        <Button type="button" variant="outline" className="h-10" onClick={() => router.push('/dashboard/profile')}>
                            Chỉnh sửa thông tin
                        </Button>
                    </div>
                </div>

                {chartError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                        {chartError}
                    </div>
                )}

                {!chartError && !chart && !isChartLoading && (
                    <div className="rounded-lg border border-dashed border-mystic-gold/30 bg-amber-50/50 px-4 py-5 text-sm text-amber-900">
                        Chưa có dữ liệu lá số. Hãy bấm nút Lập lại lá số để tải thông tin.
                    </div>
                )}

                {isChartLoading && (
                    <div className="rounded-lg border border-mystic-gold/20 bg-white px-4 py-5 text-sm text-muted-foreground">
                        Đang tính toán lá số tử vi...
                    </div>
                )}

                {chart && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Card className="border-mystic-gold/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Mệnh</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold text-mystic-gold">{chart.core.menhBranch}</p>
                                    <p className="text-xs text-muted-foreground">Cung số {chart.core.menh}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-mystic-gold/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Thân</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold text-mystic-gold">{chart.core.thanBranch}</p>
                                    <p className="text-xs text-muted-foreground">Cung số {chart.core.than}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-mystic-gold/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Ngũ Hành Cục</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold text-mystic-gold">{chart.core.cuc.name}</p>
                                    <p className="text-xs text-muted-foreground">Giá trị: {chart.core.cuc.value}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-mystic-gold/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Âm Lịch Dùng Để An Sao</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold text-mystic-gold">
                                        {chart.preProcessing.lunar.day}/{chart.preProcessing.lunar.month}/{chart.preProcessing.lunar.year}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {chart.preProcessing.lunar.yearStemName} {chart.preProcessing.lunar.yearChiName} - Giờ {chart.preProcessing.lunar.hourChiName}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-mystic-gold/20">
                            <CardHeader>
                                <CardTitle className="text-base">Bản Đồ 12 Cung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                    {chart.palaces.map((palace) => (
                                        <div key={`role-${palace.index}`} className="rounded-md border border-mystic-gold/15 bg-amber-50/40 px-3 py-2">
                                            <span className="font-semibold">{palace.role}</span>: {palace.branch} (#{palace.index})
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-mystic-gold/20">
                            <CardHeader>
                                <CardTitle className="text-base">Vị Trí Chính Tinh</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                    {mainStarPlacements.map((star) => (
                                        <div key={`${star.name}-${star.palace}`} className="rounded-md border border-mystic-gold/15 bg-white px-3 py-2">
                                            <p className="font-semibold text-mystic-gold">{star.name}</p>
                                            <p className="text-muted-foreground">
                                                {star.branch} ({star.role}){star.brightness ? ` - ${star.brightness}` : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <h2 className="text-base font-semibold text-mystic-gold mb-3">Lá Số 12 Cung (Grid)</h2>
                            <div className="overflow-x-auto">
                                <div className="grid grid-cols-4 gap-3 min-w-[920px]">
                                    {PALACE_GRID_ORDER.map((branch, cellIndex) => {
                                        if (CENTER_SKIP_INDEXES.has(cellIndex)) {
                                            return null;
                                        }

                                        if (cellIndex === CENTER_START_INDEX) {
                                            return (
                                                <div
                                                    key="center-info"
                                                    className="col-span-2 row-span-2 rounded-lg border border-mystic-gold/25 bg-[#F1ECE3] shadow-sm p-4 flex flex-col justify-between text-center"
                                                >
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide text-slate-500">Thông Tin Lá Số</p>
                                                        <p className="text-lg font-bold text-mystic-gold mt-1">
                                                            {profile?.full_name || profile?.email || 'Người dùng'}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5 text-sm text-slate-700">
                                                        <p><span className="font-semibold">Dương lịch:</span> {solarBirthText}</p>
                                                        <p>
                                                            <span className="font-semibold">Âm lịch:</span>{' '}
                                                            {chart.preProcessing.lunar.day}/{chart.preProcessing.lunar.month}/{chart.preProcessing.lunar.year}
                                                        </p>
                                                        <p><span className="font-semibold">Giờ sinh:</span> {birthHourLabel}</p>
                                                        <p><span className="font-semibold">Mệnh:</span> {chart.core.menhBranch} | <span className="font-semibold">Thân:</span> {chart.core.thanBranch}</p>
                                                        <p><span className="font-semibold">Cục:</span> {chart.core.cuc.name} ({chart.core.cuc.value})</p>
                                                    </div>

                                                    <p className="text-xs text-slate-500">
                                                        {chart.preProcessing.lunar.yearStemName} {chart.preProcessing.lunar.yearChiName} - Giờ {chart.preProcessing.lunar.hourChiName}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        if (!branch) {
                                            return (
                                                <div
                                                    key={`blank-${cellIndex}`}
                                                    className="rounded-lg border border-dashed border-mystic-gold/20 bg-[#F1ECE3]"
                                                />
                                            );
                                        }

                                        const palace = palaceByBranch.get(branch);
                                        if (!palace) {
                                            return (
                                                <div
                                                    key={`missing-${branch}`}
                                                    className="rounded-lg border border-red-200 bg-[#F1ECE3] px-2 py-3 text-xs text-red-600"
                                                >
                                                    Thiếu dữ liệu cung {branch}
                                                </div>
                                            );
                                        }

                                        const isMenh = palace.index === chart.core.menh;
                                        const isThan = palace.index === chart.core.than;
                                        const { good, bad } = classifyMinorStars(palace.stars.minor);
                                        const element = BRANCH_ELEMENT[palace.branch] ?? '';
                                        const trangSinhLabel = trangSinhLabelByPalace.get(palace.index) ?? '';
                                        const elementStyle = ELEMENT_STYLE[element] ?? { text: 'text-slate-700', border: '', bg: '' };

                                    return (
                                        <div
                                            key={`palace-${palace.index}-${branch}`}
                                            className="cung-view h-full rounded-lg border border-mystic-gold/25 bg-[#F1ECE3] shadow-sm overflow-hidden flex flex-col"
                                            id={`cung-${palace.index}`}
                                        >
                                            <div className="cung-top border-b border-mystic-gold/15 bg-amber-50/40 px-2 py-2">
                                                <div className="view-cung-top grid grid-cols-[52px_1fr_42px] gap-2 items-start">
                                                    <div>
                                                        <p className={`text-[11px] leading-4 font-semibold ${elementStyle.text}`}>{palace.branch}</p>
                                                        <p className={`text-[11px] leading-4 font-medium ${elementStyle.text}`}>+{element}</p>
                                                    </div>

                                                    <div className="chinh-tinh text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <p className={`text-[11px] font-bold ${elementStyle.text}`}>{palace.role}</p>
                                                            {isThan && <span className="text-[11px] font-bold text-red-600">&lt;Thân&gt;</span>}
                                                            {isMenh && <span className="text-[11px] font-bold text-amber-700">&lt;Mệnh&gt;</span>}
                                                        </div>
                                                        {palace.stars.main.length > 0 ? (
                                                            palace.stars.main.map((star) => (
                                                                <p key={`${palace.index}-${star.name}`} className="text-[11px] font-semibold text-slate-900 leading-4">
                                                                    {star.name} {star.brightness ? `(${star.brightness[0]})` : ''}
                                                                </p>
                                                            ))
                                                        ) : (
                                                            <p className="text-[11px] font-medium text-slate-400">Vô chính diệu</p>
                                                        )}
                                                    </div>

                                                    <div className="view-cung-dai-van text-right">
                                                        <p className="text-[11px] leading-4 font-semibold text-slate-600">#{palace.index}</p>
                                                        <p className="text-[11px] leading-4 text-slate-500">Th.{(palace.index % 12) + 1}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="cung-middle grid grid-cols-2 gap-2 px-2 py-2 min-h-[110px] flex-1">
                                                <div className="sao-tot space-y-1">
                                                    {good.length > 0 ? (
                                                        good.map((star) => (
                                                            <div
                                                                key={`good-${palace.index}-${star.name}`}
                                                                className="text-[11px] leading-4 text-slate-700"
                                                            >
                                                                {star.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[11px] leading-4 text-slate-300">.</div>
                                                    )}
                                                </div>
                                                <div className="sao-xau space-y-1">
                                                    {bad.length > 0 ? (
                                                        bad.map((star) => (
                                                            <div
                                                                key={`bad-${palace.index}-${star.name}`}
                                                                className="text-[11px] leading-4 text-slate-500 font-semibold"
                                                            >
                                                                {star.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[11px] leading-4 text-slate-300">.</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="cung-bottom border-t border-mystic-gold/15 bg-amber-50/30 px-2 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
                                                <span>ĐV.{palace.role.slice(0, 4).toUpperCase()}</span>
                                                <span>{trangSinhLabel || palace.branch}</span>
                                                <span>LN.{palace.role.slice(0, 4).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

                        <div className="space-y-2">
                            <Label>Giới tính</Label>
                            <Select value={gender} onValueChange={(value) => setGender((value as TuViGender) ?? 'male')}>
                                <SelectTrigger className="w-full h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
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
