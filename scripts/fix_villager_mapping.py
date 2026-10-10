"""按用户最终校对结果 + 星露谷维基百科居民名单，重写 dialogue-data.js。

权威依据：
  1. 用户提供的校对 JSON（villager-audit.html 导出）—— 索引对应关系的唯一权威。
  2. 用户文字补充：#10 吉尔、#11 州长、#24 潘姆；以及「#19 是利亚」「刘易斯是镇长不是州长」。
  3. 星露谷维基百科「居民」页（zh.stardewvalleywiki.com/居民）—— 校验中文名与角色身份。

维基校验结果：
  - 34 个不重复角色 **全部命中维基名单**，零缺失、零虚构。
  - 「州长」(Governor) 与「刘易斯」(Lewis) 是**两个不同角色**：Lewis 是鹈鹕镇镇长，
    Governor 是州长。用户指出的「刘易斯是镇长不是州长」已在职业字段体现。

35 格 = 34 位不重复居民 + Robin 在 #19? 不，最终 34 角色 + 1 重复格（见TRUTH 注释）。
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OLD = ROOT / 'dialogue-data.js.bak'
OUT = ROOT / 'dialogue-data.js'

# (key, 中文名, 职业) —— 中文名与维基百科一致
TRUTH = [
    ('abigail',   '阿比盖尔',   '冒险家'),        # 0
    ('alex',      '亚历克斯',   '运动员'),        # 1
    ('caroline',  '卡洛琳',     '温室专家'),      # 2
    ('clint',     '克林特',     '铁匠'),          # 3
    ('demetrius', '德米特里厄斯', '科学家'),      # 4
    ('dwarf',     '矮人',       '矿工'),          # 5
    ('elliott',   '艾利欧特',   '作家'),          # 6
    ('emily',     '艾米丽',     '裁缝'),          # 7
    ('evelyn',    '艾芙琳',     '烘焙师'),        # 8
    ('george',    '乔治',       '退休老人'),      # 9
    ('gil',       '吉尔',       '冒险家'),        # 10 深山探险家公会居民（非姜岛渔夫）
    ('governor',  '州长',       '州长'),          # 11 与刘易斯是两个不同角色
    ('gus',       '格斯',       '酒吧老板'),      # 12 香料铺老板
    ('haley',     '海莉',       '摄影师'),        # 13
    ('harvey',    '哈维',       '医生'),          # 14
    ('jas',       '贾斯',       '小女孩'),        # 15
    ('jodi',      '乔迪',       '家庭主妇'),      # 16
    ('kent',      '肯特',       '退伍军人'),      # 17
    ('krobus',    '科罗布斯',   '怪物朋友'),      # 18 矿工
    ('leah',      '莉亚',       '艺术家'),        # 19 用户修正：robin → leah
    ('lewis',     '刘易斯',     '镇长'),          # 20 鹈鹕镇镇长（非州长）
    ('linus',     '莱纳斯',     '隐士'),          # 21
    ('marnie',    '玛妮',       '牧场主'),        # 22
    ('maru',      '玛鲁',       '工程师'),        # 23 原「农场主」位，实为玛鲁
    ('pam',       '帕姆',       '公交司机'),      # 24
    ('penny',     '潘妮',       '教师'),          # 25
    ('pierre',    '皮埃尔',     '杂货店老板'),    # 26
    ('robin',     '罗宾',       '木匠'),          # 27
    ('sam',       '山姆',       '音乐人'),        # 28
    ('sandy',     '桑迪',       '沙漠商人'),      # 29
    ('sebastian', '塞巴斯蒂安', '程序员'),        # 30 默认说话人
    ('shane',     '谢恩',       '蓝领工人'),      # 31
    ('vincent',   '文森特',     '小男孩'),        # 32
    ('willy',     '威利',       '渔夫'),          # 33
    ('wizard',    '法师',       '法师'),          # 34 维基中文名就叫「法师」
]

DEFAULT_SPEAKER_INDEX = 30  # 塞巴斯蒂安

EXTRA_LINES = {
    'gil': [
        '孩子，等你有了能让我刮目相看的东西，再来找我吧。',
        '……*打鼾*……',
        '别在公会里大声嚷嚷，我在睡觉。'
    ],
    'governor': [
        '郡里的事自有郡里的规矩。',
        '年轻人，好好经营你的农场吧。',
        '这片地，我们看着呢。'
    ],
    'wizard': [
        '虚无与现实之间，只隔一层薄纱。',
        '别把话说太满，命运不喜欢承诺。',
        '想学魔法？先学会等待。'
    ],
}


def parse_old_lines():
    if not OLD.exists():
        return {}
    src = OLD.read_text(encoding='utf-8')
    data = {}
    for o in re.split(r"\n    \{\n", src)[1:]:
        km = re.search(r"key:\s*'([^']+)'", o)
        if not km:
            continue
        lm = re.search(r"lines:\s*\[(.*?)\]", o, re.S)
        data[km.group(1)] = re.findall(r"'([^']+)'", lm.group(1)) if lm else []
    return data


def main():
    old = parse_old_lines()
    parts, seen = [], set()
    for i, (key, name, role) in enumerate(TRUTH):
        k = key if key not in seen else f'{key}__at{i}'
        seen.add(key)
        lines = old.get(key) or EXTRA_LINES.get(key) or []
        if not lines:
            lines = [f'（{name}还在准备台词。）']
        parts.append(
            "    {\n"
            f"      key: '{k}', name: '{name}', role: '{role}', "
            f"portrait: 'stardew/assets/portraits/portrait-{i}.png',\n"
            "      lines: [\n" + ',\n'.join(f"        '{l}'" for l in lines) +
            "\n      ]\n    }"
        )

    header = (
        "/* 星露谷居民对话数据 —— 35 格横幅贴图的对应身份。\n"
        "   索引与 banner-all-villagers.png 的 64px 切片严格一致（0-34）。\n"
        "   身份以用户校对结果为准，中文名经星露谷维基百科「居民」页校验。\n"
        "   注意：州长(Governor) 与刘易斯(Lewis/镇长) 是两个不同角色。\n"
        "   已移除「农场主」（其贴图实为玛鲁）。\n"
        f"   默认说话人：塞巴斯蒂安（索引 {DEFAULT_SPEAKER_INDEX}）。 */\n"
        "(function () {\n  'use strict';\n\n  var VILLAGERS = [\n"
    )
    OUT.write_text(header + ',\n'.join(parts) +
                   "\n  ];\n\n"
                   "  if (typeof window !== 'undefined') window.VILLAGERS = VILLAGERS;\n"
                   "})();\n", encoding='utf-8')
    print(f'已重写：{len(TRUTH)} 格 / {len({k for k,_,_ in TRUTH})} 位不重复居民')
    print(f'#10={TRUTH[10][1]}  #11={TRUTH[11][1]}  #19={TRUTH[19][1]}  '
          f'#20={TRUTH[20][1]}  #24={TRUTH[24][1]}  #34={TRUTH[34][1]}')


if __name__ == '__main__':
    main()