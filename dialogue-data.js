/* 星露谷居民对话数据 —— 35 格横幅贴图的对应身份。
   索引与 banner-all-villagers.png 的 64px 切片严格一致（0-34）。
   身份以用户校对结果为准，中文名经星露谷维基百科「居民」页校验。
   注意：州长(Governor) 与刘易斯(Lewis/镇长) 是两个不同角色。
   已移除「农场主」（其贴图实为玛鲁）。
   默认说话人：塞巴斯蒂安（索引 30）。 */
(function () {
  'use strict';

  var VILLAGERS = [
    {
      key: 'abigail', name: '阿比盖尔', role: '冒险家', portrait: 'stardew/assets/portraits/portrait-0.png',
      lines: [
        '小时候我喜欢一个人去森林探险，现在我把好奇心写进代码里。',
        'bug 就像矿洞里的石头，敲一敲总有惊喜。',
        '你的仓库里藏着什么宝贝？能不能给我看看？'
      ]
    },
    {
      key: 'alex', name: '亚历克斯', role: '运动员', portrait: 'stardew/assets/portraits/portrait-1.png',
      lines: [
        '保持健康节奏，按时提交代码，不要熬夜修仙。',
        '强壮的身体和强壮的测试覆盖率一样重要。',
        '嘿，要不要一起去跑个步？比久坐写代码强多了。'
      ]
    },
    {
      key: 'caroline', name: '卡洛琳', role: '温室专家', portrait: 'stardew/assets/portraits/portrait-2.png',
      lines: [
        '保持耐心，作物终会丰收。',
        '温室里一年四季都能生长，好项目也是。',
        '茶叶要慢慢发酵，代码要慢慢打磨。'
      ]
    },
    {
      key: 'clint', name: '克林特', role: '铁匠', portrait: 'stardew/assets/portraits/portrait-3.png',
      lines: [
        '来升级工具？带上足够的矿石和耐心。',
        '好的代码要经过千锤百炼，急不得。',
        'copper 和 silicon 都是地里长出来的，只是形状不同。'
      ]
    },
    {
      key: 'demetrius', name: '德米特里厄斯', role: '科学家', portrait: 'stardew/assets/portraits/portrait-4.png',
      lines: [
        '数据不会说谎，但解释数据的人可能会。',
        '观察、假设、实验、结论——调试也是科学方法。',
        '番茄是水果，不是蔬菜；论证要充分。'
      ]
    },
    {
      key: 'dwarf', name: '矮人', role: '矿工', portrait: 'stardew/assets/portraits/portrait-5.png',
      lines: [
        '地下深处藏着最坚硬的代码和最闪亮的提交。',
        '矿石要一层层挖，bug 也要一步步排。',
        '我听不懂你们的语言，但我看得懂一颗好芯片。'
      ]
    },
    {
      key: 'elliott', name: '艾利欧特', role: '作家', portrait: 'stardew/assets/portraits/portrait-6.png',
      lines: [
        '每一个伟大的项目，都始于一段优雅的 README 序言。',
        '代码是现代的十四行诗，结构、韵律、意境缺一不可。',
        '来海边坐坐吧，海风能让思路变清晰。'
      ]
    },
    {
      key: 'emily', name: '艾米丽', role: '裁缝', portrait: 'stardew/assets/portraits/portrait-7.png',
      lines: [
        '把不同的颜色拼在一起，就能做出温暖的东西。',
        '每一行代码都是一根线，缝对了就是一件好衣服。',
        '你的项目需要一条亮眼的围巾，让它更有个性。'
      ]
    },
    {
      key: 'evelyn', name: '艾芙琳', role: '烘焙师', portrait: 'stardew/assets/portraits/portrait-8.png',
      lines: [
        '年轻的农场主，记得按时吃饭，别总盯着屏幕。',
        'bug 就像没烤熟的饼干，再烤一会儿就好了。',
        '我烤了饼干，你要不要来一块？配热茶最好。'
      ]
    },
    {
      key: 'george', name: '乔治', role: '退休老人', portrait: 'stardew/assets/portraits/portrait-9.png',
      lines: [
        '现在的年轻人什么都能用代码做，想当年我们全靠手算。',
        '稳重一点，别急着推送，先把测试跑完。',
        '我的轮椅可比你的编译器慢多了，但也能到终点。'
      ]
    },
    {
      key: 'gil', name: '吉尔', role: '冒险家', portrait: 'stardew/assets/portraits/portrait-10.png',
      lines: [
        '孩子，等你有了能让我刮目相看的东西，再来找我吧。',
        '……*打鼾*……',
        '别在公会里大声嚷嚷，我在睡觉。'
      ]
    },
    {
      key: 'governor', name: '州长', role: '州长', portrait: 'stardew/assets/portraits/portrait-11.png',
      lines: [
        '郡里的事自有郡里的规矩。',
        '年轻人，好好经营你的农场吧。',
        '这片地，我们看着呢。'
      ]
    },
    {
      key: 'gus', name: '格斯', role: '酒吧老板', portrait: 'stardew/assets/portraits/portrait-12.png',
      lines: [
        '来杯黑咖啡？熬夜写代码的人最需要这个。',
        '好的项目就像一锅好汤，得慢慢熬。',
        '别一个人闷着，来星之果实餐吧坐坐。'
      ]
    },
    {
      key: 'haley', name: '海莉', role: '摄影师', portrait: 'stardew/assets/portraits/portrait-13.png',
      lines: [
        '阳光好的时候，连代码看起来都更漂亮。',
        '拍照和写注释一样，都是在记录重要瞬间。',
        '你的项目界面还可以再调亮一点，像素风也要讲构图。'
      ]
    },
    {
      key: 'harvey', name: '哈维', role: '医生', portrait: 'stardew/assets/portraits/portrait-14.png',
      lines: [
        '保持健康节奏，按时提交代码，不要熬夜修仙。',
        '出现问题不要慌，先写个测试复现它。',
        '久坐对脊椎不好，起来伸展一下。'
      ]
    },
    {
      key: 'jas', name: '贾斯', role: '小女孩', portrait: 'stardew/assets/portraits/portrait-15.png',
      lines: [
        '你的项目里有小动物吗？我最喜欢小鸡。',
        'bug 是不是也像虫子一样，捏掉就好了？',
        '等我长大了，也要写一个自己的网站。'
      ]
    },
    {
      key: 'jodi', name: '乔迪', role: '家庭主妇', portrait: 'stardew/assets/portraits/portrait-16.png',
      lines: [
        '家里的事和项目一样，规划好了就不乱。',
        '别忘了给家人和朋友留点时间，代码之外还有生活。',
        '需要帮助就直说，邻里之间不用客气。'
      ]
    },
    {
      key: 'kent', name: '肯特', role: '退伍军人', portrait: 'stardew/assets/portraits/portrait-17.png',
      lines: [
        '纪律和准时，是任何项目能跑下去的基础。',
        '战场上没有 undo，写代码可要记得提交。',
        '回家真好，这里比战场安静多了。'
      ]
    },
    {
      key: 'krobus', name: '科罗布斯', role: '怪物朋友', portrait: 'stardew/assets/portraits/portrait-18.png',
      lines: [
        '……你看得见我？那就请小声一点。',
        '地下的知识比地上更古老，只是没人愿意听。',
        '我喜欢黑暗的地方，但你的代码可以亮一点。'
      ]
    },
    {
      key: 'leah', name: '莉亚', role: '艺术家', portrait: 'stardew/assets/portraits/portrait-19.png',
      lines: [
        '创作项目和种庄稼一样，都需要耐心和一点点运气。',
        '不要用别人的尺子量自己的代码。',
        '来森林里走走，灵感往往藏在落叶下面。'
      ]
    },
    {
      key: 'lewis', name: '刘易斯', role: '镇长', portrait: 'stardew/assets/portraits/portrait-20.png',
      lines: [
        '欢迎来到鹈鹕镇，镇长欢迎你。',
        '每一颗星标都是来年丰收的种子。',
        '社区的发展离不开每一个人的提交和分享。'
      ]
    },
    {
      key: 'linus', name: '莱纳斯', role: '隐士', portrait: 'stardew/assets/portraits/portrait-21.png',
      lines: [
        '自然比任何框架都更懂得包容。',
        '少一点依赖，生活反而更轻松。',
        '在山里写代码很安静，只是网络信号不太好。'
      ]
    },
    {
      key: 'marnie', name: '玛妮', role: '牧场主', portrait: 'stardew/assets/portraits/portrait-22.png',
      lines: [
        '动物需要照顾，项目也需要维护。',
        '喂鸡和修 bug 都要赶早，晚了会出事。',
        '来牧场看看吧，小鸡们都很喜欢热闹。'
      ]
    },
    {
      key: 'maru', name: '玛鲁', role: '工程师', portrait: 'stardew/assets/portraits/portrait-23.png',
      lines: [
        '我喜欢鼓捣小工具，你的项目真有趣。',
        '硬件连接和电路图最美的地方，是一切都刚刚好。',
        '如果生活能像状态机一样简单就好了。'
      ]
    },
    {
      key: 'pam', name: '帕姆', role: '公交司机', portrait: 'stardew/assets/portraits/portrait-24.png',
      lines: [
        '按时发车是我的原则，按时发布也是你的。',
        '生活就像巴士路线，总会绕几个弯。',
        '来一杯啤酒？下班之后的事情就别想太多。'
      ]
    },
    {
      key: 'penny', name: '潘妮', role: '教师', portrait: 'stardew/assets/portraits/portrait-25.png',
      lines: [
        '不断学习，生活总会给你惊喜。',
        '写注释和教别人一样重要，文档是代码最好的伙伴。',
        '看不懂的代码，就像没有书签的书。'
      ]
    },
    {
      key: 'pierre', name: '皮埃尔', role: '杂货店老板', portrait: 'stardew/assets/portraits/portrait-26.png',
      lines: [
        '种子新鲜到货，播种季节别错过。',
        '做生意和写代码一样，库存要清楚，接口要稳定。',
        '有没有兴趣开间分店？我可以供货。'
      ]
    },
    {
      key: 'robin', name: '罗宾', role: '木匠', portrait: 'stardew/assets/portraits/portrait-27.png',
      lines: [
        '再复杂的东西也要从一块好木头开始。',
        '每颗星标都是来年丰收的种子，别吝啬你的 Star。',
        '需要扩建谷仓？我随时待命。'
      ]
    },
    {
      key: 'sam', name: '山姆', role: '音乐人', portrait: 'stardew/assets/portraits/portrait-28.png',
      lines: [
        '写代码和写歌一样，要有节奏感。',
        '吉他弦松了要调，依赖版本乱了也要修。',
        '要不要组个乐队？键盘手还差一个。'
      ]
    },
    {
      key: 'sandy', name: '桑迪', role: '沙漠商人', portrait: 'stardew/assets/portraits/portrait-29.png',
      lines: [
        '沙漠里的星星和代码里的星标一样，亮晶晶的。',
        '远道而来的访客，要不要换点稀有资源？',
        '绿洲很安静，适合专心写代码。'
      ]
    },
    {
      key: 'sebastian', name: '塞巴斯蒂安', role: '程序员', portrait: 'stardew/assets/portraits/portrait-30.png',
      lines: [
        '下雨天最适合宅在家里写代码。',
        '摩托车和键盘，是我用来逃离现实的两种载具。',
        '这个函数的复杂度还可以再压一压。'
      ]
    },
    {
      key: 'shane', name: '谢恩', role: '蓝领工人', portrait: 'stardew/assets/portraits/portrait-31.png',
      lines: [
        '活着已经够累了，代码能不能简单点？',
        '啤酒不能解决所有问题，但至少能重启一下心情。',
        'chickens 不会骗你，人就不一定了。'
      ]
    },
    {
      key: 'vincent', name: '文森特', role: '小男孩', portrait: 'stardew/assets/portraits/portrait-32.png',
      lines: [
        '你写的代码能变成游戏吗？我想玩。',
        '贾斯说你的主页有会动的小人，是真的吗？',
        '长大以后我要当程序员，像塞巴斯蒂安哥哥一样。'
      ]
    },
    {
      key: 'willy', name: '威利', role: '渔夫', portrait: 'stardew/assets/portraits/portrait-33.png',
      lines: [
        '钓鱼和 debug 一样，最重要的是耐心。',
        '大海里的 bug 比你仓库里的还多，但都没你的难搞。',
        '早上五点去码头，能钓到最鲜的灵感。'
      ]
    },
    {
      key: 'wizard', name: '法师', role: '法师', portrait: 'stardew/assets/portraits/portrait-34.png',
      lines: [
        '代码即符文，优雅的结构自有魔力。',
        '这片农场里的每一行代码，都是一颗会发芽的星之果实。',
        '元素讲究平衡，架构也是。'
      ]
    }
  ];

  if (typeof window !== 'undefined') window.VILLAGERS = VILLAGERS;
})();
