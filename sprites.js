/* =====================================================================
   sprites.js — 像素精灵数据与渲染器
   ---------------------------------------------------------------------
   每个字母 = 1 个像素：K 描边，. 透明，其余见 POKE_PALETTE。
   精灵以 SVG 形式渲染（形状锐利、无模糊），通过 data-sprite 挂到页面。
   ===================================================================== */
(function (global) {
  'use strict';

  var POKE_PALETTE = {
    '.': null,
    K: '#26241c', // 描边
    W: '#ffffff',
    C: '#a8d8f0',
    Y: '#ffd24a', y: '#e3ad24', R: '#ef4b52', B: '#8a5a26',
    O: '#f2762a', o: '#c94f16', c: '#ffe2a8', F: '#ff5a1e', f: '#ffc03a', r: '#e5360f',
    A: '#63bde4', a: '#2f7fa8', S: '#ffd98a', D: '#c88a4c', d: '#8a5a26',
    G: '#84cf78', g: '#4d9b52', T: '#4fa8a4', t: '#37807e',
    P: '#8a72c8', p: '#5a4694',
    E: '#c58a4e', e: '#8e5a2c',
    w: '#f7f7f2', b: '#2f5fb8', n: '#2b3a56', s: '#f4c08a', h: '#43301f',
    L: '#a86a30', l: '#6f4320', m: '#caa05a', Q: '#5a86b8', q: '#31527a',
    X: '#3f7a45', Z: '#c4a86a', U: '#e8e2d0', u: '#b8b0a0', V: '#d23b3b',
    N: '#f2f2ea', z: '#9aa0a6', H: '#4b6b2f'
  };

  var POKE_GRID = {
    /* 皮卡丘 */
    pikachu: [
      '.....KK.....KK......',
      '.....KYK...KYK...KK.',
      '.....KYK...KYK..KyK.',
      '.....KYYK.KYYK..KyK.',
      '.....KYYKKKYYK.KyK..',
      '....KKKKKKKKKKKyK...',
      '...KYYYYYYYYYYKK....',
      '...KYKKYYKKYYYK.....',
      '..KYKWYYKWYYYK......',
      '..RKYKKYYKKYYYK.KK..',
      '..RKYYYYYYwYYYK.KyK.',
      '..RKYYYYyyyyYYK.KyK.',
      '...KYYYYyyyyYYKKK...',
      '...KYYYYyyyyYYK.....',
      '...KYYYYYYYYyyK.....',
      '...KYYYYYYYYYYK.....',
      '...KYYYYYYYYYYK.....',
      '...KYYKKYYKKYYK.....',
      '...KKKK..KK..KKKK...',
      '....................'
    ],
    /* 小火龙 */
    charmander: [
      '...................KK.',
      '..................KrrK',
      '........KKKKK.....KrrK',
      '.......KOOOOOK...KKrrK',
      '......KOOOOOOOK.KFFFFK',
      '.....KOOOOOOOOKOKFFFFK',
      '....KOOOOKOOOOOOKffffK',
      '....KOKKOKKOKOKOOK....',
      '....KOKWOKWOKOOOOK....',
      '....KOOOKOOOOKccOK....',
      '.....KOOOOOOOKccOK....',
      '.....KOOOOOOOKccK.....',
      '......KOOOOOOccK......',
      '...KKKKOOOOOccK.......',
      '..KOOOOKOOOcccK.......',
      '..KOOOOKOOOccK........',
      '..KOOOOOKOOOcK........',
      '...KKKK.KOOOOOK.......',
      '........KOOOOK........',
      '........KOOOOOK.......',
      '.........KKKKKK.......',
      '......................'
    ],
    /* 杰尼龟 */
    squirtle: [
      '......................',
      '........KKKKKK........',
      '.......KAAAAAAK.......',
      '......KAAAAAAAAK......',
      '.....KAAAAAAAAAAK.....',
      '.....KAKKAAAKKAAK.....',
      '.....KAKWKAAKWKAAK....',
      '.....KAKKAAAKKAAK.....',
      '....KKKAAAAAAAaK......',
      '...KDDDKAAAAAaaK......',
      '..KDDDDDKAAAaaKK......',
      '..KDDdDDDKAKaaK.......',
      '..KDDdDDDDSKSaaaK...KK',
      '..KDDdDDDDKSKSSaaK.KAa',
      '..KDDDDDDSSKSSSaKKAaK.',
      '..KDDDDDSSSKSSSaKAaK..',
      '..KDDDDDSSKKSSSaKaK...',
      '...KDDDDDSSKSSSaKKK...',
      '....KDDDDKSSSSaKKK....',
      '.....KKKKKSSSSK.......',
      '.........KSSSSK.......',
      '..........KKKK........'
    ],
    /* 妙蛙种子 */
    bulbasaur: [
      '.......KKKKKKK........',
      '....KKKTTTTTTTKKK.....',
      '...KTTTTTTTTTTTTTK....',
      '..KTTTKKTTTTKKTTTTK...',
      '..KTTTttTTTTttTTTKK...',
      '..KTTTTTTTTTTTTTTK....',
      '...KTTTttTTttTTTK.....',
      '....KKTTTTTTTTTK......',
      '......KKKKKKKKK.......',
      '....KKGGGGGGGGKK......',
      '...KGGGGGGGGGGGGK.....',
      '...KGGGKGGKGGGGGK.....',
      '..KGGGGKWGGKWGGGGK....',
      '..KGGGGKGGKGGGGGGK....',
      '..KGGGGGGGGGgGGGGK....',
      '..KGGGGKGGKGGGGGGK....',
      '..KGGGKKGGKKGGGGGK....',
      '..KGGGGGGGGgGGGGGK....',
      '..KGGGGGGGGgGGGGGK....',
      '...KGGGGGGGGGGGK......',
      '...KKGGGGGGGGGKK......',
      '.....KKKKKKKKK........'
    ],
    /* 伊布 */
    eevee: [
      '......................',
      '..KK...........KK.....',
      '.KEEK.........KEEK....',
      '.KEEK........KEEEK....',
      '.KEEKK......KEEEEK....',
      '.KEEEK.....KEEEEEK....',
      '.KEEEEK...KEEEEEEK....',
      '.KEEEEEKKKEEEEEEEK....',
      '.KKEEEEEEEEEEEEEEK....',
      '..KEEEEKKEEKKEEEEK....',
      '..KEEEKKWEKKWEEEEK....',
      '..KEEEEEEEEEEEEeEK....',
      '..KEEEKKKKKEEEEeEK....',
      '..KKECCCCCCCEEEeEK....',
      '.KECCCCCCCCCCEEeEK....',
      '.KECCCCCCCCCCEEeEK....',
      '.KECCCCCCCCCEEEEEK....',
      '.KKCCCCCCCCCEEEEEK....',
      '..KCCCCCCCCCEEEEK.....',
      '..KEEEEEEEEEEEEEK.....',
      '..KEEKKEEKKEEKKKK.....',
      '...KKK..KK..KKK.......'
    ],
    /* 耿鬼 */
    gengar: [
      '......................',
      '.....KK.......KK......',
      '....KPPK.....KPPK.....',
      '....KPPK.....KPPK.....',
      '....KPPPK...KPPPK.....',
      '....KPPPPKKKPPPPK.....',
      '.....KPPPPPPPPPPK.....',
      '....KPPPPPPPPPPPPK....',
      '...KPPKKPPPPKKPPPPK...',
      '...KPPKRKPPKRKPPPPK...',
      '..KPPPKRKPPKRKPPPPPKK.',
      '..KPPPPPPPPPPPPPPPKpK.',
      '..KPPPPKKKKKKKPPPPKKK.',
      '..KPPPKWWWWWWWKPPPPK..',
      '..KPPPKWKWKWKWKPPPPKKK',
      '..KPPPKWWWWWWWKPPPPKpK',
      '..KPPPKPPPPPPPKPPPPKKK',
      '..KPPPPPPPPPPPPPPPK...',
      '..KPPPPPPPPPPPPPPK....',
      '..KPPPPPPPPPPPPPK.....',
      '...KPPKKPPPPKKPPK.....',
      '....KKK..KKK..KKK.....'
    ],
    /* 宝可梦训练家 */
    trainer: [
      '....................',
      '.......KKKKK........',
      '......KVVVVVK.......',
      '.....KWWWWWWVK......',
      '....KKKKKKKKKKK.....',
      '....KhhhhhhhhhK.....',
      '....KhhhhhhhhhK.....',
      '....KsssssssssK.....',
      '....KsKKssKKssK.....',
      '....KsKWssKWssK.....',
      '....KsssssssssK.....',
      '.....KssKKssK.......',
      '...KKKKWWWWKKKK.....',
      '..KWWWKWWWWKWWWK....',
      '..KWWWKWWWWKWWWK....',
      '..KsssKbWWbKsssK....',
      '..KsssKbbbbKsssK....',
      '..KKKKKbbbbKKKKK....',
      '......KnnnnK........',
      '......KnnnnK........',
      '......KnnnnK........',
      '.....KVVnnVVK.......',
      '....KKKKKKKKKK......',
      '....................'
    ],
    /* 训练家（正面行走 / 对话框姿势） */
    trainerFront: [
      '....................',
      '.....KKKKKKKK.......',
      '....KWWWWWWWKK......',
      '....KWWWWWWWKK......',
      '...KKVVVVVVVKK......',
      '...KhhhhhhhhhK......',
      '...KssssssssssK.....',
      '...KsKKssKKsssK.....',
      '...KsKWssKWsssK.....',
      '...KssssssssssK.....',
      '....KssKKKsssK......',
      '.....KssssssK.......',
      '...KKKKWWWWKKKK.....',
      '..KWWWKWnnWKWWWK....',
      '..KWWWKWnnWKWWWK....',
      '..KbbbKWnnWKbbbK....',
      '..KbbbKWnnWKbbbK....',
      '..KbbbKWWWWKbbbK....',
      '..KsssKbbbbKsssK....',
      '..KKKKKbbbbKKKKK....',
      '......KbbbbK........',
      '......KbbbbK........',
      '......KbbbbK........',
      '.....KKnnnnKK.......',
      '....KKKKKKKKKK......',
      '....................'
    ],
    /* 道具 */
    pokeball: [
      '.KKKKKKKKKK.',
      'KCCWWWWWWWWK',
      'KCWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KKKKKKKKKKKK',
      'KKKKKKKKKKKK',
      'KRRRRRRRRRRK',
      'KRRRRRRRRRRK',
      'KRRRRRRRRRRK',
      'KRRRRRRRRRRK',
      '.KKKKKKKKKK.'
    ],
    masterball: [
      '.KKKKKKKKKK.',
      'KCCWWWWWWWWK',
      'KCWWWWWWWWWK',
      'KWWRRRRWWWWK',
      'KWRRPPRRWWWK',
      'KKKKKKKKKKKK',
      'KKKKKKKKKKKK',
      'KPPPPPPPPPPK',
      'KPPPPPPPPPPK',
      'KPPPPPPPPPPK',
      'KPPPPPPPPPPK',
      '.KKKKKKKKKK.'
    ],
    berry: [
      '.....KK.....',
      '....KHHK....',
      '...KHHKHKK..',
      '..KKHHKKVK..',
      '.KRRKKVRRVK.',
      'KRrRRVVRRRVK',
      'KRrRRRRRRRVK',
      'KRRRRRRRRRVK',
      'KCCRRRRRRRVK',
      '.KRRRRRRRRK.',
      '..KRRRRRVK..',
      '...KKKKKK...'
    ],
    bush: [
      '.....KKKK.....',
      '...KKggggKK...',
      '..KgggGGgggK..',
      '.KggGGGgGGggK.',
      'KgGGGGgGGGGGgK',
      'KgGGgGGGGgGGgK',
      'KgGGGGgGGGGGgK',
      '.KgGGGGGGGggK.',
      '..KKggggggKK..',
      '....KKKKKK....'
    ]
  };

  /* --------------------------------------------------------------- SVG 渲染 */
  var svgCache = {};

  function spriteMetrics(name) {
    var grid = POKE_GRID[name];
    return { w: grid[0].length, h: grid.length };
  }

  function buildSpriteSvg(name) {
    var grid = POKE_GRID[name];
    if (!grid) throw new Error('unknown sprite: ' + name);
    var w = grid[0].length;
    var h = grid.length;
    var rects = [];
    for (var y = 0; y < h; y++) {
      var row = grid[y];
      var x = 0;
      while (x < w) {
        var code = row.charAt(x);
        if (code === '.' || !(code in POKE_PALETTE) || !POKE_PALETTE[code]) {
          x++;
          continue;
        }
        var run = 1;
        while (x + run < w && row.charAt(x + run) === code) run++;
        rects.push(
          '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' +
            POKE_PALETTE[code] + '"/>'
        );
        x += run;
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h +
      '" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">' +
      '<g>' + rects.join('') + '</g></svg>'
    );
  }

  function spriteDataUri(name) {
    if (!svgCache[name]) {
      svgCache[name] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(buildSpriteSvg(name));
    }
    return svgCache[name];
  }

  /* --------------------------------------------------------------- 挂载 */
  var sheetInjected = false;

  function ensureSheet() {
    if (sheetInjected || typeof document === 'undefined') return;
    var css = ['.sprite{display:inline-block;background-repeat:no-repeat;' +
      'background-position:center bottom;background-size:100% 100%;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;flex:none;}'];
    Object.keys(POKE_GRID).forEach(function (name) {
      css.push('[data-sprite="' + name + '"]{background-image:url("' + spriteDataUri(name) + '");}');
    });
    var style = document.createElement('style');
    style.id = 'sprite-sheet';
    style.textContent = css.join('');
    document.head.appendChild(style);
    sheetInjected = true;
  }

  /** 把 [data-sprite] 节点填成像素精灵：--sw/--sh 按网格尺寸 × data-scale */
  function mountSprites(root) {
    ensureSheet();
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-sprite]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var name = node.getAttribute('data-sprite');
      if (!name || !POKE_GRID[name]) continue;
      if (node.getAttribute('data-sprite-ready')) continue;
      var m = spriteMetrics(name);
      var scale = parseFloat(node.getAttribute('data-scale') || '1') || 1;
      node.classList.add('sprite');
      node.style.setProperty('--sw', m.w * scale);
      node.style.setProperty('--sh', m.h * scale);
      node.setAttribute('data-sprite-ready', '1');
    }
  }

  global.POKE_GRID = POKE_GRID;
  global.POKE_PALETTE = POKE_PALETTE;
  global.buildSpriteSvg = buildSpriteSvg;
  global.spriteDataUri = spriteDataUri;
  global.spriteMetrics = spriteMetrics;
  global.mountSprites = mountSprites;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      POKE_GRID: POKE_GRID,
      POKE_PALETTE: POKE_PALETTE,
      buildSpriteSvg: buildSpriteSvg,
      spriteDataUri: spriteDataUri,
      spriteMetrics: spriteMetrics
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);