import { describe, it, expect } from 'vitest';
import { getCanChi } from '../src/canchi.js';

describe('getCanChi', () => {
  it.each([
    [2026, 'Bính', 'Ngọ', 'Ngựa', '🐴'],
    [2027, 'Đinh', 'Mùi', 'Dê', '🐐'],
    [2024, 'Giáp', 'Thìn', 'Rồng', '🐲'],
    [2023, 'Quý', 'Mão', 'Mèo', '🐱'],
    [1900, 'Canh', 'Tý', 'Chuột', '🐭'],
  ])('năm %i là %s %s (%s)', (year, can, chi, conGiap, emoji) => {
    expect(getCanChi(year)).toEqual({ can, chi, conGiap, emoji, ten: `${can} ${chi}` });
  });
});
