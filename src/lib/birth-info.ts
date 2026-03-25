export interface BirthDateParts {
  day: string;
  month: string;
  year: string;
}

export const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));

export const ZODIAC_BIRTH_HOURS = [
  { value: 'ty', label: 'Tý (23:00 - 00:59)' },
  { value: 'suu', label: 'Sửu (01:00 - 02:59)' },
  { value: 'dan', label: 'Dần (03:00 - 04:59)' },
  { value: 'mao', label: 'Mão (05:00 - 06:59)' },
  { value: 'thin', label: 'Thìn (07:00 - 08:59)' },
  { value: 'ty_ran', label: 'Tỵ (09:00 - 10:59)' },
  { value: 'ngo', label: 'Ngọ (11:00 - 12:59)' },
  { value: 'mui', label: 'Mùi (13:00 - 14:59)' },
  { value: 'than', label: 'Thân (15:00 - 16:59)' },
  { value: 'dau', label: 'Dậu (17:00 - 18:59)' },
  { value: 'tuat', label: 'Tuất (19:00 - 20:59)' },
  { value: 'hoi', label: 'Hợi (21:00 - 22:59)' },
] as const;

export const ZODIAC_BIRTH_HOUR_VALUES = new Set(
  ZODIAC_BIRTH_HOURS.map((item) => item.value)
);

export type ZodiacBirthHourValue = (typeof ZODIAC_BIRTH_HOURS)[number]['value'];

export function isZodiacBirthHourValue(value: string): value is ZodiacBirthHourValue {
  return ZODIAC_BIRTH_HOUR_VALUES.has(value as ZodiacBirthHourValue);
}

function isValidDateParts(day: number, month: number, year: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function splitBirthDate(value?: string | null): BirthDateParts {
  if (!value) {
    return { day: '', month: '', year: '' };
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return {
      day: String(Number(isoMatch[3])),
      month: String(Number(isoMatch[2])),
      year: isoMatch[1],
    };
  }

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
  if (slashMatch) {
    const y = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    return {
      day: String(Number(slashMatch[1])),
      month: String(Number(slashMatch[2])),
      year: y,
    };
  }

  return { day: '', month: '', year: '' };
}

export function validateBirthDateParts(parts: BirthDateParts): string | null {
  const { day, month, year } = parts;
  const hasAny = Boolean(day || month || year);
  const hasAll = Boolean(day && month && year);

  if (!hasAny) {
    return null;
  }

  if (!hasAll) {
    return 'Vui lòng chọn đủ ngày, tháng và nhập năm sinh';
  }

  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (!isValidDateParts(dayNum, monthNum, yearNum)) {
    return 'Ngày sinh không hợp lệ';
  }

  return null;
}

export function buildIsoBirthDate(parts: BirthDateParts): string | null {
  const validationError = validateBirthDateParts(parts);
  if (validationError) {
    return null;
  }

  if (!parts.day || !parts.month || !parts.year) {
    return null;
  }

  const day = Number(parts.day);
  const month = Number(parts.month);
  const year = Number(parts.year);

  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function formatBirthDateForClient(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const asDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return null;
  }

  const dd = String(asDate.getUTCDate()).padStart(2, '0');
  const mm = String(asDate.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = asDate.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function parseBirthDateInput(value: unknown): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('INVALID_BIRTH_DATE');
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidDateParts(day, month, year)) {
      throw new Error('INVALID_BIRTH_DATE');
    }
    return new Date(Date.UTC(year, month - 1, day));
  }

  const slashOrDashMatch = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{2}|\d{4})$/);
  if (slashOrDashMatch) {
    const day = Number(slashOrDashMatch[1]);
    const month = Number(slashOrDashMatch[2]);
    const year =
      slashOrDashMatch[3].length === 2
        ? Number(`20${slashOrDashMatch[3]}`)
        : Number(slashOrDashMatch[3]);

    if (!isValidDateParts(day, month, year)) {
      throw new Error('INVALID_BIRTH_DATE');
    }

    return new Date(Date.UTC(year, month - 1, day));
  }

  throw new Error('INVALID_BIRTH_DATE');
}