// Fetch GitHub repos and drive the Stardew farm.
(function () {
  'use strict';

  var USER = 'yythlss';
  var CATEGORIES = [
    { key: 'embedded',  name: '嵌入式',  words: ['stm32','rtos','freertos','rtt','nuttx','zephyr','mbed','arduino','esp32','raspberry','pi','pico','embed','mcu','firmware','driver','hal','i2c','spi','can','uart','ble','nrf','gd32','mm32','cortex','arm','hardware','board','传感器','嵌入式','stm'] },
    { key: 'circuits',  name: '电路',    words: ['ltspice','spice','simul','circuit','verilog','vhdl','fpga','asic','adc','dac','opamp','filter','pcb','kicad','altium','schematic','analog','digital','信号','电路'] },
    { key: 'ai',        name: 'AI',      words: ['ai','ml','llm','model','gpt','transformer','torch','tensorflow','keras','yolo','cv','nlp','stable','diffusion','embedding','rag','agent','语音','ai','智能'] },
    { key: 'frontend',  name: '前端',    words: ['web','html','css','js','vue','react','angular','svelte','next','nuxt','threejs','three','pixi','canvas','ui','component','前端','主页'] },
    { key: 'tools',     name: '工具',    words: ['tool','cli','script','parser','convert','util','helper','build','workflow','action','deploy','docker','bot','crawler','下载','工具'] }
  ];

  function classifyRepo(repo) {
    var text = (repo.name + ' ' + (repo.description || '') + ' ' + (repo.topics || []).join(' ')).toLowerCase();
    for (var i = 0; i < CATEGORIES.length; i++) {
      var cat = CATEGORIES[i];
      for (var j = 0; j < cat.words.length; j++) {
        if (text.indexOf(cat.words[j].toLowerCase()) >= 0) return cat.key;
      }
    }
    return 'default';
  }

  function normalizeRepo(r) {
    return {
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description || '',
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      issues: r.open_issues_count || 0,
      language: r.language || '',
      topics: r.topics || [],
      created_at: r.created_at,
      updated_at: r.updated_at,
      category: classifyRepo(r),
      homepage: r.homepage || ''
    };
  }

  function fetchRepos(callback) {
    var url = 'https://api.github.com/users/' + USER + '/repos?per_page=100&sort=updated';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var list = JSON.parse(xhr.responseText);
          callback(null, list.map(normalizeRepo));
        } catch (e) { callback(e, null); }
      } else {
        callback(new Error('GitHub API ' + xhr.status), null);
      }
    };
    xhr.send();
  }

  function sampleRepos() {
    return [
      { name: 'stm32-toolkit', description: 'STM32 驱动与调试工具集', stars: 12, forks: 2, issues: 1, language: 'C', topics: ['stm32','embedded'], category: 'embedded', html_url: '#' },
      { name: 'ltspice-lab', description: '模拟与数字电路仿真笔记', stars: 8, forks: 1, issues: 0, language: 'Python', topics: ['circuit','spice'], category: 'circuits', html_url: '#' },
      { name: 'tiny-llm', description: '在 MCU 上跑小型语言模型', stars: 34, forks: 7, issues: 3, language: 'C++', topics: ['llm','embedded','ai'], category: 'ai', html_url: '#' },
      { name: 'yythlss.github.io', description: '个人主页与前端实验田', stars: 5, forks: 0, issues: 0, language: 'HTML', topics: ['web','homepage'], category: 'frontend', html_url: '#', homepage: 'https://yythlss.github.io' },
      { name: 'pcb-designs', description: 'KiCad 原理图与 PCB 合集', stars: 6, forks: 1, issues: 0, language: 'KiCad', topics: ['pcb','kicad'], category: 'circuits', html_url: '#' }
    ];
  }

  function start() {
    StardewEngine.init(function () {
      document.getElementById('loader-fill').style.width = '100%';
      setTimeout(function () {
        var el = document.getElementById('loader');
        el.classList.add('hidden');
        el.style.display = 'none';
      }, 300);

      fetchRepos(function (err, repos) {
        if (err || !repos || !repos.length) {
          console.warn('GitHub API failed, using sample data', err);
          repos = sampleRepos();
        }
        FarmWorld.build(repos);
        loop();
      });
    });
  }

  function loop() {
    var engine = StardewEngine.getEngine();
    if (!engine) return;

    function step(now) {
      var dt = now - last;
      last = now;
      engine.update(dt);
      engine.draw();
      if (Math.floor(now / 1000) !== lastHudSecond) {
        engine.updateHud();
        lastHudSecond = Math.floor(now / 1000);
      }
      requestAnimationFrame(step);
    }
    var last = performance.now();
    var lastHudSecond = -1;
    requestAnimationFrame(step);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
