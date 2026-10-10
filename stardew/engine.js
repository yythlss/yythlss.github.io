// Stardew-style Canvas engine for the GitHub.io farm page.
(function () {
  'use strict';

  var TILE = 16;
  var LOGICAL_W = 320;
  var LOGICAL_H = 180;
  var DIRS = { down: 0, right: 1, up: 2, left: 3 };
  var DIR_VEC = { down: [0, 1], right: [1, 0], up: [0, -1], left: [-1, 0] };

  var canvas, ctx, overlayCtx;
  var scale = 4;
  var lastTime = 0;
  var mouse = { x: 0, y: 0, logicalX: 0, logicalY: 0, down: false };
  var assets = {};
  var loading = { total: 0, done: 0 };
  var engine = null;

  // ----------------------------- Utils -----------------------------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawText(ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.font = (opts.bold ? 'bold ' : '') + (opts.size || 10) + 'px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    if (opts.shadow) { ctx.fillStyle = '#000'; ctx.fillText(text, x + 1, y + 1); }
    ctx.fillStyle = opts.color || '#fff';
    ctx.fillText(text, x, y);
  }

  // ----------------------------- Asset loading -----------------------------
  function collectImageUrls() {
    var urls = [];
    function add(u) { if (u && urls.indexOf(u) < 0) urls.push(u); }
    function walk(obj) {
      for (var k in obj) {
        var v = obj[k];
        if (!v) continue;
        if (v.src) add(v.src);
        if (v.frame && v.src) add(v.src);
        if (typeof v === 'object') walk(v);
      }
    }
    walk(SPRITES);
    return urls;
  }

  function loadAssets(onDone, onProgress) {
    var urls = collectImageUrls();
    loading.total = urls.length;
    loading.done = 0;
    if (!urls.length) { onDone && onDone(); return; }
    urls.forEach(function (url) {
      var img = new Image();
      img.onload = function () {
        assets[url] = img;
        loading.done++;
        onProgress && onProgress(loading.done / loading.total);
        if (loading.done >= loading.total) onDone && onDone();
      };
      img.onerror = function () {
        assets[url] = null; // mark missing so rendering skips
        loading.done++;
        onProgress && onProgress(loading.done / loading.total);
        if (loading.done >= loading.total) onDone && onDone();
      };
      img.src = url;
    });
  }

  // ----------------------------- Drawing -----------------------------
  function drawSprite(spec, sx, sy, opts) {
    opts = opts || {};
    var img = assets[spec.src];
    if (!img) return;
    var rect = spec.rect || [0, 0, spec.frame[0], spec.frame[1]];
    var w = rect[2], h = rect[3];
    var anchor = spec.anchor || [0.5, 1];
    var ax = Math.floor(w * anchor[0]);
    var ay = Math.floor(h * anchor[1]);
    var dx = sx - ax;
    var dy = sy - ay;
    ctx.save();
    if (opts.flip) {
      ctx.translate(dx + w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, rect[0], rect[1], w, h, 0, 0, w, h);
    } else {
      ctx.drawImage(img, rect[0], rect[1], w, h, dx, dy, w, h);
    }
    ctx.restore();
  }

  function drawAnimSprite(spec, sx, sy, dir, frame, opts) {
    opts = opts || {};
    var img = assets[spec.src];
    if (!img) return;
    var rows = spec.rows || { down: 0, right: 1, up: 2, left: 3 };
    var row = rows[dir] || 0;
    var fw = spec.frame[0], fh = spec.frame[1];
    var fx = (frame % 4) * fw;
    var fy = row * fh;
    var anchor = spec.anchor || [0.5, 1];
    var ax = Math.floor(fw * anchor[0]);
    var ay = Math.floor(fh * anchor[1]);
    var dx = sx - ax;
    var dy = sy - ay;
    ctx.save();
    if (dir === 'left' && !opts.noFlip) {
      ctx.translate(dx + fw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, fx, fy, fw, fh, 0, 0, fw, fh);
    } else {
      ctx.drawImage(img, fx, fy, fw, fh, dx, dy, fw, fh);
    }
    ctx.restore();
  }

  function drawTile(spec, tx, ty) {
    var img = assets[spec.src];
    if (!img) return;
    var rect = spec.rect;
    ctx.drawImage(img, rect[0], rect[1], rect[2], rect[3], tx * TILE, ty * TILE, TILE, TILE);
  }

  // ----------------------------- Entities -----------------------------
  function makeEntity(type, opts) {
    var e = {
      type: type,
      x: opts.x || 0, y: opts.y || 0,
      z: opts.z || 0,
      vx: 0, vy: 0,
      dir: opts.dir || 'down',
      sprite: opts.sprite,
      frame: 0,
      frameTimer: 0,
      frameDuration: opts.frameDuration || 160,
      moving: false,
      data: opts.data || {},
      name: opts.name || '',
      anchor: opts.anchor || null,
      scale: opts.scale || 1,
      opacity: opts.opacity == null ? 1 : opts.opacity,
      hit: opts.hit != null ? opts.hit : true,
      onClick: opts.onClick || null,
      update: opts.update || null
    };
    return e;
  }

  function entityHitRect(e) {
    var spec = e.sprite;
    if (!spec) return { x: e.x - 8, y: e.y - 8, w: 16, h: 16 };
    var w, h, anchor;
    if (spec.frame) { w = spec.frame[0]; h = spec.frame[1]; anchor = e.anchor || spec.anchor || [0.5, 1]; }
    else { w = spec.rect[2]; h = spec.rect[3]; anchor = e.anchor || spec.anchor || [0.5, 1]; }
    var ax = Math.floor(w * anchor[0]);
    var ay = Math.floor(h * anchor[1]);
    return { x: e.x - ax, y: e.y - ay, w: w, h: h };
  }

  function drawEntity(e) {
    ctx.globalAlpha = e.opacity;
    var s = e.sprite;
    if (e.type === 'tile') {
      drawTile(s, e.x, e.y);
    } else if (s && s.frame) {
      drawAnimSprite(s, e.x, e.y, e.dir, e.frame, { noFlip: e.noFlip });
    } else if (s) {
      drawSprite(s, e.x, e.y);
    }
    ctx.globalAlpha = 1;
  }

  // ----------------------------- Engine -----------------------------
  function Engine(opts) {
    this.entities = [];
    this.tiles = [];
    this.ui = [];
    this.dialogue = { active: false, text: '', name: '', timer: 0 };
    this.paused = false;
    this.time = 600; // minutes since midnight (10:00)
    this.day = 1;
    this.season = 'spring';
    this.gold = 0;
    this.onDialogueClick = opts.onDialogueClick || null;
    this.onEntityClick = opts.onEntityClick || null;
  }

  Engine.prototype.add = function (e) { this.entities.push(e); return e; };
  Engine.prototype.addTile = function (t) { this.tiles.push(t); return t; };

  Engine.prototype.update = function (dt) {
    if (this.paused) return;
    var self = this;
    // advance time slowly
    this.time += dt * 0.00005;
    if (this.time >= 1440) { this.time = 360; this.day++; }

    this.entities.forEach(function (e) {
      if (e.update) e.update(e, dt, self);
      // animation
      if (e.moving) {
        e.frameTimer += dt;
        if (e.frameTimer >= e.frameDuration) { e.frameTimer = 0; e.frame = (e.frame + 1) % 4; }
      } else {
        e.frame = 0; e.frameTimer = 0;
      }
    });
  };

  Engine.prototype.draw = function () {
    // clear
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

    // draw ground tiles
    this.tiles.forEach(function (t) { drawEntity(t); });

    // sort entities by y
    var sorted = this.entities.slice().sort(function (a, b) {
      var ya = a.y + (a.z || 0);
      var yb = b.y + (b.z || 0);
      return ya - yb;
    });
    sorted.forEach(function (e) { drawEntity(e); });

    // time-of-day tint
    var tint = timeTint(this.time);
    if (tint[3] > 0) {
      ctx.fillStyle = tint[4];
      ctx.globalAlpha = tint[3];
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.globalAlpha = 1;
    }

    // custom cursor
    var cur = SPRITES.cursor;
    if (cur) {
      var cx = clamp(mouse.logicalX, 0, LOGICAL_W - 4);
      var cy = clamp(mouse.logicalY, 0, LOGICAL_H - 4);
      drawSprite(cur, cx, cy);
    }
  };

  function timeTint(minutes) {
    // return [r,g,b,alpha,css]
    var a = 0;
    var color = '#000';
    if (minutes < 300) { a = .45; color = '#1a1f3c'; }        // night
    else if (minutes < 360) { a = .25; color = '#d46b48'; }   // dawn
    else if (minutes < 1080) { a = 0; color = '#000'; }       // day
    else if (minutes < 1200) { a = .2; color = '#a84930'; }    // dusk
    else { a = .45; color = '#1a1f3c'; }                       // night
    return [0, 0, 0, a, color];
  }

  // ----------------------------- Input -----------------------------
  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var cssW = window.innerWidth;
    var cssH = window.innerHeight;
    var desired = cssW / cssH;
    var base = LOGICAL_W / LOGICAL_H;
    var targetW, targetH;
    if (desired >= base) { targetH = cssH; targetW = cssH * base; }
    else { targetW = cssW; targetH = cssW / base; }
    scale = Math.max(1, Math.floor(Math.min(targetW / LOGICAL_W, targetH / LOGICAL_H)));
    // actual canvas size is logical*scale for crisp pixels
    canvas.width = LOGICAL_W * scale * dpr;
    canvas.height = LOGICAL_H * scale * dpr;
    canvas.style.width = (LOGICAL_W * scale) + 'px';
    canvas.style.height = (LOGICAL_H * scale) + 'px';
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function toLogical(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var x = (clientX - rect.left) / scale;
    var y = (clientY - rect.top) / scale;
    return { x: clamp(x, 0, LOGICAL_W - 1), y: clamp(y, 0, LOGICAL_H - 1) };
  }

  function findHit(mx, my) {
    if (!engine) return null;
    var hits = [];
    engine.entities.forEach(function (e) {
      if (!e.hit) return;
      var r = entityHitRect(e);
      if (mx >= r.x && mx < r.x + r.w && my >= r.y && my < r.y + r.h) hits.push(e);
    });
    // return topmost (highest y/drawn last)
    hits.sort(function (a, b) { return (a.y + a.z) - (b.y + b.z); });
    return hits[hits.length - 1];
  }

  function setupInput() {
    function move(e) {
      var t = e.touches ? e.touches[0] : e;
      var p = toLogical(t.clientX, t.clientY);
      mouse.logicalX = p.x; mouse.logicalY = p.y;
      mouse.x = t.clientX; mouse.y = t.clientY;
    }
    function down(e) {
      move(e);
      mouse.down = true;
    }
    function up(e) {
      move(e);
      mouse.down = false;
      if (engine && engine.onEntityClick) {
        var hit = findHit(mouse.logicalX, mouse.logicalY);
        if (hit) engine.onEntityClick(hit);
      }
      if (engine && engine.onDialogueClick && engine.dialogue.active) {
        engine.onDialogueClick();
      }
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchend', up, { passive: true });
    window.addEventListener('resize', resize);
  }

  // ----------------------------- Dialogue / HUD helpers -----------------------------
  Engine.prototype.say = function (name, text, portraitKey) {
    this.dialogue.active = true;
    this.dialogue.name = name;
    this.dialogue.text = text;
    this.dialogue.portrait = portraitKey || null;
    var box = document.getElementById('dialogue');
    var nm = document.getElementById('dialogue-name');
    var tx = document.getElementById('dialogue-box');
    box.classList.add('visible');
    nm.textContent = name;
    tx.textContent = text;
  };

  Engine.prototype.hideDialogue = function () {
    this.dialogue.active = false;
    document.getElementById('dialogue').classList.remove('visible');
  };

  Engine.prototype.updateHud = function () {
    var hm = Math.floor(this.time);
    var h = Math.floor(hm / 60);
    var m = hm % 60;
    var seasonNames = { spring: '春季', summer: '夏季', fall: '秋季', winter: '冬季' };
    document.getElementById('hud-season').textContent = seasonNames[this.season] + ' 第 ' + this.day + ' 天';
    document.getElementById('hud-time').textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    document.getElementById('hud-gold').textContent = this.gold + 'G';
  };

  // ----------------------------- Public API -----------------------------
  window.StardewEngine = {
    init: function (onReady) {
      canvas = document.getElementById('game');
      ctx = canvas.getContext('2d');
      resize();
      setupInput();
      loadAssets(function () {
        engine = new Engine({
          onEntityClick: function (e) {
            if (e.onClick) e.onClick(e);
          }
        });
        engine.onDialogueClick = function () { engine.hideDialogue(); };
        window.FarmEngine = engine;
        onReady && onReady(engine);
      }, function (p) {
        var fill = document.getElementById('loader-fill');
        if (fill) fill.style.width = Math.round(p * 100) + '%';
      });
    },
    getEngine: function () { return engine; },
    getAssets: function () { return assets; },
    makeEntity: makeEntity,
    drawTile: drawTile,
    DIRS: DIRS
  };
})();
