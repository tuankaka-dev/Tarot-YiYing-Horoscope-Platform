'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTag } from '@/components/atoms/PriceTag';
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
    stemIndex?: number;
    stemName?: string;
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
        chuMenh?: string;
        chuThan?: string;
        cuc: {
            name: string;
            value: number;
        };
        banMenh?: {
            value: 1 | 2 | 3 | 4 | 5;
            element: 'Kim' | 'Thủy' | 'Hỏa' | 'Thổ' | 'Mộc';
            canChi?: string;
            napAm?: string;
            yNghia?: string;
        };
        laiNhanCung?: {
            yearStemName?: string;
            palaces?: number[];
            branches?: string[];
            roles?: string[];
        };
        canLuong?: {
            total: number;
            luong: number;
            chi: number;
            year: number;
            month: number;
            day: number;
            hour: number;
        };
    };
    cycles?: {
        direction?: 'forward' | 'backward';
        thaiTueRing?: number[];
        locTonRing?: number[];
        trangSinhRing?: number[];
    };
    voidsAndStrength?: {
        triet?: {
            palaces?: number[];
            branches?: string[];
        };
        tuan?: {
            palaces?: number[];
            branches?: string[];
        };
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

const GOOD_STAR_NAMES = new Set([
    'Thiên Khôi', 'Thiên Việt', 'Tả Phù', 'Hữu Bật', 'Văn Xương', 'Văn Khúc',
    'Long Trì', 'Phượng Các', 'Hoa Cái',
    'Đào Hoa', 'Hồng Loan', 'Thiên Hỷ',
    'Thiên Đức', 'Nguyệt Đức', 'Phúc Đức', 'Thiên Quan', 'Thiên Phúc',
    'Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Lộc Tồn',
]);

const BAD_STAR_NAMES = new Set([
    'Kình Dương', 'Đà La', 'Địa Không', 'Địa Kiếp', 'Hỏa Tinh', 'Linh Tinh',
    'Thiên Khốc', 'Thiên Hư', 'Đại Hao', 'Tiểu Hao', 'Tang Môn', 'Bạch Hổ',
    'Hóa Kỵ', 'Thiên Hình', 'Thiên Diêu', 'Lưu Hà', 'Quả Tú', 'Thiên Thương',
    'Điếu Khách', 'Thiên La', 'Tuế Phá', 'Quan Phủ', 'Quan Phù', 'Trực Phù',
    'Tướng Quân', 'Thiên Sứ', 'Tử Phù', 'Phục Binh', 'Phá Toái', 'Bệnh Phù',
    'Thái Tuế', 'Đầu Quân', 'Địa Võng', 'Phi Liêm', 'Cô Thần',
]);

const BAD_STAR_KEYWORDS = ['Kình', 'Đà', 'Không', 'Kiếp', 'Kỵ', 'Hổ', 'Sát', 'Khốc', 'Hư', 'Hao', 'Tang'];
const VIEW_YEAR_LUU_STARS = new Set([
    'Lưu Lộc Tồn',
    'Lưu Kình Dương',
    'Lưu Thái Tuế',
    'Lưu Tang Môn',
    'Lưu Bạch Hổ',
    'Lưu Thiên Mã',
    'Lưu Thiên Khốc',
    'Lưu Thiên Hư',
    'Lưu Thiên Khôi',
    'Lưu Thiên Việt',
    'Lưu Đào Hoa',
    'Lưu Hồng Loan',
    'Lưu Văn Xương',
    'Lưu Văn Khúc',
    'Lưu Hóa Lộc',
    'Lưu Hóa Quyền',
    'Lưu Hóa Khoa',
    'Lưu Hóa Kỵ',
]);
const PALACE_GRID_ORDER: Array<string | null> = [
    'Tỵ', 'Ngọ', 'Mùi', 'Thân',
    'Thìn', null, null, 'Dậu',
    'Mão', null, null, 'Tuất',
    'Dần', 'Sửu', 'Tý', 'Hợi',
];
const TRANG_SINH_LABELS = ['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
const THAI_TUE_RING_STARS = ['Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'];
const LOC_TON_RING_STARS = ['Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao', 'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần', 'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'];
const DV_LN_ROLE_ORDER = ['Mệnh', 'Phụ', 'Phúc', 'Điền', 'Quan', 'Nô', 'Di', 'Tật', 'Tài', 'Tử', 'Phối', 'Huynh'] as const;
const BRANCH_INDEX: Record<string, number> = {
    'Tý': 0,
    'Sửu': 1,
    'Dần': 2,
    'Mão': 3,
    'Thìn': 4,
    'Tỵ': 5,
    'Ngọ': 6,
    'Mùi': 7,
    'Thân': 8,
    'Dậu': 9,
    'Tuất': 10,
    'Hợi': 11,
};
const CENTER_START_INDEX = 5;
const CENTER_SKIP_INDEXES = new Set([6, 9, 10]);
const ELEMENT_STYLE: Record<string, { text: string; border: string; bg: string }> = {
    'Kim': { text: 'text-gray-500', border: '', bg: '' },
    'Mộc': { text: 'text-green-600', border: '', bg: '' },
    'Thuỷ': { text: 'text-slate-900', border: '', bg: '' },
    'Hoả': { text: 'text-red-600', border: '', bg: '' },
    'Thổ': { text: 'text-amber-700', border: '', bg: '' },
};

type NguHanh = 'Kim' | 'Mộc' | 'Thuỷ' | 'Hoả' | 'Thổ';

const MINOR_STAR_NGU_HANH: Record<string, NguHanh> = {
    // Kim
    'Văn Xương': 'Kim',
    'Thiên Khôi': 'Kim',
    'Thiên Việt': 'Kim',
    'Kình Dương': 'Kim',
    'Đà La': 'Kim',
    'Thiên Hình': 'Kim',
    'Tấu Thư': 'Kim',
    'Đường Phù': 'Kim',
    'Quốc Ấn': 'Kim',
    'Tam Thai': 'Kim',
    'Bát Tọa': 'Kim',
    'Bạch Hổ': 'Kim',
    'Quan Đới': 'Kim',
    'Lâm Quan': 'Kim',
    'Đế Vượng': 'Kim',

    // Mộc
    'Thiên Giải': 'Mộc',
    'Địa Giải': 'Mộc',
    'Giải Thần': 'Mộc',
    'Thiên Quan': 'Mộc',
    'Thiên Phúc': 'Mộc',
    'Thiên Lương': 'Mộc',
    'Thiên Thọ': 'Mộc',
    'Tướng Quân': 'Mộc',
    'Thiên Thương': 'Mộc',
    'Thiên Sứ': 'Mộc',
    'Dưỡng': 'Mộc',
    'Phúc Đức': 'Mộc',
    'Long Đức': 'Mộc',

    // Thuy
    'Văn Khúc': 'Thuỷ',
    'Hữu Bật': 'Thuỷ',
    'Long Trì': 'Thuỷ',
    'Thanh Long': 'Thuỷ',
    'Thiên Hỷ': 'Thuỷ',
    'Hóa Kỵ': 'Thuỷ',
    'Thiên Diêu': 'Thuỷ',
    'Thiên Y': 'Thuỷ',
    'Phá Toái': 'Thuỷ',
    'Lưu Hà': 'Thuỷ',
    'Thiên Khốc': 'Thuỷ',
    'Thiên Hư': 'Thuỷ',
    'Ân Quang': 'Thuỷ',
    'Thiên Quý': 'Thuỷ',
    'Bác Sĩ': 'Thuỷ',
    'Trực Phù': 'Thuỷ',
    'Mộc Dục': 'Thuỷ',
    'Suy': 'Thuỷ',
    'Tử': 'Thuỷ',
    'Tuyệt': 'Thuỷ',

    // Hoa
    'Hỏa Tinh': 'Hoả',
    'Linh Tinh': 'Hoả',
    'Thiên Không': 'Hoả',
    'Địa Không': 'Hoả',
    'Địa Kiếp': 'Hoả',
    'Thiên Mã': 'Hoả',
    'Đào Hoa': 'Hoả',
    'Hồng Loan': 'Hoả',
    'Thái Tuế': 'Hoả',
    'Lực Sĩ': 'Hoả',
    'Tiểu Hao': 'Hoả',
    'Đại Hao': 'Hoả',
    'Phi Liêm': 'Hoả',
    'Hỷ Thần': 'Hoả',
    'Phục Binh': 'Hoả',
    'Quan Phù': 'Hoả',
    'Điếu Khách': 'Hoả',

    // Tho
    'Tả Phù': 'Thổ',
    'Lộc Tồn': 'Thổ',
    'Phượng Các': 'Thổ',
    'Thai Phụ': 'Thổ',
    'Phong Cáo': 'Thổ',
    'Cô Thần': 'Thổ',
    'Quả Tú': 'Thổ',
    'Kiếp Sát': 'Thổ',
    'Thiên La': 'Thổ',
    'Địa Võng': 'Thổ',
    'Đầu Quân': 'Thổ',
    'Tang Môn': 'Thổ',
    'Tử Phù': 'Thổ',
    'Tuế Phá': 'Thổ',
    'Bệnh Phù': 'Thổ',
    'Quan Phủ': 'Thổ',
    'Tràng Sinh': 'Thổ',
    'Mộ': 'Thổ',
    'Thai': 'Thổ',
};

const MAIN_STAR_NGU_HANH: Record<string, NguHanh> = {
    // Hoả
    'Liêm Trinh': 'Hoả',
    'Thái Dương': 'Hoả',

    // Thổ
    'Tử Vi': 'Thổ',
    'Thiên Phủ': 'Thổ',

    // Kim
    'Vũ Khúc': 'Kim',
    'Thất Sát': 'Kim',

    // Thuỷ
    'Thiên Đồng': 'Thuỷ',
    'Thiên Tướng': 'Thuỷ',
    'Thái Âm': 'Thuỷ',
    'Tham Lang': 'Thuỷ',
    'Cự Môn': 'Thuỷ',
    'Phá Quân': 'Thuỷ',

    // Mộc
    'Thiên Cơ': 'Mộc',
    'Thiên Lương': 'Mộc',
};

type TamHopGroupId = 'menh-tai-quan' | 'phuc-phoi-di' | 'phu-no-tat' | 'dien-tu-huynh';

const TAM_HOP_GROUPS: Array<{ id: TamHopGroupId; label: string; roles: [string, string, string] }> = [
    { id: 'menh-tai-quan', label: 'Tam Hợp Mệnh - Tài - Quan', roles: ['Mệnh', 'Tài Bạch', 'Quan Lộc'] },
    { id: 'phuc-phoi-di', label: 'Tam Hợp Phúc - Phối - Di', roles: ['Phúc Đức', 'Phu Thê', 'Thiên Di'] },
    { id: 'phu-no-tat', label: 'Tam Hợp Phụ - Nô - Tật', roles: ['Phụ Mẫu', 'Nô Bộc', 'Tật Ách'] },
    { id: 'dien-tu-huynh', label: 'Tam Hợp Điền - Tử - Huynh', roles: ['Điền Trạch', 'Tử Tức', 'Huynh Đệ'] },
];

const TAM_HOP_INTERPRETATION_DB: Record<TamHopGroupId, { overview: string; focus: string; note: string }> = {
    'menh-tai-quan': {
        overview: 'Bộ Mệnh - Tài - Quan phản ánh trục bản thân, năng lực kiếm tiền và con đường công danh của đương số.',
        focus: 'Nếu chính tinh sáng và cát tinh nhiều, trục này thường cho thấy năng lực tự thân mạnh, tài chính đi cùng sự nghiệp.',
        note: 'Nên đọc đồng thời cả ba cung để tránh luận thiên lệch một điểm.',
    },
    'phuc-phoi-di': {
        overview: 'Bộ Phúc - Phối - Di cho thấy nền phúc phần, cách gắn kết hôn nhân và năng lực thích nghi với môi trường xã hội.',
        focus: 'Cát tinh tại đây thường giúp quan hệ hài hòa, ra ngoài gặp trợ lực; sát tinh nhiều báo hiệu cần mềm dẻo trong giao tiếp.',
        note: 'Khi luận hôn nhân, nên xem phối hợp Phu Thê với Phúc Đức trước rồi mới kết luận.',
    },
    'phu-no-tat': {
        overview: 'Bộ Phụ - Nô - Tật phản ánh hậu thuẫn gia đình, vòng cộng sự và nền tảng sức khỏe thể chất tinh thần.',
        focus: 'Sao tốt tại Nô Bộc và Tật Ách giúp giảm áp lực đường đời, tăng khả năng bền bỉ khi làm việc dài hạn.',
        note: 'Đây là bộ cung nên theo dõi theo đại vận để chủ động phòng ngừa hơn là đợi vấn đề xuất hiện.',
    },
    'dien-tu-huynh': {
        overview: 'Bộ Điền - Tử - Huynh thể hiện nền tảng gia cư, hậu vận con cái và cách phối hợp trong nội tộc anh em.',
        focus: 'Cung Điền sáng thường giúp ổn định chỗ ở; cung Tử và Huynh hài hòa tăng khả năng giữ nhịp gia đạo lâu dài.',
        note: 'Nên luận theo hướng cân bằng trách nhiệm gia đình và mục tiêu cá nhân.',
    },
};

function getMinorStarTextClass(starName: string, isBad: boolean): string {
    const normalizedName = normalizeMinorStarName(starName);
    const nguHanh = MINOR_STAR_NGU_HANH[normalizedName] ?? MINOR_STAR_NGU_HANH[starName];
    if (nguHanh) {
        return ELEMENT_STYLE[nguHanh].text;
    }
    return isBad ? 'text-slate-500' : 'text-slate-700';
}

function getMainStarTextClass(starName: string): string {
    const nguHanh = MAIN_STAR_NGU_HANH[starName];
    if (nguHanh) {
        return ELEMENT_STYLE[nguHanh].text;
    }
    return 'text-slate-900';
}

function getMinorBrightnessTag(star: ChartStar): string {
    return star.brightness ? ` (${star.brightness[0]})` : '';
}

const MINOR_BRIGHTNESS_BY_INDEX: Record<string, Partial<Record<number, 'M' | 'Đ' | 'H'>>> = {
    'Kình Dương': { 1: 'M', 4: 'M', 7: 'M', 10: 'M' },
    'Đà La': { 1: 'M', 4: 'M', 7: 'M', 10: 'M' },
    'Địa Không': { 2: 'Đ', 5: 'Đ', 8: 'Đ', 11: 'Đ' },
    'Địa Kiếp': { 2: 'Đ', 5: 'Đ', 8: 'Đ', 11: 'Đ' },
    'Hỏa Tinh': { 2: 'Đ', 5: 'Đ', 6: 'Đ', 8: 'Đ' },
    'Linh Tinh': { 2: 'Đ', 5: 'Đ', 6: 'Đ', 8: 'Đ' },
    'Văn Xương': { 1: 'Đ', 3: 'Đ', 5: 'Đ', 7: 'Đ', 9: 'Đ', 11: 'Đ' },
    'Văn Khúc': { 1: 'Đ', 3: 'Đ', 5: 'Đ', 7: 'Đ', 9: 'Đ', 11: 'Đ' },
    'Hóa Kỵ': { 0: 'Đ', 11: 'Đ' },
    'Lộc Tồn': { 2: 'Đ', 5: 'Đ', 8: 'Đ', 11: 'Đ' },
    'Thiên Mã': { 2: 'Đ', 8: 'Đ' },
    'Thanh Long': { 4: 'Đ' },
    'Phượng Các': { 9: 'Đ' },
    'Thiên Khốc': { 0: 'Đ', 6: 'Đ' },
    'Thiên Hư': { 0: 'Đ', 6: 'Đ' },
    'Đào Hoa': { 0: 'H', 3: 'M' },
};

function resolveMinorBrightnessByIndex(starName: string, palaceIndex: number): string | undefined {
    const normalizedName = normalizeMinorStarName(starName);
    const rule = MINOR_BRIGHTNESS_BY_INDEX[normalizedName] ?? MINOR_BRIGHTNESS_BY_INDEX[starName];
    const symbol = rule?.[palaceIndex];
    if (!symbol) {
        return undefined;
    }

    if (symbol === 'M') return 'Miếu';
    if (symbol === 'Đ') return 'Đắc';
    return 'Hãm';
}

function classifyMinorStars(stars: ChartStar[]) {
    const good: ChartStar[] = [];
    const bad: ChartStar[] = [];

    stars.forEach((star) => {
        const normalizedName = normalizeMinorStarName(star.name);

        if (GOOD_STAR_NAMES.has(normalizedName) || GOOD_STAR_NAMES.has(star.name)) {
            good.push(star);
            return;
        }

        if (BAD_STAR_NAMES.has(normalizedName) || BAD_STAR_NAMES.has(star.name)) {
            bad.push(star);
            return;
        }

        const isBad = BAD_STAR_KEYWORDS.some((keyword) => normalizedName.includes(keyword) || star.name.includes(keyword));
        if (isBad) {
            bad.push(star);
            return;
        }
        good.push(star);
    });

    return { good, bad };
}

function normalizeMinorStarName(starName: string): string {
    if (starName.startsWith('Lưu ')) {
        return starName.slice(4);
    }

    return starName;
}

function formatMinorStarDisplayName(starName: string): string {
    if (VIEW_YEAR_LUU_STARS.has(starName) && starName.startsWith('Lưu ')) {
        return `L.${starName.slice(4)}`;
    }

    return starName;
}

function normalizePalaceIndex(value: number): number {
    const v = value % 12;
    return v < 0 ? v + 12 : v;
}

function resolveTieuHanStartByYearChiAndGender(yearChiName: string, gender: TuViGender): number | null {
    const isMale = gender === 'male';

    if (['Tỵ', 'Dậu', 'Sửu'].includes(yearChiName)) {
        return BRANCH_INDEX[isMale ? 'Mùi' : 'Sửu'];
    }
    if (['Hợi', 'Mão', 'Mùi'].includes(yearChiName)) {
        return BRANCH_INDEX[isMale ? 'Sửu' : 'Mùi'];
    }
    if (['Thân', 'Tý', 'Thìn'].includes(yearChiName)) {
        return BRANCH_INDEX[isMale ? 'Dần' : 'Thân'];
    }
    if (['Dần', 'Ngọ', 'Tuất'].includes(yearChiName)) {
        return BRANCH_INDEX[isMale ? 'Thân' : 'Dần'];
    }

    return null;
}

export default function TuViPage() {
    const router = useRouter();
    const { user, profile, isLoading, fetchProfile } = useAuthStore();
    const initialViewYear = new Date().getFullYear();
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
    const [viewYear, setViewYear] = useState(String(initialViewYear));
    const [deepQuestion, setDeepQuestion] = useState('');
    const [deepAnswer, setDeepAnswer] = useState('');
    const [isDeepLoading, setIsDeepLoading] = useState(false);

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

    const thaiTueLabelByPalace = useMemo(() => {
        const map = new Map<number, string>();
        const ring = chart?.cycles?.thaiTueRing;
        if (!ring || ring.length !== 12) {
            return map;
        }

        ring.forEach((palaceIndex, stageIndex) => {
            const label = THAI_TUE_RING_STARS[stageIndex] ?? '';
            if (label) {
                map.set(palaceIndex, label);
            }
        });

        return map;
    }, [chart]);

    const locTonLabelByPalace = useMemo(() => {
        const map = new Map<number, string>();
        const ring = chart?.cycles?.locTonRing;
        if (!ring || ring.length !== 12) {
            return map;
        }

        ring.forEach((palaceIndex, stageIndex) => {
            const label = LOC_TON_RING_STARS[stageIndex] ?? '';
            if (label) {
                map.set(palaceIndex, label);
            }
        });

        return map;
    }, [chart]);

    const effectiveViewYear = useMemo(() => {
        const parsed = Number.parseInt(viewYear, 10);
        if (Number.isNaN(parsed) || parsed < 1) {
            return initialViewYear;
        }
        return parsed;
    }, [viewYear, initialViewYear]);

    const dvRoleByPalace = useMemo(() => {
        const map = new Map<number, string>();
        if (!chart) {
            return map;
        }

        const birthYear = chart.input?.solar?.year;
        if (!birthYear) {
            return map;
        }

        const currentAge = effectiveViewYear - birthYear + 1;
        const cucValue = chart.core.cuc.value;
        const cycleIndex = Math.max(0, Math.floor((currentAge - cucValue) / 10));

        const isForward = chart.cycles?.direction
            ? chart.cycles.direction === 'forward'
            : (['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(chart.preProcessing.lunar.yearStemName)
                ? gender === 'male'
                : gender === 'female');
        const step = isForward ? 1 : -1;

        const dvMenhPalace = normalizePalaceIndex(chart.core.menh + cycleIndex * step);
        DV_LN_ROLE_ORDER.forEach((role, idx) => {
            map.set(normalizePalaceIndex(dvMenhPalace + idx), role);
        });

        return map;
    }, [chart, effectiveViewYear, gender]);

    const dvAgeRangeByPalace = useMemo(() => {
        const map = new Map<number, { start: number; end: number }>();
        if (!chart) {
            return map;
        }

        const isForward = chart.cycles?.direction
            ? chart.cycles.direction === 'forward'
            : (['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(chart.preProcessing.lunar.yearStemName)
                ? gender === 'male'
                : gender === 'female');
        const step = isForward ? 1 : -1;
        const baseAge = chart.core.cuc.value;

        for (let i = 0; i < 12; i += 1) {
            const palaceIndex = normalizePalaceIndex(chart.core.menh + i * step);
            const start = baseAge + i * 10;
            map.set(palaceIndex, { start, end: start + 9 });
        }

        return map;
    }, [chart, gender]);

    const lnRoleByPalace = useMemo(() => {
        const map = new Map<number, string>();

        const birthYear = chart?.input?.solar?.year;
        const yearChiName = chart?.preProcessing?.lunar?.yearChiName;

        let tieuHanIndex = normalizePalaceIndex((effectiveViewYear + 8) % 12);
        if (birthYear && yearChiName) {
            const currentAge = effectiveViewYear - birthYear + 1;
            const startIndex = resolveTieuHanStartByYearChiAndGender(yearChiName, gender);
            if (startIndex !== null) {
                const step = gender === 'male' ? 1 : -1;
                tieuHanIndex = normalizePalaceIndex(startIndex + (currentAge - 1) * step);
            }
        }

        // Tag_LN = (palaceIndex - tieuHanIndex + 12) % 12
        // 0 -> Mệnh, 1 -> Phụ, ...
        for (let palaceIndex = 0; palaceIndex < 12; palaceIndex += 1) {
            const tagLn = normalizePalaceIndex(palaceIndex - tieuHanIndex);
            map.set(palaceIndex, DV_LN_ROLE_ORDER[tagLn]);
        }

        return map;
    }, [chart, effectiveViewYear, gender]);

    const trietPalaces = useMemo(() => {
        const palaces = chart?.voidsAndStrength?.triet?.palaces ?? [];
        return new Set(palaces);
    }, [chart]);

    const tuanPalaces = useMemo(() => {
        const palaces = chart?.voidsAndStrength?.tuan?.palaces ?? [];
        return new Set(palaces);
    }, [chart]);

    const fullTextReport = useMemo(() => {
        if (!chart) {
            return '';
        }

        const coreInfo = [
            `Lá số được lập cho ${profile?.full_name || profile?.email || 'đương số'} với dương lịch ${solarBirthText}, âm lịch ${chart.preProcessing.lunar.day}/${chart.preProcessing.lunar.month}/${chart.preProcessing.lunar.year}, giờ ${birthHourLabel}.`,
            `Năm xem ${effectiveViewYear}. Mệnh an tại cung ${chart.core.menhBranch}, Thân an tại cung ${chart.core.thanBranch}.`,
            `Cục: ${chart.core.cuc.name} (${chart.core.cuc.value}). Bản mệnh: ${chart.core.banMenh?.napAm ? `${chart.core.banMenh.napAm} (${chart.core.banMenh.yNghia ?? chart.core.banMenh.element})` : '-'}.`,
            `Chủ Mệnh: ${chart.core.chuMenh || '-'}; Chủ Thân: ${chart.core.chuThan || '-'}; Lai nhân cung: ${chart.core.laiNhanCung?.roles?.join(' / ') || '-'}.`,
            `Cân lượng: ${chart.core.canLuong ? `${chart.core.canLuong.luong} lượng ${chart.core.canLuong.chi} chỉ` : '-'}.`,
            `Chiều vận hành đại vận: ${chart.cycles?.direction === 'forward' ? 'Thuận' : 'Nghịch'}. Tuần/Triệt: ${chart.voidsAndStrength?.tuan?.branches?.join(', ') || '-'} / ${chart.voidsAndStrength?.triet?.branches?.join(', ') || '-'}.`,
        ].join(' ');

        const palaceTexts = chart.palaces.map((palace) => {
            const mainText = palace.stars.main.length > 0
                ? palace.stars.main
                    .map((star) => `${star.name}${star.brightness ? ` (${star.brightness[0]})` : ''}`)
                    .join(', ')
                : 'Vô chính diệu';

            const minorText = palace.stars.minor.length > 0
                ? palace.stars.minor
                    .map((star) => `${formatMinorStarDisplayName(star.name)}${getMinorBrightnessTag(star)}`)
                    .join(', ')
                : 'Không có phụ tinh nổi bật';

            const thaiTueRing = thaiTueLabelByPalace.get(palace.index);
            const locTonRing = locTonLabelByPalace.get(palace.index);
            const trangSinh = trangSinhLabelByPalace.get(palace.index);
            const dvRole = dvRoleByPalace.get(palace.index);
            const lnRole = lnRoleByPalace.get(palace.index);
            const dvAge = dvAgeRangeByPalace.get(palace.index);
            const voidMarks = [
                tuanPalaces.has(palace.index) ? 'Tuần' : '',
                trietPalaces.has(palace.index) ? 'Triệt' : '',
            ].filter(Boolean).join(', ');

            const ringParts = [thaiTueRing, locTonRing, trangSinh].filter(Boolean).join(', ');
            const cycleText = `${dvRole ? `dv.${dvRole}` : '-'} | ${lnRole ? `ln.${lnRole}` : '-'}${dvAge ? ` | Đại vận ${dvAge.start}-${dvAge.end}` : ''}`;

            return `Cung ${palace.role} (${palace.branch}): Chính tinh ${mainText}. Phụ tinh ${minorText}. ${ringParts ? `Vòng sao: ${ringParts}. ` : ''}${cycleText}.${voidMarks ? ` Gặp ${voidMarks}.` : ''}`;
        });

        return `${coreInfo}\n\n${palaceTexts.join('\n\n')}`;
    }, [
        chart,
        profile?.full_name,
        profile?.email,
        solarBirthText,
        birthHourLabel,
        effectiveViewYear,
        thaiTueLabelByPalace,
        locTonLabelByPalace,
        trangSinhLabelByPalace,
        dvRoleByPalace,
        lnRoleByPalace,
        dvAgeRangeByPalace,
        tuanPalaces,
        trietPalaces,
    ]);

    const tamHopAnalyses = useMemo(() => {
        if (!chart) {
            return [] as Array<{ id: TamHopGroupId; label: string; content: string }>;
        }

        const roleMap = new Map<string, ChartPalace>();
        chart.palaces.forEach((palace) => {
            roleMap.set(palace.role, palace);
        });

        return TAM_HOP_GROUPS.map((group) => {
            const db = TAM_HOP_INTERPRETATION_DB[group.id];
            const palaceSummaries = group.roles.map((role) => {
                const palace = roleMap.get(role);
                if (!palace) {
                    return `Cung ${role}: chưa có dữ liệu.`;
                }

                const mainStars = palace.stars.main.length > 0
                    ? palace.stars.main.map((s) => s.name).join(', ')
                    : 'Vô chính diệu';
                const { good, bad } = classifyMinorStars(palace.stars.minor);

                return `Cung ${role} (${palace.branch}) có chính tinh ${mainStars}; cát tinh ${good.length} và sát tinh ${bad.length}.`;
            }).join(' ');

            const content = `${db.overview} ${db.focus} ${palaceSummaries} ${db.note}`;
            return {
                id: group.id,
                label: group.label,
                content,
            };
        });
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
    }, [isLoading, isDialogOpen, profile?.birth_date, profile?.birth_time, gender, effectiveViewYear]);

    const fetchChart = async () => {
        setIsChartLoading(true);
        setChartError('');

        try {
            const response = await fetch(`/api/tuvi/chart?gender=${gender}&viewYear=${effectiveViewYear}`);
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

    const handleDeepInterpretation = async () => {
        const question = deepQuestion.trim();
        if (!question) {
            toast.error('Vui lòng nhập câu hỏi để luận giải chuyên sâu');
            return;
        }

        if (!chart || !fullTextReport) {
            toast.error('Thiếu dữ liệu lá số để gửi AI');
            return;
        }

        if (!profile?.is_pro && profile && profile.credits < 10) {
            toast.error('Không đủ xu để luận giải chuyên sâu. Cần tối thiểu 10 xu.');
            return;
        }

        setIsDeepLoading(true);
        setDeepAnswer('');

        try {
            const response = await fetch('/api/tuvi/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    chartText: fullTextReport,
                }),
            });

            const answerText = await response.text();
            if (!response.ok) {
                let message = answerText || 'Không thể luận giải chuyên sâu lúc này';
                try {
                    const parsed = JSON.parse(answerText) as { error?: string };
                    if (parsed?.error) {
                        message = parsed.error;
                    }
                } catch {
                    // keep plain text fallback
                }
                toast.error(message);
                return;
            }

            setDeepAnswer(answerText || 'AI chưa trả về nội dung.');
            await fetchProfile();
        } catch {
            toast.error('Lỗi kết nối khi gửi yêu cầu luận giải chuyên sâu');
        } finally {
            setIsDeepLoading(false);
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
                        <div className="space-y-1">
                            <Label htmlFor="view-year" className="text-xs text-muted-foreground">Năm xem</Label>
                            <Input
                                id="view-year"
                                value={viewYear}
                                onChange={(e) => setViewYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                className="h-10 w-24"
                                inputMode="numeric"
                            />
                        </div>
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
                        <div>
                            
                            <div className="overflow-x-auto">
                                <div className="grid grid-cols-4 gap-3 min-w-[920px]">
                                    {PALACE_GRID_ORDER.map((branch, cellIndex) => {
                                        if (CENTER_SKIP_INDEXES.has(cellIndex)) {
                                            return null;
                                        }

                                        if (cellIndex === CENTER_START_INDEX) {
                                            const isYangStem = ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(chart.preProcessing.lunar.yearStemName);
                                            const amDuongGenderLabel = `${isYangStem ? 'Dương' : 'Âm'} ${gender === 'male' ? 'Nam' : 'Nữ'}`;
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
                                                        <p><span className="font-semibold">Âm dương:</span> {amDuongGenderLabel}</p>
                                                        <p><span className="font-semibold">Mệnh:</span> {chart.core.menhBranch} | <span className="font-semibold">Thân:</span> {chart.core.thanBranch}</p>
                                                        <p><span className="font-semibold">Cục:</span> {chart.core.cuc.name} ({chart.core.cuc.value})</p>
                                                        <p>
                                                            <span className="font-semibold">Bản mệnh:</span>{' '}
                                                            {chart.core.banMenh?.napAm
                                                                ? `${chart.core.banMenh.napAm} (${chart.core.banMenh.yNghia ?? chart.core.banMenh.element})`
                                                                : (chart.core.banMenh ? `${chart.core.banMenh.element} (${chart.core.banMenh.value})` : '-')}
                                                        </p>
                                                        <p><span className="font-semibold">Chủ Mệnh:</span> {chart.core.chuMenh || '-'}</p>
                                                        <p><span className="font-semibold">Chủ Thân:</span> {chart.core.chuThan || '-'}</p>
                                                        <p>
                                                            <span className="font-semibold">Lai nhân cung:</span>{' '}
                                                            {chart.core.laiNhanCung?.roles && chart.core.laiNhanCung.roles.length > 0
                                                                ? `${chart.core.laiNhanCung.roles.join(' / ')}`
                                                                : '-'}
                                                        </p>
                                                        <p>
                                                            <span className="font-semibold">Cân lượng:</span>{' '}
                                                            {chart.core.canLuong
                                                                ? `${chart.core.canLuong.luong} lượng ${chart.core.canLuong.chi} chỉ`
                                                                : '-'}
                                                        </p>
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

                                        const isThan = palace.index === chart.core.than;
                                        const { good, bad } = classifyMinorStars(palace.stars.minor);
                                        const element = BRANCH_ELEMENT[palace.branch] ?? '';
                                        const trangSinhLabel = trangSinhLabelByPalace.get(palace.index) ?? '';
                                        const thaiTueStar = thaiTueLabelByPalace.get(palace.index) ?? '';
                                        const locTonStar = locTonLabelByPalace.get(palace.index) ?? '';
                                        const ringStars = [thaiTueStar, locTonStar]
                                            .filter((name): name is string => Boolean(name))
                                            .map((name) => ({
                                                name,
                                                palace: palace.index,
                                                brightness: resolveMinorBrightnessByIndex(name, palace.index),
                                            }));
                                        const { good: ringGood, bad: ringBad } = classifyMinorStars(ringStars);
                                        const elementStyle = ELEMENT_STYLE[element] ?? { text: 'text-slate-700', border: '', bg: '' };
                                        const dvRole = dvRoleByPalace.get(palace.index) ?? '';
                                        const lnRole = lnRoleByPalace.get(palace.index) ?? '';
                                        const dvAgeRange = dvAgeRangeByPalace.get(palace.index);
                                        const hasTriet = trietPalaces.has(palace.index);
                                        const hasTuan = tuanPalaces.has(palace.index);
                                        const voidMarks = [hasTuan ? 'Tuần' : '', hasTriet ? 'Triệt' : ''].filter(Boolean).join(' - ');

                                    return (
                                        <div
                                            key={`palace-${palace.index}-${branch}`}
                                            className="cung-view h-full rounded-lg border border-mystic-gold/25 bg-[#F1ECE3] shadow-sm overflow-hidden flex flex-col"
                                            id={`cung-${palace.index}`}
                                        >
                                            <div className="cung-top h-[96px] overflow-hidden border-b border-mystic-gold/15 bg-amber-50/40 px-2 py-2">
                                                <div className="view-cung-top h-full grid grid-cols-[52px_1fr_42px] gap-2 items-start">
                                                    <div>
                                                        <p className={`text-[11px] leading-4 font-semibold ${elementStyle.text}`}>{palace.branch}</p>
                                                        <p className={`text-[11px] leading-4 font-medium ${elementStyle.text}`}>+{element}</p>
                                                    </div>

                                                    <div className="chinh-tinh text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <p className={`text-[11px] font-bold ${elementStyle.text}`}>{palace.role}</p>
                                                            {isThan && <span className="text-[11px] font-bold text-red-600">&lt;Thân&gt;</span>}
                                                        </div>
                                                        {palace.stars.main.length > 0 ? (
                                                            palace.stars.main.map((star) => (
                                                                <p
                                                                    key={`${palace.index}-${star.name}`}
                                                                    className={`text-[11px] font-semibold leading-4 ${getMainStarTextClass(star.name)}`}
                                                                >
                                                                    {star.name} {star.brightness ? `(${star.brightness[0]})` : ''}
                                                                </p>
                                                            ))
                                                        ) : (
                                                            <p className="text-[11px] font-medium text-slate-400">Vô chính diệu</p>
                                                        )}
                                                    </div>

                                                    <div className="view-cung-dai-van text-right">
                                                        <p className="text-[11px] leading-4 font-semibold text-slate-600">Đại vận</p>
                                                        <p className="text-[11px] leading-4 text-slate-500">
                                                            {dvAgeRange ? `${dvAgeRange.start}-${dvAgeRange.end}` : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="cung-middle grid grid-cols-2 gap-2 px-2 py-2 min-h-[110px] flex-1">
                                                <div className="sao-tot space-y-1">
                                                    {good.length > 0 ? (
                                                        good.map((star) => (
                                                            <div
                                                                key={`good-${palace.index}-${star.name}`}
                                                                className={`text-[11px] leading-4 ${getMinorStarTextClass(star.name, false)}`}
                                                            >
                                                                {formatMinorStarDisplayName(star.name)}{getMinorBrightnessTag(star)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[11px] leading-4 text-slate-300">.</div>
                                                    )}

                                                    {ringGood.map((star, idx) => (
                                                        <div key={`ring-good-${palace.index}-${star.name}-${idx}`} className={`text-[11px] leading-4 ${getMinorStarTextClass(star.name, false)}`}>
                                                            {formatMinorStarDisplayName(star.name)}{getMinorBrightnessTag(star)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="sao-xau space-y-1">
                                                    {bad.length > 0 ? (
                                                        bad.map((star) => (
                                                            <div
                                                                key={`bad-${palace.index}-${star.name}`}
                                                                className={`text-[11px] leading-4 font-semibold ${getMinorStarTextClass(star.name, true)}`}
                                                            >
                                                                {formatMinorStarDisplayName(star.name)}{getMinorBrightnessTag(star)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[11px] leading-4 text-slate-300">.</div>
                                                    )}

                                                    {ringBad.map((star, idx) => (
                                                        <div key={`ring-bad-${palace.index}-${star.name}-${idx}`} className={`text-[11px] leading-4 font-semibold ${getMinorStarTextClass(star.name, true)}`}>
                                                            {formatMinorStarDisplayName(star.name)}{getMinorBrightnessTag(star)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="cung-bottom h-[28px] overflow-hidden border-t border-mystic-gold/15 bg-amber-50/30 px-2 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
                                                <span>{dvRole ? `dv.${dvRole}` : ''}</span>
                                                <span>{trangSinhLabel || palace.branch}</span>
                                                <span>{lnRole ? `ln.${lnRole}` : ''}</span>
                                            </div>
                                            <div
                                                className={`h-[22px] border-t px-2 py-1 text-center text-[10px] tracking-wide ${
                                                    voidMarks
                                                        ? 'border-black bg-black font-bold uppercase text-white'
                                                        : 'border-mystic-gold/15 bg-amber-50/30 text-slate-500'
                                                }`}
                                            >
                                                {voidMarks || ''}
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        </div>

                        <Card className="border-mystic-gold/20 bg-[#F1ECE3]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-mystic-gold">Luận Giải Tam Hợp</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {tamHopAnalyses.map((item) => (
                                    <details key={item.id} className="rounded-md border border-mystic-gold/20 bg-white/60 px-3 py-2">
                                        <summary className="cursor-pointer text-sm font-semibold text-slate-800">{item.label}</summary>
                                        <p className="mt-2 text-sm leading-6 text-slate-700">{item.content}</p>
                                    </details>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-mystic-gold/20 bg-[#F1ECE3]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-mystic-gold">Luận Giải Chuyên Sâu</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Textarea
                                    value={deepQuestion}
                                    onChange={(e) => setDeepQuestion(e.target.value)}
                                    placeholder={'"đại vận 16 tới 25 tuổi của tôi diễn ra như nào"\n"tiểu vận năm 18 tuổi của tôi ra sao"\n"con đường sự nghiệp tôi ra sao"\n"chấm điểm lá số"'}
                                    className="min-h-[90px] bg-white"
                                />
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-slate-500">Tử vi phái Thái Thứ Lang - Tử vi đẩu số</p>
                                    <Button onClick={handleDeepInterpretation} disabled={isDeepLoading || !deepQuestion.trim()}>
                                        {isDeepLoading ? (
                                            'Đang luận giải...'
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Gửi luận giải chuyên sâu
                                                <PriceTag isPro={profile?.is_pro} price={10} />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                                {deepAnswer && (
                                    <div className="rounded-md border border-mystic-gold/20 bg-white px-3 py-2">
                                        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{deepAnswer}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
