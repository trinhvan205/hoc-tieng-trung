// Trang chủ: lời chào theo giờ, vòng mục tiêu ngày, chuỗi ngày, thẻ đến hạn, từ của ngày.
import { h, ring, today } from '../util.js';
import { S, day, streak } from '../store.js';
import { data, greeting, nextTopic, topicInfo } from '../data.js';
import { dueIds } from '../srs.js';
import { wordDetail } from './parts.js';

function wordOfDay() {
  const words = data().words;
  const seed = today().split('-').join('') * 1;
  return words[(seed * 7919) % words.length];
}

export default function home() {
  const p = S().profile;
  const d = day();
  const goal = p.dailyGoalCards || 20;
  const pct = Math.max(d.cards / goal, d.minutes / 10);
  const due = dueIds().length;
  const st = streak();
  const next = nextTopic();

  const reviewBtn = h('a', { class: `btn ${due ? 'btn-primary' : ''}`, href: '#/review' },
    due ? `Ôn ngay · ${due} thẻ` : 'Ôn flashcard');
  const learnBtn = next
    ? h('a', { class: `btn ${due ? '' : 'btn-primary'}`, href: `#/learn/${next.id}` },
      `${topicInfo(next).learned ? 'Học tiếp' : 'Học mới'}: ${next.icon} ${next.titleVi}`)
    : h('a', { class: 'btn', href: '#/practice' }, 'Đã học hết, vào Luyện tập');

  const w = wordOfDay();
  const node = h('div', { class: 'stack-lg' },
    h('section', { class: 'hello' },
      h('p', { class: 'hello-text' }, greeting())),
    h('section', { class: 'card today' },
      ring(pct, pct >= 1 ? 'Xong! 🎉' : `${d.cards}/${goal}`, pct >= 1 ? 'mục tiêu hôm nay' : 'thẻ hôm nay'),
      h('div', { class: 'today-stats' },
        h('div', { class: 'stat' }, h('strong', null, `🔥 ${st}`), h('small', null, 'ngày liên tiếp')),
        h('div', { class: 'stat' }, h('strong', null, `📬 ${due}`), h('small', null, 'thẻ đến hạn')),
        h('div', { class: 'stat' }, h('strong', null, `⏱️ ${Math.round(d.minutes)}`), h('small', null, 'phút hôm nay')))),
    h('section', { class: 'stack' }, due ? [reviewBtn, learnBtn] : [learnBtn, reviewBtn]),
    h('section', { class: 'card' },
      h('h3', { class: 'section-title' }, '🌟 Từ của ngày'),
      wordDetail(w)));
  return { title: 'Trang chủ', tab: 'home', node };
}
