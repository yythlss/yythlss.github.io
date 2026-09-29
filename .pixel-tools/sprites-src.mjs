// Pixel sprite generator: describes each character as layered rectangles/ellipses
// plus pixel-level detail overlays, then bakes a character grid that the browser
// turns into an SVG. Build with: node .pixel-tools/build.mjs

export const PALETTE = {
  '.': null,
  // shared
  K: '#26241c', // ink / outline
  W: '#ffffff',
  C: '#a8d8f0', // cool highlight
  // electric mouse
  Y: '#ffd24a', y: '#e3ad24', R: '#ef4b52', B: '#8a5a26',
  // fire lizard
  O: '#f2762a', o: '#c94f16', c: '#ffe2a8', F: '#ff5a1e', f: '#ffc03a', r: '#e5360f',
  // water turtle
  A: '#63bde4', a: '#2f7fa8', S: '#ffd98a', D: '#c88a4c', d: '#8a5a26',
  // grass seed
  G: '#84cf78', g: '#4d9b52', T: '#4fa8a4', t: '#37807e',
  // shadow
  P: '#8a72c8', p: '#5a4694',
  // evolution fox
  E: '#c58a4e', e: '#8e5a2c',
  // trainer
  w: '#f7f7f2', b: '#2f5fb8', n: '#2b3a56', s: '#f4c08a', h: '#43301f',
  // props
  L: '#a86a30', l: '#6f4320', m: '#caa05a', Q: '#5a86b8', q: '#31527a',
  X: '#3f7a45', Z: '#c4a86a', U: '#e8e2d0', u: '#b8b0a0', V: '#d23b3b',
  N: '#f2f2ea', z: '#9aa0a6', H: '#4b6b2f'
};

const hexCache = new Map();

function mixHex(hex, target, amount) {
  const key = `${hex}|${target}|${amount}`;
  if (hexCache.has(key)) return hexCache.get(key);
  const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(target);
  const out =
    '#' +
    [0, 1, 2]
      .map((i) =>
        Math.round([r1, g1, b1][i] + ([r2, g2, b2][i] - [r1, g1, b1][i]) * amount)
          .toString(16)
          .padStart(2, '0')
      )
      .join('');
  hexCache.set(key, out);
  return out;
}

export function blank(w, h) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
}

function inEllipse(x, y, e) {
  const rx = e.w / 2;
  const ry = e.h / 2;
  const cx = e.x + rx - 0.5;
  const cy = e.y + ry - 0.5;
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  if (dx * dx + dy * dy > 1) return false;
  if (e.cut) {
    const c = e.cut;
    return x >= c[0] && x <= c[1] && y >= c[2] && y <= c[3] ? false : true;
  }
  return true;
}

function inRect(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export function fill(g, shape, code) {
  const test = shape.type === 'ellipse' ? inEllipse : inRect;
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[0].length; x++) {
      if (test(x, y, shape)) g[y][x] = code;
    }
  }
  return g;
}

export function paint(g, list, code) {
  for (const [x, y] of list) {
    if (g[y] && g[y][x] !== undefined) g[y][x] = code;
  }
  return g;
}

export function rect(x, y, w, h, extra = {}) {
  return { type: 'rect', x, y, w, h, ...extra };
}

export function ellipse(x, y, w, h, extra = {}) {
  return { type: 'ellipse', x, y, w, h, ...extra };
}

export function mirror(list, w) {
  return [...list, ...list.map(([x, y]) => [w - 1 - x, y])];
}

/** Add a 1px ink outline, shaded auto-outline on light colors, from the outside in. */
export function outline(g, ink = 'K', shade = '#8a7d3f', shadeKeys = ['Y']) {
  const w = g[0].length;
  const h = g.length;
  const next = g.map((row) => row.slice());
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (g[y][x] !== '.') continue;
      let hit = null;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const c = g[ny][nx];
        if (c === '.' || c === ink) continue;
        hit = c;
        break;
      }
      if (hit) next[y][x] = hit === 'W' || hit === 'C' ? ink : shadeKeys.includes(hit) ? '#8a7d3f' : ink;
    }
  }
  return next;
}

export function autoShade(g, keys, darkCode, opts = {}) {
  const w = g[0].length;
  const h = g.length;
  const next = g.map((row) => row.slice());
  const dirs = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1]
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = g[y][x];
      if (!keys.includes(c)) continue;
      if (opts.lowerOnly && y < Math.floor(h / 2)) continue;
      let touch = false;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = g[ny][nx];
        if (n === 'K' || n === '.' || (opts.exclude && opts.exclude.includes(n))) touch = true;
      }
      if (touch) next[y][x] = darkCode;
    }
  }
  return next;
}

export function spots(g, list, code) {
  for (const [x, y, w = 1, h = 1] of list) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (g[yy] && g[yy][xx] !== undefined && g[yy][xx] !== '.' && g[yy][xx] !== 'K') g[yy][xx] = code;
      }
    }
  }
  return g;
}

export function connect(g, pts, code) {
  let [x, y] = pts[0];
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const [tx, ty] = pts[i];
    while (x !== tx || y !== ty) {
      out.push([x, y]);
      if (x !== tx) x += Math.sign(tx - x);
      else if (y !== ty) y += Math.sign(ty - y);
    }
  }
  out.push(pts[pts.length - 1]);
  return paint(g, out, code);
}

export function bake(w, h, layers) {
  let g = blank(w, h);
  for (const item of layers) {
    if (item.raw) {
      g = item.raw(g);
      continue;
    }
    const { shapes = [], code, ink, shade, shadeKeys, after } = item;
    for (const s of shapes) fill(g, s, code);
    if (ink) g = outline(g, ink, shade, shadeKeys);
    if (after) g = after(g);
  }
  return g;
}

export function toRows(g) {
  return g.map((row) => row.join(''));
}

let ansiCache = null;
function ansiPalette() {
  if (ansiCache) return ansiCache;
  ansiCache = {};
  for (const [k, hex] of Object.entries(PALETTE)) {
    if (!hex) {
      ansiCache[k] = '\u001b[0m  ';
      continue;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const gg = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    ansiCache[k] = `\u001b[48;2;${r};${gg};${b}m  `;
  }
  return ansiCache;
}

export function debug(name, rows) {
  const pal = ansiPalette();
  console.log(`\n=== ${name} (${rows[0].length}x${rows.length}) ===`);
  console.log(rows.map((r) => [...r].map((c) => pal[c] ?? '??').join('') + '\u001b[0m').join('\n'));
}

export { mixHex };