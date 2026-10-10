/* =====================================================================
   sprites.js — 星露谷真实素材切片渲染器
   ---------------------------------------------------------------------
   素材来自本机《星露谷物语》安装包解包出的 PNG 图集。
   关键修正：人物图均为“立绘/头像”图集（每帧 64x64），
   不再当作 16x32 身体精灵去切，避免“脸被切掉一半”。
   每个精灵 = 图集内的一个源矩形，通过 background-position 切片显示，
   data-scale 控制整数倍放大，保持像素锐利。
   ===================================================================== */
(function (global) {
  'use strict';

  /* --------------------------------------------------------- 图集清单 */
  var SHEETS = {
    /* 玩家与村民立绘（每个文件都是 2 列 64x64 表情图集） */
    portraitFarmer: { url: 'stardew/assets/portrait-farmer.png',      w: 64,  h: 64 },
    robin:        { url: 'stardew/assets/Robin.png',                w: 128, h: 256 },
    clint:        { url: 'stardew/assets/Clint.png',                w: 128, h: 256 },
    pierre:       { url: 'stardew/assets/Pierre.png',               w: 128, h: 192 },
    harvey:       { url: 'stardew/assets/Harvey.png',               w: 128, h: 384 },
    wizard:       { url: 'stardew/assets/Wizard.png',               w: 128, h: 64 },
    lewis:        { url: 'stardew/assets/Lewis.png',                w: 128, h: 192 },
    maru:         { url: 'stardew/assets/Maru.png',                 w: 128, h: 320 },
    caroline:     { url: 'stardew/assets/Caroline.png',             w: 128, h: 128 },
    penny:        { url: 'stardew/assets/Penny.png',                w: 128, h: 448 },
    abigail:      { url: 'stardew/assets/Abigail.png',              w: 128, h: 320 },

    /* 玩家身体精灵图集 */
    farmer:       { url: 'stardew/assets/farmer_base.png',          w: 288, h: 672 },

    /* 作物与物品图集 */
    crops:        { url: 'stardew/assets/crops.png',                w: 256, h: 1024 },

    /* 小动物与祝尼魔 */
    junimo:       { url: 'stardew/assets/Junimo.png',               w: 128, h: 128 },
    cow:          { url: 'stardew/assets/Brown Cow.png',            w: 128, h: 160 },
    chicken:      { url: 'stardew/assets/White Chicken.png',        w: 64,  h: 112 }
  };

  /* 作物切片：坐标必须落在图集里「单个精灵的连通域边界」上。
     早期版本用的是未对齐瓦片的 16x32 估算区域，切出来是跨精灵的碎片（图标显示不全）。
     现在每个作物的 x/y/w/h 都由连通域分析实测得出，保证精灵完整不被裁切。 */
  function crop(x, y, w, h) { return { s: 'crops', x: x, y: y, w: w || 16, h: h || 32 }; }
  function portrait(sheet) { return { s: sheet, x: 0, y: 0, w: 64, h: 64 }; }

  /* --------------------------------------------------------- 精灵切片 */
  var ATOMS = {
    /* 玩家立绘与全身 */
    portraitFarmer: { s: 'portraitFarmer', x: 0, y: 0, w: 64, h: 64 },
    bFarmer:       { s: 'portraitFarmer', x: 0, y: 0, w: 64, h: 64 },
    farmer:       { s: 'farmer',         x: 0, y: 0, w: 16, h: 32 },
    vFarmer:      { s: 'farmer',         x: 0, y: 0, w: 16, h: 32 },
    faceFarmer:   { s: 'farmer',         x: 0, y: 0, w: 16, h: 16 },

    /* 村民立绘（第一帧 = 正面微笑/中性表情） */
    bRobin:       portrait('robin'),
    bClint:       portrait('clint'),
    bPierre:      portrait('pierre'),
    bHarvey:      portrait('harvey'),
    bWizard:      portrait('wizard'),
    bLewis:       portrait('lewis'),
    bMaru:        portrait('maru'),
    bPenny:       portrait('penny'),
    bCaroline:    portrait('caroline'),
    bAbigail:     portrait('abigail'),
    robin:        portrait('robin'),
    clint:        portrait('clint'),
    pierre:       portrait('pierre'),
    harvey:       portrait('harvey'),
    wizard:       portrait('wizard'),
    lewis:        portrait('lewis'),
    maru:         portrait('maru'),
    penny:        portrait('penny'),
    caroline:     portrait('caroline'),
    abigail:      portrait('abigail'),

    /* 作物：矩形 = 连通域实测边界（x, y, w, h），均为完整单株，不会裁切 */
    parsnip:     crop(96, 48, 16, 15),
    cauliflower: crop(98, 135, 13, 22),
    pumpkin:     crop(96, 299, 16, 18),
    corn:        crop(82, 480, 13, 27),
    blueberry:   crop(129, 580, 15, 28),
    melon:       crop(65, 747, 14, 19),
    hotpepper:   crop(224, 641, 16, 27),
    starfruit:   crop(225, 676, 14, 26),
    eggplant:    crop(209, 711, 15, 25),
    strawberry:  crop(81, 743, 15, 25),
    sunflower:   crop(225, 808, 15, 21),
    wheat:       crop(225, 105, 15, 20),

    /* 小动物与祝尼魔 */
    chicken:  { s: 'chicken', x: 0, y: 0, w: 16, h: 16 },
    junimo:   { s: 'junimo',  x: 0, y: 0, w: 16, h: 16 },
    cow:      { s: 'cow',     x: 0, y: 0, w: 32, h: 32 },

    /* 兼容旧命名的别名（同样使用实测边界） */
    chip:        crop(82, 480, 13, 27),
    bolt:        crop(224, 641, 16, 27),
    sign:        crop(225, 808, 15, 21),
    chest:       crop(96, 299, 16, 18),
    wateringcan: crop(96, 48, 16, 15),
    berry:       crop(96, 48, 16, 15),
    pokeball:    { s: 'junimo', x: 0, y: 0, w: 16, h: 16 },
    masterball:  { s: 'junimo', x: 0, y: 0, w: 16, h: 16 },
    bush:        crop(224, 228),
    trainer:     { s: 'farmer', x: 0, y: 0, w: 16, h: 32 },
    trainerFront: { s: 'farmer', x: 0, y: 0, w: 16, h: 32 }
  };

  /* --------------------------------------------------------- 渲染 */
  var sheetInjected = false;

  function ensureSheet() {
    if (sheetInjected || typeof document === 'undefined') return;
    var css = '.sprite{display:inline-block;background-repeat:no-repeat;' +
      'background-position:center bottom;image-rendering:pixelated;' +
      'image-rendering:crisp-edges;flex:none;}'; 
    var style = document.createElement('style');
    style.id = 'sprite-sheet';
    style.textContent = css;
    document.head.appendChild(style);
    sheetInjected = true;
  }

  function applyAtom(node, atom, scale) {
    var sheet = SHEETS[atom.s];
    if (!sheet) return;
    node.classList.add('sprite');
    node.style.width = (atom.w * scale) + 'px';
    node.style.height = (atom.h * scale) + 'px';
    node.style.backgroundImage = 'url("' + sheet.url + '")';
    node.style.backgroundRepeat = 'no-repeat';
    node.style.backgroundPosition = (-atom.x * scale) + 'px ' + (-atom.y * scale) + 'px';
    node.style.backgroundSize = (sheet.w * scale) + 'px ' + (sheet.h * scale) + 'px';
  }

  /** 把 [data-sprite] 节点填成图集切片 */
  function mountSprites(root) {
    ensureSheet();
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-sprite]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var name = node.getAttribute('data-sprite');
      if (!name || !ATOMS[name]) continue;
      if (node.getAttribute('data-sprite-ready')) continue;
      var scale = parseFloat(node.getAttribute('data-scale') || '1') || 1;
      applyAtom(node, ATOMS[name], scale);
      node.setAttribute('data-sprite-ready', '1');
    }
  }

  /** 动态替换单个节点的精灵（renderRepo 用） */
  function applySprite(node, name, scale) {
    var atom = ATOMS[name];
    if (!atom || !node) return false;
    ensureSheet();
    applyAtom(node, atom, scale || 1);
    node.setAttribute('data-sprite', name);
    node.setAttribute('data-sprite-ready', '1');
    return true;
  }

  function spriteMetrics(name) {
    var atom = ATOMS[name];
    if (!atom) return { w: 16, h: 16 };
    return { w: atom.w, h: atom.h };
  }

  function spriteDataUri(name) {
    var atom = ATOMS[name];
    return atom ? SHEETS[atom.s].url : '';
  }

  /* --------------------------------------------------------- 导出 */
  global.SDV_SHEETS = SHEETS;
  global.SDV_ATOMS = ATOMS;
  global.spriteMetrics = spriteMetrics;
  global.spriteDataUri = spriteDataUri;
  global.mountSprites = mountSprites;
  global.applySprite = applySprite;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      SHEETS: SHEETS,
      ATOMS: ATOMS,
      spriteMetrics: spriteMetrics,
      mountSprites: mountSprites,
      applySprite: applySprite
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
