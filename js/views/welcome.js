// Màn chào mừng lần đầu: lời chào có tên, 3 trang giới thiệu, chọn mục tiêu ngày.
import { h } from '../util.js';
import { S, save } from '../store.js';
import { data, fill } from '../data.js';
import { go } from '../router.js';

export default function welcome() {
  const slides = data().personal.welcome;
  let i = 0;
  const box = h('div', { class: 'welcome' });

  const goals = [
    { cards: 10, label: 'Nhẹ nhàng', sub: '10 thẻ · khoảng 5 phút' },
    { cards: 20, label: 'Vừa phải', sub: '20 thẻ · khoảng 10 phút' },
    { cards: 30, label: 'Chăm chỉ', sub: '30 thẻ · khoảng 15 phút' },
  ];

  function draw() {
    const dots = h('div', { class: 'dots' }, [...slides, 'goal'].map((_, k) => h('span', { class: k === i ? 'on' : '' })));
    if (i < slides.length) {
      const s = slides[i];
      box.replaceChildren(
        h('div', { class: 'welcome-icon' }, s.icon),
        h('h2', null, fill(s.title)),
        h('p', null, fill(s.text)),
        dots,
        h('button', { class: 'btn btn-primary', onclick: () => { i++; draw(); } }, 'Tiếp'));
      return;
    }
    let chosen = S().profile.dailyGoalCards || 20;
    const options = h('div', { class: 'stack' }, goals.map(g => {
      const b = h('button', { class: `choice${g.cards === chosen ? ' selected' : ''}`, onclick: () => {
        chosen = g.cards;
        options.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
        b.classList.add('selected');
      } }, h('strong', null, g.label), h('small', null, g.sub));
      return b;
    }));
    box.replaceChildren(
      h('div', { class: 'welcome-icon' }, '🎯'),
      h('h2', null, 'Mục tiêu mỗi ngày'),
      h('p', null, 'Chọn mức em thấy thoải mái, sau này đổi trong Cài đặt được.'),
      options, dots,
      h('button', { class: 'btn btn-primary', onclick: () => {
        const p = S().profile;
        p.dailyGoalCards = chosen;
        p.onboarded = true;
        save();
        go('/');
      } }, 'Bắt đầu thôi 💕'));
  }
  draw();
  return { title: 'Chào mừng', node: box, hideTabs: true };
}
