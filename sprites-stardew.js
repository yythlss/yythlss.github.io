/* =====================================================================
   sprites-stardew.js — 星露谷风格像素图标（在 sprites.js 之后加载）
   ---------------------------------------------------------------------
   作物 / 动物 / 祝尼魔 / 农夫 / 木箱 / 木牌 / 芯片……
   沿用 sprites.js 的网格渲染器：每个字母 = 1 像素，K 描边，. 透明。
   旧精灵名（pikachu / squirtle …）通过 ALIAS 映射到新图标，
   这样历史代码里的 data-sprite 引用无需逐一改动也能自动换皮。
   ===================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------ 网格定义 */
  var FARM_GRID = {
    /* 防风草（新手作物） */
    parsnip: [
      '................',
      '.......KK.......',
      '......KgGK......',
      '...KKKgGGgKKK...',
      '..KggKGGGGKggK..',
      '...KKKGGGGKKK...',
      '......KGGK......',
      '.....KUCCUK.....',
      '.....KUUUUK.....',
      '.....KUUUUK.....',
      '......KUUUK.....',
      '......KUUUK.....',
      '.......KUK......',
      '.......KUK......',
      '........KK......',
      '................'
    ],
    /* 花椰菜 */
    cauliflower: [
      '................',
      '.....KKKKKK.....',
      '...KKWWWWWWKK...',
      '..KWWWWWWWWWWK..',
      '.KWWWWWWWWWWWWK.',
      '.KWWKWWWWWWKWWK.',
      '.KWWKWWWWWWKWWK.',
      '.KWWWWWWWWWWWWK.',
      '.KWWWWKWWKWWWWK.',
      '..KWWWWWWWWWWK..',
      '...KKWWWWWWKK...',
      '.....KggggK.....',
      '...KggGGGGggK...',
      '..KggGGGGGGggK..',
      '...KKKGGGGKKK...',
      '................'
    ],
    /* 南瓜 */
    pumpkin: [
      '................',
      '.......KH.......',
      '......KHHK......',
      '...KKOOOOOOKK...',
      '..KOOOOOOOOOOK..',
      '.KOOoOOOOOOoOOK.',
      'KOOoOOOOOOOOoOOK',
      'KOOoOOOOOOOOoOOK',
      'KOOoOOOOOOOOoOOK',
      'KOOoOOOOOOOOoOOK',
      '.KOOoOOOOOOoOOK.',
      '..KOOOOOOOOOOK..',
      '...KKOOOOOOKK...',
      '.....KKKKKK.....',
      '................',
      '................'
    ],
    /* 玉米 */
    corn: [
      '................',
      '.......KY.......',
      '......KYYK......',
      '.....KYYYYK.....',
      '....KYYYYYYK....',
      '...KYYYYYYYYK...',
      '...KYYYYYYYYK...',
      '...KYyYYyYYYK...',
      '...KYYYYYYYYK...',
      '...KYyYYyYYYK...',
      '...KYYYYYYYYK...',
      '...KYyYYyYYYK...',
      '...KYYYYYYYYK...',
      '....KYYYYYYK....',
      '.....KKKKKK.....',
      '................'
    ],
    /* 草莓 */
    strawberry: [
      '................',
      '.....KKKKKK.....',
      '....KggGGggK....',
      '...KgGGGGGGgK...',
      '...KKRRRRRRKK...',
      '..KRRRRRRRRRRK..',
      '.KRRWRRRRWRRRRK.',
      '.KRRRRRRRRRRRRK.',
      '.KRWRRRRRRRWRRK.',
      '.KRRRRRRRRRRRRK.',
      '..KRRRWRRRRRRK..',
      '..KRRRRRRRRRRK..',
      '...KRRRRRRRRK...',
      '....KRRRRRRK....',
      '.....KKKKKK.....',
      '................'
    ],
    /* 蓝莓 */
    blueberry: [
      '................',
      '.......KK.......',
      '......KqqK......',
      '.....KQqqQK.....',
      '...KKQQQQQQKK...',
      '..KQQQQQQQQQQK..',
      '.KQQWQQQQQQQQK..',
      'KQQQQQQQQQQQQQQK',
      'KQqqQQQQQQQQqqQK',
      'KQqqQQQQQQQQqqQK',
      '.KQQQQQQQQQQQQK.',
      '..KQQQQQQQQQQK..',
      '...KKQQQQQQKK...',
      '.....KKKKKK.....',
      '................',
      '................'
    ],
    /* 甜瓜 */
    melon: [
      '................',
      '........KK......',
      '......KKggK.....',
      '....KKggGGgKK...',
      '..KKggGGGGggKK..',
      '.KggGGGGGGGGggK.',
      'KggGGgGGGGgGGggK',
      'KgGGgGGGGGGgGGgK',
      'KgGGgGGGGGGgGGgK',
      'KggGGgGGGGgGGggK',
      '.KggGGGGGGGGggK.',
      '..KKggGGGGggKK..',
      '...KKggGGggKK...',
      '.....KKKKKK.....',
      '................',
      '................'
    ],
    /* 辣椒 */
    hotpepper: [
      '................',
      '.......KH.......',
      '......KHHK......',
      '.....KHHgK......',
      '....KKRRVK......',
      '...KRRRRVK......',
      '...KRRRRVVK.....',
      '..KRRRRRVVK.....',
      '..KRRRRRVVK.....',
      '...KRRRRVVK.....',
      '...KRRRRVK......',
      '....KRRVK.......',
      '.....KRVK.......',
      '......KVK.......',
      '.......KK.......',
      '................'
    ],
    /* 星之果实（明星作物） */
    starfruit: [
      '................',
      '.......KY.......',
      '......KYYK......',
      '......KYYK......',
      '...KKKYYYYKKK...',
      'KKYYYYYYYYYYYYKK',
      'KYYYYYYYYYYYYYYK',
      '.KYYyYYYYYYyYYK.',
      '..KYYYYYYYYYYK..',
      '...KYYYYYYYYK...',
      '...KYYyYYyYYK...',
      '..KYYYYYYYYYYK..',
      '..KYKYYYYYYKYK..',
      '.KYK..KYYK..KYK.',
      '.KK....KK....KK.',
      '................'
    ],
    /* 茄子 */
    eggplant: [
      '................',
      '.......KK.......',
      '.....KggGK......',
      '....KgggGK......',
      '...KKKKKKKK.....',
      '..KPPPPPPPPK....',
      '.KPPPPPPPPPPK...',
      '.KPPPPPPPPPPPK..',
      '.KPPPPPPPPPPPK..',
      '.KPPPPPPPPPPPK..',
      '.KPPPPPPPPPPK...',
      '..KPPPPPPPPK....',
      '...KKPPPPKK.....',
      '......KK........',
      '................',
      '................'
    ],
    /* 向日葵 */
    sunflower: [
      '................',
      '......KYYK......',
      '..KY.KYYYYK.YK..',
      '..KYYKYYYYKYYK..',
      '.KYYYYhhhhYYYYK.',
      '.KYYYhhhhhhYYYK.',
      '..KYYhhhhhhYYK..',
      '..KYYYhhhhYYYK..',
      '.KYYYYhhhhYYYYK.',
      '.KYYYhhhhhhYYYK.',
      '..KYYYYYYYYYYK..',
      '.....KHHK.......',
      '.....KHHK.......',
      '.....KHHK..KgK..',
      '.....KHHK.KggK..',
      '......KK........'
    ],
    /* 鸡 */
    chicken: [
      '................',
      '................',
      '.......KK.......',
      '......KVVK......',
      '.....KWWWWK.....',
      '.....KWKWWK.....',
      '.....KWWfK......',
      '...KWWWWWWK.....',
      '..KWWWWWWWWK....',
      '..KWWWWWWWWWK...',
      '..KWWWWWWWWWK...',
      '..KWWWWWWWWK....',
      '...KWWWWWWK.....',
      '....KKKKKK......',
      '.....KfK.KfK....',
      '................'
    ],
    /* 祝尼魔（星露谷的小精灵） */
    junimo: [
      '................',
      '................',
      '.....KKKKKK.....',
      '...KKggggggKK...',
      '..KggggggggggK..',
      '..KgGggggggGgK..',
      '.KgggWWggWWgggK.',
      '.KgggWKggKWgggK.',
      '.KgggggWWgggggK.',
      '.KggggggggggggK.',
      '.KXggggggggggXK.',
      '..KXggggggggXK..',
      '...KKgggggggKK..',
      '.....KKKKKKK....',
      '......KK..KK....',
      '................'
    ],
    /* 木箱 */
    chest: [
      '................',
      '................',
      '..KKKKKKKKKKKK..',
      '..KmmmmmmmmmmK..',
      '..KmllllllllmK..',
      '..KmllllllllmK..',
      '..KmmmmmmmmmmK..',
      '..KKYYYYYYYYKK..',
      '..KmlllYYlllmK..',
      '..KmllllllllmK..',
      '..KmmmmmmmmmmK..',
      '..KKKKKKKKKKKK..',
      '................',
      '................',
      '................',
      '................'
    ],
    /* 木牌 */
    sign: [
      '................',
      '................',
      '...KKKKKKKKKK...',
      '..KmmmmmmmmmmK..',
      '..KmhhhhhhhhmmK.',
      '..KmKKKKKKKKmK..',
      '..KmhhhhhhhhKm..',
      '..KmKKKKKKKKmK..',
      '..KmmmmmmmmmmK..',
      '...KKKKKKKKKK...',
      '.......KlK......',
      '.......KlK......',
      '.......KlK......',
      '.......KlK......',
      '......KKlKK.....',
      '................'
    ],
    /* 芯片 / 电路板 */
    chip: [
      '................',
      '................',
      '...KKKKKKKKKK...',
      '..KXXXXXXXXXXK..',
      'KYKXXXXXXXXXXKYK',
      'KYKXXzzzzzzXXKYK',
      '...KXzzzzzzXK...',
      'KYKXXzzzzzzXXKYK',
      'KYKXXzzzzzzXXKYK',
      '...KXzzzzzzXK...',
      'KYKXXzzzzzzXXKYK',
      'KYKXXzzzzzzXXKYK',
      '...KXXXXXXXXXXK.',
      '...KKKKKKKKKK...',
      '................',
      '................'
    ],
    /* 电流 / 电路 */
    bolt: [
      '................',
      '........KY......',
      '.......KYYK.....',
      '......KYYK......',
      '.....KYYK.......',
      '....KYYYKKKK....',
      '...KYYYYYYYK....',
      '.....KKYYYYK....',
      '........KYYYK...',
      '.......KYYK.....',
      '......KYYK......',
      '.....KYYK.......',
      '....KYYK........',
      '....KYK.........',
      '....KK..........',
      '................'
    ],
    /* 洒水壶 */
    wateringcan: [
      '................',
      '................',
      '.........KKKK...',
      '........KzzzzK..',
      '.....KKKKzzzzK..',
      '...KKzzzzzzzzK..',
      '..KzzzzzzzzzzK..',
      '..KzzzzzzzzzzK..',
      '..KzzzzzzzzzzKK.',
      '..KzzzzzzzzzzKzK',
      '..KKzzzzzzzzKKzK',
      '...KKKKKKKKKK.zK',
      '..............zK',
      '..............KK',
      '................',
      '................'
    ],
    /* 农夫（星露谷主角，戴草帽） */
    farmer: [
      '....................',
      '....................',
      '.......KKKKKK.......',
      '.....KKmmmmmmKK.....',
      '....KmmmmmmmmmmK....',
      '...KmmmmmmmmmmmmK...',
      '...KZZZZZZZZZZZZK...',
      '.....KhhhhhhhhK.....',
      '.....KhsssssshK.....',
      '.....KhsWssWshK.....',
      '.....KhsssssshK.....',
      '......KssssssK......',
      '.......KssssK.......',
      '.....KKbbbbbbKK.....',
      '....KbbbbbbbbbbK....',
      '....KbbbbbbbbbbK....',
      '....KbbbbssbbbbK....',
      '....KbbbbbbbbbbK....',
      '.....KKbbbbbbKK.....',
      '......KnnnnnnK......',
      '......KnnKKnnK......',
      '......KnnK.KnnK.....',
      '......KnnK.KnnK.....',
      '......KKK..KKK......',
      '.....KhhK..KhhK.....',
      '....................'
    ],

    /* ============================================================
       星露谷的「人物」：16×24 村民像素立绘
       统一骨架：r1-r5 头发/帽子，r6 眼睛，r8-r9 脖子，
       r10-r13 上衣+手，r14-r18 裤子，r19-r22 腿与靴子
       ============================================================ */

    /* 农场主：草帽 + 蓝衬衫 + 背带裤 */
    vFarmer: [
      '................',
      '.....KKKKKK.....',
      '....KZZZZZZK....',
      '...KZZZZZZZZK...',
      '..KZZZZZZZZZZK..',
      '..KKKKKKKKKKKK..',
      '....KssssssK....',
      '....KsKssKsK....',
      '....KssssssK....',
      '.....KssssK.....',
      '...KbbbbbbbbK...',
      '...KbbbbbbbbK...',
      '...KbbnnnnbbK...',
      '...KsnnnnnnsK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '....KnnnnnnK....',
      '....KnnnnnnK....',
      '....KnnKKnnK....',
      '....KnnKKnnK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....'
    ],
    /* 木匠：橙红短发 + 红工装 + 工具腰带 */
    vCarpenter: [
      '................',
      '.....KKKKKK.....',
      '....KOOOOOOK....',
      '...KOOOOOOOOK...',
      '...KOssssssOK...',
      '...KOssssssOK...',
      '...KOsKssKsOK...',
      '...KOssssssOK...',
      '....KssssssK....',
      '.....KssssK.....',
      '...KVVVVVVVVK...',
      '...KVVVVVVVVK...',
      '...KVVVVVVVVK...',
      '...KsVVVVVVsK...',
      '...KjjjjjjjjK...',
      '...KEEEEEEEEK...',
      '...KEEEEEEEEK...',
      '...KEEEEEEEEK...',
      '....KEEEEEEK....',
      '....KEEKKEEK....',
      '....KEEKKEEK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....'
    ],
    /* 铁匠：络腮胡 + 灰衬衫 + 皮围裙 */
    vBlacksmith: [
      '................',
      '.....KKKKKK.....',
      '....KhhhhhhK....',
      '...KhhhhhhhhK...',
      '...KhsssssshK...',
      '...KhsssssshK...',
      '...KhsKssKshK...',
      '...KhsssssshK...',
      '...KKhhhhhhKK...',
      '....KhhhhhhK....',
      '...KzzzzzzzzK...',
      '...KzjjjjjjzK...',
      '...KzjjjjjjzK...',
      '...KsjjjjjjsK...',
      '...KjjjjjjjjK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '....KnnnnnnK....',
      '....KnnKKnnK....',
      '....KnnKKnnK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....'
    ],
    /* 杂货店老板：小胡子 + 白衬衫 + 紫围裙 */
    vShop: [
      '................',
      '.....KKKKKK.....',
      '....KhhhhhhK....',
      '...KhhhhhhhhK...',
      '...KhsssssshK...',
      '...KhsssssshK...',
      '...KhsKssKshK...',
      '...KhshhhhshK...',
      '....KssssssK....',
      '.....KssssK.....',
      '...KWWWWWWWWK...',
      '...KWMMMMMMWK...',
      '...KWMMMMMMWK...',
      '...KsMMMMMMsK...',
      '...KMMMMMMMMK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '....KnnnnnnK....',
      '....KnnKKnnK....',
      '....KnnKKnnK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....'
    ],
    /* 医生：眼镜 + 白大褂 + 听诊器 */
    vDoctor: [
      '................',
      '.....KKKKKK.....',
      '....KhhhhhhK....',
      '...KhhhhhhhhK...',
      '...KhsssssshK...',
      '...KhsssssshK...',
      '...KKWKssKWKK...',
      '...KhsssssshK...',
      '....KssssssK....',
      '.....KssssK.....',
      '...KWWWWWWWWK...',
      '...KWWWWWWWWK...',
      '...KWzWWWWzWK...',
      '...KsWWWWWWsK...',
      '...KWWWWWWWWK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '....KnnnnnnK....',
      '....KnnKKnnK....',
      '....KnnKKnnK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....'
    ],
    /* 法师：尖顶紫帽 + 白长须 + 星星长袍 */
    vWizard: [
      '................',
      '.......KK.......',
      '......KPK.......',
      '.....KMPK.......',
      '....KMPPK.......',
      '...KMPPPPK......',
      '..KMPPPPPPK.....',
      '..KKKKKKKKKKK...',
      '....KssssssK....',
      '....KsKssKsK....',
      '.....KWWWWK.....',
      '....KWWWWWWK....',
      '...KPPPPPPPPK...',
      '...KPYPPPPYPK...',
      '...KPPPPPPPPK...',
      '...KPPPPPPPPK...',
      '...KPPPPPPPPK...',
      '..KPPPPPPPPPPK..',
      '..KPPPPPPPPPPK..',
      '..KPPPPPPPPPPK..',
      '..KPPPPPPPPPPK..',
      '..KPPPPPPPPPPK..',
      '...KKKKKKKKKK...',
      '................'
    ],
    /* 镇长：礼帽 + 领结 + 深色西装 */
    vMayor: [
      '................',
      '...KKKKKKKKKK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '..KKnnnnnnnnKK..',
      '..KKKKKKKKKKKK..',
      '....KssssssK....',
      '....KsKssKsK....',
      '....KshhhhsK....',
      '.....KssssK.....',
      '...KnnnnnnnnK...',
      '...KnnVVVVnnK...',
      '...KnnnnnnnnK...',
      '...KsnnnnnnsK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '...KnnnnnnnnK...',
      '....KnnnnnnK....',
      '....KnnKKnnK....',
      '....KnnKKnnK....',
      '....KnnKKnnK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....'
    ],
    /* 矿工：黄色矿灯安全帽 + 深棕工装 */
    vMiner: [
      '................',
      '.....KKKKKK.....',
      '....KYYYYYYK....',
      '...KYYWYYYYYK...',
      '..KYYYYYYYYYYK..',
      '..KKKKKKKKKKKK..',
      '....KssssssK....',
      '....KsKssKsK....',
      '....KssssssK....',
      '.....KssssK.....',
      '...KbbbbbbbbK...',
      '...KbbbbbbbbK...',
      '...KbbllllbbK...',
      '...KsllllllsK...',
      '...KllllllllK...',
      '...KllllllllK...',
      '...KllllllllK...',
      '....KllllllK....',
      '....KllKKllK....',
      '....KllKKllK....',
      '....KhhKKhhK....',
      '....KhhKKhhK....',
      '.....KK..KK.....',
      '................'
    ],
    /* 奶牛（牧场动物） */
    cow: [
      '................',
      '.....KKKKKK.....',
      '....KWWWWWWK....',
      '...KWWKKWWWWK...',
      '...KWKKWWKWWK...',
      '...KWWWWWWWWK...',
      '...KWWKWWKWWK...',
      '...KWWWWWWWWK...',
      '....KWKKKKWK....',
      '....KssssssK....',
      '.....KKKKKK.....',
      '...KWWWWWWWWK...',
      '..KWWWKKWWWWWK..',
      '..KWWWWWWWWWWK..',
      '..KWWWWWWWWWWK..',
      '...KKKKKKKKKK...'
    ]
  };

  /* 旧精灵名 → 新图标（兼容历史引用） */
  var ALIAS = {
    pikachu: 'starfruit',
    charmander: 'hotpepper',
    squirtle: 'parsnip',
    bulbasaur: 'cauliflower',
    eevee: 'chicken',
    gengar: 'pumpkin',
    pokeball: 'chest',
    masterball: 'starfruit',
    berry: 'sunflower',
    bush: 'melon',
    trainer: 'vFarmer',
    trainerFront: 'vFarmer',
    farmer: 'vFarmer'
  };

  /* 追加几个农场配色（Z 草帽、X 深绿等沿用原调色板，这里补木纹与作物色） */
  var EXTRA_PALETTE = {
    M: '#b07ad0', // 法师袍亮紫
    J: '#5fbb46', // 祝尼魔亮绿
    j: '#7b4a24', // 皮革围裙 / 工具腰带
    V: '#d23b3b'  // 鸡冠红（沿用原值，保证向后兼容）
  };

  if (global.POKE_GRID) {
    Object.keys(FARM_GRID).forEach(function (k) { global.POKE_GRID[k] = FARM_GRID[k]; });
    Object.keys(ALIAS).forEach(function (k) { global.POKE_GRID[k] = FARM_GRID[ALIAS[k]]; });
  }
  if (global.POKE_PALETTE) {
    Object.keys(EXTRA_PALETTE).forEach(function (k) {
      if (!global.POKE_PALETTE[k]) global.POKE_PALETTE[k] = EXTRA_PALETTE[k];
    });
  }

  /* 包装 mountSprites：先把旧精灵名翻译成新名，再交给原渲染器 */
  var origMount = global.mountSprites;
  if (typeof origMount === 'function') {
    global.mountSprites = function (root) {
      try {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-sprite]');
        for (var i = 0; i < nodes.length; i++) {
          var name = nodes[i].getAttribute('data-sprite');
          if (name && ALIAS[name]) {
            nodes[i].setAttribute('data-sprite', ALIAS[name]);
            nodes[i].removeAttribute('data-sprite-ready');
          }
        }
      } catch (e) { /* DOM 不可用时忽略 */ }
      return origMount(root);
    };
  }

  global.FARM_GRID = FARM_GRID;
  global.FARM_ALIAS = ALIAS;
})(typeof window !== 'undefined' ? window : globalThis);
