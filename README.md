# Học tiếng Trung cùng anh 💕

Web tĩnh học 300 từ HSK 1–2 (cộng chủ đề Tình yêu), dùng trên điện thoại, không cần đăng nhập, tiến độ lưu ngay trên máy và học được khi mất mạng.

## Có gì bên trong

- **Bài học:** 315 từ chia 20 chủ đề, mỗi từ có chữ Hán, pinyin, nghĩa Việt, âm Hán Việt, câu ví dụ, nút loa. Chủ đề sau mở khi học xong chủ đề trước (chủ đề Tình yêu luôn mở).
- **Flashcard:** hộp Leitner 6 mức (0 → 1 → 2 → 4 → 8 → 16 ngày), ba kiểu thẻ, vuốt trái/phải để chọn Quên/Nhớ.
- **Luyện viết:** Hanzi Writer, ba bước xem mẫu → tô theo nét → tự viết trên ô 田, dữ liệu nét tải sẵn cho 355 chữ.
- **Kiểm tra:** 10 câu cuối chủ đề, 30 câu tổng hợp HSK 1 và HSK 2, 4 dạng câu hỏi.
- **Pinyin:** 4 thanh + thanh nhẹ, bảng âm tiết chạm để nghe, ghi chú so với tiếng Việt, game nghe thanh.
- **Tiến độ:** số từ đã học/đã thuộc, chuỗi ngày, lịch 30 ngày, huy hiệu, xuất/nhập sao lưu.

## Chạy thử trên máy

Cần mở qua máy chủ web (mở thẳng file `index.html` sẽ không chạy):

```bash
cd hoc-tieng-trung
python -m http.server 8000
# mở http://localhost:8000
```

## Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub, đẩy toàn bộ thư mục này lên nhánh `main`.
2. Vào **Settings › Pages**, chọn *Deploy from a branch*, nhánh `main`, thư mục `/ (root)`.
3. Mở link `https://<tên-github>.github.io/<tên-repo>/` trên iPhone bằng Safari, bấm **Chia sẻ › Thêm vào MH chính**.

Sau mỗi lần sửa mã, tăng `VERSION` trong `sw.js` để điện thoại nhận bản mới.

## Sửa nội dung

- **Tên gọi, lời chào, lời khen, lời nhắn huy hiệu:** sửa `data/personal.json` (`{name}` sẽ được thay bằng tên).
- **Từ vựng:** sửa `tools/words-source.txt` rồi chạy `python tools/build_data.py --strokes` để tạo lại `data/words.json`, `data/topics.json` và tải nét chữ mới.
- **Biểu tượng app:** `python tools/make_icons.py` (cần Pillow).

## Cấu trúc

```
index.html  manifest.webmanifest  sw.js
css/style.css
js/app.js router.js store.js srs.js audio.js data.js writer.js badges.js pinyin-data.js util.js
js/views/*.js            mỗi màn hình một file
data/words.json topics.json personal.json strokes/*.json
tools/                   script tạo dữ liệu và biểu tượng
```

Tiến độ lưu ở khóa localStorage `hoc-tieng-trung:v1`; file sao lưu chính là đối tượng đó.
