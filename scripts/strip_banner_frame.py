"""裁掉 banner-all-villagers.png 自带的 6px 深棕外框，让村民立绘连续拼接。

背景：
  原图每个 64x110 cell 上下左右各有 6px 深棕边框（约 #40200f），
  横向滚动时表现为一道道竖线，视觉上被分割成一个个"框"。
  这里先把整幅图四周的边框裁掉，再横向重采样为 CELL_W*N 的等距网格，
  保证 translateX(-50%) 无缝循环仍然成立。
"""
from PIL import Image
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'stardew' / 'assets' / 'banner-all-villagers.png'
PORTRAITS = ROOT / 'stardew' / 'assets' / 'portraits'

N = 35            # 村民数量
FRAME = 6# 素材自带边框厚度（上/下/左/右）
CELL_W = 64       # 输出单元格宽度（须为整数，否则无缝循环会错位）
OUT_H = 98# 裁掉上下边框后的净高 (110 - 2*6)


def main():
    im = Image.open(SRC).convert('RGBA')

    # 1) 裁掉四周 6px 边框 -> 2228 x 98
    inner = im.crop((FRAME, FRAME, im.width - FRAME, im.height - FRAME))
    print(f'裁边框后: {im.size} -> {inner.size}')

    # 2) 横向缩放为 N 个等距 cell
    total_w = CELL_W * N
    banner = inner.resize((total_w, OUT_H), Image.Resampling.LANCZOS)
    out_banner = SRC
    banner.save(out_banner)
    print(f'新横幅: {banner.size} -> {out_banner.name}')

    # 3) 重新切出 35 张立绘（供对话框 / 底部头像行使用）
    PORTRAITS.mkdir(parents=True, exist_ok=True)
    for i in range(N):
        cell = banner.crop((i * CELL_W, 0, (i + 1) * CELL_W, OUT_H))
        cell.save(PORTRAITS / f'portrait-{i}.png')
    print(f'已重建 portrait-0..{N - 1}.png ({CELL_W}x{OUT_H})')

    # 4) 调试用：4x 放大的接缝检查图
    seam = banner.crop((0, 0, CELL_W * 4, OUT_H))
    seam = seam.resize((seam.width * 3, seam.height * 3), Image.Resampling.NEAREST)
    seam.save(ROOT / 'verify-banner-seam.png')
    print('已输出 verify-banner-seam.png')


if __name__ == '__main__':
    main()