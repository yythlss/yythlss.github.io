from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'stardew', 'assets', 'banner-all-villagers.png')
DST = os.path.join(ROOT, 'stardew', 'assets', 'banner-all-villagers.png')
PORTRAIT_DIR = os.path.join(ROOT, 'stardew', 'assets', 'portraits')

CELL_W = 64
CELL_H = 110
N = 35

banner = Image.open(SRC).convert('RGBA')
w, h = banner.size
print(f'original banner: {w}x{h}')

# Make width an exact multiple of N cells so the two-copy -50% scroll is perfectly seamless.
new_w = CELL_W * N
if new_w != w:
    banner = banner.resize((new_w, h), Image.Resampling.NEAREST)
    print(f'resized to: {new_w}x{h}')

banner.save(DST)
print(f'saved {DST}')

os.makedirs(PORTRAIT_DIR, exist_ok=True)
for i in range(N):
    cell = banner.crop((i * CELL_W, 0, (i + 1) * CELL_W, CELL_H))
    cell.save(os.path.join(PORTRAIT_DIR, f'portrait-{i}.png'))
    print(f'  portrait-{i}.png')

print('done')
