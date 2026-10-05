// Điều hướng theo #hash, ví dụ #/topic/love hoặc #/review?ids=a,b
const routes = [];

export function route(pattern, load) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ re, keys, load });
}

export function resolve() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs));
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { load: r.load, params, query, path };
    }
  }
  return null;
}

export const go = path => { location.hash = path; };
