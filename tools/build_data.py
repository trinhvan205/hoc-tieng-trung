"""Tạo data/words.json và data/topics.json từ tools/words-source.txt.

Chạy:  python tools/build_data.py            (tạo JSON + kiểm tra)
       python tools/build_data.py --strokes  (tải thêm dữ liệu nét chữ vào data/strokes/)
"""
import json, sys, unicodedata, urllib.request, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "words-source.txt"
DATA = ROOT / "data"
STROKES_URL = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/{}.json"

TONE = {"̄": 1, "́": 2, "̌": 3, "̀": 4}


def plain(pinyin):
    """'bà ba' -> 'ba4 ba' ; 'nǚ ér' -> 'nv3 er2'."""
    out = []
    for syl in pinyin.split():
        tone = 0
        letters = []
        for ch in unicodedata.normalize("NFD", syl.lower()):
            if ch in TONE:
                tone = TONE[ch]
            elif ch == "̈":
                letters[-1] = "v"
            elif ch.isalpha():
                letters.append(ch)
        out.append("".join(letters) + (str(tone) if tone else ""))
    return " ".join(out)


def parse():
    topics, words, counters = [], [], {0: 0, 1: 0, 2: 0}
    topic = None
    for n, line in enumerate(SRC.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or (line.startswith("#") and not line.startswith("##")):
            continue
        if line.startswith("##"):
            tid, title_vi, title_zh, icon, level = [p.strip() for p in line[2:].split("|")]
            topic = {"id": tid, "titleVi": title_vi, "titleZh": title_zh, "icon": icon,
                     "level": level if level == "love" else int(level),
                     "order": len(topics) + 1, "wordIds": []}
            topics.append(topic)
            continue
        parts = line.split("|")
        if len(parts) not in (8, 9):
            sys.exit(f"Dòng {n}: cần 8 hoặc 9 trường, có {len(parts)}: {line}")
        hanzi, pinyin, meaning, hanviet, pos, ex_zh, ex_py, ex_vi = [p.strip() for p in parts[:8]]
        level = int(parts[8]) if len(parts) == 9 else topic["level"]
        counters[level] += 1
        wid = f"love-{counters[0]:04d}" if level == 0 else f"hsk{level}-{counters[level]:04d}"
        words.append({"id": wid, "hanzi": hanzi, "pinyin": pinyin, "pinyinPlain": plain(pinyin),
                      "meaningVi": meaning, "hanViet": hanviet, "pos": pos, "level": level,
                      "topicId": topic["id"], "example": {"zh": ex_zh, "pinyin": ex_py, "vi": ex_vi}})
        topic["wordIds"].append(wid)
    return topics, words


def check(topics, words):
    errors = []
    seen = {}
    for w in words:
        if w["hanzi"] in seen:
            errors.append(f"Trùng chữ {w['hanzi']} ({seen[w['hanzi']]} và {w['topicId']})")
        seen[w["hanzi"]] = w["topicId"]
        if len(w["pinyin"].split()) != len(w["hanzi"]) and not w["hanzi"].endswith("儿"):
            errors.append(f"Số âm tiết pinyin không khớp: {w['hanzi']} / {w['pinyin']}")
        for key in ("hanzi", "pinyin", "meaningVi", "hanViet", "pos"):
            if not w[key]:
                errors.append(f"{w['id']} thiếu {key}")
    for t in topics:
        if not 12 <= len(t["wordIds"]) <= 20:
            errors.append(f"Chủ đề {t['id']} có {len(t['wordIds'])} từ (cần 12–20)")
    if len({w["id"] for w in words}) != len(words):
        errors.append("Trùng id")
    return errors


def download_strokes(chars):
    out = DATA / "strokes"
    out.mkdir(parents=True, exist_ok=True)
    missing = [c for c in chars if not (out / f"{c}.json").exists()]
    for i, c in enumerate(missing, 1):
        url = STROKES_URL.format(urllib.parse.quote(c))
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                (out / f"{c}.json").write_bytes(r.read())
        except Exception as e:  # noqa: BLE001
            print(f"  không tải được {c}: {e}")
        if i % 50 == 0:
            print(f"  {i}/{len(missing)}")
    print(f"Dữ liệu nét: {len(list(out.glob('*.json')))} chữ")


def main():
    topics, words = parse()
    errors = check(topics, words)
    for e in errors:
        print("LỖI:", e)
    if errors:
        sys.exit(1)
    DATA.mkdir(exist_ok=True)
    (DATA / "words.json").write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    (DATA / "topics.json").write_text(json.dumps(topics, ensure_ascii=False, indent=1), encoding="utf-8")
    chars = sorted({c for w in words for c in w["hanzi"]} - {"〇"})
    by_level = {lv: sum(1 for w in words if w["level"] == lv) for lv in (1, 2, 0)}
    print(f"{len(words)} từ (HSK1 {by_level[1]}, HSK2 {by_level[2]}, ngoài HSK {by_level[0]}), "
          f"{len(topics)} chủ đề, {len(chars)} chữ Hán khác nhau")
    if "--strokes" in sys.argv:
        download_strokes(chars)


if __name__ == "__main__":
    main()
