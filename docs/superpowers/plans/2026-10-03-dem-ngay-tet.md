# Kế hoạch triển khai: Web đếm ngày đến Tết

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Mục tiêu:** Một trang web đếm ngược đến Tết Nguyên Đán theo giờ Việt Nam, cho chọn năm (1900–2100), hiện Can Chi và con giáp, câu nói vui ngẫu nhiên và pháo hoa lúc giao thừa.

**Kiến trúc:** Vite, JavaScript thuần (không framework). Logic nằm trong các module hàm thuần (`lunar`, `canchi`, `countdown`, `jokes`), kiểm thử bằng Vitest. `main.js` nối logic với DOM, còn `fireworks.js` vẽ trên `<canvas>`.

**Công nghệ:** Node.js v24, Vite (bản mới nhất), Vitest (bản mới nhất), HTML/CSS/JS thuần, font Be Vietnam Pro từ Google Fonts.

**Tài liệu thiết kế:** `docs/superpowers/specs/2026-10-03-dem-ngay-tet-design.md`

## Ràng buộc chung

- Thư mục gốc dự án: `D:\Cong_viec_2026\T10_2026\vuive`. Mọi đường dẫn bên dưới tính từ thư mục này.
- Git remote: `origin = https://github.com/hoangvyx/lunar_new_year_countdown.git`, nhánh `main`.
- Không có thư viện chạy kèm. Chỉ có `vite` và `vitest` trong `devDependencies`.
- Múi giờ cố định là **UTC+7**. Giao thừa là **00:00 giờ Việt Nam** của mùng 1 tháng Giêng âm lịch.
- Khoảng năm hợp lệ: **1900–2100**. Ngoài khoảng này, `getTetDate` và `getTetInstant` ném `RangeError`.
- Con giáp theo kiểu Việt: Mão là **Mèo 🐱**, không phải Thỏ.
- Toàn bộ chữ hiển thị trên giao diện là tiếng Việt có dấu.
- Giao diện ưu tiên điện thoại: khoảng cách hai bên ≥ 16 px, không cuộn ngang ở khổ 375 px.
- Mỗi commit kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Không** tự đăng lên Vercel hay GitHub Pages. Đăng lên mạng là việc riêng, phải hỏi người dùng trước.

## Bản đồ file

| File | Trách nhiệm |
|---|---|
| `package.json` | scripts `dev` / `build` / `preview` / `test`, devDependencies |
| `index.html` | khung trang, các phần tử có `id` để `main.js` điều khiển |
| `src/lunar.js` | đổi âm → dương lịch (thuật toán Hồ Ngọc Đức), `getTetDate`, `getTetInstant`, `formatSolarDate`, `MIN_YEAR`, `MAX_YEAR` |
| `src/canchi.js` | `getCanChi(year)` |
| `src/countdown.js` | `getDefaultYear(now)`, `getStatus(year, now)`, các hằng thời gian |
| `src/jokes.js` | `JOKES`, `pickJoke(days, opts)` |
| `src/fireworks.js` | `launchFireworks(canvas, durationMs)` |
| `src/main.js` | vẽ giao diện, hẹn giờ cập nhật, chọn năm, nút bấm, ăn mừng |
| `src/style.css` | giao diện đỏ son + vàng kim |
| `tests/*.test.js` | kiểm thử cho 4 module thuần |
| `.claude/launch.json` | cấu hình để mở trang trong trình duyệt tích hợp |
| `README.md` | hướng dẫn chạy |

---

### Task 1: Dựng dự án + module âm lịch `lunar.js`

**Files:**
- Create: `package.json`
- Create: `src/lunar.js`
- Test: `tests/lunar.test.js`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `getTetDate(year: number) → { year: number, month: number, day: number }` (month tính từ 1)
  - `getTetInstant(year: number) → number` (ms epoch của 00:00 giờ Việt Nam ngày Tết)
  - `formatSolarDate({ year, month, day }) → string`, ví dụ `"Thứ Bảy, 06/02/2027"`
  - `MIN_YEAR = 1900`, `MAX_YEAR = 2100`

- [ ] **Step 1: Tạo `package.json` và cài devDependencies**

Tạo file `package.json`:

```json
{
  "name": "lunar-new-year-countdown",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

Run: `npm install -D vite vitest`
Expected: tạo `node_modules/` và `package-lock.json`, `package.json` có thêm `devDependencies` gồm `vite` và `vitest`.

- [ ] **Step 2: Viết test chạy đỏ `tests/lunar.test.js`**

```js
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
```

- [ ] **Step 3: Chạy test để thấy đỏ**

Run: `npx vitest run tests/lunar.test.js`
Expected: FAIL, báo lỗi không tìm thấy module `../src/lunar.js`.

- [ ] **Step 4: Viết `src/lunar.js`**

```js
// Đổi âm lịch → dương lịch theo thuật toán của Hồ Ngọc Đức
// (https://www.informatik.uni-leipzig.de/~duc/amlich/), tính theo giờ Việt Nam.

const VN_TIME_ZONE = 7;
const HOUR_MS = 3_600_000;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4)
    - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd) {
  let b;
  let c;
  if (jd > 2299160) {
    const a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    year: b * 100 + d - 4800 + Math.floor(m / 10),
    month: m + 3 - 12 * Math.floor(m / 10),
    day: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

// Thời điểm sóc (trăng mới) thứ k, tính theo Julian day.
function newMoon(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltaT = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return jd1 + C1 - deltaT;
}

function getNewMoonDay(k, timeZone) {
  return Math.floor(newMoon(k) + 0.5 + timeZone / 24);
}

// Kinh độ mặt trời (radian) tại Julian day jdn.
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  const L = (L0 + DL) * dr;
  return L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
}

// Cung hoàng đạo 0..11 của mặt trời vào đầu ngày dayNumber.
function getSunLongitude(dayNumber, timeZone) {
  return Math.floor((sunLongitude(dayNumber - 0.5 - timeZone / 24) / Math.PI) * 6);
}

// Ngày bắt đầu tháng 11 âm lịch của năm yy (tháng chứa đông chí).
function getLunarMonth11(yy, timeZone) {
  const k = Math.floor((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  if (getSunLongitude(nm, timeZone) >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

// Ngày âm lịch (không nhuận) → ngày dương lịch.
function lunarToSolar(lunarDay, lunarMonth, lunarYear, timeZone) {
  let a11;
  let b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365 && off >= getLeapMonthOffset(a11, timeZone)) off += 1;
  return jdToDate(getNewMoonDay(k + off, timeZone) + lunarDay - 1);
}

function assertYear(year) {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`Năm phải từ ${MIN_YEAR} đến ${MAX_YEAR}`);
  }
}

export function getTetDate(year) {
  assertYear(year);
  return lunarToSolar(1, 1, year, VN_TIME_ZONE);
}

export function getTetInstant(year) {
  const { year: y, month, day } = getTetDate(year);
  return Date.UTC(y, month - 1, day) - VN_TIME_ZONE * HOUR_MS;
}

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const pad2 = (n) => String(n).padStart(2, '0');

export function formatSolarDate({ year, month, day }) {
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday}, ${pad2(day)}/${pad2(month)}/${year}`;
}
```

- [ ] **Step 5: Chạy test để thấy xanh**

Run: `npx vitest run tests/lunar.test.js`
Expected: PASS, 17 test. Gồm 12 ngày Tết (Vitest đếm `it.each` thành 12 test riêng), 2 test khoảng năm, 2 test `getTetInstant` và 1 test `formatSolarDate`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lunar.js tests/lunar.test.js
git commit -m "feat: add lunar calendar module with Vietnamese Tet dates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Can Chi + con giáp `canchi.js`

**Files:**
- Create: `src/canchi.js`
- Test: `tests/canchi.test.js`

**Interfaces:**
- Consumes: không có.
- Produces: `getCanChi(year: number) → { can: string, chi: string, conGiap: string, emoji: string, ten: string }`

- [ ] **Step 1: Viết test chạy đỏ `tests/canchi.test.js`**

```js
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
```

- [ ] **Step 2: Chạy test để thấy đỏ**

Run: `npx vitest run tests/canchi.test.js`
Expected: FAIL, báo lỗi không tìm thấy module `../src/canchi.js`.

- [ ] **Step 3: Viết `src/canchi.js`**

```js
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
// Con giáp kiểu Việt: Mão là Mèo.
const CON_GIAP = [
  ['Chuột', '🐭'], ['Trâu', '🐃'], ['Hổ', '🐯'], ['Mèo', '🐱'],
  ['Rồng', '🐲'], ['Rắn', '🐍'], ['Ngựa', '🐴'], ['Dê', '🐐'],
  ['Khỉ', '🐵'], ['Gà', '🐓'], ['Chó', '🐶'], ['Lợn', '🐷'],
];

export function getCanChi(year) {
  const can = CAN[(year + 6) % 10];
  const chiIndex = (year + 8) % 12;
  const chi = CHI[chiIndex];
  const [conGiap, emoji] = CON_GIAP[chiIndex];
  return { can, chi, conGiap, emoji, ten: `${can} ${chi}` };
}
```

- [ ] **Step 4: Chạy test để thấy xanh**

Run: `npx vitest run tests/canchi.test.js`
Expected: PASS, 5 test.

- [ ] **Step 5: Commit**

```bash
git add src/canchi.js tests/canchi.test.js
git commit -m "feat: add Can Chi and Vietnamese zodiac lookup

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Đếm ngược `countdown.js`

**Files:**
- Create: `src/countdown.js`
- Test: `tests/countdown.test.js`

**Interfaces:**
- Consumes: `getTetInstant(year)` từ `src/lunar.js` (Task 1).
- Produces:
  - `getDefaultYear(now: number) → number`
  - `getStatus(year: number, now: number) → { state: 'sap-toi' | 'dang-tet' | 'da-qua', days, hours, minutes, seconds }`. Ở `sap-toi`, các trường là thời gian còn lại. Ở `dang-tet` và `da-qua`, các trường là thời gian đã trôi qua kể từ giao thừa.
  - `DAY_MS = 86_400_000`

- [ ] **Step 1: Viết test chạy đỏ `tests/countdown.test.js`**

```js
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
```

- [ ] **Step 2: Chạy test để thấy đỏ**

Run: `npx vitest run tests/countdown.test.js`
Expected: FAIL, báo lỗi không tìm thấy module `../src/countdown.js`.

- [ ] **Step 3: Viết `src/countdown.js`**

```js
import { getTetInstant } from './lunar.js';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
const VN_OFFSET_MS = 7 * HOUR_MS;

// Tết gần nhất chưa qua hết ngày mùng 1, tính theo giờ Việt Nam.
export function getDefaultYear(now) {
  const year = new Date(now + VN_OFFSET_MS).getUTCFullYear();
  return now < getTetInstant(year) + DAY_MS ? year : year + 1;
}

function split(ms) {
  return {
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor((ms % DAY_MS) / HOUR_MS),
    minutes: Math.floor((ms % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((ms % MINUTE_MS) / SECOND_MS),
  };
}

export function getStatus(year, now) {
  const tet = getTetInstant(year);
  if (now < tet) return { state: 'sap-toi', ...split(tet - now) };
  if (now < tet + DAY_MS) return { state: 'dang-tet', ...split(now - tet) };
  return { state: 'da-qua', ...split(now - tet) };
}
```

- [ ] **Step 4: Chạy test để thấy xanh**

Run: `npx vitest run tests/countdown.test.js`
Expected: PASS, 10 test.

- [ ] **Step 5: Commit**

```bash
git add src/countdown.js tests/countdown.test.js
git commit -m "feat: add countdown status and default year logic

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Câu nói vui `jokes.js`

**Files:**
- Create: `src/jokes.js`
- Test: `tests/jokes.test.js`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `JOKES: string[]`: 20 câu mẫu, câu nào cũng chứa `{ngay}`.
  - `pickJoke(days: number, { random = Math.random, exclude = -1 } = {}) → { index: number, text: string }`

- [ ] **Step 1: Viết test chạy đỏ `tests/jokes.test.js`**

```js
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

  it('random gần 1 thì chọn câu cuối', () => {
    expect(pickJoke(5, { random: () => 0.9999 }).index).toBe(JOKES.length - 1);
  });
});
```

- [ ] **Step 2: Chạy test để thấy đỏ**

Run: `npx vitest run tests/jokes.test.js`
Expected: FAIL, báo lỗi không tìm thấy module `../src/jokes.js`.

- [ ] **Step 3: Viết `src/jokes.js`**

```js
export const JOKES = [
  'Còn {ngay} ngày nữa là được lì xì, ráng ngoan nha!',
  'Còn {ngay} ngày nữa là Tết, kế hoạch giảm cân xin phép hoãn sang năm sau.',
  '{ngay} ngày nữa thôi, bánh chưng đang trên đường đến với bạn.',
  'Còn {ngay} ngày để tập trả lời câu "Bao giờ lấy vợ/chồng?".',
  'Còn {ngay} ngày nữa là được ngủ nướng hợp pháp.',
  'Còn {ngay} ngày, ví tiền bắt đầu run rẩy vì sắm Tết.',
  '{ngay} ngày nữa là hạt dưa, mứt gừng tràn ngập khắp nhà.',
  'Còn {ngay} ngày để dọn nhà… hoặc để giả vờ là đã dọn.',
  'Còn {ngay} ngày nữa là được diện áo mới đi chúc Tết.',
  '{ngay} ngày nữa, họ hàng sẽ hỏi "Lương tháng bao nhiêu?".',
  'Còn {ngay} ngày, nồi thịt kho trứng đã sẵn sàng tinh thần.',
  'Còn {ngay} ngày nữa là nhạc Tết vang khắp mọi ngả đường.',
  '{ngay} ngày nữa là tới mùa "ăn rồi nằm, nằm rồi ăn".',
  'Còn {ngay} ngày để luyện câu "An khang thịnh vượng, vạn sự như ý".',
  'Còn {ngay} ngày nữa, tủ lạnh sẽ chật kín đồ ăn.',
  '{ngay} ngày nữa thôi, sếp ơi cho về quê sớm nha!',
  'Còn {ngay} ngày nữa là được đếm tiền lì xì đến mỏi tay (mong là vậy).',
  'Còn {ngay} ngày, dưa hành đang chờ cứu bạn khỏi đầy bụng.',
  '{ngay} ngày nữa là hoa mai, hoa đào nở rộ khắp phố.',
  'Còn {ngay} ngày nữa là năm mới, deadline cũ làm ơn biến mất giùm.',
];

export function pickJoke(days, { random = Math.random, exclude = -1 } = {}) {
  const candidates = JOKES.map((_, i) => i).filter((i) => i !== exclude);
  const index = candidates[Math.floor(random() * candidates.length)];
  return { index, text: JOKES[index].replaceAll('{ngay}', String(days)) };
}
```

- [ ] **Step 4: Chạy toàn bộ test để thấy xanh**

Run: `npm test`
Expected: PASS cả 4 file, tổng cộng 36 test (17 + 5 + 10 + 4).

- [ ] **Step 5: Commit**

```bash
git add src/jokes.js tests/jokes.test.js
git commit -m "feat: add random Tet jokes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Giao diện `index.html` + `style.css` + `main.js` (chưa có pháo hoa)

**Files:**
- Create: `index.html`
- Create: `src/style.css`
- Create: `src/main.js`
- Create: `.claude/launch.json`

**Interfaces:**
- Consumes: `getTetDate`, `formatSolarDate`, `MIN_YEAR`, `MAX_YEAR` (Task 1); `getCanChi` (Task 2); `getDefaultYear`, `getStatus` (Task 3); `pickJoke` (Task 4).
- Produces: hàm `celebrate()` trong `main.js`. Lúc này nó chỉ hiện lời chúc (toast) trong 5 giây. Task 6 sẽ gắn thêm pháo hoa. Canvas `#fireworks` cũng đã có sẵn trong HTML.

- [ ] **Step 1: Viết `index.html`**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đếm Ngày Đến Tết</title>
    <meta name="description" content="Còn bao nhiêu ngày nữa đến Tết Nguyên Đán? Đếm ngược theo giờ Việt Nam." />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧧</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <canvas id="fireworks" aria-hidden="true"></canvas>

    <main class="card">
      <h1 class="title">Còn bao lâu nữa đến Tết?</h1>
      <p class="year-name">
        <span id="year-name"></span>
        <span id="year-emoji" aria-hidden="true"></span>
      </p>
      <p id="solar-date" class="solar-date"></p>

      <section id="countdown" class="countdown">
        <div class="unit"><span id="days" class="num">0</span><span class="label">Ngày</span></div>
        <div class="unit"><span id="hours" class="num">00</span><span class="label">Giờ</span></div>
        <div class="unit"><span id="minutes" class="num">00</span><span class="label">Phút</span></div>
        <div class="unit"><span id="seconds" class="num">00</span><span class="label">Giây</span></div>
      </section>
      <p id="message" class="message" hidden></p>

      <section id="joke-box" class="joke-box">
        <p id="joke" class="joke"></p>
        <button id="next-joke" class="btn btn-ghost" type="button">Câu khác 🔄</button>
      </section>

      <section class="year-picker">
        <label for="year-input">Năm:</label>
        <button id="prev-year" class="btn btn-round" type="button" aria-label="Năm trước">◀</button>
        <input id="year-input" type="number" min="1900" max="2100" inputmode="numeric" />
        <button id="next-year" class="btn btn-round" type="button" aria-label="Năm sau">▶</button>
      </section>
      <p id="year-error" class="year-error" hidden>Chỉ xem được từ 1900 đến 2100 thôi nha 😅</p>

      <button id="fire" class="btn btn-gold" type="button">Bắn thử 🎆</button>
    </main>

    <div id="toast" class="toast" role="status" hidden>🎉 Chúc Mừng Năm Mới!</div>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Viết `src/style.css`**

```css
:root {
  --red-900: #5c0a0a;
  --red-700: #9b1111;
  --red-600: #b71c1c;
  --gold-400: #ffd54f;
  --gold-300: #ffe082;
  --cream: #fff8e1;
  --shadow: 0 10px 30px rgb(0 0 0 / 0.35);
  --radius: 16px;
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  color: var(--cream);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background-color: var(--red-900);
  background-image: radial-gradient(circle at 50% 0%, var(--red-600), var(--red-900) 70%);
  overflow-x: hidden;
}

[hidden] {
  display: none !important;
}

#fireworks {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 600;
  color: var(--gold-300);
}

.year-name {
  margin: 0;
  font-size: clamp(1.75rem, 7vw, 2.75rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--gold-400);
  text-shadow: 0 2px 0 var(--red-900);
}

.solar-date {
  margin: -12px 0 0;
  opacity: 0.9;
}

.countdown {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.unit {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 4px;
  background: rgb(0 0 0 / 0.25);
  border: 1px solid rgb(255 213 79 / 0.4);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.num {
  font-size: clamp(1.75rem, 9vw, 3rem);
  font-weight: 800;
  line-height: 1;
  color: var(--gold-400);
  font-variant-numeric: tabular-nums;
}

.label {
  font-size: 0.85rem;
  opacity: 0.85;
}

.message {
  margin: 0;
  font-size: clamp(1.25rem, 5vw, 1.6rem);
  font-weight: 600;
  color: var(--gold-300);
}

.joke-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.joke {
  margin: 0;
  min-height: 3em;
  font-style: italic;
}

.year-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

#year-input {
  width: 6.5em;
  padding: 8px;
  font: inherit;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  color: var(--red-900);
  background: var(--cream);
  border: 2px solid var(--gold-400);
  border-radius: 10px;
}

.year-error {
  margin: -12px 0 0;
  font-size: 0.9rem;
  color: var(--gold-300);
}

.btn {
  font: inherit;
  cursor: pointer;
  padding: 8px 18px;
  border: 2px solid var(--gold-400);
  border-radius: 999px;
  transition: transform 0.1s ease;
}

.btn:active {
  transform: scale(0.96);
}

.btn:focus-visible {
  outline: 3px solid var(--cream);
  outline-offset: 2px;
}

.btn-ghost {
  background: transparent;
  color: var(--gold-300);
}

.btn-round {
  width: 44px;
  height: 44px;
  padding: 0;
  font-weight: 800;
  color: var(--red-900);
  background: var(--gold-400);
}

.btn-gold {
  padding: 12px 28px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--red-900);
  background: linear-gradient(180deg, var(--gold-300), var(--gold-400));
  box-shadow: var(--shadow);
}

.toast {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 11;
  max-width: calc(100% - 32px);
  padding: 16px 28px;
  font-size: clamp(1.25rem, 6vw, 2rem);
  font-weight: 800;
  text-align: center;
  color: var(--red-700);
  background: var(--cream);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
```

- [ ] **Step 3: Viết `src/main.js`**

```js
import './style.css';
import { getTetDate, formatSolarDate, MIN_YEAR, MAX_YEAR } from './lunar.js';
import { getCanChi } from './canchi.js';
import { getDefaultYear, getStatus } from './countdown.js';
import { pickJoke } from './jokes.js';

const $ = (id) => document.getElementById(id);
const els = {
  yearName: $('year-name'),
  yearEmoji: $('year-emoji'),
  solarDate: $('solar-date'),
  countdown: $('countdown'),
  days: $('days'),
  hours: $('hours'),
  minutes: $('minutes'),
  seconds: $('seconds'),
  message: $('message'),
  jokeBox: $('joke-box'),
  joke: $('joke'),
  nextJoke: $('next-joke'),
  yearInput: $('year-input'),
  prevYear: $('prev-year'),
  nextYear: $('next-year'),
  yearError: $('year-error'),
  fire: $('fire'),
  toast: $('toast'),
  canvas: $('fireworks'),
};

const pad2 = (n) => String(n).padStart(2, '0');

let year = getDefaultYear(Date.now());
let lastState = null;
let jokeIndex = -1;
let jokeDays = null;
let toastTimer;

function renderYear() {
  const { ten, emoji } = getCanChi(year);
  els.yearName.textContent = `TẾT ${ten.toUpperCase()} ${year}`;
  els.yearEmoji.textContent = emoji;
  els.solarDate.textContent = formatSolarDate(getTetDate(year));
  els.yearInput.value = year;
}

function showJoke(days) {
  const joke = pickJoke(days, { exclude: jokeIndex });
  jokeIndex = joke.index;
  jokeDays = days;
  els.joke.textContent = `“${joke.text}”`;
}

function celebrate() {
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 5000);
}

function tick() {
  const status = getStatus(year, Date.now());
  const upcoming = status.state === 'sap-toi';
  els.countdown.hidden = !upcoming;
  els.jokeBox.hidden = !upcoming;
  els.message.hidden = upcoming;

  if (upcoming) {
    els.days.textContent = status.days;
    els.hours.textContent = pad2(status.hours);
    els.minutes.textContent = pad2(status.minutes);
    els.seconds.textContent = pad2(status.seconds);
    if (status.days !== jokeDays) showJoke(status.days);
  } else if (status.state === 'dang-tet') {
    els.message.textContent = '🎉 Hôm nay là Tết! Chúc Mừng Năm Mới!';
  } else {
    els.message.textContent = `Tết ${getCanChi(year).ten} ${year} đã qua ${status.days} ngày rồi 😅`;
  }

  if (lastState === 'sap-toi' && status.state === 'dang-tet') celebrate();
  lastState = status.state;
}

function setYear(next) {
  if (!Number.isInteger(next) || next < MIN_YEAR || next > MAX_YEAR) {
    els.yearError.hidden = false;
    els.yearInput.value = year;
    return;
  }
  els.yearError.hidden = true;
  year = next;
  lastState = null;
  jokeDays = null;
  renderYear();
  tick();
}

els.prevYear.addEventListener('click', () => setYear(year - 1));
els.nextYear.addEventListener('click', () => setYear(year + 1));
els.yearInput.addEventListener('change', () => setYear(Number(els.yearInput.value)));
els.nextJoke.addEventListener('click', () => showJoke(jokeDays));
els.fire.addEventListener('click', () => celebrate());

renderYear();
tick();
if (lastState === 'dang-tet') celebrate();
setInterval(tick, 1000);
```

- [ ] **Step 4: Viết `.claude/launch.json`**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "vuive-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 5: Kiểm tra tay trong trình duyệt tích hợp**

Mở bằng `preview_start` với name `vuive-dev`, rồi kiểm tra:
- Tiêu đề hiện "TẾT ĐINH MÙI 2027 🐐", ngày "Thứ Bảy, 06/02/2027", 4 ô đếm ngược (khoảng 125–126 ngày tùy giờ hiện tại), giây nhảy mỗi giây.
- Có một câu nói vui chứa số ngày. Bấm "Câu khác 🔄" thì ra câu khác.
- Bấm ▶ ra 2028 "TẾT MẬU THÂN 2028 🐵" với ngày 26/01/2028. Bấm ◀ hai lần ra 2026 "Tết Bính Ngọ 2026 đã qua … ngày rồi 😅", lúc này 4 ô và câu nói vui bị ẩn.
- Nhập 1899 rồi Enter: hiện "Chỉ xem được từ 1900 đến 2100 thôi nha 😅", ô nhập trả về năm cũ.
- Bấm "Bắn thử 🎆": toast "🎉 Chúc Mừng Năm Mới!" hiện rồi tự ẩn sau 5 giây.
- Đổi khổ màn hình sang `mobile` (375×812): không cuộn ngang, 4 ô vừa một hàng. Kiểm tra xong thì trả về `desktop`.
- `read_console_messages` với `onlyErrors: true` không có lỗi nào.

- [ ] **Step 6: Commit**

```bash
git add index.html src/style.css src/main.js .claude/launch.json
git commit -m "feat: add countdown page with year picker and jokes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Pháo hoa `fireworks.js`

**Files:**
- Create: `src/fireworks.js`
- Modify: `src/main.js` (thêm import, sửa `celebrate()`)

**Interfaces:**
- Consumes: canvas `#fireworks` và `celebrate()` của `main.js` (Task 5).
- Produces: `launchFireworks(canvas: HTMLCanvasElement, durationMs = 5000) → Promise<void>`, resolve khi hạt cuối cùng tắt.

- [ ] **Step 1: Viết `src/fireworks.js`**

```js
const COLORS = ['#ffd54f', '#ffe082', '#ff8a65', '#ff5252', '#fff8e1', '#ffab40'];
const GRAVITY = 0.04;
const FRICTION = 0.985;

export function launchFireworks(canvas, durationMs = 5000) {
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const start = performance.now();
  let nextBurst = start;

  function burst() {
    const x = window.innerWidth * (0.15 + Math.random() * 0.7);
    const y = window.innerHeight * (0.15 + Math.random() * 0.35);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        color,
      });
    }
  }

  return new Promise((resolve) => {
    function frame(t) {
      const elapsed = t - start;
      if (elapsed < durationMs && t >= nextBurst) {
        burst();
        nextBurst = t + 350 + Math.random() * 400;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= FRICTION;
        p.vy = p.vy * FRICTION + GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < durationMs || particles.length > 0) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        window.removeEventListener('resize', resize);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}
```

- [ ] **Step 2: Gắn pháo hoa vào `celebrate()` trong `src/main.js`**

Thêm import ngay sau dòng `import { pickJoke } from './jokes.js';`:

```js
import { launchFireworks } from './fireworks.js';
```

Thêm 2 dòng sau ngay dưới dòng `let toastTimer;`:

```js
let fireworksRunning = false;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
```

Thay toàn bộ hàm `celebrate()` bằng:

```js
function celebrate() {
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 5000);

  // Người dùng giảm chuyển động thì chỉ hiện lời chúc; đang bắn thì không bắn chồng.
  if (reduceMotion.matches || fireworksRunning) return;
  fireworksRunning = true;
  launchFireworks(els.canvas).then(() => {
    fireworksRunning = false;
  });
}
```

- [ ] **Step 3: Kiểm tra tay**

Trong trình duyệt tích hợp (server `vuive-dev`):
- Bấm "Bắn thử 🎆": pháo hoa nổ liên tục khoảng 5 giây ở nửa trên màn hình, sau đó tắt dần và canvas sạch. Toast hiện cùng lúc.
- Trong lúc pháo hoa đang bắn, vẫn bấm được ◀ ▶ (canvas không chặn thao tác).
- Bấm "Bắn thử" liên tục nhiều lần: không bị nhấp nháy (không bắn chồng).
- Giả lập giao thừa (không tải lại trang). `tick()` gọi `Date.now()` mỗi giây, nên chỉ cần ghi đè `Date.now` cho đồng hồ chạy tiếp từ 3 giây trước giao thừa 2027. Chạy đoạn sau bằng `javascript_tool`:
  ```js
  const realNow = Date.now.bind(Date);
  const offset = Date.UTC(2027, 1, 5, 17) - 3000 - realNow();
  Date.now = () => realNow() + offset;
  ```
  Expected: sau khoảng 3 giây, 4 ô đếm ngược đổi thành "🎉 Hôm nay là Tết! Chúc Mừng Năm Mới!", toast hiện và pháo hoa tự bắn. Kiểm tra xong thì tải lại trang để trả đồng hồ về bình thường.
- `read_console_messages` với `onlyErrors: true` không có lỗi.

- [ ] **Step 4: Commit**

```bash
git add src/fireworks.js src/main.js
git commit -m "feat: add canvas fireworks for New Year celebration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Build, README, đẩy lên GitHub

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: toàn bộ dự án.
- Produces: nhánh `main` trên GitHub có đủ code, `npm run build` chạy được.

- [ ] **Step 1: Chạy toàn bộ test**

Run: `npm test`
Expected: PASS, 36 test.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: tạo `dist/index.html` và `dist/assets/*.js`, `dist/assets/*.css`, không có lỗi.

Run: `npm run preview`, mở `http://localhost:4173` và xem nhanh trang có chạy giống bản dev. Kiểm tra xong thì tắt preview.

- [ ] **Step 3: Viết `README.md`**

````markdown
# 🧧 Đếm Ngày Đến Tết

Trang web đếm ngược đến Tết Nguyên Đán (mùng 1 tháng Giêng âm lịch) theo **giờ Việt Nam**.

- Mặc định đếm đến Tết gần nhất, chọn được năm bất kỳ từ 1900 đến 2100
- Can Chi + con giáp (kiểu Việt: năm Mão là Mèo 🐱)
- Câu nói vui ngẫu nhiên
- Pháo hoa lúc giao thừa, hoặc bấm "Bắn thử 🎆"

Âm lịch tính theo thuật toán của Hồ Ngọc Đức với múi giờ UTC+7, nên đúng cả những năm Tết Việt khác Tết Trung Quốc (1985, 2007, 2030).

## Chạy trên máy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm test         # chạy kiểm thử
npm run build    # build ra thư mục dist/
```
````

- [ ] **Step 4: Commit và đẩy lên GitHub**

```bash
git add README.md
git commit -m "docs: add README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin main
```

Expected: nhánh `main` trên `https://github.com/hoangvyx/lunar_new_year_countdown` có đủ các commit.

- [ ] **Step 5: Hỏi người dùng về việc đăng lên mạng**

Không tự đăng. Hỏi người dùng có muốn đăng lên Vercel hoặc GitHub Pages không, rồi làm theo câu trả lời.
