import {
  PALETTE,
  bake,
  debug,
  ellipse,
  fill,
  mirror,
  paint,
  rect,
  spots,
  toRows
} from './sprites-src.mjs';

const S = {};

/* ------------------------------------------------------------------ 皮卡丘 */
S.pikachu = bake(20, 20, [
  {
    code: 'Y',
    shapes: [
      rect(5, 5, 3, 8), // left ear
      rect(12, 5, 3, 8), // right ear
      ellipse(5, 6, 11, 10), // head
      rect(7, 13, 2, 6), // left arm
      rect(12, 13, 2, 6), // right arm
      ellipse(4, 14, 13, 7), // body
      rect(4, 17, 3, 3), // left foot
      rect(14, 17, 3, 3), // right foot
      rect(17, 10, 2, 2), // tail
      rect(16, 13, 2, 2),
      rect(18, 8, 2, 2),
      rect(17, 14, 1, 1)
    ],
    after: (g) =>
      paint(g, [
        [5, 5], [6, 5], [7, 5], [12, 5], [13, 5], [14, 5],
        [5, 5], [12, 6], [14, 6], [5, 6]
      ], 'K')
  },
  { code: 'K', shapes: [rect(12, 5, 1, 1), rect(5, 5, 1, 1)] },
  { code: 'y', shapes: [rect(19, 9, 1, 1), rect(17, 11, 1, 1), rect(16, 12, 1, 1)] },
  {
    code: 'R',
    shapes: [rect(4, 10, 2, 2), rect(14, 10, 2, 2)]
  },
  {
    code: 'K',
    shapes: [
      rect(6, 8, 2, 3), rect(12, 8, 2, 3), // eyes
      rect(8, 12, 4, 1), rect(9, 12, 2, 1), // mouth
      rect(7, 12, 1, 1), rect(12, 12, 1, 1)
    ]
  },
  { code: 'W', shapes: [rect(6, 8, 1, 1), rect(12, 8, 1, 1)] }
]);

/* ------------------------------------------------------------------ 小火龙 */
S.charmander = bake(22, 22, [
  {
    code: 'O',
    shapes: [
      rect(7, 8, 2, 6), // left arm
      rect(14, 9, 2, 5), // right arm
      ellipse(3, 11, 8, 8), // body
      ellipse(5, 2, 12, 10), // head
      rect(3, 14, 3, 4), // legs
      rect(15, 14, 3, 4),
      rect(16, 6, 2, 3), // tail root
      rect(17, 4, 3, 3), // tail
      rect(19, 2, 2, 4)
    ]
  },
  { code: 'c', shapes: [ellipse(2, 12, 6, 6), rect(6, 10, 2, 4)] },
  { code: 'o', shapes: [rect(15, 7, 2, 3), rect(18, 6, 2, 2), rect(16, 16, 2, 1), rect(4, 16, 2, 1)] },
  { code: 'F', shapes: [rect(19, 0, 3, 4), rect(18, 2, 1, 2), rect(18, 1, 1, 1)] },
  { code: 'f', shapes: [rect(19, 1, 2, 2)] },
  { code: 'K', shapes: [rect(6, 6, 2, 3), rect(13, 6, 2, 3), rect(7, 6, 1, 1), rect(14, 6, 1, 1), rect(8, 10, 4, 1), rect(11, 11, 1, 1)] },
  { code: 'W', shapes: [rect(8, 8, 1, 1), rect(15, 8, 1, 1)] },
  { code: 'c', shapes: [rect(9, 12, 3, 1)] }
]);

/* ------------------------------------------------------------------ 杰尼龟 */
S.squirtle = bake(22, 22, [
  {
    code: 'A',
    shapes: [
      rect(7, 8, 2, 6),
      rect(15, 9, 2, 6),
      ellipse(4, 12, 9, 8), // body
      ellipse(5, 2, 12, 10), // head
      rect(4, 16, 3, 3),
      rect(15, 16, 3, 3),
      rect(18, 9, 3, 5) // tail
    ]
  },
  {
    code: 'D',
    shapes: [ellipse(2, 9, 13, 12, { cut: [11, 21, 0, 21] })]
  },
  { code: 'd', shapes: [rect(3, 9, 5, 1), rect(2, 14, 8, 1), rect(8, 10, 1, 5)] },
  { code: 'S', shapes: [ellipse(6, 13, 6, 5), rect(8, 12, 3, 2), rect(9, 17, 3, 1)] },
  { code: 'K', shapes: [rect(6, 6, 2, 3), rect(13, 6, 2, 3), rect(8, 10, 4, 1), rect(10, 11, 1, 1)] },
  { code: 'W', shapes: [rect(7, 7, 1, 1), rect(14, 7, 1, 1)] },
  { code: 'S', shapes: [rect(8, 12, 4, 1)] }
]);

/* ------------------------------------------------------------------ 妙蛙种子 */
S.bulbasaur = bake(22, 22, [
  { code: 'T', shapes: [ellipse(4, 2, 13, 8)] },
  { code: 't', shapes: [rect(4, 8, 13, 1), rect(15, 3, 2, 5)] },
  {
    code: 'G',
    shapes: [
      rect(6, 10, 2, 4),
      ellipse(3, 12, 12, 9), // body
      ellipse(9, 3, 9, 8), // head
      rect(6, 13, 2, 5),
      rect(13, 13, 2, 5)
    ]
  },
  { code: 'g', shapes: [ellipse(20, 5, 2, 4), ellipse(3, 4, 2, 3)] },
  { code: 'g', shapes: [spots([], []), rect(11, 5, 1, 1), rect(15, 6, 1, 1), rect(6, 8, 1, 1)] },
  { code: 'g', shapes: [rect(5, 15, 2, 1), rect(14, 15, 2, 1)] },
  { code: 'V', shapes: [rect(8, 6, 2, 2), rect(15, 6, 2, 2)] },
  { code: 'K', shapes: [rect(9, 4, 1, 1), rect(15, 4, 1, 1), rect(9, 9, 5, 1), rect(11, 10, 1, 1)] },
  { code: 'W', shapes: [rect(8, 5, 1, 1), rect(15, 5, 1, 1)] }
]);

/* ------------------------------------------------------------------ 伊布 */
S.eevee = bake(22, 22, [
  {
    code: 'E',
    shapes: [
      rect(6, 2, 3, 22 * 0 + 7),
      rect(14, 1, 3, 8),
      ellipse(5, 8, 13, 9), // head
      rect(8, 11, 2, 7),
      ellipse(5, 14, 13, 8), // body
      rect(4, 15, 3, 4),
      rect(15, 15, 3, 4),
      rect(16, 13, 4, 3),
      rect(18, 11, 3, 3)
    ]
  },
  { code: 'e', shapes: [rect(2, 14, 3, 4), rect(19, 12, 2, 2)] },
  { code: 'C', shapes: [ellipse(7, 14, 8, 6), rect(9, 10, 4, 2)] },
  { code: 'K', shapes: [rect(7, 9, 2, 3), rect(13, 9, 2, 3), rect(9, 13, 4, 1), rect(9, 14, 1, 1)] },
  { code: 'W', shapes: [rect(8, 11, 1, 2), rect(14, 11, 1, 2)] },
  { code: 'C', shapes: [rect(10, 13, 2, 1)] }
]);

/* ------------------------------------------------------------------ 耿鬼 */
S.gengar = bake(22, 22, [
  {
    code: 'P',
    shapes: [
      rect(5, 1, 4, 6),
      rect(13, 1, 4, 6),
      ellipse(5, 5, 12, 10), // head
      rect(3, 9, 2, 5),
      rect(17, 9, 2, 5),
      ellipse(4, 13, 14, 8), // body
      rect(5, 17, 3, 3),
      rect(14, 17, 3, 3),
      rect(2, 14, 2, 3),
      rect(18, 14, 2, 3)
    ]
  },
  { code: 'p', shapes: [rect(18, 14, 2, 3), rect(2, 14, 2, 3), rect(16, 19, 1, 1), rect(6, 19, 1, 1)] },
  { code: 'R', shapes: [rect(7, 8, 3, 3), rect(12, 8, 3, 3)] },
  { code: 'W', shapes: [rect(7, 8, 1, 1), rect(12, 8, 1, 1)] },
  { code: 'K', shapes: [rect(7, 12, 8, 1)] },
  { code: 'W', shapes: [rect(7, 13, 8, 2), rect(6, 13, 1, 1), rect(15, 13, 1, 1)] },
  { code: 'K', shapes: [rect(8, 13, 1, 2), rect(10, 13, 1, 2), rect(12, 13, 1, 2), rect(14, 13, 1, 2)] }
]);

/* ------------------------------------------------------------------ 训练家 */
S.trainer = bake(20, 24, [
  { code: 'n', shapes: [rect(6, 2, 8, 4)] },
  { code: 'V', shapes: [ellipse(7, 0, 7, 5), rect(6, 4, 8, 1)] },
  { code: 'W', shapes: [ellipse(7, 0, 7, 4)] },
  { code: 'h', shapes: [ellipse(5, 3, 10, 6)] },
  { code: 's', shapes: [ellipse(5, 4, 10, 7)] },
  { code: 'K', shapes: [rect(7, 7, 2, 2), rect(12, 7, 2, 2), rect(9, 10, 3, 1)] },
  { code: 'W', shapes: [rect(8, 8, 1, 1), rect(13, 8, 1, 1)] },
  { code: 'W', shapes: [ellipse(4, 11, 12, 8), rect(3, 12, 1, 4), rect(16, 12, 1, 4)] },
  { code: 'b', shapes: [rect(4, 12, 3, 6), rect(13, 12, 3, 6), rect(8, 12, 4, 2)] },
  { code: 's', shapes: [rect(2, 14, 2, 4), rect(16, 14, 2, 4)] },
  { code: 'n', shapes: [rect(6, 18, 3, 3), rect(11, 18, 3, 3)] },
  { code: 'K', shapes: [rect(5, 21, 5, 2), rect(10, 21, 5, 2)] },
  { code: 'V', shapes: [rect(6, 19, 3, 1)] }
]);

/* ------------------------------------------------------------------ 道具 */
S.pokeball = bake(12, 12, [
  { code: 'W', shapes: [ellipse(0, 0, 12, 12)] },
  { code: 'K', shapes: [rect(0, 0, 12, 1), rect(0, 11, 12, 1), rect(0, 1, 1, 10), rect(11, 1, 1, 10)] },
  { code: 'V', shapes: [ellipse(0, 0, 12, 12, { cut: [0, 12, 6, 12] })] },
  { code: 'K', shapes: [rect(1, 5, 10, 2)] },
  { code: 'W', shapes: [rect(4, 4, 4, 4)] },
  { code: 'K', shapes: [rect(5, 5, 2, 2)] },
  { code: 'C', shapes: [rect(2, 2, 2, 2), rect(2, 3, 1, 1)] }
]);

S.masterball = bake(12, 12, [
  { code: 'W', shapes: [ellipse(0, 0, 12, 12)] },
  { code: 'K', shapes: [rect(0, 0, 12, 1), rect(0, 11, 12, 1), rect(0, 1, 1, 10), rect(11, 1, 1, 10)] },
  { code: 'P', shapes: [ellipse(0, 0, 12, 12, { cut: [0, 12, 6, 12] })] },
  { code: 'R', shapes: [rect(1, 2, 3, 2), rect(5, 1, 2, 2), rect(8, 3, 3, 2)] },
  { code: 'K', shapes: [rect(1, 5, 10, 2)] },
  { code: 'W', shapes: [rect(4, 4, 4, 4)] },
  { code: 'K', shapes: [rect(5, 5, 2, 2)] },
  { code: 'C', shapes: [rect(2, 2, 2, 1)] }
]);

S.berry = bake(12, 12, [
  { code: 'H', shapes: [rect(5, 0, 2, 3), rect(7, 1, 3, 1)] },
  { code: 'V', shapes: [ellipse(1, 3, 10, 9)] },
  { code: 'r', shapes: [ellipse(3, 6, 7, 5)] },
  { code: 'C', shapes: [rect(3, 4, 2, 2)] }
]);

export const SPRITE_ROWS = Object.fromEntries(Object.entries(S).map(([k, v]) => [k, toRows(v)]));

if (process.argv[1] && process.argv[1].endsWith('build.mjs')) {
  for (const [name, rows] of Object.entries(SPRITE_ROWS)) debug(name, rows);
  const used = new Set(Object.values(SPRITE_ROWS).flatMap((rows) => rows.flatMap((r) => [...r])));
  console.log('\nused codes:', [...used].filter((c) => c !== '.').sort().join(''));
  console.log('unused palette:', Object.keys(PALETTE).filter((c) => c !== '.' && !used.has(c)).join(''));
}

export default SPRITE_ROWS;