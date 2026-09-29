import { GRIDS } from './grids.mjs';
import { PALETTE } from './sprites-src.mjs';
import { writeFileSync } from 'node:fs';

const lines = [];
let problems = 0;
for (const [name, rows] of Object.entries(GRIDS)) {
  const width = rows[0].length;
  const ragged = rows.map((r, i) => [i, r.length]).filter(([, l]) => l !== width);
  if (ragged.length) {
    problems++;
    lines.push(`!! ${name}: expected width ${width}; ragged rows -> ${ragged.map(([i, l]) => `${i}:${l}`).join(', ')}`);
  }
  lines.push(`${name} ${width}x${rows.length}`);
  lines.push(rows.map((r, i) => String(i).padStart(2) + '|' + r).join('\n'));
  lines.push('');
}
const used = [...new Set(Object.values(GRIDS).flatMap((r) => r.flatMap((x) => [...x])))].sort();
lines.push('codes used: ' + used.filter((c) => c !== '.').join(''));
lines.push('not in palette: ' + used.filter((c) => !(c in PALETTE)).join(',') );
const counted = {};
for (const rows of Object.values(GRIDS))
  for (const r of rows) for (const c of r) counted[c] = (counted[c] || 0) + 1;
lines.push('counts: ' + Object.entries(counted).map(([k, v]) => `${k}=${v}`).join(' '));
writeFileSync('.pixel-tools/dump.txt', lines.join('\n'), 'utf8');
console.log(problems ? `PROBLEMS: ${problems}` : 'all grids rectangular');