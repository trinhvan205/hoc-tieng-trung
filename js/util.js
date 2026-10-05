// Tiện ích dùng chung: tạo phần tử, ngày tháng, xáo trộn, thông báo.

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const pad = n => String(n).padStart(2, '0');
export const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => isoDate(new Date());
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return isoDate(new Date(y, m - 1, d + n));
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Bỏ dấu tiếng Việt và dấu thanh pinyin để tìm kiếm: "Yêu" -> "yeu", "ài" -> "ai".
export function fold(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[0-9]/g, '').trim();
}

let toastTimer;
export function toast(msg, ms = 2400) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// Hiệu ứng tắt khi người dùng tắt trong Cài đặt hoặc máy bật "Giảm chuyển động".
export const fxOff = () => document.documentElement.classList.contains('no-fx')
  || matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mưa tim và lấp lánh rơi từ trên xuống khi học xong một buổi.
export function confetti(count = 26) {
  if (fxOff()) return;
  const items = ['💖', '💕', '✨', '🌸', '💗', '⭐', '🎀'];
  for (let i = 0; i < count; i++) {
    const s = h('span', { class: 'confetti-fx' }, pick(items));
    s.style.left = `${Math.random() * 100}vw`;
    s.style.fontSize = `${14 + Math.random() * 16}px`;
    s.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    s.style.animationDelay = `${Math.random() * 400}ms`;
    s.style.setProperty('--drift', `${Math.random() * 80 - 40}px`);
    document.body.append(s);
    setTimeout(() => s.remove(), 3800);
  }
}

// Mấy trái tim nhỏ bay lên khi trả lời đúng.
export function hearts(anchor) {
  if (fxOff()) return;
  const r = anchor?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  for (let i = 0; i < 6; i++) {
    const s = h('span', { class: 'heart-fx' }, pick(['💕', '💗', '✨', '💖']));
    s.style.left = `${r.left + r.width / 2 + (Math.random() * 80 - 40)}px`;
    s.style.top = `${r.top + r.height / 2}px`;
    s.style.animationDelay = `${i * 60}ms`;
    document.body.append(s);
    setTimeout(() => s.remove(), 1400);
  }
}

// Bảng nổi từ dưới lên (dùng cho luyện viết trong bài học, lời nhắn huy hiệu...).
export function sheet(content, { onClose } = {}) {
  const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const wrap = h('div', { class: 'sheet-backdrop', onclick: e => { if (e.target === wrap) close(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
      h('button', { class: 'sheet-close icon-btn', 'aria-label': 'Đóng', onclick: close }, '✕'),
      content));
  document.body.append(wrap);
  document.addEventListener('keydown', onKey);
  return close;
}

export function progressBar(value, max) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('div', { class: 'bar-fill', style: { width: `${pct}%` } }));
}

export function ring(pct, label, sub) {
  const r = 52, c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct));
  const wrap = h('div', { class: 'ring' });
  wrap.innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="${r}" class="ring-bg"/>
    <circle cx="60" cy="60" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/>
  </svg>`;
  wrap.append(h('div', { class: 'ring-text' }, h('strong', null, label), h('small', null, sub)));
  return wrap;
}
