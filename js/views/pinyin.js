// Pinyin: bài nhập môn 4 thanh + thanh nhẹ, bảng thanh mẫu × vận mẫu chạm để nghe, ghi chú so với tiếng Việt.
import { h } from '../util.js';
import { speak, ttsAvailable } from '../audio.js';
import { SYLLABLES, INITIALS, FINAL_NOTES, TONES, syllablesOf, toneSvg } from '../pinyin-data.js';

export default function pinyin() {
  const canHear = ttsAvailable();

  const tones = h('section', { class: 'card stack' },
    h('h3', { class: 'section-title' }, '🎵 Bốn thanh điệu và thanh nhẹ'),
    h('p', { class: 'muted' }, 'Cùng một âm “ma” nhưng đổi thanh là đổi nghĩa. Chạm từng ô để nghe.'),
    h('div', { class: 'tone-grid-list' }, TONES.map(t => {
      const b = h('button', { class: 'tone-card', onclick: () => speak(t.ex[1]) },
        h('span', { class: 'tone-graph', html: toneSvg(t.pts) }),
        h('span', { class: 'tone-body' },
          h('strong', null, t.name),
          h('span', { class: 'pinyin pinyin-lg' }, `${t.ex[0]} `, h('span', { lang: 'zh-CN', class: 'hanzi' }, t.ex[1]), ` · ${t.ex[2]}`),
          h('small', { class: 'muted' }, t.vi)));
      return b;
    })),
    h('a', { class: 'btn btn-primary', href: '#/tones' }, '🎧 Chơi game nghe thanh'));

  const note = h('p', { class: 'initial-note' });
  const grid = h('div', { class: 'syl-grid' });
  const chips = h('div', { class: 'chip-wrap' });
  let current = 'b';
  function choose(ini) {
    current = ini;
    chips.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.i === ini));
    note.textContent = `${ini === '∅' ? 'Không thanh mẫu' : ini}: ${INITIALS.find(x => x.i === ini).note}`;
    grid.replaceChildren(...syllablesOf(ini).map(s => h('button', {
      class: 'syl', onclick: () => speak(SYLLABLES[s]), 'aria-label': `Nghe ${s}`,
    }, h('span', { class: 'syl-py' }, s), h('span', { class: 'syl-zh', lang: 'zh-CN' }, SYLLABLES[s]))));
  }
  chips.append(...INITIALS.map(x => h('button', { class: 'chip', 'data-i': x.i, onclick: () => choose(x.i) }, x.i)));
  choose(current);

  const table = h('section', { class: 'card stack' },
    h('h3', { class: 'section-title' }, '🔤 Bảng pinyin'),
    h('p', { class: 'muted' }, 'Chọn thanh mẫu (phụ âm đầu), rồi chạm vào âm tiết để nghe. Chữ nhỏ bên dưới là một chữ Hán có âm đó.'),
    chips, note, grid);

  const finals = h('section', { class: 'card stack' },
    h('h3', { class: 'section-title' }, '📝 Vận mẫu cần chú ý'),
    h('dl', { class: 'notes' }, FINAL_NOTES.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)])));

  return {
    title: 'Pinyin & phát âm', tab: 'practice', back: '#/practice',
    node: h('div', { class: 'stack-lg' },
      canHear ? null : h('div', { class: 'card notice' }, 'Máy này chưa có giọng đọc tiếng Trung nên chưa nghe được. Trên iPhone vào Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói để tải giọng Trung Quốc.'),
      tones, table, finals),
  };
}
