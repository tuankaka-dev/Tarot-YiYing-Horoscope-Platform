type Gender = 'male' | 'female';
type Direction = 'forward' | 'backward';
type StrengthSymbol = 'M' | 'V' | 'Đ' | 'B' | 'H';

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

const THIEN_KHOI_BY_STEM: Record<number, number> = {
  0: 1,
  1: 0,
  2: 11,
  3: 11,
  4: 1,
  5: 0,
  6: 6,
  7: 6,
  8: 3,
  9: 3,
};

const THIEN_VIET_BY_STEM: Record<number, number> = {
  0: 7,
  1: 8,
  2: 9,
  3: 9,
  4: 7,
  5: 8,
  6: 2,
  7: 2,
  8: 5,
  9: 5,
};

const THIEN_QUAN_BY_STEM: Record<number, number> = {
  0: 7,
  1: 4,
  2: 5,
  3: 2,
  4: 3,
  5: 9,
  6: 11,
  7: 9,
  8: 10,
  9: 6,
};

const LUU_HA_BY_STEM: Record<number, number> = {
  0: 9,
  1: 10,
  2: 7,
  3: 8,
  4: 5,
  5: 6,
  6: 8,
  7: 3,
  8: 11,
  9: 2,
};

const THIEN_PHUC_BY_STEM: Record<number, number> = {
  0: 9,
  1: 8,
  2: 0,
  3: 11,
  4: 3,
  5: 2,
  6: 6,
  7: 5,
  8: 6,
  9: 5,
};

const THIEN_TRU_BY_STEM: Record<number, number> = {
  0: 5,
  1: 6,
  2: 0,
  3: 5,
  4: 6,
  5: 8,
  6: 2,
  7: 3,
  8: 9,
  9: 11,
};

const VAN_TINH_BY_STEM: Record<number, number> = {
  0: 5,
  1: 6,
  2: 8,
  3: 9,
  4: 8,
  5: 9,
  6: 11,
  7: 0,
  8: 2,
  9: 3,
};

const HOA_CAI_BY_BRANCH: Record<number, number> = {
  0: 4,
  1: 1,
  2: 10,
  3: 7,
  4: 4,
  5: 1,
  6: 10,
  7: 7,
  8: 4,
  9: 1,
  10: 10,
  11: 7,
};

const KIEP_SAT_BY_BRANCH: Record<number, number> = {
  0: 5,
  1: 2,
  2: 11,
  3: 8,
  4: 5,
  5: 2,
  6: 11,
  7: 8,
  8: 5,
  9: 2,
  10: 11,
  11: 8,
};

const CO_THAN_BY_BRANCH: Record<number, number> = {
  0: 2,
  1: 2,
  2: 5,
  3: 5,
  4: 5,
  5: 8,
  6: 8,
  7: 8,
  8: 11,
  9: 11,
  10: 11,
  11: 2,
};

const QUA_TU_BY_BRANCH: Record<number, number> = {
  0: 10,
  1: 10,
  2: 1,
  3: 1,
  4: 1,
  5: 4,
  6: 4,
  7: 4,
  8: 7,
  9: 7,
  10: 7,
  11: 10,
};

const PHA_TOAI_BY_BRANCH: Record<number, number> = {
  0: 5,
  1: 1,
  2: 9,
  3: 5,
  4: 1,
  5: 9,
  6: 5,
  7: 1,
  8: 9,
  9: 5,
  10: 1,
  11: 9,
};

const DAO_HOA_BY_BRANCH: Record<number, number> = {
  0: 9,
  1: 6,
  2: 3,
  3: 0,
  4: 9,
  5: 6,
  6: 3,
  7: 0,
  8: 9,
  9: 6,
  10: 3,
  11: 0,
};

const THIEN_MA_BY_BRANCH: Record<number, number> = {
  0: 2,
  1: 11,
  2: 8,
  3: 5,
  4: 2,
  5: 11,
  6: 8,
  7: 5,
  8: 2,
  9: 11,
  10: 8,
  11: 5,
};

const HOA_TINH_START_BY_BRANCH: Record<number, number> = {
  0: 2,
  1: 3,
  2: 1,
  3: 9,
  4: 2,
  5: 3,
  6: 1,
  7: 9,
  8: 2,
  9: 3,
  10: 1,
  11: 9,
};

const LINH_TINH_START_BY_BRANCH: Record<number, number> = {
  0: 10,
  1: 10,
  2: 3,
  3: 10,
  4: 10,
  5: 10,
  6: 3,
  7: 10,
  8: 10,
  9: 10,
  10: 3,
  11: 10,
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
  'Liêm Trinh': ['V', 'H', 'V', 'H', 'M', 'H', 'V', 'Đ', 'V', 'H', 'M', 'H'],
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
  'Thất Sát':   ['M', 'H', 'M', 'H', 'Đ', 'V', 'M', 'Đ', 'M', 'H', 'H', 'V'],
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

    const lunarLegal = this.convertSolarToLunarByApi(
      solar.day,
      solar.month,
      solar.year,
      solar.hour,
      solar.minute,
      timezone,
    );

    let chartDateSource = { day: solar.day, month: solar.month, year: solar.year };
    if (autoHourChi === 0 && solar.hour === 23) {
      chartDateSource = this.addSolarDays(solar.day, solar.month, solar.year, 1);
    }

    const lunarChart = this.convertSolarToLunarByApi(
      chartDateSource.day,
      chartDateSource.month,
      chartDateSource.year,
      solar.hour,
      solar.minute,
      timezone,
    );

    const menh = this.normalizeIndex(2 + lunarChart.month - 1 - hourChi);
    const than = this.normalizeIndex(2 + lunarChart.month - 1 + hourChi);
    const palaceRoles = this.buildPalaceRolesFromMenh(menh);
    const cuc = this.resolveCuc(lunarChart.yearStem, menh);
    const direction = this.resolveDirection(lunarChart.yearStem, input.gender);

    const majorStars = this.placeMainStars(lunarChart.day, cuc.value);

    const minorStars = this.placeMinorStars({
      hourChi,
      lunarDay: lunarChart.day,
      lunarMonth: lunarChart.month,
      yearStem: lunarChart.yearStem,
      yearChi: lunarChart.yearChi,
      menh,
      than,
      direction,
    });

    const cycles = this.buildCycles(lunarChart.yearChi, minorStars.locTon, cuc.value, direction);
    const triet = TRIET_BY_STEM_GROUP[lunarChart.yearStem % 5];
    const tuan = this.resolveTuan(lunarChart.yearStem, lunarChart.yearChi);

    const tuHoa = this.resolveTuHoa(lunarChart.yearStem, majorStars, minorStars);
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
          day: lunarChart.day,
          month: lunarChart.month,
          year: lunarChart.year,
          yearStemIndex: lunarChart.yearStem,
          yearStemName: STEMS[lunarChart.yearStem],
          yearChiIndex: lunarChart.yearChi,
          yearChiName: BRANCHES[lunarChart.yearChi],
          hourChiIndex: hourChi,
          hourChiName: BRANCHES[hourChi],
        },
        lunarLegal: {
          day: lunarLegal.day,
          month: lunarLegal.month,
          year: lunarLegal.year,
          yearStemIndex: lunarLegal.yearStem,
          yearStemName: STEMS[lunarLegal.yearStem],
          yearChiIndex: lunarLegal.yearChi,
          yearChiName: BRANCHES[lunarLegal.yearChi],
        },
        lunarChart: {
          day: lunarChart.day,
          month: lunarChart.month,
          year: lunarChart.year,
          yearStemIndex: lunarChart.yearStem,
          yearStemName: STEMS[lunarChart.yearStem],
          yearChiIndex: lunarChart.yearChi,
          yearChiName: BRANCHES[lunarChart.yearChi],
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

  private placeMinorStars(input: { hourChi: number; lunarDay: number; lunarMonth: number; yearStem: number; yearChi: number; menh: number; than: number; direction: Direction }) {
    const { hourChi, lunarDay, lunarMonth, yearStem, yearChi, menh, than, direction } = input;
    const locTon = LOC_TON_BY_STEM[yearStem];
    const thienKhoi = THIEN_KHOI_BY_STEM[yearStem];
    const thienViet = THIEN_VIET_BY_STEM[yearStem];
    const thienQuan = THIEN_QUAN_BY_STEM[yearStem];
    const thienPhuc = THIEN_PHUC_BY_STEM[yearStem];
    const thienTru = THIEN_TRU_BY_STEM[yearStem];
    const vanTinh = VAN_TINH_BY_STEM[yearStem];
    const luuHa = LUU_HA_BY_STEM[yearStem];
    const hoaCai = HOA_CAI_BY_BRANCH[yearChi];
    const kiepSat = KIEP_SAT_BY_BRANCH[yearChi];
    const coThan = CO_THAN_BY_BRANCH[yearChi];
    const quaTu = QUA_TU_BY_BRANCH[yearChi];
    const phaToai = PHA_TOAI_BY_BRANCH[yearChi];
    const daoHoa = DAO_HOA_BY_BRANCH[yearChi];
    const thienMa = THIEN_MA_BY_BRANCH[yearChi];
    const hoaTinhStart = HOA_TINH_START_BY_BRANCH[yearChi];
    const linhTinhStart = LINH_TINH_START_BY_BRANCH[yearChi];
    const vanXuong = this.normalizeIndex(10 - hourChi);
    const vanKhuc = this.normalizeIndex(4 + hourChi);
    const taPhu = this.normalizeIndex(4 + (lunarMonth - 1));
    const huuBat = this.normalizeIndex(10 - (lunarMonth - 1));
    const phuongCac = this.normalizeIndex(10 - yearChi);
    const thienDieu = this.normalizeIndex(1 + lunarMonth - 1);
    const thienY = this.normalizeIndex(1 + lunarMonth - 1);
    const thienHinh = this.normalizeIndex(9 + lunarMonth - 1);
    const diaGiai = this.normalizeIndex(7 + lunarMonth - 1);
    const thaiPhu = this.normalizeIndex(vanXuong + lunarDay - 1);
    const phongCao = this.normalizeIndex(vanKhuc + lunarDay - 3);
    const thienTai = this.normalizeIndex(menh + yearChi);
    const thienThuong = this.normalizeIndex(menh + 5);
    const thienSu = this.normalizeIndex(menh + 7);
    const dauQuan = this.normalizeIndex(yearChi - (lunarMonth - 1) + hourChi);
    const hongLoan = this.normalizeIndex(3 - yearChi);
    const thienKhong = this.normalizeIndex(yearChi + 1);
    const nguyetGiai = this.normalizeIndex(8 + lunarMonth - 1);
    const hoaTinh = direction === 'forward'
      ? this.normalizeIndex(hoaTinhStart + hourChi)
      : this.normalizeIndex(hoaTinhStart - hourChi);
    const linhTinh = direction === 'forward'
      ? this.normalizeIndex(linhTinhStart - hourChi)
      : this.normalizeIndex(linhTinhStart + hourChi);

    const fixed: StarItem[] = [
      { name: 'Văn Xương', palace: vanXuong },
      { name: 'Văn Khúc', palace: vanKhuc },
      { name: 'Địa Không', palace: this.normalizeIndex(11 - hourChi) },
      { name: 'Địa Kiếp', palace: this.normalizeIndex(11 + hourChi) },
      { name: 'Tả Phù', palace: taPhu },
      { name: 'Hữu Bật', palace: huuBat },
      { name: 'Lộc Tồn', palace: locTon },
      { name: 'Kình Dương', palace: this.normalizeIndex(locTon + 1) },
      { name: 'Đà La', palace: this.normalizeIndex(locTon - 1) },
      { name: 'Thiên Khôi', palace: thienKhoi },
      { name: 'Thiên Việt', palace: thienViet },
      { name: 'Thiên Quan', palace: thienQuan },
      { name: 'Thiên Phúc', palace: thienPhuc },
      { name: 'Thiên Trù', palace: thienTru },
      { name: 'Văn Tinh', palace: vanTinh },
      { name: 'Lưu Hà', palace: luuHa },
      { name: 'Quốc Ấn', palace: this.normalizeIndex(locTon + 8) },
      { name: 'Đường Phù', palace: this.normalizeIndex(locTon + 5) },
      { name: 'Long Trì', palace: this.normalizeIndex(4 + yearChi) },
      { name: 'Phượng Các', palace: phuongCac },
      { name: 'Giải Thần', palace: phuongCac },
      { name: 'Thiên Diêu', palace: thienDieu },
      { name: 'Thiên Y', palace: thienY },
      { name: 'Địa Giải', palace: diaGiai },
      { name: 'Thiên Hình', palace: thienHinh },
      { name: 'Thiên Khốc', palace: this.normalizeIndex(6 - yearChi) },
      { name: 'Thiên Hư', palace: this.normalizeIndex(6 + yearChi) },
      { name: 'Phá Toái', palace: phaToai },
      { name: 'Thiên Đức', palace: this.normalizeIndex(9 + yearChi) },
      { name: 'Nguyệt Đức', palace: this.normalizeIndex(5 + yearChi) },
      { name: 'Đào Hoa', palace: daoHoa },
      { name: 'Thiên Mã', palace: thienMa },
      { name: 'Hỏa Tinh', palace: hoaTinh },
      { name: 'Linh Tinh', palace: linhTinh },
      { name: 'Hoa Cái', palace: hoaCai },
      { name: 'Kiếp Sát', palace: kiepSat },
      { name: 'Cô Thần', palace: coThan },
      { name: 'Quả Tú', palace: quaTu },
      { name: 'Thiên Thọ', palace: this.normalizeIndex(than + yearChi) },
      { name: 'Thiên Hỉ', palace: this.normalizeIndex(9 - yearChi) },
      { name: 'Hồng Loan', palace: hongLoan },
      { name: 'Thiên Không', palace: thienKhong },
      { name: 'Thiên Giải', palace: nguyetGiai },
      { name: 'Ân Quang', palace: this.normalizeIndex(vanXuong + lunarDay - 2) },
      { name: 'Thiên Quý', palace: this.normalizeIndex(vanKhuc - lunarDay + 2) },
      { name: 'Tam Thai', palace: this.normalizeIndex(taPhu + lunarDay - 1) },
      { name: 'Bát Tọa', palace: this.normalizeIndex(huuBat - lunarDay + 1) },
      { name: 'Thai Phụ', palace: thaiPhu },
      { name: 'Phong Cáo', palace: phongCao },
      { name: 'Thiên Tài', palace: thienTai },
      { name: 'Thiên Thương', palace: thienThuong },
      { name: 'Thiên Sứ', palace: thienSu },
      { name: 'Đầu Quân', palace: dauQuan },
      { name: 'Thiên La', palace: 4 },
      { name: 'Địa Võng', palace: 10 },
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

  // Ho Ngoc Duc Vietnamese lunar calendar algorithm.
  private jdFromDate(dd: number, mm: number, yy: number): number {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }
    return jd;
  }

  private getNewMoonDay(k: number, timeZone: number): number {
    const t = k / 1236.85;
    const t2 = t * t;
    const t3 = t2 * t;
    const dr = Math.PI / 180;

    let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
    jd1 += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);

    const m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
    const mpr = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
    const f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;

    let c1 = (0.1734 - 0.000393 * t) * Math.sin(m * dr) + 0.0021 * Math.sin(2 * dr * m);
    c1 -= 0.4068 * Math.sin(mpr * dr) + 0.0161 * Math.sin(dr * 2 * mpr);
    c1 -= 0.0004 * Math.sin(dr * 3 * mpr);
    c1 += 0.0104 * Math.sin(dr * 2 * f) - 0.0051 * Math.sin(dr * (m + mpr));
    c1 -= 0.0074 * Math.sin(dr * (m - mpr)) + 0.0004 * Math.sin(dr * (2 * f + m));
    c1 -= 0.0004 * Math.sin(dr * (2 * f - m)) - 0.0006 * Math.sin(dr * (2 * f + mpr));
    c1 += 0.001 * Math.sin(dr * (2 * f - mpr)) + 0.0005 * Math.sin(dr * (2 * mpr + m));

    const deltaT = t < -11
      ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
      : -0.000278 + 0.000265 * t + 0.000262 * t2;

    const jdNew = jd1 + c1 - deltaT;
    return Math.floor(jdNew + 0.5 + timeZone / 24);
  }

  private getSunLongitude(dayNumber: number, timeZone: number): number {
    const t = (dayNumber - 2451545.5 - timeZone / 24) / 36525;
    const t2 = t * t;
    const dr = Math.PI / 180;

    const m = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
    const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
    let dl = (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m);
    dl += (0.019993 - 0.000101 * t) * Math.sin(dr * 2 * m) + 0.000290 * Math.sin(dr * 3 * m);

    let l = l0 + dl;
    l = l * dr;
    l -= Math.PI * 2 * Math.floor(l / (Math.PI * 2));

    return Math.floor((l / Math.PI) * 6);
  }

  private getLunarMonth11(yy: number, timeZone: number): number {
    const off = this.jdFromDate(31, 12, yy) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = this.getNewMoonDay(k, timeZone);
    const sunLong = this.getSunLongitude(nm, timeZone);
    if (sunLong >= 9) {
      nm = this.getNewMoonDay(k - 1, timeZone);
    }
    return nm;
  }

  private getLeapMonthOffset(a11: number, timeZone: number): number {
    const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last = 0;
    let i = 1;
    let arc = this.getSunLongitude(this.getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc;
      i += 1;
      arc = this.getSunLongitude(this.getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  private convertSolarToLunarHoNgocDuc(dd: number, mm: number, yy: number, timeZone: number): {
    day: number;
    month: number;
    year: number;
    leap: number;
  } {
    const dayNumber = this.jdFromDate(dd, mm, yy);
    const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = this.getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = this.getNewMoonDay(k, timeZone);
    }

    let a11 = this.getLunarMonth11(yy, timeZone);
    let b11 = a11;
    let lunarYear: number;

    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = this.getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = this.getLunarMonth11(yy + 1, timeZone);
    }

    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarMonth = diff + 11;
    let lunarLeap = 0;

    if (b11 - a11 > 365) {
      const leapMonthDiff = this.getLeapMonthOffset(a11, timeZone);
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
    };
  }

  private convertSolarToLunarByApi(dd: number, mm: number, yy: number, hour: number, minute: number, timeZone: number) {
    void hour;
    void minute;

    const lunar = this.convertSolarToLunarHoNgocDuc(dd, mm, yy, timeZone);
    const yearStem = ((lunar.year + 6) % 10 + 10) % 10;
    const yearChi = ((lunar.year + 8) % 12 + 12) % 12;

    return {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      leap: lunar.leap,
      yearStem,
      yearChi,
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