// Tab Luyện: lối vào flashcard, luyện viết, bảng pinyin, game nghe thanh, bài tổng hợp HSK.
import { h } from '../util.js';
import { dueIds } from '../srs.js';
import { S } from '../store.js';

const tile = (href, icon, title, sub) =>
  h('a', { class: 'tile', href }, h('span', { class: 'tile-icon' }, icon), h('strong', null, title), h('small', null, sub));

export default function practice() {
  const due = dueIds().length;
  const best = id => S().topics[id]?.bestScore;
  const node = h('div', { class: 'tiles' },
    tile('#/review', '🃏', 'Ôn flashcard', due ? `${due} thẻ đến hạn` : 'Không có thẻ đến hạn'),
    tile('#/write', '✍️', 'Luyện viết', 'Viết chữ theo thứ tự nét'),
    tile('#/pinyin', '🔤', 'Bảng pinyin', '4 thanh và cách đọc'),
    tile('#/tones', '🎧', 'Game nghe thanh', 'Nghe rồi chọn thanh 1–4'),
    tile('#/quiz/hsk1', '📝', 'Tổng hợp HSK 1', best('hsk1-test') != null ? `Cao nhất ${best('hsk1-test')}/30` : '30 câu'),
    tile('#/quiz/hsk2', '🏅', 'Tổng hợp HSK 2', best('hsk2-test') != null ? `Cao nhất ${best('hsk2-test')}/30` : '30 câu'));
  return { title: 'Luyện tập', tab: 'practice', node };
}
