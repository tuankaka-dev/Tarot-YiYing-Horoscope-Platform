export type TuViGender = 'male' | 'female';

const TUVI_GENDER_STORAGE_KEY = 'tuvi_gender';

export function normalizeTuViGender(value: string | null | undefined): TuViGender {
  return value === 'female' ? 'female' : 'male';
}

export function getStoredTuViGender(): TuViGender {
  if (typeof window === 'undefined') {
    return 'male';
  }

  const value = window.localStorage.getItem(TUVI_GENDER_STORAGE_KEY);
  return normalizeTuViGender(value);
}

export function setStoredTuViGender(value: TuViGender): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TUVI_GENDER_STORAGE_KEY, value);
}
