import { describe, it, expect } from 'vitest';
import { JOKES, pickJoke } from '../src/jokes.js';

describe('JOKES', () => {
  it('có ít nhất 20 câu và câu nào cũng chứa {ngay}', () => {
    expect(JOKES.length).toBeGreaterThanOrEqual(20);
    for (const joke of JOKES) expect(joke).toContain('{ngay}');
  });
});

describe('pickJoke', () => {
  it('thay {ngay} bằng số ngày', () => {
    const { index, text } = pickJoke(126, { random: () => 0 });
    expect(index).toBe(0);
    expect(text).toContain('126');
    expect(text).not.toContain('{ngay}');
  });

  it('không lặp lại câu bị loại trừ', () => {
    expect(pickJoke(5, { random: () => 0, exclude: 0 }).index).toBe(1);
  });

  it('ngày cuối nói "chưa đầy 1 ngày" thay vì "0 ngày"', () => {
    expect(pickJoke(0, { random: () => 0 }).text)
      .toBe('Còn chưa đầy 1 ngày nữa là được lì xì, ráng ngoan nha!');
    expect(pickJoke(0, { random: () => 0.11 }).text)
      .toBe('Chưa đầy 1 ngày nữa thôi, bánh chưng đang trên đường đến với bạn.');
  });

  it('random gần 1 thì chọn câu cuối', () => {
    expect(pickJoke(5, { random: () => 0.9999 }).index).toBe(JOKES.length - 1);
  });
});
