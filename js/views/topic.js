// Chi tiết chủ đề: danh sách từ và 3 nút lớn (Học từ mới, Luyện viết, Làm bài kiểm tra).
import { h, progressBar } from '../util.js';
import { data, topicInfo, topicWords } from '../data.js';
import { wordRow } from './parts.js';

export default function topic({ params }) {
  const t = data().topicById.get(params.id);
  if (!t) return { title: 'Không thấy chủ đề', back: '#/topics', node: h('p', null, 'Chủ đề không tồn tại.') };
  const info = topicInfo(t);
  const words = topicWords(t);

  const actions = info.locked
    ? h('div', { class: 'card notice' }, '🔒 Học xong chủ đề trước thì chủ đề này sẽ mở. Muốn mở hết thì vào Cài đặt nhé.')
    : h('div', { class: 'stack' },
      h('a', { class: 'btn btn-primary', href: `#/learn/${t.id}` },
        info.done ? '📖 Xem lại các từ' : info.learned ? `📖 Học tiếp (${info.total - info.learned} từ mới)` : '📖 Học từ mới'),
      h('div', { class: 'btn-row' },
        h('a', { class: 'btn', href: `#/write/${t.id}` }, '✍️ Luyện viết'),
        h('a', { class: 'btn', href: `#/quiz/${t.id}` }, '📝 Kiểm tra')));

  const node = h('div', { class: 'stack-lg' },
    h('section', { class: 'card topic-hero' },
      h('div', { class: 'topic-hero-icon' }, t.icon),
      h('div', null,
        h('h2', null, t.titleVi, info.star ? ' ⭐' : ''),
        h('p', { class: 'muted' }, h('span', { lang: 'zh-CN' }, t.titleZh), ` · ${info.learned}/${info.total} từ đã học`,
          info.bestScore != null ? ` · điểm cao nhất ${info.bestScore}/10` : ''),
        progressBar(info.learned, info.total))),
    actions,
    h('section', { class: 'card list-card' },
      words.map(w => wordRow(w, {
        extra: info.locked ? null : h('a', { class: 'mini-btn', href: `#/write/${t.id}/${w.id}`, 'aria-label': `Viết ${w.hanzi}` }, '✍️'),
      }))));
  return { title: t.titleVi, tab: 'topics', back: '#/topics', node };
}
