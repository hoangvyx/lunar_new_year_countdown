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
  els.joke.textContent = `"${joke.text}"`;
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
