// Flashcard ôn tập: lật bằng chạm, chọn Quên / Khó / Nhớ (vuốt trái, bấm giữa, vuốt phải).
import { h, shuffle, hearts } from '../util.js';
import { S, save, countCard, day } from '../store.js';
import { data, praise } from '../data.js';
import { dueIds, grade, isLearned } from '../srs.js';
import { speak, speaker, ttsAvailable } from '../audio.js';
import { checkBadges } from '../badges.js';
import { praiseScreen, btn, exampleBox } from './parts.js';

const MODES = [
  { id: 'zh', label: 'Chữ → nghĩa' },
  { id: 'vi', label: 'Nghĩa → chữ' },
  { id: 'listen', label: 'Nghe → nghĩa' },
];

export default function flashcard({ query }) {
  const p = S().profile;
  const byId = data().byId;
  let mode = MODES.some(m => m.id === query.mode) ? query.mode : (p.cardMode || 'zh');
  if (mode === 'listen' && !ttsAvailable()) mode = 'zh';

  // Chọn thẻ cho buổi ôn.
  let ids;
  let practice = false;
  const goal = p.dailyGoalCards || 20;
  const due = dueIds();
  if (query.ids) ids = query.ids.split(',').filter(id => byId.has(id));
  else if (query.practice) {
    ids = shuffle(Object.keys(S().words)).slice(0, 10);
    practice = true;
  } else {
    const left = query.extra ? due.length : Math.max(0, goal - (day().reviews || 0));
    ids = due.slice(0, left);
  }

  const root = h('div', { class: 'stack-lg' });
  const title = 'Ôn flashcard';
  const ret = { title, tab: 'practice', back: true, node: root };

  if (!ids.length) {
    const learnedAny = Object.keys(S().words).length > 0;
    root.append(praiseScreen(due.length
      ? { icon: '✅', title: 'Hôm nay em ôn đủ rồi', text: `Còn ${due.length} thẻ đến hạn, để mai ôn tiếp cũng được nha.`,
        actions: [btn('Ôn thêm luôn', '#/review?extra=1', 'btn btn-primary'), btn('Về Trang chủ', '#/', 'btn btn-ghost')] }
      : { icon: '🎉', title: 'Không còn thẻ nào đến hạn', text: learnedAny ? 'Em giỏi quá! Muốn ôn thêm vài từ đã học không?' : 'Học vài từ mới trước, rồi thẻ ôn sẽ xuất hiện ở đây.',
        actions: [learnedAny ? btn('Ôn thêm 10 từ đã học', '#/review?practice=1', 'btn btn-primary') : btn('Học từ mới', '#/topics', 'btn btn-primary'),
          btn('Về Trang chủ', '#/', 'btn btn-ghost')] }));
    return ret;
  }

  const queue = ids.map(id => byId.get(id));
  const requeued = new Set();
  let i = 0;
  let flipped = false;
  let tally = { good: 0, hard: 0, again: 0 };

  const modeBar = h('div', { class: 'seg' }, MODES.map(m => h('button', {
    class: m.id === mode ? 'on' : '', disabled: m.id === 'listen' && !ttsAvailable() ? true : null,
    onclick: () => {
      mode = m.id; p.cardMode = mode; save();
      modeBar.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', MODES[k].id === mode));
      show();
    },
  }, m.label)));
  const counter = h('div', { class: 'muted center' });
  const stage = h('div', { class: 'flash-stage' });
  const actions = h('div', { class: 'grade-row' });

  root.append(modeBar, counter, stage, actions);

  function front(w) {
    if (mode === 'vi') return h('div', { class: 'face-content' }, h('div', { class: 'meaning meaning-lg' }, w.meaningVi), h('small', { class: 'muted' }, w.pos));
    if (mode === 'listen') return h('div', { class: 'face-content' }, speaker(w.hanzi, w, { big: true }), h('small', { class: 'muted' }, 'Nghe rồi đoán nghĩa'));
    return h('div', { class: 'face-content' },
      h('div', { class: 'hanzi hanzi-xl', lang: 'zh-CN' }, w.hanzi),
      p.showPinyin ? h('div', { class: 'pinyin pinyin-lg' }, w.pinyin) : null);
  }
  function back(w) {
    return h('div', { class: 'face-content' },
      h('div', { class: 'word-head' }, h('div', { class: 'hanzi hanzi-lg', lang: 'zh-CN' }, w.hanzi), speaker(w.hanzi, w)),
      h('div', { class: 'pinyin pinyin-lg' }, w.pinyin),
      h('div', { class: 'meaning' }, w.meaningVi),
      h('div', { class: 'muted' }, `Hán Việt: ${w.hanViet}`),
      exampleBox(w));
  }

  function show() {
    const w = queue[i];
    flipped = false;
    counter.textContent = `Còn ${queue.length - i} thẻ${practice ? ' · ôn thêm' : ''}`;
    const card = h('div', { class: 'flash', tabindex: 0, role: 'button', 'aria-label': 'Chạm để lật thẻ' },
      h('div', { class: 'flash-inner' },
        h('div', { class: 'flash-face flash-front' }, front(w), h('small', { class: 'flip-hint' }, 'Chạm để lật')),
        h('div', { class: 'flash-face flash-back' }, back(w))));
    stage.replaceChildren(card);
    attachGestures(card);
    actions.replaceChildren(h('button', { class: 'btn btn-primary wide', onclick: flip }, 'Lật thẻ'));
    if (mode === 'listen') speak(w.hanzi, w);
  }

  function flip() {
    if (flipped) return;
    flipped = true;
    stage.querySelector('.flash')?.classList.add('flipped');
    stage.querySelector('.flash')?.classList.add('sparkle');
    actions.replaceChildren(
      h('button', { class: 'grade grade-again', onclick: () => answer('again') }, h('strong', null, 'Quên'), h('small', null, '← vuốt trái')),
      h('button', { class: 'grade grade-hard', onclick: () => answer('hard') }, h('strong', null, 'Khó'), h('small', null, 'ôn mai')),
      h('button', { class: 'grade grade-good', onclick: e => { hearts(e.currentTarget); answer('good'); } }, h('strong', null, 'Nhớ'), h('small', null, 'vuốt phải →')));
  }

  function answer(g) {
    const w = queue[i];
    tally[g]++;
    if (!practice && isLearned(w.id) && !requeued.has(w.id)) {
      grade(w.id, g);
      countCard('review');
    } else countCard();
    if (g === 'again' && !requeued.has(w.id)) { requeued.add(w.id); queue.push(w); }
    i++;
    if (i < queue.length) show(); else finish();
  }

  function attachGestures(card) {
    let x0 = null, y0 = 0, dx = 0, swiped = false;
    card.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; dx = 0; swiped = false; });
    card.addEventListener('pointermove', e => {
      if (x0 == null || !flipped) return;
      dx = e.clientX - x0;
      if (Math.abs(dx) > Math.abs(e.clientY - y0)) {
        card.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
        card.dataset.swipe = dx > 40 ? 'good' : dx < -40 ? 'again' : '';
      }
    });
    const end = e => {
      if (x0 == null) return;
      swiped = Math.abs(e.clientX - x0) > 10 || Math.abs(e.clientY - y0) > 10;
      x0 = null;
      card.style.transform = '';
      card.dataset.swipe = '';
      if (flipped && dx > 80) { hearts(card); answer('good'); return; }
      if (flipped && dx < -80) answer('again');
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('click', e => { if (!swiped && !e.target.closest('.speaker')) flip(); });
    card.addEventListener('pointercancel', () => { x0 = null; card.style.transform = ''; });
    card.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      if (flipped && e.key === 'ArrowLeft') answer('again');
      if (flipped && e.key === 'ArrowRight') answer('good');
      if (flipped && e.key === 'ArrowDown') answer('hard');
    });
  }

  function finish() {
    checkBadges();
    const left = dueIds().length;
    root.replaceChildren(praiseScreen({
      icon: '💖', title: praise(),
      text: `Nhớ ${tally.good} · Khó ${tally.hard} · Quên ${tally.again}.` + (left && !practice ? ` Còn ${left} thẻ đến hạn.` : ''),
      actions: [btn('Về Trang chủ', '#/', 'btn btn-primary'),
        left && !practice ? btn('Ôn tiếp', `#/review?extra=1&t=${Date.now()}`) : null,
        btn('Học từ mới', '#/topics', 'btn btn-ghost')],
    }));
  }

  show();
  return ret;
}
