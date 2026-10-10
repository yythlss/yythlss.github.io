// Build the farm world from real Stardew assets and GitHub repos.
(function () {
  'use strict';

  var TILE = 16;
  var W = 20, H = 12;
  var engine = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  function makeTiles() {
    for (var ty = 0; ty < H; ty++) {
      for (var tx = 0; tx < W; tx++) {
        var spec = SPRITES.grass;
        // add some subtle grass variation by offsetting source rect later
        engine.addTile(StardewEngine.makeEntity('tile', {
          x: tx, y: ty,
          sprite: spec,
          hit: false,
          update: function (e) {
            // no per-tile update needed
          }
        }));
      }
    }
  }

  function placeDirtPatch(cx, cy, cols, rows) {
    var rects = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var tx = cx + c, ty = cy + r;
        engine.addTile(StardewEngine.makeEntity('tile', {
          x: tx, y: ty,
          sprite: SPRITES.dirt,
          hit: false
        }));
        rects.push({ tx: tx, ty: ty, x: tx * TILE + 8, y: ty * TILE + 8 });
      }
    }
    return rects;
  }

  function makeBuilding(key, x, y) {
    return engine.add(StardewEngine.makeEntity('building', {
      x: x, y: y,
      sprite: SPRITES[key],
      hit: true,
      onClick: function (e) {
        var lines = {
          house: '农舍：这里是项目的起点，温暖又熟悉。',
          house2: '农舍升级：项目越来越多了，屋顶也高了一截。',
          barn: '畜棚：大型项目安顿的地方。',
          coop: '鸡舍：孵化中的小工具和原型。'
        };
        engine.say(e.name || '建筑', lines[key] || '一座结实的星露谷建筑。');
      }
    }));
  }

  function makeDecor(key, x, y) {
    return engine.add(StardewEngine.makeEntity('decor', {
      x: x, y: y,
      sprite: SPRITES[key],
      hit: false
    }));
  }

  function makeAnimal(key, x, y) {
    var speed = key === 'chicken' ? 4 : 6;
    var e = engine.add(StardewEngine.makeEntity('animal', {
      name: key === 'cow' ? '奶牛' : '小鸡',
      x: x, y: y,
      sprite: SPRITES[key],
      dir: 'down',
      frameDuration: key === 'chicken' ? 100 : 180,
      update: simpleWander(speed, 30, 12),
      onClick: function (e) {
        engine.say(e.name, e.name === '奶牛' ? '哞——（它对你的项目很感兴趣）' : '叽叽！（加油 commit）');
      }
    }));
    return e;
  }

  function makeVillager(key, x, y) {
    var v = VILLAGERS.find(function (v) { return v.key === key; });
    var e = engine.add(StardewEngine.makeEntity('villager', {
      name: v ? v.name : key,
      x: x, y: y,
      sprite: SPRITES[key],
      dir: 'down',
      frameDuration: 150,
      update: simpleWander(9, 50, 8),
      onClick: function (e) {
        var data = VILLAGERS.find(function (v) { return v.name === e.name; });
        engine.say(e.name, data ? data.intro : '你好！');
      }
    }));
    return e;
  }

  function simpleWander(speed, range, idleChance) {
    return function (e, dt) {
      if (!e.goalX) e.goalX = e.x;
      if (!e.goalY) e.goalY = e.y;
      if (!e.idle) e.idle = 0;
      if (e.idle > 0) {
        e.idle -= dt;
        e.moving = false;
        return;
      }
      var dx = e.goalX - e.x, dy = e.goalY - e.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        e.moving = false;
        e.idle = rand(500, 2500);
        var angle = rand(0, Math.PI * 2);
        var r = rand(8, range);
        e.goalX = clamp(e.x + Math.cos(angle) * r, 16, 304);
        e.goalY = clamp(e.y + Math.sin(angle) * r, 60, 160);
        return;
      }
      e.moving = true;
      e.vx = dx / dist * speed;
      e.vy = dy / dist * speed;
      e.x += e.vx;
      e.y += e.vy;
      if (Math.abs(dx) > Math.abs(dy)) e.dir = dx > 0 ? 'right' : 'left';
      else e.dir = dy > 0 ? 'down' : 'up';
    };
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function makeCrop(slot, repo, index) {
    var cat = repo.category || 'default';
    var cropKey = CROP_FOR_CATEGORY[cat] || CROP_FOR_CATEGORY.default;
    var e = engine.add(StardewEngine.makeEntity('crop', {
      x: slot.x, y: slot.y,
      sprite: SPRITES.crops[cropKey] || SPRITES.crops.parsnip,
      name: repo.name,
      data: { repo: repo, originalY: slot.y },
      update: function (e, dt) {
        // gentle bob
        e.y = e.data.originalY + Math.sin((Date.now() / 1000 + index) * 2) * 0.5;
      },
      onClick: function (e) {
        openLetter(e.data.repo);
      }
    }));
    e.category = cat;
    return e;
  }

  function openLetter(repo) {
    var overlay = document.getElementById('letter-overlay');
    overlay.classList.add('visible');
    document.getElementById('letter-title').textContent = repo.name;
    document.getElementById('letter-meta').textContent = (repo.stars || 0) + ' stars · ' + (repo.forks || 0) + ' forks · ' + (repo.issues || 0) + ' issues · ' + (repo.language || '—');
    document.getElementById('letter-desc').textContent = repo.description || '暂无描述。';

    // portrait
    var pKey = repo.villager || 'abigail';
    var pSrc = SPRITES.portrait[pKey] && SPRITES.portrait[pKey].src;
    document.getElementById('letter-portrait').src = pSrc || SPRITES.portrait.abigail.src;

    var tags = document.getElementById('letter-tags');
    tags.innerHTML = '';
    var cat = document.createElement('span');
    cat.className = 'letter-tag';
    cat.textContent = repo.categoryName || repo.category;
    tags.appendChild(cat);
    (repo.topics || []).forEach(function (t) {
      var s = document.createElement('span'); s.className = 'letter-tag'; s.textContent = t; tags.appendChild(s);
    });

    var links = document.getElementById('letter-links');
    links.innerHTML = '';
    if (repo.html_url) {
      var a = document.createElement('a'); a.href = repo.html_url; a.target = '_blank'; a.className = 'letter-link'; a.textContent = '在 GitHub 打开';
      links.appendChild(a);
    }
    if (repo.homepage) {
      var a2 = document.createElement('a'); a2.href = repo.homepage; a2.target = '_blank'; a2.className = 'letter-link'; a2.textContent = '项目主页';
      links.appendChild(a2);
    }
  }

  function closeLetter() {
    document.getElementById('letter-overlay').classList.remove('visible');
  }

  function buildFilters(repos) {
    var cats = {};
    repos.forEach(function (r) { cats[r.category] = (cats[r.category] || 0) + 1; });
    var bar = document.getElementById('filter-bar');
    bar.innerHTML = '';
    var all = document.createElement('div');
    all.className = 'filter-chip active';
    all.innerHTML = '全部 <span class="count">' + repos.length + '</span>';
    all.dataset.cat = '';
    bar.appendChild(all);
    Object.keys(cats).forEach(function (c) {
      var chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.dataset.cat = c;
      chip.innerHTML = (categoryLabel(c)) + ' <span class="count">' + cats[c] + '</span>';
      bar.appendChild(chip);
    });

    bar.addEventListener('click', function (e) {
      var t = e.target.closest('.filter-chip');
      if (!t) return;
      Array.from(bar.children).forEach(function (c) { c.classList.remove('active'); });
      t.classList.add('active');
      applyFilter(t.dataset.cat);
    });
  }

  function categoryLabel(c) {
    var map = { embedded: '嵌入式', circuits: '电路', ai: 'AI', frontend: '前端', tools: '工具', default: '其他' };
    return map[c] || c;
  }

  function applyFilter(cat) {
    engine.entities.forEach(function (e) {
      if (e.type !== 'crop') return;
      if (!cat || e.category === cat) e.opacity = 1;
      else e.opacity = 0.25;
    });
  }

  function buildWorld(repos) {
    engine = StardewEngine.getEngine();
    if (!engine) return;

    makeTiles();

    // Buildings
    makeBuilding('house', 104, 82);
    makeBuilding('barn', 208, 90);
    makeBuilding('coop', 40, 90);

    // Decor
    makeDecor('tree', 24, 64);
    makeDecor('tree', 260, 58);
    makeDecor('tree', 260, 110);
    makeDecor('bush', 92, 88);
    makeDecor('bush', 180, 88);
    for (var i = 0; i < 4; i++) makeDecor('stone', randInt(8, 18) * TILE + 8, randInt(3, 6) * TILE + 8);

    // Animals
    makeAnimal('cow', 252, 112);
    makeAnimal('chicken', 44, 108);
    makeAnimal('chicken', 64, 116);

    // Villagers
    makeVillager('farmer', 160, 120);
    makeVillager('robin', 144, 92);
    makeVillager('clint', 268, 108);
    makeVillager('pierre', 50, 108);
    makeVillager('harvey', 210, 130);
    makeVillager('wizard', 28, 132);
    makeVillager('lewis', 298, 68);
    makeVillager('maru', 100, 130);
    makeVillager('penny', 240, 132);
    makeVillager('caroline', 80, 98);

    // Crops / repos
    var patches = [
      { cx: 3, cy: 8, cols: 5, rows: 2, cat: 'embedded' },
      { cx: 9, cy: 8, cols: 4, rows: 2, cat: 'circuits' },
      { cx: 14, cy: 8, cols: 4, rows: 2, cat: 'ai' },
      { cx: 3, cy: 6, cols: 3, rows: 1, cat: 'frontend' }
    ];

    var usedRepos = [];
    patches.forEach(function (p, pi) {
      var patchRepos = repos.filter(function (r) { return r.category === p.cat; });
      if (!patchRepos.length) patchRepos = repos.slice(pi * 3, pi * 3 + 4);
      var slots = placeDirtPatch(p.cx, p.cy, p.cols, p.rows);
      patchRepos.forEach(function (repo, i) {
        if (i >= slots.length) return;
        repo.categoryName = categoryLabel(repo.category);
        var v = VILLAGERS[i % VILLAGERS.length];
        repo.villager = v.key;
        makeCrop(slots[i], repo, i);
        usedRepos.push(repo.name);
      });
    });

    // Fill remaining repos as extra crops scattered in front patches
    var extras = [];
    var scatterSlots = placeDirtPatch(7, 10, 8, 1);
    repos.forEach(function (r, i) {
      if (usedRepos.indexOf(r.name) >= 0) return;
      if (extras.length < scatterSlots.length) {
        r.categoryName = categoryLabel(r.category);
        r.villager = VILLAGERS[(i + 7) % VILLAGERS.length].key;
        makeCrop(scatterSlots[extras.length], r, i + 100);
        extras.push(r.name);
      }
    });

    buildFilters(repos);

    document.getElementById('letter-close').addEventListener('click', closeLetter);
    document.getElementById('letter-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'letter-overlay') closeLetter();
    });

    engine.gold = repos.reduce(function (s, r) { return s + (r.stars || 0); }, 0);

    // initial greeting
    setTimeout(function () {
      engine.say('镇长 Lewis', '欢迎来到 yythlss 的农场！点击作物查看项目，和村民聊聊天。');
    }, 800);
  }

  window.FarmWorld = {
    build: buildWorld,
    closeLetter: closeLetter,
    categoryLabel: categoryLabel
  };
})();
