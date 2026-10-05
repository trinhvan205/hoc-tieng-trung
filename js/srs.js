// Lặp lại ngắt quãng theo hộp Leitner 6 mức: 0 → 1 → 2 → 4 → 8 → 16 ngày.
import { S, save } from './store.js';
import { today, addDays } from './util.js';

export const INTERVALS = [0, 1, 2, 4, 8, 16];

export const rec = id => S().words[id];
export const isLearned = id => !!S().words[id];
export const isMastered = id => !!S().words[id]?.mastered;

// Học xong một từ mới: vào hộp 1, hẹn ôn ngày mai.
export function learn(id) {
  if (S().words[id]) return false;
  S().words[id] = { box: 1, due: addDays(today(), 1), seen: 1, wrong: 0 };
  return true;
}

export function dueIds() {
  const t = today();
  return Object.entries(S().words)
    .filter(([, r]) => r.due <= t)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[1].box - b[1].box))
    .map(([id]) => id);
}

// grade: 'good' (Nhớ), 'hard' (Khó), 'again' (Quên)
export function grade(id, g) {
  const r = S().words[id];
  if (!r) return;
  r.seen = (r.seen || 0) + 1;
  if (g === 'good') {
    if (r.box >= 6) { r.mastered = true; r.due = addDays(today(), 32); }
    else { r.box += 1; r.due = addDays(today(), INTERVALS[r.box - 1]); }
  } else if (g === 'hard') {
    r.due = addDays(today(), 1);
  } else {
    r.box = 1; r.wrong = (r.wrong || 0) + 1; r.mastered = false; r.due = today();
  }
  save();
}

// Làm sai trong bài kiểm tra: về mức 1, ôn lại ngay hôm nay.
export function demote(id) {
  const r = S().words[id];
  if (!r) return;
  r.box = 1; r.wrong = (r.wrong || 0) + 1; r.mastered = false; r.due = today();
}
