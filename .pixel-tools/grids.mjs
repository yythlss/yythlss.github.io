// Hand-authored character grids. One letter per pixel, see PALETTE in sprites-src.mjs
// '.' = transparent, 'K' = ink outline. Grids are 20-22px wide, drawn to be
// readable at 4-6x zoom with hard edges (GBA / Gen-1 overhead sprite feel).

export const GRIDS = {};

/* ---------------------------------------------------------------- 皮卡丘 20x20
   tall ears with black tips, red cheeks, lightning-bolt tail on the right  */
GRIDS.pikachu = [
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
];

/* -------------------------------------------------------------- 小火龙 22x22
   orange body, cream belly, tail flame top-right  */
GRIDS.charmander = [
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
];

/* -------------------------------------------------------------- 杰尼龟 22x22
   blue body, brown segmented shell on the left, cream belly  */
GRIDS.squirtle = [
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
];

/* ------------------------------------------------------------ 妙蛙种子 22x22
   green body, blue-green bulb with dark spots on the back  */
GRIDS.bulbasaur = [
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
];

/* ------------------------------------------------------------------ 伊布 22x22
   brown body, cream ruff/chest, big pointed ears  */
GRIDS.eevee = [
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
];

/* ----------------------------------------------------------------- 耿鬼 22x22
   round purple body, spikes on the head, wide white grin  */
GRIDS.gengar = [
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
];

/* -------------------------------------------------------------- 训练家 20x24 */
GRIDS.trainer = [
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
];

/* -------------------------------------------------------------- 训练家 20x26
   正面姿势，用于导航栏、仓库卡片与用户信息面板的像素头像  */
GRIDS.trainerFront = [
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
];

/* ----------------------------------------------------------------- 道具 */
GRIDS.pokeball = [
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
];

GRIDS.masterball = [
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
];

GRIDS.berry = [
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
];

GRIDS.bush = [
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
];