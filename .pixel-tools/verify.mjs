// Compares the hand-authored grids against the embedded copy in sprites.js and
// writes a preview sheet so the sprites can be eyeballed in a browser too.
import { readFileSync, writeFileSync } from 'node:fs';
import { GRIDS } from './grids.mjs';
import { PALETTE } from './sprites-src.mjs';
import vm from 'node:vm';

const src = readFileSync('sprites.js', 'utf8');
const sandbox = { globalThis: {}, window: undefined, document: undefined, module: undefined };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'sprites.js' });
const embedded = sandbox.POKE_GRID;

let diffs = 0;
for (const name of Object.keys(GRIDS)) {
  const a = GRIDS[name].join('|');
  const b = (embedded[name] || []).join('|');
  if (a !== b) {
    diffs++;
    console.log(`DIFF ${name}`);
    console.log('  grids.mjs :', a.slice(0, 120));
    console.log('  sprites.js:', b.slice(0, 120));
  }
}
for (const name of Object.keys(embedded)) {
  if (!(name in GRIDS)) console.log('extra in sprites.js:', name);
  const rows = embedded[name];
  const bad = rows.filter((r) => r.length !== rows[0].length || !/^[.\w]+$/.test(r));
  if (bad.length) console.log(`RAGGED/odd ${name}`);
}

// palette agreement
const used = [...new Set(Object.values(embedded).flatMap((r) => r.flatMap((x) => [...x])))].filter((c) => c !== '.');
const missing = used.filter((c) => !(c in sandbox.POKE_PALETTE) || !sandbox.POKE_PALETTE[c]);
const mismatched = used.filter((c) => c in PALETTE && sandbox.POKE_PALETTE[c] !== PALETTE[c]);
if (missing.length) console.log('codes without a colour in sprites.js:', missing.join(''));
if (mismatched.length) console.log('colour mismatch vs authoring palette:', mismatched.join(''));

// preview sheet
const cards = Object.keys(embedded)
  .map((name) => {
    const svg = sandbox.buildSpriteSvg(name);
    const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return `<figure><img src="${uri}" width="140" height="140" style="image-rendering:pixelated"><figcaption>${name} ${embedded[name][0].length}x${embedded[name].length}</figcaption></figure>`;
  })
  .join('\n');
writeFileSync(
  '.pixel-tools/preview.html',
  `<!doctype html><meta charset="utf-8"><title>sprite sheet</title><body style="background:#f6efd8;font:14px sans-serif;display:flex;flex-wrap:wrap;gap:16px">${cards}</body>`,
  'utf8'
);

console.log(diffs === 0 ? 'grids match sprites.js exactly' : `${diffs} sprite(s) out of sync`);
console.log('codes used:', used.join(''));
console.log('preview written to .pixel-tools/preview.html');