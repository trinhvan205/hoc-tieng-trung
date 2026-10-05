// Học từ mới: mỗi lần một thẻ, học xong từ nào thì từ đó vào hàng ôn tập.
import { h, progressBar, sheet } from '../util.js';
import { S, save, countCard, day } from '../store.js';
import { data, topicWords, topicInfo, praise } from '../data.js';
import { learn, isLearned } from '../srs.js';
import { speak, canSpeak } from '../audio.js';
import { writerPanel } from '../writer.js';
import { checkBadges } from '../badges.js';
import { wordDetail, praiseScreen, btn } from './parts.js';
import { go } from '../router.js';

export default function lesson({ params }) {
  const t = data().topicById.get(params.id);
  if (!t) { go('/topics'); return { node: h('div') }; }
  if (topicInfo(t).locked) { go(`/topic/${t.id}`); return { node: h('div') }; }

  const all = topicWords(t);
  const fresh = all.filter(w => !isLearned(w.id));
  const reviewing = fresh.length === 0;   // đã học hết: xem lại cả chủ đề, không đổi tiến độ
  const perDay = S().profile.newPerDay || 10;
  const queue = reviewing ? all : fresh.slice(0, perDay);
  const overQuota = !reviewing && (day().newWords || 0) >= perDay;

  const root = h('div', { class: 'stack-lg lesson' });
  let i = 0;
  let closeSheet = null;

  function showCard() {
    const w = queue[i];
    const next = () => {
      if (!reviewing && learn(w.id)) countCard('new');
      i++;
      if (i < queue.length) {
        if (canSpeak(queue[i])) speak(queue[i].hanzi, queue[i]);
        showCard();
      } else finish();
    };
    root.replaceChildren(
      h('div', { class: 'lesson-top' },
        h('span', { class: 'muted' }, `${t.icon} ${reviewing ? 'Xem lại' : 'Từ mới'} ${i + 1}/${queue.length}`),
        progressBar(i, queue.length)),
      h('div', { class: 'card flash-learn' }, wordDetail(w)),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => openWriter(w) }, '✍️ Viết thử'),
        h('button', { class: 'btn btn-primary', onclick: next }, i === queue.length - 1 ? 'Xong ✓' : 'Tiếp →')));
  }

  function openWriter(w) {
    const panel = writerPanel(w, { onWordDone: () => closeSheet?.() });
    closeSheet = sheet(panel.node, { onClose: () => panel.destroy() });
  }

  function finish() {
    const info = topicInfo(t);
    if (info.done) {
      S().topics[t.id] = { ...(S().topics[t.id] || {}), learned: true };
      save();
    }
    checkBadges();
    const left = info.total - info.learned;
    root.replaceChildren(praiseScreen({
      icon: info.done ? '🎊' : '🌷',
      title: praise(),
      text: reviewing ? 'Em đã xem lại cả chủ đề rồi.'
        : info.done ? `Em đã học xong chủ đề “${t.titleVi}”. Các từ đã vào hàng ôn tập và chủ đề kế tiếp đã mở.`
          : `Em vừa học ${queue.length} từ mới. Chủ đề này còn ${left} từ nữa.`,
      actions: [
        !reviewing && left > 0 ? btn('Học thêm từ mới', `#/learn/${t.id}?again=${Date.now()}`, 'btn btn-primary') : null,
        btn('✍️ Luyện viết các từ này', `#/write/${t.id}`, info.done ? 'btn btn-primary' : 'btn'),
        btn('📝 Làm bài kiểm tra', `#/quiz/${t.id}`),
        btn('Về chủ đề', `#/topic/${t.id}`, 'btn btn-ghost'),
      ],
    }));
  }

  if (overQuota) {
    root.replaceChildren(praiseScreen({
      icon: '🌙',
      title: 'Hôm nay em học đủ từ mới rồi',
      text: `Em đã học ${day().newWords} từ mới hôm nay. Nghỉ chút cho đầu óc nhẹ nhàng, hoặc học thêm vẫn được nha.`,
      actions: [
        h('button', { class: 'btn btn-primary', onclick: showCard }, 'Vẫn học thêm'),
        btn('Ôn flashcard', '#/review'),
        btn('Về chủ đề', `#/topic/${t.id}`, 'btn btn-ghost'),
      ],
    }));
  } else showCard();

  return { title: t.titleVi, tab: 'topics', back: `#/topic/${t.id}`, node: root, leave: () => closeSheet?.() };
}
