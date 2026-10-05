// Mảnh giao diện dùng lại giữa các màn hình.
import { h, confetti, hearts, pick } from '../util.js';
import { data, fill } from '../data.js';
import { speaker } from '../audio.js';
import { isLearned, isMastered } from '../srs.js';
import { S } from '../store.js';
import { photoOfDay } from '../photos.js';

export const levelLabel = lv => (lv === 0 ? 'Ngoài HSK' : `HSK ${lv}`);

// Thẻ từ đầy đủ: chữ Hán lớn, pinyin, nghĩa, Hán Việt, loại từ, câu ví dụ.
export function wordDetail(w, { pinyin = true } = {}) {
  return h('div', { class: 'word-detail' },
    h('div', { class: 'word-head' },
      h('div', { class: 'hanzi hanzi-xl', lang: 'zh-CN' }, w.hanzi),
      speaker(w.hanzi, w, { big: true })),
    pinyin ? h('div', { class: 'pinyin pinyin-lg' }, w.pinyin) : null,
    h('div', { class: 'meaning' }, w.meaningVi),
    h('div', { class: 'tags' },
      h('span', { class: 'tag tag-peach' }, `Hán Việt: ${w.hanViet}`),
      h('span', { class: 'tag' }, w.pos),
      h('span', { class: 'tag' }, levelLabel(w.level))),
    exampleBox(w));
}

export function exampleBox(w) {
  if (!w.example?.zh) return null;
  return h('div', { class: 'example' },
    h('div', { class: 'example-zh' },
      h('span', { lang: 'zh-CN' }, w.example.zh),
      speaker(w.example.zh, null, { label: 'Nghe câu ví dụ' })),
    S().profile.showPinyin ? h('div', { class: 'pinyin' }, w.example.pinyin) : null,
    h('div', { class: 'muted' }, w.example.vi));
}

export function wordRow(w, { href, extra } = {}) {
  const status = isMastered(w.id) ? h('span', { class: 'dot dot-master', title: 'Đã thuộc' }, '★')
    : isLearned(w.id) ? h('span', { class: 'dot dot-learned', title: 'Đã học' }, '✓') : null;
  const body = h('div', { class: 'row-main' },
    h('span', { class: 'hanzi hanzi-md', lang: 'zh-CN' }, w.hanzi),
    h('span', { class: 'row-text' },
      h('span', { class: 'pinyin' }, w.pinyin),
      h('span', { class: 'row-meaning' }, w.meaningVi)));
  return h('div', { class: 'word-row' },
    href ? h('a', { href, class: 'row-link' }, body) : body,
    status, extra, speaker(w.hanzi, w));
}

export function praiseScreen({ icon = '🎉', title, text, actions = [] }) {
  const photo = photoOfDay(Math.floor(Math.random() * 6));
  setTimeout(() => confetti(), 120);
  return h('div', { class: 'card done-card' },
    photo ? h('div', { class: 'done-photo' }, h('img', { src: photo, alt: 'Ảnh của hai bạn', style: { width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%' } }), h('span', null, icon))
      : h('div', { class: 'done-icon' }, icon),
    h('h2', null, title),
    text ? h('p', null, text) : null,
    h('div', { class: 'stack' }, actions));
}

export const btn = (label, href, cls = 'btn') => h('a', { class: cls, href }, label);

// Bé gấu trúc cổ vũ: chạm vào để nghe câu khác, kèm tim bay.
export function mascot() {
  const lines = (data().personal.mascot || ['Cố lên nha! 加油！']).map(fill);
  let last = '';
  const say = () => { let t; do { t = pick(lines); } while (t === last && lines.length > 1); last = t; return t; };
  const bubble = h('div', { class: 'mascot-bubble', 'aria-live': 'polite' }, say());
  const face = h('button', { class: 'mascot-face', 'aria-label': 'Bé gấu trúc' }, '🐼');
  face.addEventListener('click', () => {
    bubble.textContent = say();
    face.classList.remove('boing');
    void face.offsetWidth;
    face.classList.add('boing');
    hearts(face);
  });
  return h('div', { class: 'mascot' }, face, bubble);
}
