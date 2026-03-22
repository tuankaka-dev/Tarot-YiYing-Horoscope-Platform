import { NextResponse } from 'next/server';

const TIME_ZONE = 7;
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const GIO_LABELS = ['Tý (23-01h)', 'Sửu (01-03h)', 'Dần (03-05h)', 'Mão (05-07h)', 'Thìn (07-09h)', 'Tỵ (09-11h)', 'Ngọ (11-13h)', 'Mùi (13-15h)', 'Thân (15-17h)', 'Dậu (17-19h)', 'Tuất (19-21h)', 'Hợi (21-23h)'];
const GIO_HD = ['110100101100', '001101001011', '110011010010', '101100110100', '001011001101', '010010110011'];

const TRUC_NAMES = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];

const TRUC_ACTIVITY_MAP: Record<string, { good: string[]; bad: string[]; level: 'Đại Cát' | 'Cát' | 'Bình' | 'Hung' }> = {
    Kiến: { good: ['Xuất hành', 'Khai trương nhẹ', 'Mở đầu công việc'], bad: ['Động thổ lớn', 'Kiện tụng'], level: 'Cát' },
    Trừ: { good: ['Giải hạn', 'Dọn dẹp', 'Chữa bệnh'], bad: ['Khai trương', 'Cưới hỏi'], level: 'Bình' },
    Mãn: { good: ['Ký kết', 'Giao dịch', 'Cầu tài'], bad: ['Phá dỡ', 'Kiện cáo'], level: 'Cát' },
    Bình: { good: ['Công việc thường nhật', 'Gặp gỡ'], bad: ['Việc đại sự'], level: 'Bình' },
    Định: { good: ['Ký hợp đồng', 'Nhập trạch', 'An cư'], bad: ['Tranh chấp', 'Thay đổi lớn'], level: 'Đại Cát' },
    Chấp: { good: ['Bảo trì', 'Ổn định kế hoạch'], bad: ['Khai trương', 'Xuất hành xa'], level: 'Bình' },
    Phá: { good: ['Sửa lỗi', 'Phá bỏ thói quen xấu'], bad: ['Cưới hỏi', 'Động thổ', 'Khai trương'], level: 'Hung' },
    Nguy: { good: ['Cầu an', 'Tĩnh dưỡng'], bad: ['Đầu tư lớn', 'Đi xa đêm'], level: 'Hung' },
    Thành: { good: ['Khai trương', 'Ký kết', 'Cưới hỏi'], bad: ['Kiện tụng'], level: 'Đại Cát' },
    Thu: { good: ['Thu hoạch', 'Tổng kết', 'Thu nợ'], bad: ['Khởi sự dài hạn'], level: 'Cát' },
    Khai: { good: ['Mở cửa hàng', 'Khởi công', 'Giao dịch'], bad: ['Chôn cất'], level: 'Đại Cát' },
    Bế: { good: ['Nghỉ ngơi', 'Rà soát nội bộ'], bad: ['Khai trương', 'Ký kết quan trọng'], level: 'Hung' },
};

function int(number: number): number {
    return Math.floor(number);
}

function jdFromDate(day: number, month: number, year: number): number {
    const a = int((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return day + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
}

function getNewMoonDay(k: number, timeZone: number): number {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = Math.PI / 180;
    let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
    C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * Mpr * dr);
    C1 -= 0.0004 * Math.sin(3 * Mpr * dr);
    C1 += 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
    C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
    C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
    C1 += 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);

    const deltaT = T < -11
        ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
        : -0.000278 + 0.000265 * T + 0.000262 * T2;

    return int(jd1 + C1 - deltaT + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
    const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
    const T2 = T * T;
    const dr = Math.PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;

    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);

    let L = L0 + DL;
    L = L * dr;
    L = L - Math.PI * 2 * int(L / (Math.PI * 2));
    return int((L / Math.PI) * 6);
}

function getLunarMonth11(year: number, timeZone: number): number {
    const off = jdFromDate(31, 12, year) - 2415021;
    const k = int(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    const sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9) {
        nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
    const k = int((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
        last = arc;
        i++;
        arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
}

function convertSolarToLunar(day: number, month: number, year: number, timeZone: number): { day: number; month: number; year: number; leap: number; jd: number } {
    const dayNumber = jdFromDate(day, month, year);
    const k = int((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k, timeZone);
    }

    let a11 = getLunarMonth11(year, timeZone);
    let b11 = a11;
    let lunarYear: number;

    if (a11 >= monthStart) {
        lunarYear = year;
        a11 = getLunarMonth11(year - 1, timeZone);
    } else {
        lunarYear = year + 1;
        b11 = getLunarMonth11(year + 1, timeZone);
    }

    const lunarDay = dayNumber - monthStart + 1;
    const diff = int((monthStart - a11) / 29);
    let lunarLeap = 0;
    let lunarMonth = diff + 11;

    if (b11 - a11 > 365) {
        const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff) {
                lunarLeap = 1;
            }
        }
    }

    if (lunarMonth > 12) {
        lunarMonth -= 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }

    return {
        day: lunarDay,
        month: lunarMonth,
        year: lunarYear,
        leap: lunarLeap,
        jd: dayNumber,
    };
}

function getCanChiInfo(lunar: { day: number; month: number; year: number; jd: number }) {
    const yearCan = CAN[(lunar.year + 6) % 10];
    const yearChi = CHI[(lunar.year + 8) % 12];

    const monthCan = CAN[(lunar.year * 12 + lunar.month + 3) % 10];
    const monthChi = CHI[(lunar.month + 1) % 12];

    const dayCan = CAN[(lunar.jd + 9) % 10];
    const dayChiIndex = (lunar.jd + 1) % 12;
    const dayChi = CHI[dayChiIndex];

    return {
        year: `${yearCan} ${yearChi}`,
        month: `${monthCan} ${monthChi}`,
        day: `${dayCan} ${dayChi}`,
        dayChiIndex,
    };
}

function getGoodAndBadHours(dayChiIndex: number) {
    const pattern = GIO_HD[dayChiIndex % 6];
    const goodHours: string[] = [];
    const badHours: string[] = [];

    for (let i = 0; i < 12; i++) {
        if (pattern[i] === '1') {
            goodHours.push(GIO_LABELS[i]);
        } else {
            badHours.push(GIO_LABELS[i]);
        }
    }

    return { goodHours, badHours };
}

function getTrucInfo(lunarMonth: number, dayChiIndex: number) {
    const monthChiIndex = (lunarMonth + 1) % 12;
    const trucIndex = (dayChiIndex - monthChiIndex + 12) % 12;
    const trucName = TRUC_NAMES[trucIndex];
    return {
        truc: trucName,
        ...TRUC_ACTIVITY_MAP[trucName],
    };
}

export async function GET() {
    try {
        const now = new Date();
        const solarDay = now.getDate();
        const solarMonth = now.getMonth() + 1;
        const solarYear = now.getFullYear();

        const lunar = convertSolarToLunar(solarDay, solarMonth, solarYear, TIME_ZONE);
        const canChi = getCanChiInfo(lunar);
        const { goodHours, badHours } = getGoodAndBadHours(canChi.dayChiIndex);
        const trucInfo = getTrucInfo(lunar.month, canChi.dayChiIndex);

        const ratingDescriptions: Record<'Đại Cát' | 'Cát' | 'Bình' | 'Hung', string> = {
            'Đại Cát': 'Ngày cát khí mạnh, phù hợp việc quan trọng.',
            'Cát': 'Ngày thuận khí, tốt cho phần lớn công việc.',
            'Bình': 'Ngày trung tính, nên làm việc vừa phải và có kế hoạch.',
            'Hung': 'Ngày xung khí cao, nên hạn chế đại sự.',
        };

        const dayRating = {
            level: trucInfo.level,
            description: `${ratingDescriptions[trucInfo.level]} (Trực ${trucInfo.truc})`,
        };
        
        const data = {
            solar: {
                year: solarYear,
                month: solarMonth,
                day: solarDay,
                dayOfWeek: now.getDay(),
                dayName: now.toLocaleDateString('vi-VN', { weekday: 'long' }),
                fullDate: now.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
            },
            lunar: {
                year: lunar.year,
                month: lunar.month,
                day: lunar.day,
                leap: lunar.leap,
                canChiYear: canChi.year,
                canChiMonth: canChi.month,
                canChiDay: canChi.day,
            },
            dayRating,
            truc: trucInfo.truc,
            goodHours,
            badHours,
            goodActivities: trucInfo.good,
            badActivities: trucInfo.bad,
            timezone: 'Asia/Ho_Chi_Minh',
            source: 'am-lich-viet-algorithm',
        };
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Lunar calendar API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lunar calendar data' },
            { status: 500 }
        );
    }
}
