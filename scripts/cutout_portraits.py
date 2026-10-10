"""抠掉 portrait-N.png 的米色背景，生成透明立绘（供对话框内嵌显示）。

背景：banner-all-villagers.png 是米色底(255,214,136)合成图，
裁掉外框后直接放进对话框会带着一块方形底色，很突兀。

做法：从四周边缘做 flood fill（BFS），只把「与边缘连通的背景像素」设为透明，
不碰角色内部可能出现的同色浅色区域，避免误伤。
"""
from PIL import Image
from pathlib import Path
from collections import deque

ROOT = Path(__file__).resolve().parent.parent
PORTRAITS = ROOT / 'stardew' / 'assets' / 'portraits'
N = 35

BG = (255, 214, 136)
TOL = 30# 颜色容差


def is_bg(px):
    return (abs(px[0] - BG[0]) <= TOL
            and abs(px[1] - BG[1]) <= TOL
            and abs(px[2] - BG[2]) <= TOL)


def cutout(img):
    w, h = img.size
    px = img.load()
    seen = [[False] * h for _ in range(w)]
    q = deque()

    # 四个边的像素作为种子
    for x in range(w):
        for y in (0, h - 1):
            if not seen[x][y] and is_bg(px[x, y]):
                seen[x][y] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[x][y] and is_bg(px[x, y]):
                seen[x][y] = True
                q.append((x, y))

    # BFS 扩散
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and is_bg(px[nx, ny]):
                seen[nx][ny] = True
                q.append((nx, ny))

    out = img.copy()
    op = out.load()
    n = 0
    for x in range(w):
        for y in range(h):
            if seen[x][y]:
                op[x, y] = (0, 0, 0, 0)
                n += 1
    return out, n


def main():
    for i in range(N):
        p = PORTRAITS / f'portrait-{i}.png'
        im = Image.open(p).convert('RGBA')
        res, n = cutout(im)
        res.save(p)
        print(f'portrait-{i:2d}: 透明化 {n} px ({n/(im.size[0]*im.size[1])*100:.0f}%)')

    # 检查图：深色棋盘底，方便看清透明区域
    sample = Image.open(PORTRAITS / 'portrait-30.png').convert('RGBA')
    W, H = sample.size
    chk = Image.new('RGBA', (W * 3, H * 3), (40, 40, 40, 255))
    for y in range(0, H * 3, 16):
        for x in range(0, W * 3, 16):
            if (x // 16 + y // 16) % 2 == 0:
                for dy in range(16):
                    for dx in range(16):
                        if x + dx < W * 3 and y + dy < H * 3:
                            chk.putpixel((x + dx, y + dy), (90, 90, 90, 255))
    big = sample.resize((W * 3, H * 3), Image.NEAREST)
    chk.alpha_composite(big)
    chk.save(ROOT / 'verify-portrait-alpha.png')
    print('已输出 verify-portrait-alpha.png')


if __name__ == '__main__':
    main()