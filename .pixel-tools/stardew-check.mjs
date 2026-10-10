// 校验星露谷精灵网格：矩形、调色板覆盖、别名完整性、HTML/JS 引用可解析
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const win = {};
const sandbox = { window: win, console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync('sprites.js', 'utf8'), sandbox, { filename: 'sprites.js' });
win.mountSprites = () => {};
vm.runInContext(readFileSync('sprites-stardew.js', 'utf8'), sandbox, { filename: 'sprites-stardew.js' });

const grid = win.FARM_GRID;
const alias = win.FARM_ALIAS;
const palette = win.POKE_PALETTE;
let problems = 0;
const bad = (msg) => { problems++; console.log('ISSUE:', msg); };

for (const [name, rows] of Object.entries(grid)) {
  const w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) bad(`${name} 第 ${i} 行长度 ${r.length} ≠ ${w}`); });
  const codes = new Set([...rows.flatMap((r) => [...r])].filter((c) => c !== '.'));
  for (const c of codes) {
    if (!(c in palette) || !palette[c]) bad(`${name}: 颜色码 "${c}" 不在调色板中`);
  }
}

// 别名必须都指向真实网格
for (const [from, to] of Object.entries(alias)) {
  if (!grid[to]) bad(`别名 ${from} → ${to}，但 ${to} 不存在`);
  if (!win.POKE_GRID[from]) bad(`旧名 ${from} 未注入 POKE_GRID`);
}

// 新精灵必须都进了 POKE_GRID（供 ensureSheet 生成 CSS）
for (const name of Object.keys(grid)) {
  if (!win.POKE_GRID[name]) bad(`${name} 未注入 POKE_GRID`);
}

// HTML / JS 中用到的精灵名是否都能解析
const html = readFileSync('index.html', 'utf8');
const js = readFileSync('github-gba.js', 'utf8');
const used = new Set([
  ...[...html.matchAll(/data-sprite="([^"]+)"/g)].map((m) => m[1]),
  ...[...js.matchAll(/sprite:\s*'([a-zA-Z]+)'/g)].map((m) => m[1]),
  ...[...js.matchAll(/icon:\s*'([a-zA-Z]+)'/g)].map((m) => m[1]),
  ...[...js.matchAll(/'(v[A-Z][a-zA-Z]+|cow|junimo)'/g)].map((m) => m[1])
]);
for (const name of used) {
  if (!win.POKE_GRID[name]) bad(`引用了不存在的精灵 "${name}"`);
}

console.log(`精灵数: ${Object.keys(grid).length}，别名: ${Object.keys(alias).length}，问题: ${problems}`);
console.log('尺寸:', Object.entries(grid).map(([n, r]) => `${n} ${r[0].length}x${r.length}`).join(', '));
console.log('页面使用的精灵:', [...used].join(', '));

// 顺手导出一份 SVG 预览，方便看人物长什么样
const build = win.buildSpriteSvg;
if (build) {
  const cast = ['vFarmer', 'vCarpenter', 'vBlacksmith', 'vShop', 'vDoctor', 'vWizard', 'vMayor', 'vMiner', 'junimo', 'cow'];
  const cells = cast.map((n) => {
    const g = grid[n];
    const svg = build(n).replace(/^<svg[^>]*viewBox="([^"]+)"[^>]*>/, '<svg viewBox="$1" width="96" height="144" shape-rendering="crispEdges">');
    return `<figure><div class="box">${svg}</div><figcaption>${n} ${g[0].length}x${g.length}</figcaption></figure>`;
  }).join('');
  writeFileSync('.pixel-tools/sprites-preview.html',
    `<!doctype html><meta charset="utf-8"><style>body{background:#e8f0d8;font-family:system-ui;padding:16px}
figure{margin:0 8px 8px 0;display:inline-block;text-align:center;background:#fff8e6;border:3px solid #8a5a2b;padding:6px}
.box{width:96px;height:144px;display:flex;align-items:flex-end;justify-content:center}figcaption{font-size:12px}</style>${cells}`);
  console.log('预览已写入 .pixel-tools/sprites-preview.html');
}
