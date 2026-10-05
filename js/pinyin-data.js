// Bảng âm tiết pinyin. Mỗi âm tiết kèm một chữ Hán đại diện để giọng đọc của máy phát âm chuẩn.
const RAW = `
a啊 ai爱 an安 ang昂 ao奥 e饿 ei欸 en恩 er二 o哦 ou欧
ba八 bai白 ban班 bang帮 bao包 bei北 ben本 beng崩 bi笔 bian边 biao表 bie别 bin宾 bing冰 bo波 bu不
pa怕 pai牌 pan盘 pang胖 pao跑 pei陪 pen盆 peng朋 pi皮 pian片 piao票 pie撇 pin品 ping平 po破 pu普
ma妈 mai买 man慢 mang忙 mao猫 mei美 men门 meng梦 mi米 mian面 miao秒 mie灭 min民 ming名 mo摸 mou某 mu木
fa发 fan饭 fang方 fei飞 fen分 feng风 fo佛 fou否 fu父
da大 dai带 dan蛋 dang当 dao到 de的 deng等 di地 dian点 diao掉 die爹 ding顶 diu丢 dong东 dou都 du读 duan短 dui对 dun顿 duo多
ta他 tai太 tan谈 tang汤 tao桃 te特 teng疼 ti体 tian天 tiao跳 tie铁 ting听 tong同 tou头 tu土 tuan团 tui腿 tun吞 tuo拖
na那 nai奶 nan男 nao脑 ne呢 nei内 neng能 ni你 nian年 niang娘 niao鸟 nie捏 nin您 ning宁 niu牛 nong农 nu怒 nü女 nuan暖 nüe虐 nuo诺
la拉 lai来 lan蓝 lang狼 lao老 le了 lei累 leng冷 li里 lia俩 lian脸 liang两 liao聊 lie列 lin林 ling零 liu六 long龙 lou楼 lu路 lü绿 luan乱 lüe略 lun论 luo落
ga嘎 gai该 gan干 gang刚 gao高 ge哥 gei给 gen跟 geng更 gong工 gou狗 gu古 gua瓜 guai怪 guan关 guang光 gui贵 gun滚 guo国
ka卡 kai开 kan看 kang康 kao考 ke课 ken肯 keng坑 kong空 kou口 ku哭 kua夸 kuai快 kuan宽 kuang筐 kui亏 kun困 kuo阔
ha哈 hai还 han汉 hang航 hao好 he喝 hei黑 hen很 heng横 hong红 hou后 hu湖 hua花 huai坏 huan欢 huang黄 hui回 hun婚 huo火
ji机 jia家 jian见 jiang江 jiao叫 jie姐 jin今 jing京 jiong窘 jiu九 ju句 juan卷 jue觉 jun军
qi七 qia恰 qian钱 qiang枪 qiao桥 qie切 qin亲 qing请 qiong穷 qiu秋 qu去 quan全 que却 qun群
xi西 xia下 xian先 xiang想 xiao小 xie写 xin心 xing星 xiong熊 xiu休 xu需 xuan选 xue学 xun寻
zha炸 zhai摘 zhan站 zhang张 zhao找 zhe这 zhen真 zheng正 zhi知 zhong中 zhou周 zhu住 zhua抓 zhuan转 zhuang装 zhui追 zhun准 zhuo桌
cha茶 chai柴 chan产 chang长 chao超 che车 chen晨 cheng城 chi吃 chong虫 chou臭 chu出 chuan穿 chuang床 chui吹 chun春 chuo戳
sha沙 shai晒 shan山 shang上 shao少 she蛇 shei谁 shen身 sheng生 shi是 shou手 shu书 shua刷 shuai帅 shuang双 shui水 shun顺 shuo说
re热 ran然 rang让 rao绕 ren人 reng扔 ri日 rong容 rou肉 ru如 ruan软 rui瑞 run润 ruo弱
za杂 zai在 zan赞 zang脏 zao早 ze则 zei贼 zen怎 zeng增 zi字 zong总 zou走 zu足 zuan钻 zui最 zun尊 zuo坐
ca擦 cai菜 can参 cang藏 cao草 ce厕 ceng层 ci次 cong从 cou凑 cu醋 cuan窜 cui脆 cun村 cuo错
sa撒 sai赛 san三 sang桑 sao扫 se色 sen森 seng僧 si四 song送 sou搜 su苏 suan酸 sui岁 sun孙 suo所
ya呀 yan眼 yang羊 yao要 ye也 yi一 yin音 ying英 yong用 you有 yu鱼 yuan远 yue月 yun云
wa哇 wai外 wan晚 wang王 wei为 wen问 weng翁 wo我 wu五
`;

export const SYLLABLES = Object.fromEntries([...RAW.matchAll(/([a-zü]+)(\S)/g)].map(m => [m[1], m[2]]));

export const INITIALS = [
  { i: 'b', note: 'Gần “p” tiếng Việt nhưng không bật hơi, nghe hơi giống “b” nhẹ.' },
  { i: 'p', note: 'Như “p” nhưng bật mạnh luồng hơi ra (đặt tờ giấy trước miệng sẽ thấy giấy rung).' },
  { i: 'm', note: 'Như “m” tiếng Việt.' },
  { i: 'f', note: 'Như “ph” tiếng Việt.' },
  { i: 'd', note: 'Như “t” tiếng Việt, không bật hơi.' },
  { i: 't', note: 'Như “th” tiếng Việt, bật hơi mạnh.' },
  { i: 'n', note: 'Như “n” tiếng Việt.' },
  { i: 'l', note: 'Như “l” tiếng Việt.' },
  { i: 'g', note: 'Như “c/k” tiếng Việt, không bật hơi.' },
  { i: 'k', note: 'Như “c/k” nhưng bật hơi mạnh.' },
  { i: 'h', note: 'Gần “kh” tiếng Việt (hơi ma sát ở cuống lưỡi).' },
  { i: 'j', note: 'Gần “ch” tiếng Việt, mặt lưỡi áp lên vòm, không bật hơi.' },
  { i: 'q', note: 'Như “j” nhưng bật hơi, nghe gần “ch” mạnh.' },
  { i: 'x', note: 'Gần “x” tiếng Việt, môi hơi dẹt như cười.' },
  { i: 'zh', note: 'Gần “tr” tiếng Việt, cong đầu lưỡi lên.' },
  { i: 'ch', note: 'Như “zh” nhưng bật hơi mạnh.' },
  { i: 'sh', note: 'Gần “s” tiếng Việt (miền Bắc ít phân biệt), cong đầu lưỡi.' },
  { i: 'r', note: 'Cong lưỡi như “sh” nhưng rung dây thanh, gần “r” nhẹ hoặc “gi”.' },
  { i: 'z', note: 'Như “ch” đặt đầu lưỡi sau răng trên, giống “ts” trong “its”.' },
  { i: 'c', note: 'Như “z” nhưng bật hơi mạnh, giống “ts-h”.' },
  { i: 's', note: 'Như “x” tiếng Việt.' },
  { i: 'y', note: 'Âm đầu trống, đọc như vần bắt đầu bằng “i” (yi = i, ya = ia).' },
  { i: 'w', note: 'Âm đầu trống, đọc như vần bắt đầu bằng “u” (wu = u, wo = uơ).' },
  { i: '∅', note: 'Không có thanh mẫu, chỉ đọc vần.' },
];

export const FINAL_NOTES = [
  ['e', 'Gần “ơ” tiếng Việt nhưng sâu hơn trong họng.'],
  ['ü', 'Tròn môi như “u” nhưng lưỡi đặt như “i”, gần “uy”. Sau j, q, x, y viết là u.'],
  ['-i (zi ci si)', 'Sau z, c, s: giữ nguyên vị trí lưỡi, gần “ư”.'],
  ['-i (zhi chi shi ri)', 'Sau zh, ch, sh, r: cong lưỡi, cũng gần “ư”.'],
  ['ian', 'Đọc gần “iên”, không phải “i-an”.'],
  ['ong', 'Gần “ung” tiếng Việt.'],
  ['ui, iu, un', 'Viết tắt của uei, iou, uen: đọc gần “uây”, “iêu”, “uân”.'],
  ['er', 'Cong lưỡi khi đọc “ơ”, giống “ơr”.'],
];

export function syllablesOf(initial) {
  const all = Object.keys(SYLLABLES);
  if (initial === '∅') return all.filter(s => /^[aeo]/.test(s));
  if (initial === 'y' || initial === 'w') return all.filter(s => s.startsWith(initial));
  const twoLetter = ['zh', 'ch', 'sh'];
  return all.filter(s => s.startsWith(initial) && !(initial.length === 1 && twoLetter.includes(s.slice(0, 2))));
}

// Bốn thanh và thanh nhẹ, kèm đường cao độ (điểm trên thang 1–5) để vẽ minh họa.
export const TONES = [
  { n: 1, name: 'Thanh 1 (ngang)', mark: 'ā', vi: 'Cao và đều, giống thanh ngang nhưng cao hơn.', pts: [[0, 5], [1, 5]], ex: ['mā', '妈', 'mẹ'] },
  { n: 2, name: 'Thanh 2 (lên)', mark: 'á', vi: 'Đi lên từ giữa, giống thanh sắc.', pts: [[0, 3], [1, 5]], ex: ['má', '麻', 'cây gai'] },
  { n: 3, name: 'Thanh 3 (xuống rồi lên)', mark: 'ǎ', vi: 'Xuống thấp rồi hơi lên, gần thanh hỏi.', pts: [[0, 2], [0.5, 1], [1, 4]], ex: ['mǎ', '马', 'con ngựa'] },
  { n: 4, name: 'Thanh 4 (xuống)', mark: 'à', vi: 'Rơi mạnh từ cao xuống thấp, gần thanh nặng nhưng dứt khoát.', pts: [[0, 5], [1, 1]], ex: ['mà', '骂', 'mắng'] },
  { n: 0, name: 'Thanh nhẹ', mark: 'a', vi: 'Ngắn và nhẹ, không dấu.', pts: [[0.4, 3], [0.6, 3]], ex: ['ma', '吗', 'không? (trợ từ)'] },
];

export function toneSvg(pts, cls = '') {
  const x = t => 10 + t * 80;
  const y = v => 90 - (v - 1) * 20;
  const d = pts.map(([t, v], k) => `${k ? 'L' : 'M'}${x(t)} ${y(v)}`).join(' ');
  const lines = [1, 2, 3, 4, 5].map(v => `<line x1="6" x2="94" y1="${y(v)}" y2="${y(v)}"/>`).join('');
  return `<svg class="tone-svg ${cls}" viewBox="0 0 100 100" aria-hidden="true"><g class="tone-grid">${lines}</g><path d="${d}"/></svg>`;
}
