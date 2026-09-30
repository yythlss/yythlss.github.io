/* =====================================================================
   github-gba.js — 页面行为：精灵挂载、贡献热力图、仓库详情切换、
   仓库标签页、左栏搜索过滤、杰尼龟对话气泡
   ---------------------------------------------------------------------
   数据来源（三层，逐级降级，并在界面上如实标注当前用的是哪一层）：
   1. GitHub REST API（实时）：仓库列表 / 仓库详情 / 文件列表 / README /
      议题 / 拉取请求 / 公开动态 —— 用户 yythlss
   2. 缓存：localStorage + ETag 条件请求（304 不消耗配额），标注缓存时间
   3. 本地内置数据（兜底）：明确标注「离线数据」，不再假装实时

   为什么之前看起来"不更新"：未认证 API 只有 60 次/小时/IP，
   而一次访问最多要发 11 个请求 → 配额很快耗尽，之后全部静默失败，
   页面退回写死的内置数据。现在的做法：
   - 所有请求走缓存（列表 10 分钟、详情 30 分钟、热力图 6 小时）
   - 带 If-None-Match，命中 304 不消耗配额
   - 读取 X-RateLimit-Remaining，配额耗尽后不再发新请求，直接用缓存
   - 文件 / README / 议题 / PR 只在切到对应标签页时才请求
   - 状态徽章实时显示：实时 / 缓存 / 配额用尽 / 离线
   ===================================================================== */
(function () {
  'use strict';

  var GITHUB_USER = 'yythlss';

  /* ------------------------------------------------------------- 工具 */
  function makeRandom(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function relTime(date) {
    var diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
    if (diff < 604800) return Math.floor(diff / 86400) + ' 天前';
    if (diff < 2592000) return Math.floor(diff / 604800) + ' 周前';
    if (diff < 31536000) return Math.floor(diff / 2592000) + ' 个月前';
    return Math.floor(diff / 31536000) + ' 年前';
  }

  /* ------------------------------------------------- 缓存（localStorage）
     私有模式 / 禁用存储时 localStorage 会抛错，全部包 try-catch，失败即不缓存 */
  var CACHE_PREFIX = 'gba.v2.';
  var TTL = { list: 10 * 60 * 1000, detail: 30 * 60 * 1000, heat: 6 * 60 * 60 * 1000, long: 6 * 60 * 60 * 1000 };

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      var v = JSON.parse(raw);
      return (v && typeof v === 'object' && 'body' in v) ? v : null;
    } catch (e) { return null; }
  }
  function cacheSet(key, value) {
    try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }

  /* ------------------------------------------------- 配额与状态
     未认证 API：60 次/小时/IP。剩余为 0 时停止发新请求，改用缓存兜底 */
  var quota = { remaining: -1, resetAt: 0, limited: false };
  var feed = { live: 0, cache: 0, fail: 0, liveAt: 0, cacheAt: 0 };

  function noteQuota(headers) {
    if (!headers || typeof headers.get !== 'function') return;
    var rem = headers.get('X-RateLimit-Remaining');
    var reset = headers.get('X-RateLimit-Reset');
    if (rem !== null) {
      quota.remaining = parseInt(rem, 10);
      if (quota.remaining <= 0) quota.limited = true;
    }
    if (reset !== null) quota.resetAt = parseInt(reset, 10) * 1000;
    refreshStatus();
  }

  function quotaBlocked() {
    if (!quota.limited) return false;
    if (quota.resetAt && Date.now() > quota.resetAt) { // 到点自动解除
      quota.limited = false;
      quota.remaining = -1;
      return false;
    }
    return true;
  }

  function servedLive() {
    feed.live++; feed.liveAt = Date.now();
    refreshStatus();
  }
  function servedCache(at) {
    feed.cache++;
    if (at) feed.cacheAt = Math.max(feed.cacheAt || 0, at);
    refreshStatus();
  }
  function servedFail() { feed.fail++; refreshStatus(); }

  function clock(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    var sameDay = new Date().toDateString() === d.toDateString();
    return sameDay ? hm : (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + hm;
  }

  /* 状态徽章：如实告诉访问者当前看到的是实时数据还是缓存/离线数据 */
  function refreshStatus() {
    var el = $('#live-status');
    if (!el) return;
    var kind, text;
    if (feed.live > 0) {
      kind = 'live';
      text = 'GitHub API 实时 · ' + clock(feed.liveAt);
    } else if (feed.cache > 0) {
      kind = quota.limited ? 'quota' : 'cache';
      text = (quota.limited ? 'API 配额用尽，' + clock(quota.resetAt) + ' 恢复' : '网络较慢，已降级') +
        ' · 显示 ' + clock(feed.cacheAt) + ' 的数据';
    } else if (feed.fail > 0) {
      kind = 'offline';
      text = '无法连接 GitHub API，显示离线数据';
    } else {
      kind = 'loading';
      text = '正在获取实时数据…';
    }
    el.className = 'live-badge is-' + kind;
    el.textContent = text;
    el.title = text + '（未认证 API 限额 60 次/小时/IP）';
  }

  /* ------------------------------------------------- 带超时与缓存的请求 */
  function timedFetch(url, init, ms) {
    // api.github.com 在部分网络下会"挂住"（既不成功也不失败），必须主动中断
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms || 8000) : 0;
    var opt = init || {};
    if (ctrl) opt.signal = ctrl.signal;
    return fetch(url, opt).then(function (r) { clearTimeout(timer); return r; },
      function (e) { clearTimeout(timer); throw e; });
  }

  /* 通用缓存请求：handler(res) 把响应转成要缓存的值（JSON / 文本 / 数字） */
  function cachedFetch(url, key, ttl, handler, accept) {
    var cached = cacheGet(key);
    if (cached && Date.now() - cached.t < ttl) {
      servedCache(cached.t);
      return Promise.resolve(cached.body);
    }
    if (quotaBlocked()) {
      if (cached) { servedCache(cached.t); return Promise.resolve(cached.body); }
      return Promise.reject(new Error('QUOTA'));
    }
    var headers = { 'Accept': accept || 'application/vnd.github+json' };
    if (cached && cached.etag) headers['If-None-Match'] = cached.etag;
    return timedFetch(url, { headers: headers }, 8000).then(function (r) {
      noteQuota(r.headers);
      if (r.status === 304 && cached) {           // 内容未变：不消耗配额
        cached.t = Date.now();
        cacheSet(key, cached);
        servedCache(cached.t);
        return cached.body;
      }
      if (r.status === 403 || r.status === 429) {  // 限流
        quota.limited = true;
        noteQuota(r.headers);
        if (cached) { servedCache(cached.t); return cached.body; }
        throw new Error('QUOTA');
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return handler(r).then(function (body) {
        cacheSet(key, { t: Date.now(), etag: r.headers.get('ETag') || '', body: body });
        servedLive();
        return body;
      });
    });
  }

  /* GitHub API：opts = { raw, key, ttl }（也兼容旧的 ghFetch(path, true)） */
  function ghFetch(path, opts) {
    var o = (opts === true) ? { raw: true } : (opts || {});
    var base = 'https://api.github.com' + path;
    var key = o.key || ((o.raw ? 'raw:' : 'json:') + path);
    var ttl = o.ttl || (o.raw ? TTL.detail : TTL.list);
    return cachedFetch(base, key, ttl, function (r) {
      return o.raw ? r.text() : r.json();
    }, o.raw ? 'application/vnd.github.raw' : 'application/vnd.github+json');
  }

  /* 靠 Link 头取总数（只取 1 条，最省配额），结果同样进缓存 */
  function ghCount(path, key) {
    return cachedFetch('https://api.github.com' + path, key, TTL.detail, function (r) {
      var m = /[?&]page=(\d+)>;\s*rel="last"/.exec(r.headers.get('Link') || '');
      return Promise.resolve(m ? +m[1] : 1);
    });
  }

  /* --------------------------------------------------- 本地兜底数据 + 精灵映射 */
  var SPRITE_NAMES = {
    pikachu: '皮卡丘', squirtle: '杰尼龟', eevee: '伊布', bulbasaur: '妙蛙种子',
    charmander: '小火龙', gengar: '耿鬼', pokeball: '精灵球', berry: '树果',
    trainerFront: '训练家'
  };

  var LANG_SPRITE = {
    'C': 'squirtle', 'C++': 'pikachu', 'Python': 'bulbasaur', 'TypeScript': 'eevee',
    'HTML': 'berry', 'JavaScript': 'pikachu', 'Java': 'gengar', 'C#': 'charmander',
    'Shell': 'charmander', 'Vue': 'eevee', 'Go': 'bulbasaur', 'Rust': 'gengar'
  };

  var LANG_COLOR = {
    'C': '#555555', 'C++': '#f34b7d', 'Python': '#3572A5', 'TypeScript': '#3178c6',
    'HTML': '#e34c26', 'JavaScript': '#f1e05a', 'Java': '#b07219', 'C#': '#178600',
    'Shell': '#89e051', 'CSS': '#563d7c', 'Vue': '#41b883', 'Go': '#00ADD8',
    'Rust': '#dea584', 'Arduino': '#bd79d1', 'Multisim': '#f69e1d'
  };

  /* 内置兜底数据：2026-09-30 从 GitHub API 抓的真实快照
     仅在「配额用尽 + 无缓存 + 网络不通」时显示，界面会标注为离线数据
     星标 / 复刻 / 语言 / 默认分支均为真实值；commits、branches 未知故留空（显示 —） */
  var REPOS = [
    { name: 'farm-game', sprite: 'bulbasaur', lang: 'Python', color: '#3572A5',
      desc: 'AI 种田经营小游戏：规则引擎负责公平结算，大模型负责让每一天都不重样。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-09-30T07:29:44Z', createdAt: '2026-09-30T07:26:51Z',
      topics: ['python', 'game', 'llm'],
      url: 'https://github.com/yythlss/farm-game',
      files: null,
      readme: { lede: '30 天，把一块薄田经营成产业——规则引擎负责公平结算，大模型负责让每一天都不重样。',
        list: ['无需下载，点击即玩', '规则引擎负责公平结算', '大模型生成每日事件'] },
      issues: [], pulls: [], actions: [] },

    { name: 'keep-track-of-expense', sprite: 'eevee', lang: 'Python', color: '#3572A5',
      desc: '小账本 · 一句话记账：AI 自动识别金额、分类与日期，日历经松回看每天开销。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-09-30T07:23:51Z', createdAt: '2026-09-30T07:19:12Z',
      topics: ['python', 'expense', 'llm'],
      url: 'https://github.com/yythlss/keep-track-of-expense',
      files: null,
      readme: { lede: '说一句话就能记账，AI 帮你看懂钱包：自动识别金额、分类与日期。',
        list: ['一句话完成记账', '日历回看每天开销', '月度看板自动统计'] },
      issues: [], pulls: [], actions: [] },

    { name: 'd12x', sprite: 'charmander', lang: 'C', color: '#555555',
      desc: 'C 语言项目（仓库暂无简介）。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'start', pushedAt: '2026-09-30T01:57:52Z', createdAt: '2026-09-30T01:57:52Z',
      topics: ['c'],
      url: 'https://github.com/yythlss/d12x',
      files: null,
      readme: { lede: 'C 语言项目，仓库暂无 README。',
        list: ['（离线数据：连接 GitHub 后显示真实 README）'] },
      issues: [], pulls: [], actions: [] },

    { name: 'yythlss.github.io', sprite: 'berry', lang: 'HTML', color: '#e34c26',
      desc: '就是你现在看到的这个宝可梦风格主页。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-09-29T13:50:13Z', createdAt: '2026-07-31T00:00:00Z',
      topics: ['github-pages', 'css'],
      url: 'https://github.com/yythlss/yythlss.github.io',
      files: [
        { name: 'assets/', dir: true, update: 'add: 横幅图', time: '离线快照' },
        { name: 'index.html', dir: false, update: 'feat: 仓库详情布局', time: '离线快照' },
        { name: 'sprites.js', dir: false, update: 'feat: 像素精灵数据', time: '离线快照' }
      ],
      readme: { lede: '用 HTML / CSS / JavaScript 搭的界面，把 GitHub 主页重绘成宝可梦风格的野外画面。',
        list: ['横幅取自参考图', 'GitHub API 实时数据（带缓存与配额控制）', '贡献热力图 + 对话气泡'] },
      issues: [], pulls: [], actions: [] },

    { name: 'rsoc-rtt', sprite: 'gengar', lang: 'C', color: '#555555',
      desc: '2026 RT-Thread 暑期夏令营仓库，含学员笔记与每日作业。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'master', pushedAt: '2026-09-29T13:34:13Z', createdAt: '2026-09-29T13:34:13Z',
      topics: ['rt-thread', 'rtos', 'embedded'],
      url: 'https://github.com/yythlss/rsoc-rtt',
      files: null,
      readme: { lede: '2026 RT-Thread 暑期夏令营学员仓库：按「年份 / 分组 / 姓名」组织笔记与作业。',
        list: ['内核笔记与驱动笔记', '每日作业归档', '夏令营学习记录'] },
      issues: [], pulls: [], actions: [] },

    { name: 'ProtoVibe-Agent', sprite: 'pokeball', lang: 'TypeScript', color: '#3178c6',
      desc: '面向 AI 产品原型与交互 Agent 的结构化产品工作台。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-08-15T14:34:24Z', createdAt: '2026-07-29T00:00:00Z',
      topics: ['typescript', 'agent', 'prototype', 'react'],
      url: 'https://github.com/yythlss/ProtoVibe-Agent',
      files: [
        { name: 'src/', dir: true, update: 'feat: 流程画布节点编排', time: '离线快照' },
        { name: 'package.json', dir: false, update: 'chore: 依赖升级', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 架构图', time: '离线快照' }
      ],
      readme: { lede: '收服一个想法就像投出一颗精灵球：把 AI 产品原型拆成节点，在画布上连一连就能跑。',
        list: ['可视化 Agent 流程编排画布', '内置提示词模板与变量插槽', 'React 18 + Zustand + Vite'] },
      issues: [], pulls: [], actions: [] },

    { name: 'yythlss', sprite: 'trainerFront', lang: 'Other', color: '#8b949e',
      desc: 'GitHub 个人主页 README。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-08-09T10:54:24Z', createdAt: '2026-07-31T00:00:00Z',
      topics: ['profile'],
      url: 'https://github.com/yythlss/yythlss',
      files: null,
      readme: { lede: '武汉理工大学电子信息工程本科生，关注嵌入式系统、智能硬件与数字 / 模拟电路。',
        list: ['精选嵌入式与硬件项目', '技术栈与当前方向', '联系方式'] },
      issues: [], pulls: [], actions: [] },

    { name: 'FreeRTOS-Warehouse-Count-Access-System', sprite: 'squirtle', lang: 'C', color: '#555555',
      desc: '基于 STM32F103C8T6 与 FreeRTOS 的仓库人数统计和门禁演示系统。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-08-01T06:51:26Z', createdAt: '2026-07-28T00:00:00Z',
      topics: ['stm32', 'freertos', 'rtos', 'access-control'],
      url: 'https://github.com/yythlss/FreeRTOS-Warehouse-Count-Access-System',
      files: [
        { name: 'Core/', dir: true, update: 'fix: 红外对射计数消抖', time: '离线快照' },
        { name: 'Drivers/', dir: true, update: 'init: HAL 库工程', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 任务调度说明', time: '离线快照' }
      ],
      readme: { lede: '仓库门口的「人数守门员」：进一个人加一，出一个人减一，超限就拉警报。',
        list: ['FreeRTOS 四任务：计数 / 门禁 / 显示 / 报警', '红外对射传感器双向进出识别', 'OLED 实时显示在场人数'] },
      issues: [], pulls: [], actions: [] },

    { name: 'Time-Limited-Four-Channel-Responder-Based-on-Digital-Circuits', sprite: 'gengar', lang: 'Other', color: '#f69e1d',
      desc: '基于 74LS 系列数字集成电路的四路限时抢答器。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-08-01T06:24:06Z', createdAt: '2026-07-31T00:00:00Z',
      topics: ['digital-circuits', '74ls', 'multisim'],
      url: 'https://github.com/yythlss/Time-Limited-Four-Channel-Responder-Based-on-Digital-Circuits',
      files: [
        { name: 'multisim/', dir: true, update: 'feat: 主持人复位电路', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 状态转移说明', time: '离线快照' }
      ],
      readme: { lede: '数电课设：四只耿鬼抢答一只精灵球——74LS148 编码、74LS279 锁存、555 倒计时。',
        list: ['优先编码 + 锁存', '倒计时与超时报警'] },
      issues: [], pulls: [], actions: [] },

    { name: 'Smart-Desktop-Pet', sprite: 'eevee', lang: 'C', color: '#555555',
      desc: '基于嘉立创开源电子宠物项目优化的离线语音桌面宠物。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-07-31T05:16:38Z', createdAt: '2026-07-31T00:00:00Z',
      topics: ['desktop-pet', 'voice-interaction'],
      url: 'https://github.com/yythlss/Smart-Desktop-Pet',
      files: [
        { name: 'firmware/', dir: true, update: 'feat: 摸头交互动作', time: '离线快照' },
        { name: 'hardware/', dir: true, update: 'init: 原理图与外壳', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 演示视频链接', time: '离线快照' }
      ],
      readme: { lede: '一只住在你桌上的伊布：离线语音唤醒、摸头会开心、久不理会会睡觉的桌面电子宠物。',
        list: ['离线语音识别，不联网也能互动', '六种情绪状态机', '1.54 寸 LCD 像素动画'] },
      issues: [], pulls: [], actions: [] },

    { name: 'Temperature-Limit-Alarm-Based-on-Analog-Electronics', sprite: 'charmander', lang: 'Other', color: '#f69e1d',
      desc: 'MF58 NTC + LM358 窗口比较器 + 双 NE555 的纯模拟高低温声光报警系统。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-07-31T04:51:36Z', createdAt: '2026-07-31T00:00:00Z',
      topics: ['analog-electronics', 'multisim', 'ne555'],
      url: 'https://github.com/yythlss/Temperature-Limit-Alarm-Based-on-Analog-Electronics',
      files: [
        { name: 'schematic/', dir: true, update: 'docs: 元件清单核对', time: '离线快照' },
        { name: 'simulation/', dir: true, update: 'fix: 迟滞比较器阈值', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 仿真截图', time: '离线快照' }
      ],
      readme: { lede: '纯模拟电路课程设计：温度越界，灯亮蜂鸣器叫，没有任何单片机参与。',
        list: ['MF58 NTC 测温电桥', 'LM358 窗口比较器', '双 NE555 声光报警'] },
      issues: [], pulls: [], actions: [] },

    { name: 'Smart-Home-Controller', sprite: 'pikachu', lang: 'C++', color: '#f34b7d',
      desc: 'ESP32-S3 智能家居终端，集成小智 AI、环境传感器、毫米波雷达、串口屏与微信小程序。',
      stars: 2, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-07-30T14:39:40Z', createdAt: '2026-07-21T00:00:00Z',
      topics: ['esp32-s3', 'smart-home', 'iot', 'xiaozhi-ai', 'wechat-miniprogram'],
      url: 'https://github.com/yythlss/Smart-Home-Controller',
      files: [
        { name: 'components/', dir: true, update: 'feat: 毫米波雷达存在检测', time: '离线快照' },
        { name: 'main/', dir: true, update: 'feat: 小智 AI 语音对话', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 更新演示说明', time: '离线快照' }
      ],
      readme: { lede: '基于 ESP32-S3 的智能家居中控终端：一块串口屏 + 一路语音 + 一堆传感器。',
        list: ['小智 AI 离线唤醒 + 流式语音对话', '温湿度 / 烟雾 / 毫米波雷达存在检测', '串口屏仪表盘 + 微信小程序远程查看'] },
      issues: [], pulls: [], actions: [] },

    { name: 'MemoStudy-Agent', sprite: 'bulbasaur', lang: 'Python', color: '#3572A5',
      desc: '本地优先的个人知识管理与学习助手，支持知识库问答与复盘。',
      stars: 1, forks: 0, watchers: 1, commits: null, branches: null, license: '无许可证',
      defaultBranch: 'main', pushedAt: '2026-07-29T11:27:11Z', createdAt: '2026-07-29T00:00:00Z',
      topics: ['python', 'rag', 'knowledge-base', 'llm'],
      url: 'https://github.com/yythlss/MemoStudy-Agent',
      files: [
        { name: 'src/', dir: true, update: 'feat: 混合检索重排序', time: '离线快照' },
        { name: 'tests/', dir: true, update: 'test: 评测集覆盖', time: '离线快照' },
        { name: 'README.md', dir: false, update: 'docs: 快速上手指南', time: '离线快照' }
      ],
      readme: { lede: '像妙蛙种子慢慢发芽一样积累知识：本地优先的 RAG 学习助手。',
        list: ['本地向量库 + BM25 混合检索', 'Markdown 笔记自动索引', '数据完全留在本机'] },
      issues: [], pulls: [], actions: [] }
  ];

  /* 兜底数据归一化：pushedAt 转时间戳，生成"离线快照"标注 */
  REPOS.forEach(function (r) {
    if (typeof r.pushedAt === 'string') r.pushedAt = Date.parse(r.pushedAt);
    if (!r.updated) r.updated = '离线快照 · ' + dateKey(new Date(r.pushedAt || Date.now()));
  });

  function findRepo(name) {
    for (var i = 0; i < REPOS.length; i++) {
      if (REPOS[i].name === name) return REPOS[i];
    }
    return null;
  }

  /* 实时数据状态 */
  var live = { ok: false, repos: [], user: null, at: 0, fromCache: false };
  var currentRepo = null;
  var currentTab = 'code';

  /* 把 GitHub API 返回的仓库与本地兜底数据合并 */
  function mergeRepo(api) {
    var cur = findRepo(api.name) || {};
    var lang = api.language || '其它';
    return {
      name: api.name,
      sprite: cur.sprite || LANG_SPRITE[lang] || 'pokeball',
      lang: lang,
      color: LANG_COLOR[lang] || '#8b949e',
      desc: api.description || cur.desc || '这个仓库还没有简介。',
      stars: api.stargazers_count || 0,
      forks: api.forks_count || 0,
      watchers: api.subscribers_count || cur.watchers || 0,
      openIssues: api.open_issues_count || 0,
      commits: cur.commits != null ? cur.commits : null,
      branches: cur.branches != null ? cur.branches : null,
      license: api.license ? (api.license.name || '许可证') : (cur.license || '无许可证'),
      defaultBranch: api.default_branch || 'main',
      updated: '更新于 ' + relTime(new Date(api.pushed_at || api.updated_at)),
      pushedAt: new Date(api.pushed_at || api.updated_at).getTime() || 0,
      createdAt: api.created_at || null,
      topics: (api.topics && api.topics.length) ? api.topics : (cur.topics || []),
      url: api.html_url,
      live: true,
      issues: cur.issues || [], pulls: cur.pulls || [], actions: cur.actions || [],
      filesCurated: cur.files || null,
      readmeCurated: cur.readme || null,
      _files: null, _readme: null, _issuesLive: null, _pullsLive: null
    };
  }

  /* --------------------------------------------------- 1. 像素精灵挂载 */
  function initSprites() {
    if (typeof window.mountSprites === 'function') window.mountSprites(document);

    var tip = document.createElement('div');
    tip.className = 'sprite-tip';
    document.body.appendChild(tip);

    function bindTips(scope) {
      $$('.pokeball-mark, .repo-bar-sprite, .bubble-sprite, .repo-ic, .act-sprite', scope).forEach(function (node) {
        if (node._tipBound) return;
        node._tipBound = true;
        node.addEventListener('mouseenter', function () {
          var label = node.getAttribute('data-label') ||
            (node.classList.contains('pokeball-mark') ? '精灵球' : '');
          if (!label) return;
          var box = node.getBoundingClientRect();
          tip.textContent = label;
          tip.style.left = (box.left + box.width / 2) + 'px';
          tip.style.top = (box.top - 6) + 'px';
          tip.classList.add('is-on');
        });
        node.addEventListener('mouseleave', function () { tip.classList.remove('is-on'); });
      });
    }
    bindTips(document);
    // 动态渲染的节点也要挂提示
    window._bindSpriteTips = bindTips;

    var squirtle = $('.bubble-sprite');
    if (squirtle) {
      squirtle.addEventListener('click', function () {
        say('杰尼龟：杰尼杰尼！（意思是——记得给项目点个 Star。）');
      });
      squirtle.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); squirtle.click(); }
      });
    }
  }

  /* ------------------------------------------------- 2. 贡献热力图 */
  function heatmapCell(level, stamp, count) {
    var el = document.createElement('i');
    el.className = 'cell l' + level;
    el.title = stamp + '：捕获 ' + count + ' 只宝可梦（' + count + ' 次贡献）';
    el.setAttribute('aria-label', el.title);
    el.dataset.count = count;
    el.dataset.date = stamp;
    return el;
  }

  function bindHeatmapClick(host) {
    host.addEventListener('click', function (event) {
      var cell = event.target.closest('.cell');
      if (!cell) return;
      say('杰尼龟：' + cell.dataset.date + ' 在那片草丛里捕获了 ' + cell.dataset.count + ' 只宝可梦，' +
        (Number(cell.dataset.count) > 9 ? '那天手感奇佳！' : '虽然不算多，但每天都要来草丛走一圈。'));
    });
  }

  function setMonths(labels) {
    var months = $('.heat-months');
    if (!months) return;
    months.innerHTML = labels.map(function (m) { return '<span>' + m + '</span>'; }).join('');
  }

  /* 统一渲染近 26 周热力图：byDate = { 'YYYY-MM-DD': count } */
  function renderHeatmap(byDate, meta) {
    var host = $('#heatmap');
    if (!host) return;
    var weeks = 26, days = 7;
    var today = new Date();
    var frag = document.createDocumentFragment();
    var total = 0;
    var monthLabels = [];
    var lastMonth = -1;

    for (var w = 0; w < weeks; w++) {
      for (var d = 0; d < days; d++) {
        var date = new Date(today.getTime() - ((weeks - 1 - w) * 7 + (6 - d)) * 86400000);
        var key = dateKey(date);
        var count = byDate[key] || 0;
        total += count;
        var level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
        frag.appendChild(heatmapCell(level, key, count));
      }
      // 每列第一天的月份变化时记录标签（月份标签因此永远是真实的）
      var colDate = new Date(today.getTime() - ((weeks - 1 - w) * 7) * 86400000);
      if (colDate.getMonth() !== lastMonth) {
        lastMonth = colDate.getMonth();
        monthLabels.push((colDate.getMonth() + 1) + '月');
      }
    }
    host.innerHTML = '';
    host.appendChild(frag);
    if (!host._clickBound) { bindHeatmapClick(host); host._clickBound = true; }
    setMonths(monthLabels);

    var year = $('#grass-year');
    if (year) {
      year.textContent = meta.sample
        ? '示例数据 · 未连上贡献数据源'
        : total.toLocaleString() + ' 次贡献（近半年' + (meta.suffix || '') + '）';
    }
  }

  /* 兜底：固定种子随机图 —— 只作为占位，明确标注为示例数据 */
  function sampleHeatmap() {
    var host = $('#heatmap');
    if (!host) return;
    var weeks = 26, days = 7;
    var rand = makeRandom(20260214);
    var today = new Date();
    var byDate = {};
    for (var w = 0; w < weeks; w++) {
      for (var d = 0; d < days; d++) {
        var isWeekend = d === 0 || d === 6;
        var level = 0;
        if (rand() < (isWeekend ? 0.62 : 0.86)) {
          var weight = rand();
          level = weight > 0.86 ? 4 : weight > 0.62 ? 3 : weight > 0.34 ? 2 : 1;
        }
        if (w > weeks - 8 && !isWeekend && rand() > 0.45) level = Math.max(level, 3);
        var perLevel = [0, 2, 5, 9, 16];
        var count = level === 0 ? 0 : perLevel[level] - Math.floor(rand() * 2);
        if (count < 0) count = 0;
        var date = new Date(today.getTime() - ((weeks - 1 - w) * 7 + (6 - d)) * 86400000);
        byDate[dateKey(date)] = count;
      }
    }
    renderHeatmap(byDate, { sample: true });
  }

  /* 首屏：有缓存先用缓存，否则渲染示例图占位 */
  function initHeatmap() {
    var cached = cacheGet('heat');
    if (cached && Date.now() - cached.t < TTL.heat) {
      renderHeatmap(cached.body, { suffix: ' · 缓存' });
      return;
    }
    var year = $('#grass-year');
    if (year) year.textContent = '贡献数据加载中…';
    sampleHeatmap();
  }

  /* 真实贡献数据：依次尝试多个数据源（各 7 秒超时）→ ghchart 真实图 → 保留示例图 */
  var HEAT_SOURCES = [
    'https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER,
    'https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last'
  ];

  function ghChartFallback() {
    var host = $('#heatmap');
    if (!host) return;
    var img = new Image();
    img.className = 'heatmap-img';
    img.alt = 'yythlss 的 GitHub 真实贡献图（来自 ghchart）';
    img.onload = function () {
      host.innerHTML = '';
      host.appendChild(img);
      var year = $('#grass-year');
      if (year) year.textContent = '真实贡献图 · ghchart（无精确总数）';
    };
    img.onerror = function () {
      var year = $('#grass-year');
      if (year) year.textContent = '示例数据 · 未连上贡献数据源';
    };
    img.src = 'https://ghchart.rshah.org/' + GITHUB_USER;
  }

  function tryLiveHeatmap() {
    var host = $('#heatmap');
    if (!host || typeof fetch !== 'function') return;
    var cached = cacheGet('heat');
    if (cached && Date.now() - cached.t < TTL.heat) {
      renderHeatmap(cached.body, { suffix: ' · 缓存' });
      return;
    }

    var i = 0;
    (function next() {
      if (i >= HEAT_SOURCES.length) { ghChartFallback(); return; }
      var url = HEAT_SOURCES[i++];
      timedFetch(url, { headers: { 'Accept': 'application/json' } }, 7000)
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          if (!data || !Array.isArray(data.contributions)) throw new Error('bad');
          var byDate = {};
          data.contributions.forEach(function (c) { byDate[c.date] = c.count; });
          cacheSet('heat', { t: Date.now(), etag: '', body: byDate });
          renderHeatmap(byDate, { suffix: ' · 实时' });
        })
        .catch(next);
    })();
  }

  /* ------------------------------------- 3. 仓库详情渲染 */
  function fileRowHtml(file) {
    return '<li class="file-row' + (file.dir ? ' is-dir' : '') + '">' +
      '<span class="file-icon" aria-hidden="true"></span>' +
      '<span class="file-name">' + esc(file.name) + '</span>' +
      '<span class="file-update">' + esc(file.update || '') + '</span>' +
      '<span class="file-time">' + esc(file.time || '') + '</span>' +
      '</li>';
  }

  function issueRowHtml(item) {
    var mark = item.state === 'closed' ? 'is-closed' : item.state === 'merged' ? 'is-merged' : item.state === 'pr' ? 'is-pr' : 'is-open';
    return '<li>' +
      '<span class="issue-mark ' + mark + '" aria-hidden="true"></span>' +
      '<div><p class="issue-title">' + esc(item.title) + '</p>' +
      '<p class="issue-sub">' + esc(item.sub) + '</p></div>' +
      '</li>';
  }

  function actionRowHtml(item) {
    return '<li>' +
      '<span class="action-dot ' + (item.state === 'fail' ? 'is-fail' : 'is-pass') + '" aria-hidden="true"></span>' +
      '<div><p class="issue-title">' + esc(item.name) + '</p>' +
      '<p class="issue-sub">' + (item.state === 'fail' ? '失败 · ' : '通过 · ') + esc(item.time) + '</p></div>' +
      '</li>';
  }

  function renderRepo(repo) {
    currentRepo = repo;
    if (!repo) return;

    // 顶栏
    $('#repo-title').textContent = GITHUB_USER + ' / ' + repo.name;
    var spriteEl = $('#repo-bar-sprite');
    spriteEl.setAttribute('data-sprite', repo.sprite);
    spriteEl.setAttribute('data-label', SPRITE_NAMES[repo.sprite] || '宝可梦');
    var m = (typeof window.spriteMetrics === 'function') ? window.spriteMetrics(repo.sprite) : { w: 20, h: 20 };
    spriteEl.style.setProperty('--sw', m.w * 2);
    spriteEl.style.setProperty('--sh', m.h * 2);
    if (typeof window.spriteDataUri === 'function') {
      spriteEl.style.backgroundImage = 'url("' + window.spriteDataUri(repo.sprite) + '")';
    }

    // 简介 + 主题
    $('#repo-desc').textContent = repo.desc;
    $('#repo-topics').innerHTML = (repo.topics || []).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');

    // 标签页计数
    // 实时仓库的议题数用 openIssues；PR 数要拉取后才知道，未拉取时显示 ·（不编造数字）
    $('#tab-issues').textContent = repo.live ? repo.openIssues : repo.issues.length;
    $('#tab-pulls').textContent = repo._pullsLive ? pullCountLabel(repo._pullsLive.length)
      : (repo.live ? '·' : repo.pulls.length);

    // 代码页：提交数 / 分支数未知时显示 —，不用内置假数字顶替
    $('#branch-chip').textContent = '⎇ ' + (repo.defaultBranch || 'main');
    $('#stat-commits').textContent = repo.commits == null ? '—' : repo.commits;
    $('#stat-branches').textContent = repo.branches == null ? '—' : repo.branches;
    $('#stat-license').textContent = repo.license;
    $('#fork-count').textContent = repo.forks;

    // 文件列表：实时数据 > 内置数据 > 占位（拉取中 / 离线 / 配额用尽）
    renderFiles(repo);

    // README：实时数据 > 内置数据
    renderReadme(repo);

    // 议题 / 拉取请求 / Actions
    var issues = repo._issuesLive || repo.issues;
    $('#issue-list').innerHTML = issues.length
      ? issues.map(issueRowHtml).join('')
      : '<li><span class="issue-mark is-open"></span><div><p class="issue-title">还没有议题</p><p class="issue-sub">这片草丛非常安静</p></div></li>';
    var pulls = repo._pullsLive || repo.pulls;
    $('#pull-list').innerHTML = pulls.length
      ? pulls.map(issueRowHtml).join('')
      : '<li><span class="issue-mark is-pr"></span><div><p class="issue-title">没有待处理的拉取请求</p><p class="issue-sub">训练家把分支都收服了</p></div></li>';
    $('#action-list').innerHTML = repo.actions.length
      ? repo.actions.map(actionRowHtml).join('')
      : '<li><span class="action-dot"></span><div><p class="issue-title">尚未配置工作流</p><p class="issue-sub">纯硬件 / 仿真仓库，不需要 CI</p></div></li>';

    // 星标按钮复位
    var starBtn = $('#btn-star');
    starBtn.setAttribute('aria-pressed', 'false');
    $('#star-count').textContent = repo.stars;

    // 实时仓库：文件 / README / 提交数只在「代码」页可见时才请求，省配额
    if (repo.live && currentTab === 'code') fetchLiveCodeData(repo);
  }

  function pullCountLabel(n) { return n >= 8 ? '8+' : String(n); }

  /* 代码页需要的数据，按需加载（结果全部进缓存，30 分钟内不再发请求） */
  function fetchLiveCodeData(repo) {
    if (!repo._files) fetchLiveFiles(repo);
    if (!repo._readme) fetchLiveReadme(repo);
    fetchLiveRepoStats(repo);
  }

  /* 文件列表渲染：实时 > 内置 > 占位文案（并把失败原因如实说出来） */
  function renderFiles(repo, err) {
    var el = $('#file-list');
    if (!el) return;
    // 实时仓库用 filesCurated，内置兜底数据用 files，两者都要兼容
    var files = (repo._files && repo._files.length) ? repo._files : (repo.filesCurated || repo.files);
    if (files && files.length) {
      el.innerHTML = files.map(fileRowHtml).join('');
      return;
    }
    var msg;
    if (repo._filesLoading) msg = '正在从 GitHub 拉取文件列表…';
    else if (err && /QUOTA/.test(err.message || '')) msg = 'API 配额用尽，暂无法拉取文件列表';
    else if (err && /HTTP 404/.test(err.message || '')) msg = '这个仓库还是空的——push 代码后再点开即可显示';
    else if (err) msg = '拉取超时或网络受阻，重新点开此仓库可重试';
    else msg = '离线数据：连接 GitHub 后显示文件列表';
    el.innerHTML = '<li class="file-row"><span class="file-icon"></span><span class="file-name">' +
      esc(msg) + '</span><span class="file-update"></span><span class="file-time"></span></li>';
  }

  function renderReadme(repo) {
    var readme = repo._readme || repo.readmeCurated || repo.readme;
    if (!readme) return;
    $('#readme-lede').textContent = readme.lede;
    $('#readme-list').innerHTML = readme.list.map(function (line) {
      return '<li>' + esc(line) + '</li>';
    }).join('');
  }

  /* 提交数（Link 头 rel="last" 页码）与分支数：带缓存，30 分钟内不重复请求 */
  function fetchLiveRepoStats(repo) {
    if (repo._statsFetched) return;
    repo._statsFetched = true;
    var base = '/repos/' + GITHUB_USER + '/' + encodeURIComponent(repo.name);
    ghCount(base + '/commits?per_page=1', 'commits:' + repo.name)
      .then(function (n) {
        repo.commits = n;
        if (currentRepo === repo) $('#stat-commits').textContent = n;
      })
      .catch(function () {});
    ghFetch(base + '/branches?per_page=100', { key: 'branches:' + repo.name, ttl: TTL.detail })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error('bad');
        repo.branches = list.length || 1;
        if (currentRepo === repo) $('#stat-branches').textContent = repo.branches;
      })
      .catch(function () {});
  }

  function fetchLiveFiles(repo) {
    repo._filesLoading = true;
    ghFetch('/repos/' + GITHUB_USER + '/' + encodeURIComponent(repo.name) + '/contents',
      { key: 'files:' + repo.name, ttl: TTL.detail })
      .then(function (entries) {
        repo._filesLoading = false;
        if (!Array.isArray(entries)) throw new Error('bad');
        repo._files = entries.map(function (e) {
          return { name: e.type === 'dir' ? e.name + '/' : e.name, dir: e.type === 'dir', update: '', time: '' };
        });
        if (currentRepo === repo) renderFiles(repo);
      })
      .catch(function (err) {
        repo._filesLoading = false;
        repo._files = null; // 失败不写入缓存，下次点开自动重试
        if (currentRepo === repo) renderFiles(repo, err);
      });
  }

  function stripMd(s) {
    return s.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_`>#|]/g, '')
      .trim();
  }

  function parseReadme(md) {
    var lines = md.split(/\r?\n/);
    var lede = '';
    var list = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (!l) continue;
      if (/^#{1,6}\s/.test(l)) continue;
      if (/^[-*+]\s+/.test(l) || /^\d+\.\s/.test(l)) {
        if (list.length < 5) list.push(stripMd(l.replace(/^([-*+]|\d+\.)\s+/, '')));
        continue;
      }
      if (!lede) {
        lede = stripMd(l);
        if (lede.length > 130) lede = lede.slice(0, 127) + '…';
      }
      if (lede && list.length >= 3) break;
    }
    return {
      lede: lede || '这个仓库还没有 README，先去看看代码吧。',
      list: list.length ? list : ['（README 为空或未解析出列表）']
    };
  }

  function fetchLiveReadme(repo) {
    ghFetch('/repos/' + GITHUB_USER + '/' + encodeURIComponent(repo.name) + '/readme',
      { raw: true, key: 'readme:' + repo.name, ttl: TTL.detail })
      .then(function (md) {
        repo._readme = parseReadme(md);
        if (currentRepo === repo) renderReadme(repo);
      })
      .catch(function (err) {
        if (/HTTP 404/.test(err && err.message || '') && currentRepo === repo) {
          $('#readme-lede').textContent = '这个仓库还没有 README。';
          $('#readme-list').innerHTML = '<li>先去看看代码，或者稍后再来。</li>';
        }
        /* 其余失败（限流 / 超时）保留内置文案 */
      });
  }

  /* 议题 / 拉取请求懒加载（切到对应标签页时才请求，结果进缓存） */
  function fetchLiveIssues(repo) {
    if (repo._issuesLive) return;
    repo._issuesLive = [];
    ghFetch('/repos/' + GITHUB_USER + '/' + encodeURIComponent(repo.name) + '/issues?state=open&per_page=8',
      { key: 'issues:' + repo.name, ttl: TTL.detail })
      .then(function (list) {
        repo._issuesLive = (Array.isArray(list) ? list : [])
          .filter(function (i) { return !i.pull_request; })
          .map(function (i) {
            return { title: i.title, sub: '#' + i.number + ' · 打开于 ' + relTime(new Date(i.created_at)), state: 'open' };
          });
        if (currentRepo === repo) {
          $('#issue-list').innerHTML = repo._issuesLive.length
            ? repo._issuesLive.map(issueRowHtml).join('')
            : '<li><span class="issue-mark is-open"></span><div><p class="issue-title">还没有议题</p><p class="issue-sub">这片草丛非常安静</p></div></li>';
        }
      })
      .catch(function () { /* 保留内置数据 */ });
  }

  function fetchLivePulls(repo) {
    if (repo._pullsLive) return;
    repo._pullsLive = [];
    ghFetch('/repos/' + GITHUB_USER + '/' + encodeURIComponent(repo.name) + '/pulls?state=all&per_page=8',
      { key: 'pulls:' + repo.name, ttl: TTL.detail })
      .then(function (list) {
        repo._pullsLive = (Array.isArray(list) ? list : []).map(function (p) {
          return {
            title: p.title,
            sub: (p.state === 'closed' ? (p.merged_at ? '合并' : '关闭') : '打开') + '于 ' +
              relTime(new Date(p.updated_at)) + ' · #' + p.number,
            state: p.merged_at ? 'merged' : (p.state === 'closed' ? 'closed' : 'pr')
          };
        });
        // PR 数拉取到了，把标签页上的 · 换成真实数量
        if (currentRepo === repo) $('#tab-pulls').textContent = pullCountLabel(repo._pullsLive.length);
        if (currentRepo === repo) {
          $('#pull-list').innerHTML = repo._pullsLive.length
            ? repo._pullsLive.map(issueRowHtml).join('')
            : '<li><span class="issue-mark is-pr"></span><div><p class="issue-title">没有待处理的拉取请求</p><p class="issue-sub">训练家把分支都收服了</p></div></li>';
        }
      })
      .catch(function () { /* 保留内置数据 */ });
  }

  function activateTab(name) {
    currentTab = name;
    $$('#repo-tabs .repo-tab').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-tab') === name);
    });
    $$('.repo-tabpanel').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-panel') === name);
    });
    if (currentRepo && currentRepo.live) {
      if (name === 'code') fetchLiveCodeData(currentRepo);
      if (name === 'issues') fetchLiveIssues(currentRepo);
      if (name === 'pulls') fetchLivePulls(currentRepo);
    }
  }

  function initRepoDetail() {
    if (!$('#repo-title')) return;

    // 左栏列表点击切换（事件委托，动态渲染的条目也生效）
    var list = $('#repo-list');
    list.addEventListener('click', function (event) {
      var item = event.target.closest('.repo-item');
      if (!item) return;
      event.preventDefault();
      $$('.repo-item').forEach(function (other) { other.classList.toggle('is-active', other === item); });
      var repo = findRepoLive(item.dataset.repo || '');
      if (repo) {
        renderRepo(repo);
        activateTab('code');
        say('杰尼龟：翻开了 ' + repo.name + ' 的图鉴页！★ ' + repo.stars + '，' + repo.lang + ' 编写，' + repo.updated + '。');
      }
    });

    // 标签页切换
    $$('#repo-tabs .repo-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.getAttribute('data-tab'));
      });
    });

    // 星标按钮
    var starBtn = $('#btn-star');
    starBtn.addEventListener('click', function () {
      var pressed = starBtn.getAttribute('aria-pressed') === 'true';
      starBtn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      var count = $('#star-count');
      count.textContent = Number(count.textContent) + (pressed ? -1 : 1);
      say(pressed ? '杰尼龟：取消了星标，宝可梦有点失落。'
                  : '杰尼龟：★ 已点亮星标！去 GitHub 上给 ' + (currentRepo ? currentRepo.name : '它') + ' 点一个真的吧！');
    });
  }

  function findRepoLive(name) {
    for (var i = 0; i < live.repos.length; i++) {
      if (live.repos[i].name === name) return live.repos[i];
    }
    return findRepo(name);
  }

  /* 左栏仓库列表渲染（实时数据到达后重建） */
  function renderRepoList(repos) {
    var list = $('#repo-list');
    if (!list) return;
    list.innerHTML = repos.map(function (r) {
      return '<li><a class="repo-item" href="#" data-repo="' + esc(r.name) + '">' +
        '<span class="repo-ic" data-sprite="' + r.sprite + '" data-scale="1"></span>' +
        '<span class="repo-name">' + esc(r.name) + '</span>' +
        '<span class="repo-star">★</span></a></li>';
    }).join('');
    var first = $('.repo-item', list);
    if (first) first.classList.add('is-active');
    if (typeof window.mountSprites === 'function') window.mountSprites(list);
    if (window._bindSpriteTips) window._bindSpriteTips(list);
  }

  function updateHint() {
    var hint = $('#repo-hint');
    if (!hint) return;
    var n = live.ok ? live.repos.length : REPOS.length;
    var suffix = live.ok ? (live.fromCache ? ' · 缓存数据' : ' · GitHub API 实时') : ' · 离线快照';
    hint.textContent = n + ' 个公开仓库' + suffix;
  }

  /* 右上角星标徽章：全部公开仓库的星标总数（实时优先，离线用真实快照值） */
  function updateStarChip() {
    var chip = $('.star-chip');
    if (!chip) return;
    var source = live.ok ? live.repos : REPOS;
    var total = 0;
    source.forEach(function (r) { total += r.stars || 0; });
    chip.innerHTML = '<span class="icon-star" aria-hidden="true"></span>' + total +
      '<span class="sr-only"> 颗星标</span>';
    chip.title = '全部公开仓库共获得 ' + total + ' 颗星标' +
      (live.ok ? (live.fromCache ? '（缓存数据）' : '（GitHub API 实时）') : '（离线快照）');
  }

  /* ------------------------------------- 4. 仓库搜索过滤（左栏与顶栏共用） */
  function filterRepos(q) {
    var list = $('#repo-list');
    if (!list) return 0;
    var shown = 0;
    $$('.repo-item', list).forEach(function (item) {
      var name = (item.dataset.repo || '').toLowerCase();
      var hit = !q || name.indexOf(q) > -1;
      item.parentElement.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    var hint = $('#repo-hint');
    if (hint) {
      if (q) hint.textContent = '匹配到 ' + shown + ' 个仓库';
      else updateHint();
    }
    return shown;
  }

  function initRepoSearch() {
    var input = $('#repo-search-input');
    if (!input) return;
    input.addEventListener('input', function () {
      filterRepos(input.value.trim().toLowerCase());
    });
  }

  /* 顶栏全局搜索：输入时同步过滤仓库列表；回车有匹配则定位，无匹配跳 GitHub 搜索 */
  function initNavSearch() {
    var form = $('.nav-search');
    var input = $('#search-input');
    if (!form || !input) return;
    input.addEventListener('input', function () {
      filterRepos(input.value.trim().toLowerCase());
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value.trim();
      if (!q) {
        say('杰尼龟：请先输入要搜索的仓库或训练家名字。');
        return;
      }
      var shown = filterRepos(q.toLowerCase());
      if (shown > 0) {
        say('杰尼龟：在草丛里找到了 ' + shown + ' 个匹配「' + q + '」的仓库，看左边！');
      } else {
        say('杰尼龟：本地没有「' + q + '」，去 GitHub 全站搜索看看！');
        window.open('https://github.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
      }
    });
  }

  /* ------------------------------------- 5. 实时动态（真实事件多源合并）
     events API 只保留近 90 天且经常缺失推送，所以动态由多个真实来源拼出：
     a) 仓库 pushed_at —— 真实的最后推送时间
     b) 仓库 created_at —— 真实的建仓时间
     c) events API —— 真实的星标 / 议题 / PR / 发版事件
     d) commits API —— 最近一次提交的真实 message（按需补充）
     全部按时间倒序合并、去重后渲染 */
  var liveEvents = [];
  var currentActivity = [];

  function spriteForRepo(name) {
    var r = findRepoLive(name);
    return r && r.sprite ? r.sprite : 'pokeball';
  }

  function shortMsg(msg) {
    var first = String(msg || '').split(/\r?\n/)[0].trim();
    if (first.length > 42) first = first.slice(0, 40) + '…';
    return first;
  }

  /* events API 事件 → 动态条目 */
  function eventToItem(ev) {
    var repo = ev.repo ? String(ev.repo.name).split('/')[1] : '';
    var p = ev.payload || {};
    var it = null;
    switch (ev.type) {
      case 'PushEvent':
        it = { kind: 'push', repo: repo,
          msg: p.commits && p.commits[0] ? shortMsg(p.commits[0].message) : '' };
        break;
      case 'CreateEvent':
        it = p.ref_type === 'repository'
          ? { kind: 'create-repo', repo: repo }
          : { kind: 'create-branch', repo: repo, ref: p.ref || '' };
        break;
      case 'WatchEvent': it = { kind: 'star', repo: repo }; break;
      case 'ForkEvent':  it = { kind: 'fork', repo: repo }; break;
      case 'ReleaseEvent':
        it = { kind: 'release', repo: repo, tag: p.release ? p.release.tag_name : '' };
        break;
      case 'IssuesEvent':
        it = { kind: 'issue', repo: repo, action: p.action,
          num: p.issue ? p.issue.number : '', title: p.issue ? p.issue.title : '' };
        break;
      case 'PullRequestEvent':
        it = { kind: 'pr', repo: repo, action: p.action,
          num: p.pull_request ? p.pull_request.number : '',
          merged: !!(p.pull_request && p.pull_request.merged) };
        break;
      default: return null;
    }
    it.at = new Date(ev.created_at);
    return it;
  }

  /* 仓库列表 → 真实的推送 / 建仓条目 */
  function repoDerivedItems(repos) {
    var items = [];
    repos.forEach(function (r) {
      if (r.pushedAt) items.push({ kind: 'push', repo: r.name, at: new Date(r.pushedAt) });
      if (r.createdAt) items.push({ kind: 'create-repo', repo: r.name, at: new Date(r.createdAt) });
    });
    return items;
  }

  function itemText(it) {
    switch (it.kind) {
      case 'push':
        return '推送了 <b>' + esc(it.msg || '代码更新') + '</b> 到 <b>' + esc(it.repo) + '</b>';
      case 'create-repo':
        return '创建了仓库 <b>' + esc(it.repo) + '</b>';
      case 'create-branch':
        return '创建了分支 <b>' + esc(it.ref) + '</b> 于 <b>' + esc(it.repo) + '</b>';
      case 'star':
        return '给 <b>' + esc(it.repo) + '</b> 点了星标';
      case 'fork':
        return '复刻了 <b>' + esc(it.repo) + '</b>';
      case 'release':
        return '发布了 <b>' + esc(it.tag || '新版本') + '</b> 于 <b>' + esc(it.repo) + '</b>';
      case 'issue':
        return (it.action === 'closed' ? '关闭了' : '打开了') + '议题 <b>#' + esc(it.num) + ' ' + esc(shortMsg(it.title)) + '</b> 于 <b>' + esc(it.repo) + '</b>';
      case 'pr':
        return (it.action === 'closed' ? (it.merged ? '合并了' : '关闭了') : '打开了') +
          '拉取请求 <b>#' + esc(it.num) + '</b> 于 <b>' + esc(it.repo) + '</b>';
      default:
        return '在 <b>' + esc(it.repo) + '</b> 有新动作';
    }
  }

  function renderActivityList() {
    var list = $('#activity-list');
    if (!list) return;
    if (!currentActivity.length) {
      list.innerHTML = '<li><span class="act-sprite" data-sprite="pokeball" data-scale="2"></span>' +
        '<p>' + (live.ok ? '最近没有公开动态' : '离线数据：连接 GitHub 后显示真实动态') +
        '<span class="act-time">—</span></p></li>';
    } else {
      list.innerHTML = currentActivity.map(function (it) {
        return '<li><span class="act-sprite" data-sprite="' + spriteForRepo(it.repo) + '" data-scale="2"></span>' +
          '<p>' + itemText(it) + '<span class="act-time">' + esc(relTime(it.at)) + '</span></p></li>';
      }).join('');
    }
    if (typeof window.mountSprites === 'function') window.mountSprites(list);
    if (window._bindSpriteTips) window._bindSpriteTips(list);
  }

  /* 用真实提交信息补全「推送了 …」条目（最多 2 个仓库，结果缓存，省配额） */
  function enrichPushMessages(items) {
    var targets = items.filter(function (it) { return it.kind === 'push' && !it.msg && !it._fetched; }).slice(0, 2);
    targets.forEach(function (it) {
      it._fetched = true; // 避免重复请求
      ghFetch('/repos/' + GITHUB_USER + '/' + encodeURIComponent(it.repo) + '/commits?per_page=1',
        { key: 'lastcommit:' + it.repo, ttl: TTL.detail })
        .then(function (commits) {
          if (Array.isArray(commits) && commits[0] && commits[0].commit) {
            it.msg = shortMsg(commits[0].commit.message) || '代码更新';
            var when = commits[0].commit.author && commits[0].commit.author.date;
            if (when) it.at = new Date(when);
            renderActivityList();
          }
        })
        .catch(function () { it.msg = '代码更新'; });
    });
  }

  function buildActivity() {
    if (!live.ok && !liveEvents.length) return;
    var seen = {};
    var items = [];
    repoDerivedItems(live.ok ? live.repos : []).concat(liveEvents).forEach(function (it) {
      var key = it.kind + '|' + it.repo + '|' + Math.floor(it.at.getTime() / 86400000);
      if (seen[key]) return;
      seen[key] = true;
      items.push(it);
    });
    items.sort(function (a, b) { return b.at.getTime() - a.at.getTime(); });
    currentActivity = items.slice(0, 8);
    renderActivityList();
    enrichPushMessages(currentActivity);
  }

  /* ----------------------------------------------------- 7. 对话气泡 */
  var LINES = [
    '一起探索宝可梦的世界，用代码收服无限可能！',
    '欢迎来到 GitHub 草丛！仓库、星标和动态都来自 GitHub API，并带缓存。',
    '「我的仓库」上面的徽章会告诉你：现在看到的是实时数据、缓存还是离线数据。',
    '这里是 yythlss 的图鉴：嵌入式系统、智能硬件、数字与模拟电路。',
    '按 / 可以直接跳进搜索框，就像在野外使用「飞翔」。',
    '心血来潮的时候，去草丛里 commit 一次，贡献图就会变绿。',
    '仓库的星标、议题和 README 都是实时拉取的哦。'
  ];

  var typing = null;

  function say(text, options) {
    var host = $('#dialogue-text');
    if (!host) return;
    var opts = options || {};
    if (typing) { clearInterval(typing); typing = null; }

    host.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'caret';
    host.appendChild(caret);

    var i = 0;
    var speed = opts.instant ? 0 : 22;
    if (!speed) {
      host.textContent = text;
      return;
    }
    typing = setInterval(function () {
      i += 1;
      host.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typing);
        typing = null;
        host.textContent = text;
      }
    }, speed);
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function initDialogue() {
    var text = $('#dialogue-text');
    if (!text) return;
    say(LINES[0]);

    var index = 0;
    $$('[data-dialogue]').forEach(function (button) {
      button.addEventListener('click', function () {
        var mode = button.getAttribute('data-dialogue');
        if (mode === 'next') {
          index = (index + 1) % LINES.length;
          say(LINES[index]);
        } else {
          say(pick(LINES));
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      var tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (event.key === '/') {
        event.preventDefault();
        var input = $('#search-input');
        if (input) input.focus();
        return;
      }
      if (event.key === 'z' || event.key === 'Z' || event.key === ' ' || event.key === 'Enter') {
        var next = $('[data-dialogue="next"]');
        if (next && document.activeElement !== next) { next.click(); }
      }
    });

    var addBtn = $('.btn-new-repo');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        say('杰尼龟：要新建仓库？先想好名字，草丛里可不能随便插旗。');
      });
    }
    var plusBtn = $('.btn-add');
    if (plusBtn) {
      plusBtn.addEventListener('click', function () {
        say('杰尼龟：＋ 是留给下一只宝可梦的位置！');
      });
    }
  }

  /* ------------------------------------------ 8. 实时数据加载入口
     仓库列表是页面骨架，优先请求；事件与热力图失败不影响主体，只影响状态徽章 */
  function loadLive() {
    if (typeof fetch !== 'function') { servedFail(); return; }

    var cachedList = cacheGet('list:repos');
    var listFromCache = !!(cachedList && Date.now() - cachedList.t < TTL.list);

    // 仓库列表（按最近推送排序，排除复刻仓库）
    ghFetch('/users/' + GITHUB_USER + '/repos?per_page=100&sort=pushed', { key: 'list:repos', ttl: TTL.list })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) return;
        live.ok = true;
        live.at = Date.now();
        live.fromCache = listFromCache;
        live.repos = list
          .filter(function (r) { return !r.fork; })
          .map(mergeRepo)
          .sort(function (a, b) { return b.pushedAt - a.pushedAt; });
        renderRepoList(live.repos);
        if (live.repos[0]) {
          renderRepo(live.repos[0]);
          activateTab('code');
        }
        updateHint();
        updateStarChip();
        buildActivity(); // 仓库时间线（推送 / 建仓）就绪
      })
      .catch(function () {
        servedFail(); // 限流或断网：保留内置数据，并在状态徽章上说明
        updateHint();
        updateStarChip();
        renderActivityList(); // 把「正在获取…」占位换成离线说明
      });

    // 公开事件（星标 / 议题 / PR / 发版），到达后与仓库时间线合并
    ghFetch('/users/' + GITHUB_USER + '/events/public?per_page=40', { key: 'list:events', ttl: TTL.list })
      .then(function (events) {
        liveEvents = (Array.isArray(events) ? events : [])
          .map(eventToItem)
          .filter(Boolean);
        buildActivity();
      })
      .catch(function () { servedFail(); });

    // 真实贡献热力图
    tryLiveHeatmap();
  }

  /* --------------------------------------------------- 9. 年份与启动 */
  function initYear() {
    var year = $('#gba-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function boot() {
    initSprites();
    initHeatmap();
    initRepoDetail();
    initRepoSearch();
    initNavSearch();
    initDialogue();
    initYear();
    refreshStatus();
    renderRepo(REPOS[0]);
    loadLive(); // 异步接管为实时数据
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
