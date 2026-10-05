// Ảnh của hai bạn: chỉ lưu trên máy (localStorage riêng, không nằm trong file sao lưu, không lên mạng).
import { h, today } from './util.js';

const KEY = 'hoc-tieng-trung:photos';
const MAX = 6;
const SIZE = 900;

export function getPhotos() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function savePhotos(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// Thu nhỏ ảnh về tối đa 900px để vừa bộ nhớ trình duyệt.
function shrink(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, SIZE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh')); };
    img.src = url;
  });
}

export async function addPhotos(files) {
  const list = getPhotos();
  for (const f of files) {
    if (list.length >= MAX) throw new Error(`Tối đa ${MAX} ảnh`);
    list.push(await shrink(f));
    try { savePhotos(list); } catch { list.pop(); throw new Error('Bộ nhớ đầy, hãy xóa bớt ảnh'); }
  }
  return list;
}

export function removePhoto(i) {
  const list = getPhotos();
  list.splice(i, 1);
  savePhotos(list);
  return list;
}

export const MAX_PHOTOS = MAX;

// Mỗi ngày một ảnh, đổi theo ngày.
export function photoOfDay(offset = 0) {
  const list = getPhotos();
  if (!list.length) return null;
  const n = Number(today().replaceAll('-', '')) + offset;
  return list[n % list.length];
}

export function photoImg(src, cls = 'photo') {
  return src ? h('img', { class: cls, src, alt: 'Ảnh của hai bạn' }) : null;
}
