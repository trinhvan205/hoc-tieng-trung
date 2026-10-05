// Mini-game nghe thanh: nghe một chữ, chọn thanh 1–4. 10 lượt mỗi ván.
import { h, shuffle, hearts, progressBar } from '../util.js';
import { countCard } from '../store.js';
import { data, praise } from '../data.js';
import { speak, ttsAvailable } from '../audio.js';
import { TONES, toneSvg } from '../pinyin-data.js';
import { praiseScreen, btn } from './parts.js';

const ROUNDS = 10;

export default function tones() {
  const ret = { title: 'Game nghe thanh', tab: 'practice', back: '#/practice' };
  if (!ttsAvailable()) {
    ret.node = h('div', { class: 'card notice' }, 'Máy này chưa có giọng đọc tiếng Trung nên chưa chơi được game nghe.');
    return ret;
  }
  // Chữ đơn có thanh 1–4 rõ ràng trong bộ từ vựng.
  const pool = data().words.filter(w => w.hanzi.length === 1 && /[1-4]$/.test(w.pinyinPlain));
  const items = shuffle(pool).slice(0, ROUNDS);
  let i = 0;
  let score = 0;
  const root = h('div', { class: 'stack-lg' });

  function show() {
    const w = items[i];
    const tone = Number(w.pinyinPlain.slice(-1));
    let answered = false;
    const feedback = h('div', { class: 'quiz-feedback', 'aria-live': 'polite' });
    const next = h('button', { class: 'btn btn-primary wide', hidden: true, onclick: () => { i++; i < items.length ? show() : finish(); } },
      i === items.length - 1 ? 'Xem kết quả' : 'Tiếp →');
    const buttons = TONES.filter(t => t.n > 0).map(t => h('button', {
      class: 'choice tone-choice', onclick: e => {
        if (answered) return;
        answered = true;
        const ok = t.n === tone;
        buttons.forEach((b, k) => { b.disabled = true; if (k + 1 === tone) b.classList.add('right'); });
        if (ok) { score++; hearts(e.currentTarget); } else e.currentTarget.classList.add('wrong');
        countCard();
        feedback.replaceChildren(h('strong', null, ok ? 'Chuẩn luôn! 💕' : `Đây là thanh ${tone}.`), ' ',
          h('span', { lang: 'zh-CN' }, w.hanzi), ` ${w.pinyin} · ${w.meaningVi}`);
        next.hidden = false;
      },
    }, h('span', { html: toneSvg(t.pts, 'tone-svg-sm') }), h('span', null, `Thanh ${t.n}`)));

    root.replaceChildren(
      h('div', { class: 'lesson-top' }, h('span', { class: 'muted' }, `Lượt ${i + 1}/${items.length}`), progressBar(i, items.length)),
      h('div', { class: 'card quiz-prompt' },
        h('button', { class: 'speaker speaker-big', 'aria-label': 'Nghe lại', onclick: () => speak(w.hanzi, w) }, '🔊'),
        h('small', { class: 'muted' }, 'Nghe rồi chọn thanh điệu')),
      h('div', { class: 'choices choices-2' }, buttons),
      feedback, next);
    speak(w.hanzi, w);
  }

  function finish() {
    root.replaceChildren(praiseScreen({
      icon: score >= 8 ? '🎧' : '🌱', title: `${score}/${items.length} đúng`,
      text: score >= 8 ? praise() : 'Tai đang quen dần rồi đó, chơi thêm ván nữa nha.',
      actions: [btn('Chơi ván mới', `#/tones?t=${Date.now()}`, 'btn btn-primary'), btn('Ôn lại 4 thanh', '#/pinyin'), btn('Về Luyện tập', '#/practice', 'btn btn-ghost')],
    }));
  }

  root.append(praiseScreen({
    icon: '🎧', title: 'Nghe và đoán thanh', text: `${ROUNDS} lượt, mỗi lượt nghe một chữ rồi chọn thanh 1, 2, 3 hoặc 4.`,
    actions: [h('button', { class: 'btn btn-primary', onclick: show }, 'Bắt đầu')],
  }));
  ret.node = root;
  return ret;
}
