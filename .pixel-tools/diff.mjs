import { readFileSync } from 'node:fs';
import { GRIDS } from './grids.mjs';
import vm from 'node:vm';

const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync('sprites.js', 'utf8'), sandbox, { filename: 'sprites.js' });

for (const name of ['pikachu', 'bulbasaur', 'charmander']) {
  const a = GRIDS[name];
  const b = sandbox.POKE_GRID[name];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? '<missing>';
    const y = b[i] ?? '<missing>';
    if (x !== y) console.log(`${name} row ${i}\n  author: ${x}\n  embed : ${y}`);
  }
}