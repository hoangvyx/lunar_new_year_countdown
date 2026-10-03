import { describe, it, expect } from 'vitest';
import { getTetDate, getTetInstant, formatSolarDate, MIN_YEAR, MAX_YEAR } from '../src/lunar.js';

// Ngày Tết Việt Nam (giờ UTC+7). 1985, 2007, 2030 khác Trung Quốc.
const TET_VN = [
  [1985, 1, 21], // Trung Quốc: 20/02/1985
  [2000, 2, 5],
  [2007, 2, 17], // Trung Quốc: 18/02/2007
  [2020, 1, 25],
  [2023, 1, 22],
  [2024, 2, 10],
  [2025, 1, 29],
  [2026, 2, 17],
  [2027, 2, 6],
  [2028, 1, 26],
  [2029, 2, 13],
  [2030, 2, 2], // Trung Quốc: 03/02/2030
];

describe('getTetDate', () => {
  it.each(TET_VN)('Tết năm %i rơi vào tháng %i ngày %i', (year, month, day) => {
    expect(getTetDate(year)).toEqual({ year, month, day });
  });

  it('nhận đúng hai đầu khoảng năm', () => {
    expect(getTetDate(MIN_YEAR).year).toBe(1900);
    expect(getTetDate(MAX_YEAR).year).toBe(2100);
  });

  it('ném RangeError khi năm ngoài 1900–2100', () => {
    expect(() => getTetDate(1899)).toThrow(RangeError);
    expect(() => getTetDate(2101)).toThrow(RangeError);
    expect(() => getTetDate(2027.5)).toThrow(RangeError);
  });
});

describe('getTetInstant', () => {
  it('là 00:00 giờ Việt Nam, tức 17:00 UTC hôm trước', () => {
    expect(getTetInstant(2027)).toBe(Date.UTC(2027, 1, 5, 17));
  });

  it('ném RangeError khi năm ngoài khoảng', () => {
    expect(() => getTetInstant(2101)).toThrow(RangeError);
  });
});

describe('formatSolarDate', () => {
  it('ghi kèm thứ trong tuần và đệm số 0', () => {
    expect(formatSolarDate({ year: 2027, month: 2, day: 6 })).toBe('Thứ Bảy, 06/02/2027');
    expect(formatSolarDate({ year: 2026, month: 2, day: 17 })).toBe('Thứ Ba, 17/02/2026');
  });
});
