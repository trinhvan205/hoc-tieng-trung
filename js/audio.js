// Phát âm: giọng đọc tiếng Trung có sẵn trên máy (Web Speech API, zh-CN); mp3 nếu từ có file riêng.
import { h, toast } from './util.js';
import { S } from './store.js';

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
let voice = null;
let voicesLoaded = false;
let warned = false;

function pickVoice() {
  const voices = synth?.getVoices() || [];
  if (!voices.length) return;
  voicesLoaded = true;
  voice = voices.find(v => /^zh[-_]CN/i.test(v.lang))
    || voices.find(v => /^zh/i.test(v.lang) && !/HK|TW/i.test(v.lang))
    || voices.find(v => /^zh/i.test(v.lang)) || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

// Chưa biết danh sách giọng (iPhone đôi khi trả về rỗng) thì vẫn cho thử đọc với lang zh-CN.
export const ttsAvailable = () => !!synth && (!voicesLoaded || !!voice);
export const canSpeak = word => !!word?.audio || ttsAvailable();

export function speak(text, word) {
  if (word?.audio && !ttsAvailable()) { new Audio(word.audio).play().catch(() => {}); return; }
  if (!ttsAvailable()) { warnOnce(); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  if (voice) u.voice = voice;
  u.rate = S().profile.rate || 0.8;
  synth.speak(u);
}

function warnOnce() {
  if (warned) return;
  warned = true;
  toast('Máy này chưa có giọng đọc tiếng Trung nên tạm ẩn nút loa.', 4000);
}

// Nút loa; trả về null (và báo một lần) nếu máy không đọc được.
export function speaker(text, word, { big = false, label = 'Nghe' } = {}) {
  if (!canSpeak(word)) { warnOnce(); return null; }
  return h('button', {
    class: `speaker${big ? ' speaker-big' : ''}`, type: 'button', 'aria-label': `${label}: ${text}`,
    onclick: e => { e.stopPropagation(); speak(text, word); },
  }, '🔊');
}
