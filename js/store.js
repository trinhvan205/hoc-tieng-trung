// Tiến độ lưu trong một khóa localStorage duy nhất. File sao lưu chính là đối tượng này.
import { today, addDays } from './util.js';

const KEY = 'hoc-tieng-trung:v1';

const defaults = () => ({
  version: 1,
  profile: {
    name: '', dailyGoalCards: 20, newPerDay: 10, showPinyin: true,
    rate: 0.8, theme: 'auto', unlockAll: false, onboarded: false,
  },
  words: {},   // id -> { box, due, seen, wrong, mastered? }
  topics: {},  // id -> { learned, bestScore }
  days: {},    // yyyy-mm-dd -> { cards, minutes, reviews, newWords }
  badges: [],
});

let state = defaults();

function migrate(s) {
  const d = defaults();
  if (!s || typeof s !== 'object') return d;
  return {
    ...d, ...s, version: 1,
    profile: { ...d.profile, ...(s.profile || {}) },
    words: s.words || {}, topics: s.topics || {}, days: s.days || {}, badges: s.badges || [],
  };
}

export function load() {
  try { state = migrate(JSON.parse(localStorage.getItem(KEY))); } catch { state = defaults(); }
  return state;
}
export const S = () => state;
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Không lưu được tiến độ', e); }
}

export function day(date = today()) {
  return (state.days[date] ||= { cards: 0, minutes: 0, reviews: 0, newWords: 0 });
}

// Cộng thời gian học: mỗi thao tác tính khoảng cách tới thao tác trước, tối đa 1 phút.
let lastTouch = 0;
export function activity() {
  const now = Date.now();
  const gap = lastTouch ? Math.min(now - lastTouch, 60000) : 15000;
  lastTouch = now;
  const d = day();
  d.minutes = Math.round((d.minutes + gap / 60000) * 10) / 10;
}

export function countCard(kind) {
  activity();
  const d = day();
  d.cards++;
  if (kind === 'review') d.reviews = (d.reviews || 0) + 1;
  if (kind === 'new') d.newWords = (d.newWords || 0) + 1;
  save();
}

export function streak() {
  let n = 0;
  let date = today();
  if (!(state.days[date]?.cards > 0)) date = addDays(date, -1);
  while (state.days[date]?.cards > 0) { n++; date = addDays(date, -1); }
  return n;
}

export function applyTheme() {
  const t = state.profile.theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

export function exportBackup() {
  return JSON.stringify(state, null, 1);
}

export function importBackup(text) {
  const data = JSON.parse(text);
  if (!data || data.version !== 1 || typeof data.words !== 'object') throw new Error('File không đúng định dạng sao lưu');
  state = migrate(data);
  save();
}

export function resetAll() {
  const keepName = state.profile.name;
  state = defaults();
  state.profile.name = keepName;
  save();
}
