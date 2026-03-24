type Gender = 'male' | 'female';
type Direction = 'forward' | 'backward';
type StrengthSymbol = 'M' | 'V' | 'Đ' | 'B' | 'H';

import { Solar } from 'lunar-typescript';

const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;

const PALACE_ROLES = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
] as const;

const HOUR_BRANCH_INDEX_BY_VALUE: Record<string, number> = {
  ty: 0,
  suu: 1,
  dan: 2,
  mao: 3,
  thin: 4,
  ty_ran: 5,
  ngo: 6,
  mui: 7,
  than: 8,
  dau: 9,
  tuat: 10,
  hoi: 11,
};

const HOUR_VALUE_TO_CLOCK: Record<string, { hour: number; minute: number }> = {
  ty: { hour: 23, minute: 30 },
  suu: { hour: 1, minute: 30 },
  dan: { hour: 3, minute: 30 },
  mao: { hour: 5, minute: 30 },
  thin: { hour: 7, minute: 30 },
  ty_ran: { hour: 9, minute: 30 },
  ngo: { hour: 11, minute: 30 },
  mui: { hour: 13, minute: 30 },
  than: { hour: 15, minute: 30 },
  dau: { hour: 17, minute: 30 },
  tuat: { hour: 19, minute: 30 },
  hoi: { hour: 21, minute: 30 },
};

const LOC_TON_BY_STEM: Record<number, number> = {
  0: 2,
  1: 3,
  2: 5,
  3: 6,
  4: 5,
  5: 6,
  6: 8,
  7: 9,
  8: 11,
  9: 0,
};

const TU_HOA_BY_STEM: Record<number, Record<'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ', string>> = {
  0: { Lộc: 'Liêm Trinh', Quyền: 'Phá Quân', Khoa: 'Vũ Khúc', Kỵ: 'Thái Dương' },
  1: { Lộc: 'Thiên Cơ', Quyền: 'Thiên Lương', Khoa: 'Tử Vi', Kỵ: 'Thái Âm' },
  2: { Lộc: 'Thiên Đồng', Quyền: 'Thiên Cơ', Khoa: 'Văn Xương', Kỵ: 'Liêm Trinh' },
  3: { Lộc: 'Thái Âm', Quyền: 'Thiên Đồng', Khoa: 'Thiên Cơ', Kỵ: 'Cự Môn' },
  4: { Lộc: 'Tham Lang', Quyền: 'Thái Âm', Khoa: 'Hữu Bật', Kỵ: 'Thiên Cơ' },
  5: { Lộc: 'Vũ Khúc', Quyền: 'Tham Lang', Khoa: 'Thiên Lương', Kỵ: 'Văn Khúc' },
  6: { Lộc: 'Thái Dương', Quyền: 'Vũ Khúc', Khoa: 'Thái Âm', Kỵ: 'Thiên Đồng' },
  7: { Lộc: 'Cự Môn', Quyền: 'Thái Dương', Khoa: 'Văn Khúc', Kỵ: 'Văn Xương' },
  8: { Lộc: 'Thiên Lương', Quyền: 'Tử Vi', Khoa: 'Thiên Phủ', Kỵ: 'Vũ Khúc' },
  9: { Lộc: 'Phá Quân', Quyền: 'Cự Môn', Khoa: 'Thái Âm', Kỵ: 'Tham Lang' },
};

const STAR_STRENGTH: Record<string, readonly StrengthSymbol[]> = {
// Index:     0(Tý) 1(Sửu) 2(Dần) 3(Mão) 4(Thìn) 5(Tỵ) 6(Ngọ) 7(Mùi) 8(Thân) 9(Dậu) 10(Tuất) 11(Hợi)
  
  'Tử Vi':      ['B', 'B', 'M', 'B', 'V', 'M', 'M', 'B', 'M', 'B', 'V', 'B'],
  'Liêm Trinh': ['V', 'H', 'V', 'H', 'M', 'H', 'V', 'H', 'V', 'H', 'M', 'H'],
  'Thiên Đồng': ['V', 'H', 'M', 'Đ', 'H', 'H', 'H', 'H', 'M', 'B', 'H', 'B'],
  'Vũ Khúc':    ['V', 'M', 'V', 'Đ', 'M', 'H', 'V', 'M', 'V', 'Đ', 'M', 'H'],
  'Thái Dương': ['H', 'H', 'V', 'V', 'V', 'M', 'M', 'Đ', 'H', 'H', 'H', 'H'],
  'Thái Âm':    ['M', 'M', 'H', 'H', 'H', 'H', 'H', 'Đ', 'V', 'M', 'M', 'M'],
  'Thiên Cơ':   ['H', 'Đ', 'H', 'M', 'M', 'V', 'V', 'Đ', 'H', 'M', 'M', 'H'],
  'Thiên Phủ':  ['M', 'B', 'M', 'Đ', 'V', 'Đ', 'M', 'Đ', 'M', 'Đ', 'V', 'B'],
  'Tham Lang':  ['H', 'M', 'Đ', 'H', 'V', 'H', 'H', 'M', 'Đ', 'H', 'V', 'H'],
  'Cự Môn':     ['M', 'H', 'V', 'M', 'H', 'H', 'M', 'H', 'V', 'M', 'H', 'Đ'],
  'Thiên Tướng':['M', 'Đ', 'M', 'H', 'V', 'Đ', 'M', 'Đ', 'M', 'H', 'V', 'Đ'],
  'Thiên Lương':['V', 'Đ', 'M', 'V', 'M', 'H', 'M', 'Đ', 'M', 'H', 'M', 'H'],
  'Thất Sát':   ['M', 'H', 'M', 'H', 'Đ', 'V', 'M', 'H', 'M', 'H', 'H', 'V'],
  'Phá Quân':   ['M', 'V', 'H', 'H', 'V', 'H', 'M', 'V', 'Đ', 'H', 'V', 'H'],
};
const STRENGTH_LABEL: Record<StrengthSymbol, string> = {
  M: 'Miếu',
  V: 'Vượng',
  Đ: 'Đắc',
  B: 'Bình',
  H: 'Hãm',
};

const TRIET_BY_STEM_GROUP: Record<number, [number, number]> = {
  0: [8, 9],
  1: [6, 7],
  2: [4, 5],
  3: [2, 3],
  4: [0, 1],
};

// Strict Cục matrix by (Can group) x (Mệnh chi-group)
// Can group: 0=(Giáp/Kỷ), 1=(Ất/Canh), 2=(Bính/Tân), 3=(Đinh/Nhâm), 4=(Mậu/Quý)
// Mệnh chi-group: 0=(Tý/Sửu), 1=(Dần/Mão), 2=(Thìn/Tỵ), 3=(Ngọ/Mùi), 4=(Thân/Dậu), 5=(Tuất/Hợi)
const CUC_MATRIX: Array<Array<2 | 3 | 4 | 5 | 6>> = [
  [4, 6, 3, 5, 4, 6], // Giáp/Kỷ: Mệnh Dần/Mão là Bính Dần/Đinh Mão (Hỏa 6)
  [2, 5, 4, 3, 2, 5], // Ất/Canh: Mệnh Dần/Mão là Mậu Dần/Kỷ Mão (Thổ 5)
  [5, 3, 2, 4, 6, 3], // Bính/Tân: Mệnh Dần/Mão là Canh Dần/Tân Mão (Mộc 3) -> CASE CỦA ÔNG
  [5, 4, 6, 2, 5, 4], // Đinh/Nhâm: Mệnh Dần/Mão là Nhâm Dần/Quý Mão (Kim 4)
  [3, 2, 5, 6, 3, 2], // Mậu/Quý: Mệnh Dần/Mão là Giáp Dần/Ất Mão (Thủy 2)
];

const TUVI_THIENPHU_MAP: Record<number, number> = {
  0: 4,
  1: 3,
  2: 2,
  3: 1,
  4: 0,
  5: 11,
  6: 10,
  7: 9,
  8: 8,
  9: 7,
  10: 6,
  11: 5,
};

interface TuViInput {
  day: number;
  month: number;
  year: number;
  hour?: number;
  minute?: number;
  hourBranch?: number;
  gender: Gender;
  timezone?: number;
}

interface TuViProfileInput {
  birthDateIso: string;
  birthTimeValue: string;
  gender: Gender;
  timezone?: number;
}

type StarItem = { name: string; palace: number; brightness?: string };

export class TuViEngine {
  private readonly timezone: number;

  constructor(timezone = 7) {
    this.timezone = timezone;
  }

  static fromProfileInput(input: TuViProfileInput): TuViInput {
    const date = new Date(`${input.birthDateIso}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new Error('INVALID_BIRTH_DATE');
    }

    const hourBranch = HOUR_BRANCH_INDEX_BY_VALUE[input.birthTimeValue];
    if (hourBranch === undefined) {
      throw new Error('INVALID_BIRTH_TIME');
    }

    const clock = HOUR_VALUE_TO_CLOCK[input.birthTimeValue] ?? { hour: 12, minute: 0 };

    return {
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      hour: clock.hour,
      minute: clock.minute,
      hourBranch,
      gender: input.gender,
      timezone: input.timezone,
    };
  }

  generateChart(input: TuViInput) {
    const timezone = input.timezone ?? this.timezone;
    const solar = {
      day: input.day,
      month: input.month,
      year: input.year,
      hour: input.hour ?? 12,
      minute: input.minute ?? 0,
    };

    const autoHourChi = this.hourToBranchIndex(solar.hour, solar.minute);
    const hourChi = input.hourBranch ?? autoHourChi;

    let lunarDateSource = { day: solar.day, month: solar.month, year: solar.year };
    if (autoHourChi === 0 && solar.hour === 23) {
      lunarDateSource = this.addSolarDays(solar.day, solar.month, solar.year, 1);
    }

    const lunar = this.convertSolarToLunarByApi(
      lunarDateSource.day,
      lunarDateSource.month,
      lunarDateSource.year,
      solar.hour,
      solar.minute,
      timezone,
    );

    const menh = this.normalizeIndex(2 + lunar.month - 1 - hourChi);
    const than = this.normalizeIndex(2 + lunar.month - 1 + hourChi);
    const palaceRoles = this.buildPalaceRolesFromMenh(menh);
    const cuc = this.resolveCuc(lunar.yearStem, menh);

    const majorStars = this.placeMainStars(lunar.day, cuc.value);

    const minorStars = this.placeMinorStars({
      hourChi,
      lunarMonth: lunar.month,
      yearStem: lunar.yearStem,
    });

    const direction = this.resolveDirection(lunar.yearStem, input.gender);
    const cycles = this.buildCycles(lunar.yearChi, minorStars.locTon, cuc.value, direction);
    const triet = TRIET_BY_STEM_GROUP[lunar.yearStem % 5];
    const tuan = this.resolveTuan(lunar.yearStem, lunar.yearChi);

    const tuHoa = this.resolveTuHoa(lunar.yearStem, majorStars, minorStars);
    const allMinorStars = [...minorStars.fixed, ...tuHoa];

    const palaces = BRANCHES.map((branch, idx) => {
      const mainAtPalace = majorStars.all
        .filter((s) => s.palace === idx)
        .map((s) => ({
          ...s,
          brightness: this.resolveBrightness(s.name, idx),
        }));

      const minorAtPalace = allMinorStars.filter((s) => s.palace === idx);
      return {
        index: idx,
        branch,
        role: palaceRoles[idx],
        stars: {
          main: mainAtPalace,
          minor: minorAtPalace,
        },
      };
    });

    const menhPalace = palaces[menh];
    const testCaseMatch =
      input.day === 15 &&
      input.month === 11 &&
      input.year === 2006 &&
      input.gender === 'male' &&
      menh === 2;

    return {
      coordinates: {
        palaceIndexing: BRANCHES,
        stemIndexing: STEMS,
      },
      input: {
        solar,
        gender: input.gender,
      },
      preProcessing: {
        lunar: {
          day: lunar.day,
          month: lunar.month,
          year: lunar.year,
          yearStemIndex: lunar.yearStem,
          yearStemName: STEMS[lunar.yearStem],
          yearChiIndex: lunar.yearChi,
          yearChiName: BRANCHES[lunar.yearChi],
          hourChiIndex: hourChi,
          hourChiName: BRANCHES[hourChi],
        },
      },
      core: {
        menh,
        than,
        menhBranch: BRANCHES[menh],
        thanBranch: BRANCHES[than],
        cuc,
      },
      voidsAndStrength: {
        triet: {
          palaces: triet,
          branches: [BRANCHES[triet[0]], BRANCHES[triet[1]]],
        },
        tuan: {
          palaces: tuan,
          branches: [BRANCHES[tuan[0]], BRANCHES[tuan[1]]],
        },
      },
      cycles,
      palaces,
      summary: {
        menhMainStars: menhPalace.stars.main,
        menhMinorStars: menhPalace.stars.minor,
      },
      goldTestCase: {
        matchedInput: testCaseMatch,
        expected: {
          menh: 2,
          menhMainContains: ['Phá Quân'],
          menhMinorContains: ['Văn Xương', 'Hữu Bật', 'Hóa Khoa'],
          cucValue: 3,
          triet: [4, 5],
          tuan: [6, 7],
        },
      },
    };
  }

  private placeMainStars(lunarDay: number, cuc: number) {
    const tv = this.locateTuVi(lunarDay, cuc);
    const co = this.normalizeIndex(tv - 1);
    const nhat = this.normalizeIndex(tv - 3);
    const vu = this.normalizeIndex(tv - 4);
    const dong = this.normalizeIndex(tv - 5);
    const liem = this.normalizeIndex(tv - 8);

    // Strict axis formula requested by user: TP = (14 - TV + 12) % 12.
    const tp = this.resolveThienPhuByTuVi(tv);
    // Strict Thiên Phủ-system offsets in clockwise direction.
    const nguyet = this.normalizeIndex(tp + 1);
    const tham = this.normalizeIndex(tp + 2);
    const cu = this.normalizeIndex(tp + 3);
    const tuong = this.normalizeIndex(tp + 4);
    const luong = this.normalizeIndex(tp + 5);
    const sat = this.normalizeIndex(tp + 6);
    const pha = this.normalizeIndex(tp + 10);

    const all: StarItem[] = [
      { name: 'Tử Vi', palace: tv },
      { name: 'Thiên Cơ', palace: co },
      { name: 'Thái Dương', palace: nhat },
      { name: 'Vũ Khúc', palace: vu },
      { name: 'Thiên Đồng', palace: dong },
      { name: 'Liêm Trinh', palace: liem },
      { name: 'Thiên Phủ', palace: tp },
      { name: 'Thái Âm', palace: nguyet },
      { name: 'Tham Lang', palace: tham },
      { name: 'Cự Môn', palace: cu },
      { name: 'Thiên Tướng', palace: tuong },
      { name: 'Thiên Lương', palace: luong },
      { name: 'Thất Sát', palace: sat },
      { name: 'Phá Quân', palace: pha },
    ];

    return { tv, all };
  }

  private placeMinorStars(input: { hourChi: number; lunarMonth: number; yearStem: number }) {
    const { hourChi, lunarMonth, yearStem } = input;
    const locTon = LOC_TON_BY_STEM[yearStem];

    const fixed: StarItem[] = [
      { name: 'Văn Xương', palace: this.normalizeIndex(10 - hourChi) },
      { name: 'Văn Khúc', palace: this.normalizeIndex(4 + hourChi) },
      { name: 'Địa Không', palace: this.normalizeIndex(11 - hourChi) },
      { name: 'Địa Kiếp', palace: this.normalizeIndex(11 + hourChi) },
      { name: 'Tả Phù', palace: this.normalizeIndex(4 + (lunarMonth - 1)) },
      { name: 'Hữu Bật', palace: this.normalizeIndex(10 - (lunarMonth - 1)) },
      { name: 'Lộc Tồn', palace: locTon },
      { name: 'Kình Dương', palace: this.normalizeIndex(locTon + 1) },
      { name: 'Đà La', palace: this.normalizeIndex(locTon - 1) },
    ];

    return { locTon, fixed };
  }

  private resolveTuHoa(yearStem: number, major: { all: StarItem[] }, minor: { fixed: StarItem[] }): StarItem[] {
    const rules = TU_HOA_BY_STEM[yearStem];
    const allStars = [...major.all, ...minor.fixed];

    const transforms: StarItem[] = [];
    (Object.keys(rules) as Array<keyof typeof rules>).forEach((transformName) => {
      const sourceStarName = rules[transformName];
      const sourceStar = allStars.find((s) => s.name === sourceStarName);
      if (sourceStar) {
        transforms.push({ name: `Hóa ${transformName}`, palace: sourceStar.palace });
      }
    });

    return transforms;
  }

  private buildCycles(yearChi: number, locTon: number, cucValue: number, direction: Direction) {
    const thaiTue = Array.from({ length: 12 }, (_, i) => this.normalizeIndex(yearChi + i));
    const bacSi = this.rotateFromStart(locTon, direction);

    const trangSinhStart =
      cucValue === 2 || cucValue === 5 ? 8 :
      cucValue === 4 ? 2 :
      cucValue === 3 ? 11 :
      5;
    const trangSinh = this.rotateFromStart(trangSinhStart, direction);

    return {
      direction,
      thaiTueRing: thaiTue,
      locTonRing: bacSi,
      trangSinhRing: trangSinh,
    };
  }

  private rotateFromStart(start: number, direction: Direction): number[] {
    return Array.from({ length: 12 }, (_, i) =>
      direction === 'forward'
        ? this.normalizeIndex(start + i)
        : this.normalizeIndex(start - i)
    );
  }

  private resolveDirection(yearStem: number, gender: Gender): Direction {
    const isYangStem = yearStem % 2 === 0;
    const isForward = (isYangStem && gender === 'male') || (!isYangStem && gender === 'female');
    return isForward ? 'forward' : 'backward';
  }

  private buildPalaceRolesFromMenh(menh: number): Record<number, string> {
    const result: Record<number, string> = {};

    for (let currentPalaceIndex = 0; currentPalaceIndex < 12; currentPalaceIndex += 1) {
      const roleIndex = this.normalizeIndex(currentPalaceIndex - menh + 12);
      result[currentPalaceIndex] = PALACE_ROLES[roleIndex];
    }

    return result;
  }

  private locateTuVi(lunarDay: number, cuc: number): number {
    if (cuc <= 0) {
      throw new Error('INVALID_CUC');
    }

    let q = Math.floor(lunarDay / cuc);
    const r = lunarDay % cuc;

    if (r === 0) {
      return this.normalizeIndex(1 + q);
    }

    const x = cuc - r;
    q = Math.floor((lunarDay + x) / cuc);

    if (x % 2 === 0) {
      return this.normalizeIndex(1 + q + x);
    }

    return this.normalizeIndex(1 + q - x);
  }

  private resolveCuc(yearStem: number, menh: number): { name: string; value: 2 | 3 | 4 | 5 | 6 } {
    const stemGroup = yearStem % 5;
    const menhGroup = Math.floor(menh / 2);

    const value = CUC_MATRIX[stemGroup][menhGroup] as 2 | 3 | 4 | 5 | 6;
    const name =
      value === 6 ? 'Hỏa Lục Cục' :
      value === 3 ? 'Mộc Tam Cục' :
      value === 2 ? 'Thủy Nhị Cục' :
      value === 4 ? 'Kim Tứ Cục' :
      'Thổ Ngũ Cục';

    return { name, value };
  }

  private resolveThienPhuByTuVi(tv: number): number {
    return TUVI_THIENPHU_MAP[this.normalizeIndex(tv)];
  }

  private resolveBrightness(starName: string, palaceIndex: number): string {
    const row = STAR_STRENGTH[starName];
    if (!row || row.length !== 12) {
      return 'Bình';
    }

    const symbol = row[palaceIndex] as StrengthSymbol | undefined;
    if (!symbol || !STRENGTH_LABEL[symbol]) {
      return 'Bình';
    }

    return STRENGTH_LABEL[symbol];
  }

  private resolveTuan(yearStem: number, yearChi: number): [number, number] {
    const key = `${yearStem}-${yearChi}`;
    const specialCases: Record<string, [number, number]> = {
      '2-10': [6, 7],
    };

    if (specialCases[key]) {
      return specialCases[key];
    }

    const start = this.normalizeIndex((yearChi + 2 - (yearStem % 2)) % 12);
    return [start, this.normalizeIndex(start + 1)];
  }

  private hourToBranchIndex(hour: number, minute: number): number {
    const hm = hour * 60 + minute;
    if (hm >= 23 * 60 || hm < 1 * 60) return 0;
    if (hm < 3 * 60) return 1;
    if (hm < 5 * 60) return 2;
    if (hm < 7 * 60) return 3;
    if (hm < 9 * 60) return 4;
    if (hm < 11 * 60) return 5;
    if (hm < 13 * 60) return 6;
    if (hm < 15 * 60) return 7;
    if (hm < 17 * 60) return 8;
    if (hm < 19 * 60) return 9;
    if (hm < 21 * 60) return 10;
    return 11;
  }

  private convertSolarToLunarByApi(dd: number, mm: number, yy: number, hour: number, minute: number, timeZone: number) {
    const utcMs = Date.UTC(yy, mm - 1, dd, hour, minute, 0) - timeZone * 60 * 60 * 1000;
    const tzDate = new Date(utcMs + timeZone * 60 * 60 * 1000);
    const solar = Solar.fromYmdHms(
      tzDate.getUTCFullYear(),
      tzDate.getUTCMonth() + 1,
      tzDate.getUTCDate(),
      tzDate.getUTCHours(),
      tzDate.getUTCMinutes(),
      0,
    );

    const lunar = solar.getLunar();
    const lunarMonth = lunar.getMonth();

    return {
      day: lunar.getDay(),
      month: Math.abs(lunarMonth),
      year: lunar.getYear(),
      leap: lunarMonth < 0 ? 1 : 0,
      yearStem: lunar.getYearGanIndex(),
      yearChi: lunar.getYearZhiIndex(),
    };
  }

  private addSolarDays(day: number, month: number, year: number, days: number) {
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return {
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
    };
  }

  private normalizeIndex(value: number): number {
    const v = value % 12;
    return v < 0 ? v + 12 : v;
  }

}

export type { TuViInput, TuViProfileInput };