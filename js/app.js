// Khởi động: nạp tiến độ và dữ liệu, gắn các màn hình vào router, hiển thị.
import { load, S, applyTheme } from './store.js';
import { loadData } from './data.js';
import { route, resolve, go } from './router.js';
import { h } from './util.js';

const view = document.getElementById('view');
const titleEl = document.getElementById('page-title');
const backBtn = document.getElementById('back-btn');
const settingsBtn = document.getElementById('settings-btn');
const tabbar = document.getElementById('tabbar');

const lazy = name => () => import(`./views/${name}.js`).then(m => m.default);
route('/', lazy('home'));
route('/welcome', lazy('welcome'));
route('/topics', lazy('topics'));
route('/topic/:id', lazy('topic'));
route('/learn/:id', lazy('lesson'));
route('/review', lazy('flashcard'));
route('/quiz/:id', lazy('quiz'));
route('/write', lazy('write'));
route('/write/:topic', lazy('write'));
route('/write/:topic/:word', lazy('write'));
route('/practice', lazy('practice'));
route('/pinyin', lazy('pinyin'));
route('/tones', lazy('tones'));
route('/progress', lazy('progress'));
route('/settings', lazy('settings'));

let leave = null;
let renderId = 0;

async function render() {
  const id = ++renderId;
  const match = resolve();
  if (!match) { go('/'); return; }
  if (!S().profile.onboarded && match.path !== '/welcome') { go('/welcome'); return; }

  leave?.();
  leave = null;
  let screen;
  try {
    const make = await match.load();
    screen = await make(match);
  } catch (e) {
    console.error(e);
    screen = { title: 'Có lỗi', node: h('div', { class: 'card empty' }, h('p', null, 'Có lỗi khi mở trang này.'), h('a', { class: 'btn', href: '#/' }, 'Về Trang chủ')) };
  }
  if (id !== renderId) { screen.leave?.(); return; }

  leave = screen.leave || null;
  titleEl.textContent = screen.title || 'Học tiếng Trung';
  document.title = screen.title ? `${screen.title} · Học tiếng Trung` : 'Học tiếng Trung cùng anh';
  backBtn.hidden = !screen.back;
  backBtn.onclick = () => (typeof screen.back === 'string' ? go(screen.back) : history.back());
  settingsBtn.hidden = match.path === '/welcome' || match.path === '/settings';
  tabbar.hidden = !!screen.hideTabs;
  document.body.classList.toggle('no-tabs', !!screen.hideTabs);
  for (const a of tabbar.querySelectorAll('a')) a.classList.toggle('active', a.dataset.tab === screen.tab);
  view.replaceChildren(screen.node);
  view.scrollTop = 0;
  window.scrollTo(0, 0);
}

async function start() {
  load();
  applyTheme();
  try {
    await loadData();
  } catch (e) {
    view.replaceChildren(h('div', { class: 'card empty' },
      h('p', null, 'Không tải được dữ liệu bài học. Hãy mở trang qua đường link web (không mở trực tiếp file), rồi thử lại.')));
    return;
  }
  addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
  }
}

start();
