// Stardew Valley source rectangles for extracted game assets.
// Frame conventions:
//   villagers: 16x32 frames, 4 frames per direction. Rows: 0=down, 1=right, 2=up, 3=left.
//   farmer:    16x32 frames, 4 frames per direction. Rows: 0=down, 1=right, 2=up, 3=left.
//   cow:       32x32 frames, 4 frames per row.
//   chicken:   16x16 frames.
//   crops:     final stage usually 16x32 or 16x16; rects chosen from crops.png.

var SPRITES = {
  grass:     { src: 'stardew/assets/grass.png',     rect: [0, 0, 16, 16] },
  dirt:      { src: 'stardew/assets/hoeDirt.png',    rect: [48, 0, 16, 16] },
  dirt_wet:  { src: 'stardew/assets/hoeDirt.png',    rect: [48, 32, 16, 16] },
  floor:     { src: 'stardew/assets/Floors.png',     rect: [0, 0, 16, 16] },
  path:      { src: 'stardew/assets/Floors.png',     rect: [32, 0, 16, 16] },

  // Decor
  tree:      { src: 'stardew/assets/tree1_fall.png', rect: [0, 0, 48, 80], anchor: [0.5, 0.85] },
  bush:      { src: 'stardew/assets/bushes.png',     rect: [0, 0, 32, 32], anchor: [0.5, 0.85] },
  stone:     { src: 'stardew/assets/debris.png',     rect: [0, 0, 16, 16], anchor: [0.5, 0.9] },
  flower:    { src: 'stardew/assets/crops.png',      rect: [192, 144, 16, 16], anchor: [0.5, 0.9] },

  // Buildings (drawn from top-left; anchor handled in renderer)
  house:     { src: 'stardew/assets/houses.png',     rect: [0, 0, 96, 96], anchor: [0.5, 0.95] },
  house2:    { src: 'stardew/assets/houses.png',     rect: [0, 144, 112, 112], anchor: [0.5, 0.95] },
  barn:      { src: 'stardew/assets/Barn.png',       rect: [0, 0, 112, 128], anchor: [0.5, 0.95] },
  coop:      { src: 'stardew/assets/Coop.png',       rect: [0, 0, 96, 128], anchor: [0.5, 0.95] },

  // Animals
  cow:       { src: 'stardew/assets/Brown Cow.png',  rect: [0, 0, 32, 32], anchor: [0.5, 0.9] },
  chicken:   { src: 'stardew/assets/White Chicken.png', rect: [0, 0, 16, 16], anchor: [0.5, 0.9] },

  // UI
  chatBox:   { src: 'stardew/assets/chatBox.png',    rect: [0, 0, 300, 336], nineSlice: [20, 20, 20, 20] },
  letter:    { src: 'stardew/assets/letterBG.png',   rect: [0, 0, 320, 180] },
  cursor:    { src: 'stardew/assets/Cursors.png',     rect: [0, 0, 40, 40], anchor: [0.5, 0.5] },

  // Characters (16x32 base frame)
  farmer:    { src: 'stardew/assets/farmer_base.png',  frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  farmerGirl:{ src: 'stardew/assets/farmer_girl_base.png', frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  abigail:   { src: 'stardew/assets/Abigail.png',    frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  robin:     { src: 'stardew/assets/Robin.png',      frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  clint:     { src: 'stardew/assets/Clint.png',      frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  pierre:    { src: 'stardew/assets/Pierre.png',     frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  harvey:    { src: 'stardew/assets/Harvey.png',     frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  wizard:    { src: 'stardew/assets/Wizard.png',     frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  lewis:     { src: 'stardew/assets/Lewis.png',      frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  maru:      { src: 'stardew/assets/Maru.png',       frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  caroline:  { src: 'stardew/assets/Caroline.png',   frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },
  penny:     { src: 'stardew/assets/Penny.png',      frame: [16, 32], rows: { down:0, right:1, up:2, left:3 }, anchor: [0.5, 0.95] },

  // Portraits (64x64)
  portrait: {
    farmer:    { src: 'stardew/assets/farmer_base.png',    rect: [0, 0, 16, 32] }, // fallback
    abigail:   { src: 'stardew/assets/Abigail.png',        rect: [0, 0, 64, 64] },
    robin:     { src: 'stardew/assets/Robin.png',          rect: [0, 0, 64, 64] },
    clint:     { src: 'stardew/assets/Clint.png',          rect: [0, 0, 64, 64] },
    pierre:    { src: 'stardew/assets/Pierre.png',          rect: [0, 0, 64, 64] },
    harvey:    { src: 'stardew/assets/Harvey.png',          rect: [0, 0, 64, 64] },
    wizard:    { src: 'stardew/assets/Wizard.png',          rect: [0, 0, 64, 64] },
    lewis:     { src: 'stardew/assets/Lewis.png',           rect: [0, 0, 64, 64] },
    maru:      { src: 'stardew/assets/Maru.png',            rect: [0, 0, 64, 64] },
    caroline:  { src: 'stardew/assets/Caroline.png',        rect: [0, 0, 64, 64] },
    penny:     { src: 'stardew/assets/Penny.png',            rect: [0, 0, 64, 64] }
  },

  // Crops: 16x32 sprites chosen from crops.png for visual variety.
  crops: {
    parsnip:   { src: 'stardew/assets/crops.png', rect: [96, 32, 16, 32], anchor: [0.5, 0.9] },
    cauliflower:{ src: 'stardew/assets/crops.png', rect: [228, 92, 16, 32], anchor: [0.5, 0.9] },
    pumpkin:   { src: 'stardew/assets/crops.png', rect: [228, 192, 16, 32], anchor: [0.5, 0.9] },
    corn:      { src: 'stardew/assets/crops.png', rect: [220, 128, 16, 32], anchor: [0.5, 0.9] },
    sunflower: { src: 'stardew/assets/crops.png', rect: [224, 228, 16, 32], anchor: [0.5, 0.9] },
    hotpepper: { src: 'stardew/assets/crops.png', rect: [96, 116, 16, 32], anchor: [0.5, 0.9] },
    eggplant:  { src: 'stardew/assets/crops.png', rect: [208, 48, 16, 32], anchor: [0.5, 0.9] },
    blueberry: { src: 'stardew/assets/crops.png', rect: [200, 0, 16, 32], anchor: [0.5, 0.9] },
    strawberry:{ src: 'stardew/assets/crops.png', rect: [208, 84, 16, 32], anchor: [0.5, 0.9] },
    starfruit: { src: 'stardew/assets/crops.png', rect: [204, 248, 16, 32], anchor: [0.5, 0.9] },
    wheat:     { src: 'stardew/assets/crops.png', rect: [200, 120, 16, 32], anchor: [0.5, 0.9] }
  }
};

// Map repo categories to crop sprite keys.
var CROP_FOR_CATEGORY = {
  embedded:  'cauliflower',
  circuits:  'pumpkin',
  ai:        'starfruit',
  frontend:  'sunflower',
  tools:     'hotpepper',
  default:   'parsnip'
};

// Villagers and their roles.
var VILLAGERS = [
  { key: 'robin',   name: 'Robin',   role: '木匠',    color: '#d94', intro: '需要扩建谷仓？我随时待命。' },
  { key: 'clint',   name: 'Clint',   role: '铁匠',    color: '#888', intro: '来升级工具？带上足够的矿石。' },
  { key: 'pierre',  name: 'Pierre',  role: '杂货店老板', color: '#2a5', intro: '种子新鲜到货，播种季节别错过。' },
  { key: 'harvey',  name: 'Harvey',  role: '医生',    color: '#e8a', intro: '累了就休息一下，健康第一。' },
  { key: 'wizard',  name: 'Rasmodius', role: '法师',  color: '#73b', intro: '代码如符文，排列得当方可唤出奇迹。' },
  { key: 'lewis',   name: 'Lewis',   role: '镇长',    color: '#b53', intro: '欢迎来到鹈鹕镇，镇长欢迎你。' },
  { key: 'maru',    name: 'Maru',    role: '工程师',  color: '#39d', intro: '我喜欢鼓捣小工具，你的项目真有趣。' },
  { key: 'penny',   name: 'Penny',   role: '教师',    color: '#e66', intro: '不断学习，生活总会给你惊喜。' },
  { key: 'abigail', name: 'Abigail', role: '冒险家',  color: '#85c', intro: '地下室有什么秘密？一起去看看。' },
  { key: 'caroline',name: 'Caroline', role: '温室专家', color: '#7a5', intro: '保持耐心，作物终会丰收。' }
];
