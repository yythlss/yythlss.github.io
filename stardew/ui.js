/* ==========================================================================
 * stardew/ui.js — 游戏内菜单（九宫格贴图 + 像素字体）
 * 参考 Stardew Valley 的 IClickableMenu / CollectionsPage / LetterViewerMenu
 * ========================================================================== */
(function (global) {
  'use strict';
  var SD = global.SD || (global.SD = {});
  var E = SD.engine;

  var INK = '#3b2a18', INK_SOFT = '#6b5540', GOLD = '#c88a1e';

  var UI = {
    mode: 'none',          // none | repos | detail | intro | npc
    tab: 'all',
    selected: null,
    scroll: 0,
    buttons: [],
    npc: null,
    npcTimer: 0,
    world: null,
    assets: null,
    profile: null,
    repos: [],
    totals: { repos: 0, stars: 0 },
    onOpen: function (url) { global.open(url, '_blank', 'noopener'); }
  };

  UI.init = function (assets, world, repos, profile) {
    UI.assets = assets; UI.world = world;
    UI.repos = repos || []; UI.profile = profile || {};
    var stars = 0;
    UI.repos.forEach(function (r) { stars += r.stars || 0; });
    UI.totals = { repos: UI.repos.length, stars: stars };
  };

  /* ---------------- 文本工具 ---------------- */
  function wrap(text, size, maxW, bold) {
    var lines = [], cur = '';
    text = String(text || '');
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      var t = cur + ch;
      if (E.measure(t, size, bold) > maxW && cur) { lines.push(cur); cur = ch; }
      else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function ellipsis(text, size, maxW, bold) {
    if (E.measure(text, size, bold) <= maxW) return text;
    var s = text;
    while (s.length > 1 && E.measure(s + '…', size, bold) > maxW) s = s.slice(0, -1);
    return s + '…';
  }
  UI.wrap = wrap;

  function button(x, y, w, h, label, onClick, opts) {
    opts = opts || {};
    var b = { x: x, y: y, w: w, h: h, label: label, onClick: onClick, opts: opts };
    UI.buttons.push(b);
    return b;
  }
  function drawButton(ctx, b, mx, my) {
    var hot = mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
    var a = UI.assets;
    E.drawBox(ctx, a.menuTiles, b.x, b.y, b.w, b.h, 1);
    if (hot || b.opts.active) {
      ctx.fillStyle = b.opts.active ? 'rgba(240,200,90,0.55)' : 'rgba(255,236,150,0.5)';
      ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
    }
    E.drawText(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 - 8, {
      size: b.opts.size || 15, color: b.opts.color || INK, bold: true, align: 'center'
    });
    return hot;
  }

  /* ---------------- 分类页签 ---------------- */
  function tabs() {
    var list = [{ key: 'all', name: '全部仓库', crop: 'parsnip' }];
    SD.world.FIELDS.forEach(function (f) { list.push({ key: f.key, name: f.name, crop: f.crop }); });
    return list;
  }
  UI.tabs = tabs;

  function reposFor(tab) {
    if (!tab || tab === 'all') return UI.repos;
    return UI.repos.filter(function (r) { return r.category === tab; });
  }

  /* ---------------- 仓库列表菜单 ---------------- */
  function drawReposMenu(ctx, W, H) {
    var a = UI.assets;
    var pw = Math.min(1120, W - 60), ph = Math.min(600, H - 70);
    var px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    ctx.fillStyle = 'rgba(24,16,10,0.45)';
    ctx.fillRect(0, 0, W, H);

    E.drawBox(ctx, a.menuTiles, px, py, pw, ph, 2);
    // 标题
    E.drawText(ctx, '项 目 仓 库', px + pw / 2, py + 22, { size: 22, color: INK, bold: true, align: 'center' });
    E.drawText(ctx, '共 ' + UI.totals.repos + ' 个仓库 · ' + UI.totals.stars + ' 颗星', px + pw / 2, py + 50,
      { size: 13, color: INK_SOFT, align: 'center' });
    // 关闭
    drawButton(ctx, button(px + pw - 52, py + 14, 38, 34, '×', function () { UI.close(); }, { size: 20 }), E.mouse.x, E.mouse.y);

    var tabW = 214, tabY = py + 74, tabH = Math.min(52, (ph - 150) / 6);
    var list = tabs();
    list.forEach(function (t, i) {
      var ty = tabY + i * tabH;
      var b = button(px + 16, ty, tabW - 8, tabH - 6, '', function () { UI.tab = t.key; UI.scroll = 0; });
      var hot = E.mouse.x >= b.x && E.mouse.x <= b.x + b.w && E.mouse.y >= b.y && E.mouse.y <= b.y + b.h;
      var active = UI.tab === t.key;
      if (active) {
        E.drawBox(ctx, a.menuTiles, b.x, b.y, b.w, b.h, 1);
        ctx.fillStyle = 'rgba(246,226,150,0.85)';
        ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
      } else if (hot) {
        ctx.fillStyle = 'rgba(255,240,180,0.35)';
        ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
      }
      // 作物图标
      var row = a.cropRows[t.crop];
      ctx.drawImage(a.crops, 4 * 16, row * 32, 16, 32, b.x + 12, b.y + (b.h - 48) / 2, 24, 48);
      var count = t.key === 'all' ? UI.repos.length : reposFor(t.key).length;
      E.drawText(ctx, t.name, b.x + 46, b.y + b.h / 2 - 16, { size: 15, color: INK, bold: active });
      E.drawText(ctx, count + ' 个', b.x + 46, b.y + b.h / 2 + 4, { size: 12, color: INK_SOFT });
    });

    /* 列表区 */
    var lx = px + tabW + 16, ly = py + 74;
    var lw = pw - tabW - 48, lh = ph - 74 - 46;
    ctx.save();
    ctx.beginPath(); ctx.rect(lx - 8, ly, lw + 12, lh); ctx.clip();

    var items = reposFor(UI.tab);
    var rowH = 92;
    var contentH = items.length * rowH;
    var maxScroll = Math.max(0, contentH - lh);
    UI.scroll = E.clamp(UI.scroll, 0, maxScroll);

    items.forEach(function (r, i) {
      var ry = ly + i * rowH - UI.scroll;
      if (ry + rowH < ly - 10 || ry > ly + lh + 10) return;
      var hot = E.mouse.x >= lx && E.mouse.x <= lx + lw && E.mouse.y >= ry && E.mouse.y <= ry + rowH - 4;
      var b = button(lx, ry, lw, rowH - 6, '', function () { UI.openDetail(r); });
      if (hot) {
        ctx.fillStyle = 'rgba(255,238,170,0.55)';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = 'rgba(120,80,30,0.6)'; ctx.lineWidth = 2;
        ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      } else {
        ctx.fillStyle = 'rgba(255,250,235,0.42)';
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      // 图标
      var crop = cropForCat(r.category);
      var crow = a.cropRows[crop];
      var stage = r.stars >= 10 ? 4 : (r.stars >= 3 ? 3 : (r.stars >= 1 ? 2 : 1));
      ctx.drawImage(a.crops, stage * 16, crow * 32, 16, 32, b.x + 10, b.y + 12, 32, 64);
      // 名称
      E.drawText(ctx, ellipsis(r.name, 17, lw - 200, true), b.x + 56, b.y + 12, { size: 17, color: INK, bold: true });
      // 语言 / 星标 / 时间
      var meta = [];
      if (r.language) meta.push(r.language);
      meta.push('★ ' + r.stars);
      if (r.updated) meta.push('更新 ' + r.updated);
      E.drawText(ctx, meta.join('   '), b.x + 56, b.y + 38, { size: 12, color: GOLD });
      E.drawText(ctx, ellipsis(r.description || '暂无描述', 13, lw - 72), b.x + 56, b.y + 60, { size: 13, color: INK_SOFT });
      // 箭头
      E.drawText(ctx, '›', b.x + b.w - 22, b.y + b.h / 2 - 10, { size: 20, color: INK_SOFT, bold: true });
    });
    ctx.restore();

    // 滚动条
    if (maxScroll > 0) {
      var sbx = lx + lw + 2, sby = ly, sbh = lh;
      ctx.fillStyle = 'rgba(90,62,34,0.35)';
      ctx.fillRect(sbx, sby, 6, sbh);
      var kh = Math.max(30, sbh * lh / contentH);
      var ky = sby + (sbh - kh) * (UI.scroll / maxScroll);
      ctx.fillStyle = 'rgba(120,80,34,0.85)';
      ctx.fillRect(sbx, ky, 6, kh);
    }
    // 底部提示
    E.drawText(ctx, '点击一行查看详情 · 滚轮滚动 · Esc 关闭', px + pw / 2, py + ph - 30,
      { size: 13, color: INK_SOFT, align: 'center' });
  }

  function cropForCat(cat) {
    var f = SD.world.FIELDS.filter(function (x) { return x.key === cat; })[0];
    return f ? f.crop : 'parsnip';
  }

  /* ---------------- 详情信纸 ---------------- */
  function drawDetail(ctx, W, H) {
    var a = UI.assets, r = UI.selected;
    if (!r) { UI.close(); return; }
    var pw = Math.min(760, W - 60), ph = Math.min(560, H - 60);
    var px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    ctx.fillStyle = 'rgba(24,16,10,0.5)';
    ctx.fillRect(0, 0, W, H);
    E.drawBox(ctx, a.menuTiles, px, py, pw, ph, 2);

    var crop = cropForCat(r.category);
    var crow = a.cropRows[crop];
    var stage = r.stars >= 10 ? 4 : (r.stars >= 3 ? 3 : (r.stars >= 1 ? 2 : 1));
    ctx.drawImage(a.crops, stage * 16, crow * 32, 16, 32, px + 26, py + 26, 40, 80);

    var tx = px + 82;
    E.drawText(ctx, ellipsis(r.name, 22, pw - 130, true), tx, py + 30, { size: 22, color: INK, bold: true });
    var catName = (SD.world.FIELDS.filter(function (f) { return f.key === r.category; })[0] || {}).name || '其他项目';
    E.drawText(ctx, catName + (r.language ? ' · ' + r.language : ''), tx, py + 60, { size: 13, color: GOLD });

    // 数据行
    var stats = [['★ 星标', r.stars], ['⑂ 分支', r.forks || 0], ['最近更新', r.updated || '—']];
    stats.forEach(function (s, i) {
      var sx = px + 30 + i * ((pw - 60) / 3);
      E.drawText(ctx, String(s[1]), sx, py + 92, { size: 18, color: INK, bold: true });
      E.drawText(ctx, s[0], sx, py + 114, { size: 12, color: INK_SOFT });
    });

    ctx.save();
    ctx.fillStyle = 'rgba(120,90,50,0.25)';
    ctx.fillRect(px + 28, py + 134, pw - 56, 2);
    ctx.restore();

    var lines = wrap(r.description || '这个项目还没有填写描述。', 15, pw - 70);
    lines.slice(0, 9).forEach(function (ln, i) {
      E.drawText(ctx, ln, px + 30, py + 150 + i * 24, { size: 15, color: '#4a3826' });
    });

    if (r.topics && r.topics.length) {
      var chipX = px + 30, chipY = py + 150 + Math.min(9, lines.length) * 24 + 8;
      r.topics.slice(0, 6).forEach(function (t) {
        var w = E.measure(t, 12) + 14;
        if (chipX + w > px + pw - 30) return;
        ctx.fillStyle = 'rgba(200,138,30,0.25)';
        ctx.fillRect(chipX, chipY, w, 20);
        E.drawText(ctx, t, chipX + 7, chipY + 4, { size: 12, color: '#7a4a1a' });
        chipX += w + 6;
      });
    }

    var by = py + ph - 62;
    var b1 = button(px + 34, by, 210, 44, '在 GitHub 打开', function () {
      if (r.url) UI.onOpen(r.url);
    });
    drawButton(ctx, b1, E.mouse.x, E.mouse.y);
    var b2 = button(px + pw - 244, by, 210, 44, '返回列表', function () { UI.mode = 'repos'; });
    drawButton(ctx, b2, E.mouse.x, E.mouse.y);
  }

  /* ---------------- 介绍信 ---------------- */
  function drawIntro(ctx, W, H) {
    var a = UI.assets;
    var pw = Math.min(700, W - 60), ph = Math.min(520, H - 60);
    var px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    ctx.fillStyle = 'rgba(24,16,10,0.5)'; ctx.fillRect(0, 0, W, H);
    E.drawBox(ctx, a.menuTiles, px, py, pw, ph, 2);
    E.drawText(ctx, '来自鹈鹕镇的一封信', px + pw / 2, py + 26, { size: 21, color: INK, bold: true, align: 'center' });
    var body = UI.profile.about ||
      '这里是 yythlss 的农场。田里种着嵌入式、电路、AI 和 Web 的项目，' +
      '每一株作物都是一个仓库：星标越多，长得越壮。\n\n' +
      '用 WASD 或方向键走动，点击作物查看项目，点击屋前的信箱可以打开完整清单。';
    var lines = wrap(body, 15, pw - 76);
    lines.forEach(function (ln, i) {
      E.drawText(ctx, ln, px + 38, py + 70 + i * 24, { size: 15, color: '#4a3826' });
    });
    var y = py + 70 + lines.length * 24 + 14;
    ['WASD / 方向键 —— 在农场里走动',
      '点击作物 —— 查看对应的仓库',
      '点击信箱 —— 按分类浏览全部项目'].forEach(function (t, i) {
        E.drawText(ctx, '· ' + t, px + 38, y + i * 22, { size: 14, color: INK_SOFT });
      });
    var by = py + ph - 62;
    drawButton(ctx, button(px + 34, by, 220, 44, '打开项目清单', function () { UI.mode = 'repos'; }), E.mouse.x, E.mouse.y);
    drawButton(ctx, button(px + pw - 254, by, 220, 44, '关闭', function () { UI.close(); }), E.mouse.x, E.mouse.y);
  }

  /* ---------------- NPC 对话 ---------------- */
  function drawNpcDialogue(ctx, W, H) {
    var a = UI.assets, n = UI.npc;
    var pw = Math.min(880, W - 60), ph = 128;
    var px = Math.round((W - pw) / 2), py = H - ph - 28;
    E.drawBox(ctx, a.menuTiles, px, py, pw, ph, 2);
    // 头像
    var sheet = a.characters[n.key];
    ctx.save();
    ctx.beginPath(); ctx.rect(px + 14, py + 12, 84, 104); ctx.clip();
    ctx.fillStyle = 'rgba(246,232,200,0.7)';
    ctx.fillRect(px + 14, py + 12, 84, 104);
    ctx.drawImage(sheet, 0, 64, 16, 32, px + 24, py + 18, 64, 128);
    ctx.restore();
    E.drawText(ctx, n.name + ' · ' + n.role, px + 110, py + 22, { size: 17, color: INK, bold: true });
    var lines = wrap(n.line, 15, pw - 150);
    lines.slice(0, 3).forEach(function (ln, i) {
      E.drawText(ctx, ln, px + 110, py + 54 + i * 24, { size: 15, color: '#4a3826' });
    });
  }

  /* ---------------- HUD ---------------- */
  function drawHud(ctx, W, H) {
    var a = UI.assets, w = UI.world;
    if (!w) return;
    var d = new Date();
    var seasonName = { spring: '春', summer: '夏', fall: '秋', winter: '冬' }[w.season] || '秋';
    var hh = d.getHours(), mm = d.getMinutes();
    var timeStr = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;

    // 左上：日期时间
    var px = 16, py = 14;
    E.drawBox(ctx, a.menuTiles, px, py, 176, 66, 1);
    var seasonIcon = { spring: a.crops, summer: a.crops, fall: a.crops, winter: a.crops }[w.season];
    var iconRow = a.cropRows[{ spring: 'parsnip', summer: 'sunflower', fall: 'pumpkin', winter: 'parsnip' }[w.season]];
    ctx.drawImage(seasonIcon, 4 * 16, iconRow * 32, 16, 32, px + 10, py + 14, 22, 44);
    E.drawText(ctx, seasonName + '季 · 第 ' + d.getDate() + ' 日', px + 40, py + 16, { size: 15, color: INK, bold: true });
    E.drawText(ctx, timeStr, px + 40, py + 38, { size: 15, color: INK_SOFT });

    // 右上：星标与仓库
    var rw = 190;
    E.drawBox(ctx, a.menuTiles, W - rw - 16, py, rw, 66, 1);
    ctx.drawImage(a.crops, 4 * 16, a.cropRows.starfruit * 32, 16, 32, W - rw - 2, py + 14, 22, 44);
    E.drawText(ctx, '★ ' + UI.totals.stars, W - rw + 26, py + 16, { size: 15, color: GOLD, bold: true });
    E.drawText(ctx, '仓库 ' + UI.totals.repos + ' 个', W - rw + 26, py + 38, { size: 14, color: INK_SOFT });

    // 底部提示
    var hint = 'WASD / 方向键 走动    ·    点击作物、信箱或村民    ·    Esc 关闭窗口';
    E.drawText(ctx, hint, W / 2, H - 26, { size: 13, color: '#fff4d0', shadowColor: 'rgba(20,12,6,0.85)', align: 'center' });
  }

  /* ---------------- Tooltip ---------------- */
  function drawTooltip(ctx, W, H) {
    var hov = UI.world && UI.world.hover;
    if (!hov) return;
    var lines = [];
    if (hov.type === 'crop') {
      lines.push({ t: hov.repo.name, size: 15, bold: true, color: INK });
      var meta = [];
      if (hov.repo.language) meta.push(hov.repo.language);
      meta.push('★ ' + hov.repo.stars);
      lines.push({ t: meta.join('   '), size: 12, color: GOLD });
      if (hov.repo.description) lines.push({ t: ellipsis(hov.repo.description, 12, 300), size: 12, color: INK_SOFT });
      lines.push({ t: '点击查看', size: 11, color: '#8a6a3a' });
    } else {
      lines.push({ t: hov.title, size: 15, bold: true, color: INK });
      if (hov.desc) lines.push({ t: ellipsis(hov.desc, 12, 300), size: 12, color: INK_SOFT });
    }
    var tw = 0;
    lines.forEach(function (l) { tw = Math.max(tw, E.measure(l.t, l.size, l.bold)); });
    tw += 24;
    var th = lines.length * 22 + 16;
    var tx = E.clamp(E.mouse.x + 16, 8, W - tw - 8);
    var ty = E.clamp(E.mouse.y + 16, 8, H - th - 8);
    E.drawBox(ctx, UI.assets.menuTiles, tx, ty, tw, th, 1);
    lines.forEach(function (l, i) {
      E.drawText(ctx, l.t, tx + 12, ty + 11 + i * 22, { size: l.size, color: l.color, bold: l.bold, shadow: false });
    });
  }

  /* ---------------- 对外 ---------------- */
  UI.openMenu = function (tab) { UI.mode = 'repos'; UI.tab = tab || 'all'; UI.scroll = 0; };
  UI.openDetail = function (r) { UI.mode = 'detail'; UI.selected = r; };
  UI.openIntro = function () { UI.mode = 'intro'; };
  UI.sayNpc = function (n) { UI.npc = n; UI.npcTimer = 6000; };
  UI.close = function () { UI.mode = 'none'; UI.selected = null; UI.npc = null; };
  UI.isOpen = function () { return UI.mode !== 'none'; };

  UI.update = function (dt) {
    if (UI.npcTimer > 0) {
      UI.npcTimer -= dt;
      if (UI.npcTimer <= 0) UI.npc = null;
    }
  };

  UI.draw = function (ctx, W, H) {
    UI.buttons = [];
    drawHud(ctx, W, H);
    if (UI.mode === 'repos') drawReposMenu(ctx, W, H);
    else if (UI.mode === 'detail') drawDetail(ctx, W, H);
    else if (UI.mode === 'intro') drawIntro(ctx, W, H);
    if (UI.npc && UI.mode === 'none') drawNpcDialogue(ctx, W, H);
    if (UI.mode === 'none') drawTooltip(ctx, W, H);
  };

  UI.click = function (x, y) {
    for (var i = UI.buttons.length - 1; i >= 0; i--) {
      var b = UI.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { b.onClick(); return true; }
    }
    return false;
  };
  UI.wheel = function (d) {
    if (UI.mode === 'repos') UI.scroll += d;
    else if (UI.mode === 'detail') UI.scroll += d;
  };
  UI.key = function (code) {
    if (code === 'Escape') {
      if (UI.mode === 'detail') UI.mode = 'repos';
      else if (UI.mode !== 'none') UI.close();
      else UI.npc = null;
      return true;
    }
    if (UI.mode === 'none' && (code === 'KeyE' || code === 'Enter')) { UI.openMenu('all'); return true; }
    return false;
  };

  SD.ui = UI;
})(window);
