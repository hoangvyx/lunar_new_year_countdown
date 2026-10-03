import { describe, it, expect } from 'vitest';
import { getDefaultYear, getStatus, DAY_MS } from '../src/countdown.js';

// Mốc thời gian (ms) của một thời điểm theo giờ Việt Nam (UTC+7).
const vn = (y, m, d, h = 0, min = 0, s = 0) => Date.UTC(y, m - 1, d, h - 7, min, s);

const TODAY = vn(2026, 10, 3);
const TET_2027 = vn(2027, 2, 6);

describe('getDefaultYear', () => {
  it('ngày 3/10/2026 đếm đến Tết 2027', () => {
    expect(getDefaultYear(TODAY)).toBe(2027);
  });

  it('đầu tháng 1/2027 vẫn đếm đến Tết 2027', () => {
    expect(getDefaultYear(vn(2027, 1, 1))).toBe(2027);
  });

  it('suốt mùng 1 vẫn là năm 2027', () => {
    expect(getDefaultYear(TET_2027 + 12 * 3_600_000)).toBe(2027);
  });

  it('sang mùng 2 thì chuyển sang Tết 2028', () => {
    expect(getDefaultYear(TET_2027 + DAY_MS)).toBe(2028);
  });
});

describe('getStatus', () => {
  it('ngày 3/10/2026 còn đúng 126 ngày đến Tết 2027', () => {
    expect(getStatus(2027, TODAY)).toEqual({
      state: 'sap-toi', days: 126, hours: 0, minutes: 0, seconds: 0,
    });
  });

  it('một giây trước giao thừa', () => {
    expect(getStatus(2027, TET_2027 - 1000)).toEqual({
      state: 'sap-toi', days: 0, hours: 0, minutes: 0, seconds: 1,
    });
  });

  it('đúng giao thừa và cuối ngày mùng 1 đều là dang-tet', () => {
    expect(getStatus(2027, TET_2027).state).toBe('dang-tet');
    expect(getStatus(2027, TET_2027 + DAY_MS - 60_000).state).toBe('dang-tet');
  });

  it('hết mùng 1 thì là da-qua', () => {
    expect(getStatus(2027, TET_2027 + DAY_MS)).toEqual({
      state: 'da-qua', days: 1, hours: 0, minutes: 0, seconds: 0,
    });
  });

  it('Tết Giáp Thìn 2024 đã qua 966 ngày tính đến 3/10/2026', () => {
    expect(getStatus(2024, TODAY)).toEqual({
      state: 'da-qua', days: 966, hours: 0, minutes: 0, seconds: 0,
    });
  });

  it('tách đúng giờ, phút, giây', () => {
    const now = TET_2027 - (2 * DAY_MS + 3 * 3_600_000 + 4 * 60_000 + 5_000);
    expect(getStatus(2027, now)).toEqual({
      state: 'sap-toi', days: 2, hours: 3, minutes: 4, seconds: 5,
    });
  });
});
