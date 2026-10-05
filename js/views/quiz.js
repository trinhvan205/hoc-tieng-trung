// Bài kiểm tra: 10 câu cuối chủ đề hoặc 30 câu tổng hợp HSK. Mỗi câu 4 lựa chọn.
import { h, shuffle, pick, progressBar, hearts } from '../util.js';
import { S, save, countCard } from '../store.js';
import { data, topicWords, praise } from '../data.js';
import { demote } from '../srs.js';
import { speak, speaker, ttsAvailable } from '../audio.js';
import { checkBadges } from '../badges.js';
import { praiseScreen, btn } from './parts.js';

const TYPES = {
  meaning: { ask: 'Chọn nghĩa đúng', value: w => w.meaningVi },
  hanzi: { ask: 'Chọn chữ Hán đúng', value: w => w.hanzi, zh: true },
  listen: { ask: 'Nghe và chọn chữ đúng', value: w => w.hanzi, zh: true },
  pinyin: { ask: 'Chọn pinyin đúng', value: w => w.pinyin },
};

// Đáp án nhiễu: cùng cấp độ, khác đáp án đúng và khác nhau.
function options(w, type) {
  const val = TYPES[type].value;
  const right = val(w);
  const seen = new Set([right]);
  const pool = shuffle(data().words.filter(x => x.level === w.level && x.id !== w.id));
  const wrong = [];
  for (const x of pool) {
    const v = val(x);
    if (seen.has(v)) continue;
    seen.add(v);
    wrong.push(v);
    if (wrong.length === 3) break;
  }
  return shuffle([right, ...wrong]);
}

function makeQuestions(words, n) {
  const types = Object.keys(TYPES).filter(t => t !== 'listen' || ttsAvailable());
  return shuffle(words).slice(0, n).map(w => {
    const type = pick(types);
    return { w, type, choices: options(w, type), answer: TYPES[type].value(w) };
  });
}

export default function quiz({ params }) {
  const D = data();
  let words, n, key, title, backTo;
  const hsk = params.id.match(/^hsk([12])$/);
  if (hsk) {
    const lv = Number(hsk[1]);
    words = D.words.filter(w => w.level === lv);
    n = 30; key = `hsk${lv}-test`; title = `Tổng hợp HSK ${lv}`; backTo = '#/practice';
  } else {
    const t = D.topicById.get(params.id);
    if (!t) return { title: 'Không thấy bài', back: true, node: h('p', null, 'Bài kiểm tra không tồn tại.') };
    words = topicWords(t); n = 10; key = t.id; title = `Kiểm tra: ${t.titleVi}`; backTo = `#/topic/${t.id}`;
  }

  const qs = makeQuestions(words, n);
  const root = h('div', { class: 'stack-lg quiz' });
  let i = 0;
  let score = 0;
  const wrongs = [];

  function show() {
    const q = qs[i];
    const type = TYPES[q.type];
    const p = S().profile;
    let prompt;
    if (q.type === 'meaning' || q.type === 'pinyin') {
      prompt = h('div', { class: 'quiz-prompt' },
        h('div', { class: 'hanzi hanzi-xl', lang: 'zh-CN' }, q.w.hanzi),
        q.type === 'meaning' && p.showPinyin ? h('div', { class: 'pinyin' }, q.w.pinyin) : null);
    } else if (q.type === 'hanzi') {
      prompt = h('div', { class: 'quiz-prompt' }, h('div', { class: 'meaning meaning-lg' }, q.w.meaningVi));
    } else {
      prompt = h('div', { class: 'quiz-prompt' }, speaker(q.w.hanzi, q.w, { big: true }));
    }
    const next = h('button', { class: 'btn btn-primary wide', hidden: true, onclick: () => { i++; i < qs.length ? show() : finish(); } },
      i === qs.length - 1 ? 'Xem kết quả' : 'Tiếp →');
    const feedback = h('div', { class: 'quiz-feedback', 'aria-live': 'polite' });
    const choiceBtns = q.choices.map(c => h('button', {
      class: `choice${type.zh ? ' choice-zh' : ''}`, lang: type.zh ? 'zh-CN' : null,
      onclick: e => choose(c, e.currentTarget),
    }, c));

    function choose(c, el) {
      if (!next.hidden) return;
      const ok = c === q.answer;
      choiceBtns.forEach(b => {
        b.disabled = true;
        if (b.textContent === q.answer) b.classList.add('right');
      });
      if (!ok) { el.classList.add('wrong'); wrongs.push(q.w); } else { score++; hearts(el); }
      countCard();
      feedback.replaceChildren(
        h('strong', null, ok ? 'Đúng rồi! 💕' : 'Chưa đúng rồi.'), ' ',
        h('span', { lang: 'zh-CN' }, q.w.hanzi), ` ${q.w.pinyin} · ${q.w.meaningVi}`);
      next.hidden = false;
    }

    root.replaceChildren(
      h('div', { class: 'lesson-top' }, h('span', { class: 'muted' }, `Câu ${i + 1}/${qs.length} · ${type.ask}`), progressBar(i, qs.length)),
      h('div', { class: 'card' }, prompt),
      h('div', { class: 'choices' }, choiceBtns),
      feedback, next);
    if (q.type === 'listen') speak(q.w.hanzi, q.w);
  }

  function finish() {
    const passMark = Math.ceil(qs.length * 0.8);
    const star = score >= passMark;
    const scaled = hsk ? score : Math.round((score / qs.length) * 10);
    const saved = (S().topics[key] ||= {});
    saved.bestScore = Math.max(saved.bestScore || 0, scaled);
    wrongs.forEach(w => demote(w.id));
    save();
    checkBadges();
    const uniqueWrong = [...new Map(wrongs.map(w => [w.id, w])).values()];
    root.replaceChildren(
      praiseScreen({
        icon: star ? '⭐' : '🌱',
        title: `${score}/${qs.length} câu đúng`,
        text: star ? `${praise()} ${hsk ? '' : 'Chủ đề này được gắn sao rồi.'}` : `Gần được rồi, cần ${passMark} câu để được sao. Ôn lại rồi thử lần nữa nha.`,
        actions: [
          uniqueWrong.length ? btn('Ôn lại các từ này', `#/review?ids=${uniqueWrong.map(w => w.id).join(',')}`, 'btn btn-primary') : null,
          btn('Làm lại bài', `#/quiz/${params.id}?t=${Date.now()}`),
          btn(hsk ? 'Về Luyện tập' : 'Về chủ đề', backTo, 'btn btn-ghost'),
        ],
      }),
      uniqueWrong.length ? h('section', { class: 'card list-card' },
        h('h3', { class: 'section-title' }, 'Các từ làm sai'),
        uniqueWrong.map(w => h('div', { class: 'word-row' },
          h('div', { class: 'row-main' },
            h('span', { class: 'hanzi hanzi-md', lang: 'zh-CN' }, w.hanzi),
            h('span', { class: 'row-text' }, h('span', { class: 'pinyin' }, w.pinyin), h('span', { class: 'row-meaning' }, w.meaningVi))),
          speaker(w.hanzi, w)))) : null);
  }

  show();
  return { title, tab: hsk ? 'practice' : 'topics', back: backTo, node: root };
}
