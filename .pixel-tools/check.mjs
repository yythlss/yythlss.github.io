// Static integrity checks for the GBA page: sprite names, pixel sizes, CSS hooks.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('github-gba.html', 'utf8');
const css = readFileSync('github-gba.css', 'utf8');
const js = readFileSync('github-gba.js', 'utf8');

const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync('sprites.js', 'utf8'), sandbox, { filename: 'sprites.js' });
const grid = sandbox.POKE_GRID;

let issues = 0;
const report = (msg) => { issues++; console.log('ISSUE:', msg); };

// 1. every data-sprite in HTML exists
const usedSprites = [...html.matchAll(/data-sprite="([^"]+)"/g)].map((m) => m[1]);
for (const name of new Set(usedSprites)) {
  if (!grid[name]) report(`data-sprite="${name}" 在 sprites.js 中不存在`);
}

// 2. CSS hard-coded pixel sizes must match the grid dimensions
const sizeRules = [...css.matchAll(/\[data-sprite="([^"]+)"\][^{]*\{[^}]*width:\s*calc\((\d+)\s*\*\s*2px\)[^}]*height:\s*calc\((\d+)\s*\*\s*2px\)/g)];
for (const [, name, w, h] of sizeRules) {
  const g = grid[name];
  if (!g) continue;
  if (Number(w) !== g[0].length || Number(h) !== g.length) {
    report(`CSS 覆盖尺寸不匹配：${name} 声明 ${w}x${h}，实际 ${g[0].length}x${g.length}`);
  }
}
// generic 2x/3x sprite sizing blocks
for (const [block, name, factor] of [...css.matchAll(/\.([a-z-]+)[^{]*\{[^}]*width:\s*calc\((\d+)\s*\*\s*(\d+)px\)[^}]*height:\s*calc\((\d+)\s*\*\s*(\d+)px\)/g)].map((m) => [m[0], m[1], m[3]])) {
  void block; void name; void factor;
}
for (const m of css.matchAll(/\.trainer-chip[^{]*\{[^}]*width:\s*calc\((\d+)\s*\*\s*2px\)[^}]*height:\s*calc\((\d+)\s*\*\s*2px\)/g)) {
  const g = grid.trainerFront;
  if (Number(m[1]) !== g[0].length || Number(m[2]) !== g.length) report('trainer-chip 尺寸与 trainerFront 不符');
}
for (const m of css.matchAll(/\.trainer-card[^{]*\{[^}]*width:\s*calc\((\d+)\s*\*\s*3px\)[^}]*height:\s*calc\((\d+)\s*\*\s*3px\)/g)) {
  const g = grid.trainer;
  if (Number(m[1]) !== g[0].length || Number(m[2]) !== g.length) report('trainer-card 尺寸与 trainer 不符');
}

// 3. ids referenced by JS exist in HTML
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const m of js.matchAll(/\$\('#([a-zA-Z0-9_-]+)'\)/g)) {
  if (!ids.has(m[1])) report(`github-gba.js 引用了不存在的 #${m[1]}`);
}

// 4. classes used by JS selectors exist in CSS
const jsSelectors = [...js.matchAll(/\$\$?\(\s*'([^']+)'/g)].map((m) => m[1]);
const selectorClasses = new Set();
for (const sel of jsSelectors) {
  for (const m of sel.matchAll(/\.([a-z][a-z0-9-]+)/g)) selectorClasses.add(m[1]);
}
for (const cls of selectorClasses) {
  if (!css.includes('.' + cls)) report(`JS 选择器用到 .${cls}，但 CSS 中没有定义`);
}
// classes toggled by classList must also exist in CSS
for (const m of js.matchAll(/classList\.(?:add|toggle|remove)\(\s*'([a-z][a-z0-9-]+)'/g)) {
  if (!css.includes('.' + m[1])) report(`classList 使用 .${m[1]}，但 CSS 中没有定义`);
}

// 5. html tags balance for the containers we care about
for (const tag of ['aside', 'section', 'main', 'footer', 'header', 'nav', 'ul', 'div']) {
  const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
  const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  if (open !== close) report(`<${tag}> 开合不匹配：${open} 开 / ${close} 闭`);
}

// 6. CSS brace balance
const openBraces = (css.match(/\{/g) || []).length;
const closeBraces = (css.match(/\}/g) || []).length;
if (openBraces !== closeBraces) report(`CSS 花括号不平衡：${openBraces}/{${closeBraces}}`);

// 7. referenced local assets exist
import { existsSync } from 'node:fs';
for (const m of html.matchAll(/(?:src|href)="([^"#:]+\.(?:css|js|png|jpg|svg|webp))"/g)) {
  if (!existsSync(m[1])) report(`引用的本地文件不存在：${m[1]}`);
}

console.log(issues ? `\n${issues} issue(s)` : '\n静态检查全部通过');
console.log('sprite 使用情况:', [...new Set(usedSprites)].join(', '));
const unused = Object.keys(grid).filter((n) => !usedSprites.includes(n));
console.log('未被使用的精灵:', unused.join(', ') || '（无）');