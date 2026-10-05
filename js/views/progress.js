// Tiến độ: số từ theo HSK, chuỗi ngày, lịch 30 ngày, huy hiệu.
import { h, today, addDays, progressBar } from '../util.js';
import { S, streak } from '../store.js';
import { stats, BADGES } from '../data.js';
import { showBadge } from '../badges.js';
import { levelLabel } from './parts.js';

export default function progress() {
  const s = stats();
  const st = streak();
  const days = S().days;
  const goal = S().profile.dailyGoalCards || 20;

  const levels = h('section', { class: 'card stack' },
    h('h3', { class: 'section-title' }, '📚 Từ vựng'),
    [1, 2, 3, 0].filter(lv => s.byLevel[lv]).map(lv => {
      const x = s.byLevel[lv];
      return h('div', { class: 'level-row' },
        h('div', { class: 'level-head' }, h('strong', null, lv === 0 ? 'Tình yêu (ngoài HSK)' : levelLabel(lv)),
          h('span', { class: 'muted' }, `${x.learned} đã học · ${x.mastered} đã thuộc · ${x.total} tổng`)),
        progressBar(x.learned, x.total));
    }));

  // Lịch 30 ngày gần nhất, đậm hơn khi học nhiều hơn.
  const t = today();
  const cells = [];
  for (let k = 29; k >= 0; k--) {
    const date = addDays(t, -k);
    const cards = days[date]?.cards || 0;
    const lvl = cards === 0 ? 0 : cards < goal / 2 ? 1 : cards < goal ? 2 : 3;
    const [, m, d] = date.split('-');
    cells.push(h('div', { class: `cal-cell lv${lvl}${date === t ? ' today' : ''}`, title: `${d}/${m}: ${cards} thẻ` }, Number(d)));
  }
  const totalDays = Object.values(days).filter(d => d.cards > 0).length;
  const calendar = h('section', { class: 'card stack' },
    h('h3', { class: 'section-title' }, '🗓️ 30 ngày gần đây'),
    h('div', { class: 'today-stats' },
      h('div', { class: 'stat' }, h('strong', null, `🔥 ${st}`), h('small', null, 'ngày liên tiếp')),
      h('div', { class: 'stat' }, h('strong', null, `📅 ${totalDays}`), h('small', null, 'ngày đã học'))),
    h('div', { class: 'calendar' }, cells),
    h('div', { class: 'cal-legend muted' }, h('span', { class: 'cal-cell lv0' }), 'chưa học',
      h('span', { class: 'cal-cell lv1' }), h('span', { class: 'cal-cell lv2' }), h('span', { class: 'cal-cell lv3' }), 'đạt mục tiêu'));

  const earned = S().badges;
  const badges = h('section', { class: 'card stack' },
    h('h3', { class: 'section-title' }, '🏅 Huy hiệu'),
    h('div', { class: 'badges' }, BADGES.map(b => {
      const got = earned.includes(b.id);
      return h('button', {
        class: `badge${got ? ' got' : ''}`, 'aria-label': `${b.title}${got ? '' : ' (chưa đạt)'}`,
        onclick: () => (got ? showBadge(b) : null),
      }, h('span', { class: 'badge-icon' }, got ? b.icon : '🔒'), h('small', null, b.title));
    })),
    h('p', { class: 'muted small' }, earned.length ? 'Chạm vào huy hiệu để xem lời nhắn.' : 'Học đủ mốc sẽ nhận huy hiệu kèm lời nhắn.'));

  return { title: 'Tiến độ', tab: 'progress', node: h('div', { class: 'stack-lg' }, levels, calendar, badges) };
}

