// Luyện viết với Hanzi Writer: xem mẫu → tô theo nét mờ → tự viết trên ô 田.
// Dữ liệu nét lấy từ data/strokes/<chữ>.json (tải sẵn để viết được khi mất mạng).
import { h, hearts } from './util.js';
import { speaker } from './audio.js';

const GRID = `<svg class="write-grid" viewBox="0 0 100 100" aria-hidden="true">
  <rect x="1" y="1" width="98" height="98" rx="3"/>
  <line x1="50" y1="1" x2="50" y2="99"/><line x1="1" y1="50" x2="99" y2="50"/>
  <line x1="1" y1="1" x2="99" y2="99" class="diag"/><line x1="99" y1="1" x2="1" y2="99" class="diag"/>
</svg>`;

const STEPS = ['1. Xem mẫu', '2. Tô theo nét', '3. Tự viết'];

function loader(char, onLoad, onError) {
  fetch(`data/strokes/${char}.json`).then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(onLoad).catch(onError);
}

const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Trả về { node, destroy }. onWordDone được gọi khi viết xong chữ cuối cùng của từ.
export function writerPanel(word, { onWordDone } = {}) {
  const chars = [...word.hanzi].filter(c => /\p{Script=Han}/u.test(c));
  let ci = 0;
  let step = 0;
  let writer = null;

  const stepTabs = h('div', { class: 'seg' });
  const msg = h('p', { class: 'write-msg' });
  const box = h('div', { class: 'write-box' });
  const charNav = h('div', { class: 'char-nav' });
  const controls = h('div', { class: 'btn-row' });

  const node = h('div', { class: 'writer' },
    h('div', { class: 'write-info' },
      h('span', { class: 'pinyin pinyin-lg' }, word.pinyin),
      h('span', { class: 'meaning' }, word.meaningVi),
      speaker(word.hanzi, word)),
    charNav, stepTabs, box, msg, controls);

  if (!window.HanziWriter) {
    msg.textContent = 'Chưa tải được công cụ luyện viết. Hãy mở lại trang khi có mạng một lần.';
    return { node, destroy() {} };
  }

  function drawCharNav() {
    charNav.replaceChildren(...(chars.length > 1 ? chars.map((c, k) =>
      h('button', { class: `char-chip${k === ci ? ' on' : ''}`, lang: 'zh-CN', onclick: () => { ci = k; mount(); } }, c)) : []));
  }

  function mount() {
    writer?.cancelQuiz?.();
    drawCharNav();
    const size = Math.min(320, Math.max(220, (node.isConnected ? node.clientWidth : innerWidth - 64) - 8));
    box.style.width = box.style.height = `${size}px`;
    box.innerHTML = GRID;
    const host = h('div', { class: 'write-host' });
    box.append(host);
    writer = HanziWriter.create(host, chars[ci], {
      width: size, height: size, padding: 12,
      showCharacter: false, showOutline: true,
      strokeColor: cssVar('--ink') || '#2b2220',
      outlineColor: cssVar('--outline') || '#e8dcd3',
      drawingColor: cssVar('--accent') || '#c8473d',
      highlightColor: cssVar('--peach') || '#f2a7a0',
      drawingWidth: 22, strokeAnimationSpeed: 1, delayBetweenStrokes: 250,
      charDataLoader: loader,
      onLoadCharDataError: () => { msg.textContent = `Chưa có dữ liệu nét cho chữ ${chars[ci]}.`; },
    });
    setStep(0);
  }

  function setStep(n) {
    step = n;
    writer.cancelQuiz();
    stepTabs.replaceChildren(...STEPS.map((label, k) =>
      h('button', { class: k === step ? 'on' : '', onclick: () => setStep(k) }, label)));
    writer.hideCharacter();
    if (n === 0) {
      writer.showOutline();
      msg.textContent = 'Xem thứ tự các nét nhé.';
      writer.animateCharacter({ onComplete: res => {
        if (step === 0 && !res?.canceled) msg.textContent = 'Xong rồi, giờ thử tô theo nét mờ nào.';
      } });
      controls.replaceChildren(
        h('button', { class: 'btn', onclick: () => setStep(0) }, '↻ Xem lại'),
        h('button', { class: 'btn btn-primary', onclick: () => setStep(1) }, 'Tô theo nét →'));
      return;
    }
    if (n === 1) writer.showOutline(); else writer.hideOutline();
    msg.textContent = n === 1 ? 'Dùng ngón tay tô theo nét mờ. Sai 3 lần sẽ có gợi ý.' : 'Giờ tự viết, không có nét mờ nữa. Sai 3 lần sẽ có gợi ý.';
    controls.replaceChildren(
      h('button', { class: 'btn', onclick: () => setStep(0) }, '👀 Xem mẫu'),
      h('button', { class: 'btn', onclick: () => setStep(n) }, '↻ Viết lại'));
    writer.quiz({
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      onComplete: summary => {
        hearts(box);
        if (n === 1) {
          msg.textContent = 'Đẹp lắm! Giờ tự viết nhé.';
          setTimeout(() => step === 1 && setStep(2), 900);
          return;
        }
        const perfect = summary.totalMistakes === 0;
        msg.textContent = perfect ? 'Hoàn hảo, không sai nét nào! 💕' : `Viết xong rồi! Có ${summary.totalMistakes} lần sai nét, lần sau sẽ tốt hơn.`;
        const last = ci === chars.length - 1;
        controls.replaceChildren(
          h('button', { class: 'btn', onclick: () => setStep(2) }, '↻ Viết lại'),
          last
            ? h('button', { class: 'btn btn-primary', onclick: () => onWordDone?.() }, onWordDone ? 'Xong từ này →' : 'Xong')
            : h('button', { class: 'btn btn-primary', onclick: () => { ci++; mount(); } }, `Chữ tiếp: ${chars[ci + 1]} →`));
      },
    });
  }

  // Vẽ sau khi node đã gắn vào trang để đo được chiều rộng.
  setTimeout(mount, 0);
  return { node, destroy() { writer?.cancelQuiz?.(); } };
}
