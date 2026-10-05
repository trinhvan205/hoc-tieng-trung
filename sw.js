// Service worker: tải sẵn toàn bộ web + dữ liệu nét chữ để học được khi mất mạng.
// Sửa mã xong thì tăng VERSION để máy người dùng nhận bản mới.
const VERSION = 'v4';
const CACHE = `hoc-tieng-trung-${VERSION}`;
const FONT_CACHE = 'hoc-tieng-trung-fonts';

const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/router.js', 'js/store.js', 'js/srs.js', 'js/audio.js', 'js/data.js', 'js/util.js',
  'js/badges.js', 'js/writer.js', 'js/pinyin-data.js', 'js/photos.js', 'js/reminder.js', 'js/vendor/hanzi-writer.min.js',
  'js/views/parts.js', 'js/views/welcome.js', 'js/views/home.js', 'js/views/topics.js', 'js/views/topic.js',
  'js/views/lesson.js', 'js/views/flashcard.js', 'js/views/quiz.js', 'js/views/write.js', 'js/views/practice.js',
  'js/views/pinyin.js', 'js/views/tones.js', 'js/views/progress.js', 'js/views/settings.js',
  'data/words.json', 'data/topics.json', 'data/personal.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload' để bỏ qua bộ nhớ đệm HTTP, luôn lấy bản mới nhất từ máy chủ.
    await cache.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    // Dữ liệu nét của mọi chữ Hán có trong bộ từ vựng.
    const words = await (await cache.match('data/words.json')).json();
    const chars = [...new Set(words.flatMap(w => [...w.hanzi]))].filter(c => /\p{Script=Han}/u.test(c));
    await Promise.all(chars.map(c => cache.add(new Request(`data/strokes/${encodeURIComponent(c)}.json`, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Phông chữ Google: lấy từ bộ nhớ trước, không có mới tải.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(caches.open(FONT_CACHE).then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
        return res;
      } catch { return new Response('', { status: 504 }); }
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  // Dữ liệu nét chữ không đổi: lấy từ bộ nhớ trước cho nhanh.
  // Mã và dữ liệu bài học: ưu tiên bản mới trên mạng (chờ tối đa 3 giây), mất mạng thì dùng bản đã lưu.
  // Nhờ vậy CSS, JS và JSON luôn cùng một phiên bản, không bị lẫn bản cũ với bản mới.
  const strokes = url.pathname.includes('/data/strokes/');
  event.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (strokes && hit) return hit;
    const network = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    const timeout = new Promise(resolve => setTimeout(() => resolve(null), hit ? 3000 : 15000));
    const res = await Promise.race([network, timeout]);
    if (res) return res;
    if (hit) { event.waitUntil(network); return hit; }
    if (req.mode === 'navigate') return (await cache.match('index.html')) || new Response('Offline', { status: 503 });
    return new Response('Offline', { status: 503 });
  }));
});
