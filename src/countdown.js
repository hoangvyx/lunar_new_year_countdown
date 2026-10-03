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
