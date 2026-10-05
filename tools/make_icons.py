"""Vẽ biểu tượng app (chữ 爱 trên nền đỏ son, trái tim hồng đào). Chạy: python tools/make_icons.py"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = "C:/Windows/Fonts/msyhbd.ttc"
RED, CREAM, PEACH = (200, 71, 61), (255, 248, 240), (242, 167, 160)


def draw(size, maskable=False):
    img = Image.new("RGBA", (size, size), RED if maskable else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if not maskable:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=RED)
    scale = 0.5 if maskable else 0.62
    font = ImageFont.truetype(FONT, int(size * scale))
    box = d.textbbox((0, 0), "爱", font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((size - w) / 2 - box[0], (size - h) / 2 - box[1] - size * 0.02), "爱", font=font, fill=CREAM)
    # trái tim nhỏ góc dưới phải
    r = size * (0.07 if maskable else 0.085)
    cx, cy = size * (0.70 if maskable else 0.76), size * (0.70 if maskable else 0.76)
    d.ellipse([cx - r * 2, cy - r, cx, cy + r], fill=PEACH)
    d.ellipse([cx, cy - r, cx + r * 2, cy + r], fill=PEACH)
    d.polygon([(cx - r * 1.95, cy + r * 0.3), (cx + r * 1.95, cy + r * 0.3), (cx, cy + r * 2.4)], fill=PEACH)
    return img


out = ROOT / "icons"
out.mkdir(exist_ok=True)
draw(192).save(out / "icon-192.png")
draw(512).save(out / "icon-512.png")
draw(512, maskable=True).save(out / "icon-maskable-512.png")
# iPhone không dùng nền trong suốt: vẽ kín nền đỏ.
apple = Image.new("RGB", (180, 180), RED)
apple.paste(draw(180, maskable=True).resize((180, 180)), (0, 0))
apple.save(out / "apple-touch-icon.png")
print("Đã tạo icons/")
