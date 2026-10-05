// Nạp nội dung bài học (JSON tĩnh) và các phép tính dựa trên tiến độ.
import { S } from './store.js';
import { isLearned, isMastered } from './srs.js';
import { pick } from './util.js';

let D = null;

export async function loadData() {
  if (D) return D;
  const get = name => fetch(`data/${name}.json`).then(r => {
    if (!r.ok) throw new Error(`Không tải được ${name}.json`);
    return r.json();
  });
  const [words, topics, personal] = await Promise.all([get('words'), get('topics'), get('personal')]);
  topics.sort((a, b) => a.order - b.order);
  D = {
    words, topics, personal,
    byId: new Map(words.map(w => [w.id, w])),
    topicById: new Map(topics.map(t => [t.id, t])),
  };
  return D;
}
export const data = () => D;

export const topicWords = t => t.wordIds.map(id => D.byId.get(id));
export const regularTopics = () => D.topics.filter(t => t.level !== 'love');

export function topicInfo(t) {
  const learned = t.wordIds.filter(isLearned).length;
  const saved = S().topics[t.id] || {};
  return {
    learned, total: t.wordIds.length,
    done: learned === t.wordIds.length,
    star: (saved.bestScore || 0) >= 8,
    bestScore: saved.bestScore,
    locked: isLocked(t),
  };
}

// Chủ đề "Tình yêu" luôn mở; các chủ đề khác mở lần lượt khi chủ đề trước đã học xong.
export function isLocked(t) {
  if (t.level === 'love' || S().profile.unlockAll) return false;
  const list = regularTopics();
  const i = list.indexOf(t);
  if (i <= 0) return false;
  return !list[i - 1].wordIds.every(isLearned);
}

export function nextTopic() {
  return regularTopics().find(t => !isLocked(t) && !t.wordIds.every(isLearned))
    || D.topics.find(t => !t.wordIds.every(isLearned)) || null;
}

export function name() {
  return S().profile.name || D.personal.name;
}
export const fill = s => (s || '').replaceAll('{name}', name());

export function greeting() {
  const hr = new Date().getHours();
  const g = D.personal.greetings;
  const key = hr < 5 ? 'night' : hr < 11 ? 'morning' : hr < 13 ? 'noon' : hr < 18 ? 'afternoon' : hr < 22 ? 'evening' : 'night';
  return fill(g[key]);
}
export const praise = () => pick(D.personal.praise);

export function stats() {
  const byLevel = {};
  for (const w of D.words) {
    const s = (byLevel[w.level] ||= { total: 0, learned: 0, mastered: 0 });
    s.total++;
    if (isLearned(w.id)) s.learned++;
    if (isMastered(w.id)) s.mastered++;
  }
  const learned = D.words.filter(w => isLearned(w.id)).length;
  return { byLevel, learned, total: D.words.length };
}

export const BADGES = [
  { id: 'words-10', icon: '🌱', title: '10 từ', test: s => s.learned >= 10 },
  { id: 'words-50', icon: '📚', title: '50 từ', test: s => s.learned >= 50 },
  { id: 'words-100', icon: '💯', title: '100 từ', test: s => s.learned >= 100 },
  { id: 'words-300', icon: '💖', title: '300 từ', test: s => s.learned >= 300 },
  { id: 'streak-7', icon: '🔥', title: 'Chuỗi 7 ngày', test: s => s.streak >= 7 },
  { id: 'streak-30', icon: '🏆', title: 'Chuỗi 30 ngày', test: s => s.streak >= 30 },
];
export const badgeMessage = id => fill(D.personal.badges?.[id] || '');
