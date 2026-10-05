// Luyện viết: chọn chủ đề, rồi viết lần lượt từng từ (từng chữ) trong chủ đề.
import { h } from '../util.js';
import { countCard } from '../store.js';
import { data, topicWords, topicInfo, praise } from '../data.js';
import { writerPanel } from '../writer.js';
import { praiseScreen, btn } from './parts.js';

function picker() {
  const topics = data().topics.filter(t => !topicInfo(t).locked);
  return {
    title: 'Luyện viết', tab: 'practice', back: '#/practice',
    node: h('div', { class: 'stack' },
      h('p', { class: 'muted' }, 'Chọn chủ đề để luyện viết từng chữ theo thứ tự nét.'),
      topics.map(t => {
        const info = topicInfo(t);
        return h('a', { class: 'topic-card', href: `#/write/${t.id}` },
          h('span', { class: 'topic-icon' }, t.icon),
          h('span', { class: 'topic-body' },
            h('span', { class: 'topic-title' }, t.titleVi),
            h('span', { class: 'topic-sub' }, `${info.learned}/${info.total} từ đã học`)),
          h('span', { class: 'topic-state' }, '›'));
      })),
  };
}

export default function write({ params }) {
  if (!params.topic) return picker();
  const t = data().topicById.get(params.topic);
  if (!t) return picker();
  const words = topicWords(t);
  let i = Math.max(0, words.findIndex(w => w.id === params.word));
  let panel = null;

  const chips = h('div', { class: 'chip-scroll' });
  const holder = h('div', { class: 'card' });
  const nav = h('div', { class: 'btn-row' });
  const root = h('div', { class: 'stack' }, chips, holder, nav);

  function show() {
    panel?.destroy();
    const w = words[i];
    chips.replaceChildren(...words.map((x, k) => h('button', {
      class: `char-chip${k === i ? ' on' : ''}`, lang: 'zh-CN', onclick: () => { i = k; show(); },
    }, x.hanzi)));
    chips.children[i]?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
    panel = writerPanel(w, { onWordDone: () => { countCard(); nextWord(); } });
    holder.replaceChildren(panel.node);
    nav.replaceChildren(
      h('button', { class: 'btn', disabled: i === 0 ? true : null, onclick: () => { i--; show(); } }, '← Từ trước'),
      h('button', { class: 'btn', onclick: nextWord }, i === words.length - 1 ? 'Kết thúc' : 'Từ sau →'));
  }

  function nextWord() {
    if (i < words.length - 1) { i++; show(); return; }
    panel?.destroy();
    root.replaceChildren(praiseScreen({
      icon: '✍️', title: praise(), text: `Em đã luyện viết hết các từ của chủ đề “${t.titleVi}”.`,
      actions: [btn('📝 Làm bài kiểm tra', `#/quiz/${t.id}`, 'btn btn-primary'), btn('Về chủ đề', `#/topic/${t.id}`, 'btn btn-ghost')],
    }));
  }

  show();
  return { title: `Viết: ${t.titleVi}`, tab: 'practice', back: `#/topic/${t.id}`, node: root, leave: () => panel?.destroy() };
}
