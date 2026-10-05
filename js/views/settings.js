// Cài đặt: tên, mục tiêu ngày, số từ mới/ngày, tốc độ đọc, pinyin, chế độ tối, sao lưu.
import { h, toast, today } from '../util.js';
import { S, save, exportBackup, importBackup, resetAll, applyTheme } from '../store.js';
import { data } from '../data.js';
import { speak } from '../audio.js';
import { getPhotos, addPhotos, removePhoto, MAX_PHOTOS } from '../photos.js';
import { downloadReminder } from '../reminder.js';

function field(label, control, hint) {
  return h('label', { class: 'field' }, h('span', { class: 'field-label' }, label), control, hint ? h('small', { class: 'muted' }, hint) : null);
}

function select(value, options, onChange) {
  const el = h('select', { onchange: () => onChange(el.value) },
    options.map(([v, label]) => h('option', { value: v, selected: String(v) === String(value) ? true : null }, label)));
  return el;
}

function toggle(checked, onChange) {
  const el = h('input', { type: 'checkbox', class: 'switch', checked: checked ? true : null, onchange: () => onChange(el.checked) });
  return el;
}

export default function settings() {
  const p = S().profile;
  const set = (k, v) => { p[k] = v; save(); };

  const nameInput = h('input', { type: 'text', value: p.name || data().personal.name, maxlength: 40, autocomplete: 'off' });
  nameInput.addEventListener('change', () => { set('name', nameInput.value.trim()); toast('Đã lưu tên'); });

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      if (!confirm('Nhập file này sẽ thay toàn bộ tiến độ hiện tại. Tiếp tục?')) return;
      importBackup(text);
      toast('Đã nhập sao lưu 💕');
      setTimeout(() => { location.hash = '#/'; location.reload(); }, 600);
    } catch (e) {
      toast(`Không nhập được: ${e.message}`, 4000);
    } finally { fileInput.value = ''; }
  });

  function download() {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `hoc-tieng-trung-${today()}.json` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Đã xuất file sao lưu');
  }

  // Ảnh của hai bạn
  const photoGrid = h('div', { class: 'photo-grid' });
  const photoInput = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
  function drawPhotos() {
    const list = getPhotos();
    photoGrid.replaceChildren(
      ...list.map((src, i) => h('div', { class: 'photo-thumb' },
        h('img', { src, alt: `Ảnh ${i + 1}`, style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' } }),
        h('button', { class: 'photo-del', 'aria-label': 'Xóa ảnh', onclick: () => {
          if (!confirm('Xóa ảnh này?')) return;
          removePhoto(i); drawPhotos();
        } }, '✕'))),
      list.length < MAX_PHOTOS ? h('button', { class: 'photo-add', onclick: () => photoInput.click() }, '＋', h('small', null, 'Thêm ảnh')) : null);
  }
  photoInput.addEventListener('change', async () => {
    try {
      await addPhotos([...photoInput.files]);
      toast('Đã thêm ảnh 💕');
    } catch (e) { toast(e.message, 3500); }
    photoInput.value = '';
    drawPhotos();
  });
  drawPhotos();

  // Nhắc học mỗi ngày
  const timeInput = h('input', { type: 'time', value: p.reminderTime || '20:00', class: 'time-input' });
  timeInput.addEventListener('change', () => set('reminderTime', timeInput.value));

  const node = h('div', { class: 'stack-lg settings' },
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '👤 Cá nhân'),
      field('Tên gọi', nameInput, 'Hiện trong lời chào ở Trang chủ.')),
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '📷 Ảnh của hai bạn'),
      h('p', { class: 'muted small' }, `Tối đa ${MAX_PHOTOS} ảnh, hiện ở Trang chủ và khi học xong. Ảnh chỉ lưu trên máy này, không đưa lên mạng.`),
      photoGrid, photoInput),
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '⏰ Nhắc học mỗi ngày'),
      field('Giờ nhắc', timeInput),
      h('button', { class: 'btn btn-primary', onclick: () => {
        const time = timeInput.value || '20:00';
        set('reminderTime', time);
        downloadReminder(time, p.name || data().personal.name);
        toast('Chọn “Thêm tất cả” để lưu vào Lịch', 4000);
      } }, '📅 Thêm nhắc học vào Lịch'),
      h('small', { class: 'muted' }, 'Tạo một lịch lặp lại hằng ngày trong app Lịch, đến giờ điện thoại sẽ nhắc. Nếu bấm mà không thấy gì, hãy mở web bằng Safari (không mở từ icon màn hình chính) rồi bấm lại.')),
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '🎯 Mục tiêu học'),
      field('Mục tiêu mỗi ngày', select(p.dailyGoalCards, [[10, '10 thẻ'], [20, '20 thẻ'], [30, '30 thẻ'], [40, '40 thẻ']], v => set('dailyGoalCards', Number(v))),
        'Cũng là số thẻ ôn tối đa mỗi ngày.'),
      field('Số từ mới mỗi buổi', select(p.newPerDay, [[5, '5 từ'], [10, '10 từ'], [15, '15 từ'], [20, '20 từ']], v => set('newPerDay', Number(v)))),
      h('div', { class: 'field field-inline' }, h('span', { class: 'field-label' }, 'Mở tất cả chủ đề'), toggle(p.unlockAll, v => set('unlockAll', v)))),
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '🔊 Hiển thị & âm thanh'),
      field('Tốc độ đọc', select(p.rate, [[0.6, 'Chậm'], [0.8, 'Vừa (mặc định)'], [1, 'Bình thường']], v => { set('rate', Number(v)); speak('你好'); })),
      h('button', { class: 'btn', onclick: () => speak('你好，我爱你') }, '🔊 Thử âm thanh'),
      h('small', { class: 'muted' }, 'Không nghe thấy? Trên iPhone hãy gạt nút im lặng bên hông máy sang chế độ chuông (không thấy vạch cam) và tăng âm lượng.'),
      h('div', { class: 'field field-inline' }, h('span', { class: 'field-label' }, 'Hiện pinyin trên mặt thẻ'), toggle(p.showPinyin, v => set('showPinyin', v))),
      field('Giao diện', select(p.theme, [['auto', 'Theo máy'], ['light', 'Sáng'], ['dark', 'Tối']], v => { set('theme', v); applyTheme(); }))),
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '💾 Sao lưu'),
      h('p', { class: 'muted' }, 'Tiến độ chỉ nằm trên máy này. Thỉnh thoảng xuất file sao lưu để khỏi mất khi xóa dữ liệu trình duyệt hoặc đổi máy.'),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: download }, '⬇️ Xuất sao lưu'),
        h('button', { class: 'btn', onclick: () => fileInput.click() }, '⬆️ Nhập sao lưu')),
      fileInput),
    h('section', { class: 'card stack' },
      h('h3', { class: 'section-title' }, '⚠️ Đặt lại'),
      h('button', { class: 'btn btn-danger', onclick: () => {
        if (!confirm('Xóa toàn bộ tiến độ học? Không hoàn tác được.')) return;
        if (!confirm('Chắc chắn chứ? Nên xuất sao lưu trước.')) return;
        resetAll();
        location.hash = '#/welcome';
        location.reload();
      } }, 'Xóa toàn bộ tiến độ')),
    h('p', { class: 'muted center small' }, 'Làm bằng cả trái tim 💕'));

  return { title: 'Cài đặt', back: true, node };
}
