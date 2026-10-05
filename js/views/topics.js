// Danh sách chủ đề theo nhóm, kèm ô tìm kiếm (chữ Hán, pinyin không dấu, nghĩa tiếng Việt).
import { h, fold, progressBar } from '../util.js';
import { data, topicInfo } from '../data.js';
import { wordRow } from './parts.js';

function topicCard(t) {
  const info = topicInfo(t);
  return h('a', { class: `topic-card${info.locked ? ' locked' : ''}`, href: `#/topic/${t.id}` },
    h('span', { class: 'topic-icon' }, t.icon),
    h('span', { class: 'topic-body' },
      h('span', { class: 'topic-title' }, t.titleVi, info.star ? h('span', { class: 'star' }, ' ⭐') : null),
      h('span', { class: 'topic-sub' }, h('span', { lang: 'zh-CN' }, t.titleZh), ` · ${info.learned}/${info.total} từ`),
      progressBar(info.learned, info.total)),
    h('span', { class: 'topic-state' }, info.locked ? '🔒' : info.done ? '✅' : '›'));
}

function search(q) {
  const f = fold(q).replace(/\s+/g, '');
  if (!f && !q.trim()) return [];
  return data().words.filter(w =>
    w.hanzi.includes(q.trim())
    || fold(w.pinyinPlain).replace(/\s+/g, '').includes(f)
    || fold(w.meaningVi).includes(fold(q))
    || fold(w.hanViet).includes(fold(q))).slice(0, 40);
}

export default function topics({ query }) {
  const groups = [
    { title: '💕 Đặc biệt', items: data().topics.filter(t => t.level === 'love') },
    { title: 'HSK 1', items: data().topics.filter(t => t.level === 1) },
    { title: 'HSK 2', items: data().topics.filter(t => t.level === 2) },
    { title: 'HSK 3', items: data().topics.filter(t => t.level === 3) },
  ];
  const list = h('div', { class: 'stack-lg' }, groups.map(g =>
    h('section', null, h('h3', { class: 'section-title' }, g.title), h('div', { class: 'stack' }, g.items.map(topicCard)))));
  const results = h('div', { class: 'stack' });

  const input = h('input', {
    type: 'search', class: 'search', placeholder: 'Tìm: 爱, ai, yêu…', value: query.q || '',
    'aria-label': 'Tìm từ', enterkeyhint: 'search',
  });
  const update = () => {
    const q = input.value;
    if (!q.trim()) { results.replaceChildren(); list.hidden = false; return; }
    const found = search(q);
    list.hidden = true;
    results.replaceChildren(found.length
      ? h('div', { class: 'card list-card' }, found.map(w => wordRow(w, { href: `#/topic/${w.topicId}` })))
      : h('p', { class: 'muted center' }, 'Chưa tìm thấy từ nào.'));
  };
  input.addEventListener('input', update);
  update();

  return { title: 'Bài học', tab: 'topics', node: h('div', { class: 'stack-lg' }, input, results, list) };
}
