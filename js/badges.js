// Kiểm tra mốc huy hiệu sau mỗi buổi học và chúc mừng khi đạt mốc mới.
import { S, save, streak } from './store.js';
import { BADGES, badgeMessage, stats } from './data.js';
import { h, sheet, hearts } from './util.js';

export function checkBadges() {
  const s = { ...stats(), streak: streak() };
  const earned = S().badges;
  const fresh = BADGES.filter(b => !earned.includes(b.id) && b.test(s));
  if (!fresh.length) return;
  earned.push(...fresh.map(b => b.id));
  save();
  showBadge(fresh[0]);
}

export function showBadge(b) {
  const node = h('div', { class: 'badge-sheet' },
    h('div', { class: 'badge-big' }, b.icon),
    h('h2', null, `Huy hiệu: ${b.title}`),
    h('p', null, badgeMessage(b.id)));
  sheet(node);
  hearts(node);
}
