// Nhắc học mỗi ngày: tạo file lịch (.ics) có sự kiện lặp lại hằng ngày kèm báo thức.
// Web tĩnh không tự gửi thông báo được, nên nhờ app Lịch của điện thoại nhắc thay.
import { h } from './util.js';

const pad = n => String(n).padStart(2, '0');

function icsText(time, name) {
  const [hh, mm] = time.split(':').map(Number);
  const d = new Date();
  const start = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(hh)}${pad(mm)}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const url = location.href.split('#')[0];
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//hoc-tieng-trung//VI', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:hoc-tieng-trung-${start}@github.io`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    'DURATION:PT15M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Học tiếng Trung 15 phút 💕',
    `DESCRIPTION:Mở web học: ${url}`,
    `URL:${url}`,
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:Đến giờ học tiếng Trung rồi ${name} ơi 💕`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}

export function downloadReminder(time, name) {
  const blob = new Blob([icsText(time, name)], { type: 'text/calendar;charset=utf-8' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'nhac-hoc-tieng-trung.ics' });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
