// ==========================================================
//  МУЗЫКА
//  1) Пока идёт заставка с Артуром — весёлая праздничная мелодия
//     «Happy Birthday» (без слов). Страница пытается включить её сразу при
//     загрузке; если браузер не разрешает звук без действия пользователя
//     (так устроены Chrome / Safari / Edge), музыка включается от самого
//     первого нажатия или касания в любом месте страницы.
//  2) Как только Артур убегает и появляется «С Днём рождения,
//     Лилия Ильдаровна!» — весёлая мелодия плавно затихает и включается
//     песня music/birthday-song.mp3.
//  3) Когда она закончится — сразу, без паузы, играет песня Аллегровой
//     «С днём рождения!» (music/allegrova.mp3).
//  4) Когда закончится и она — тихо возвращается спокойный праздничный фон.
//  Кнопка 🔊 / 🔇 в левом нижнем углу — включить/выключить звук.
// ==========================================================
const Music = (() => {
  const SONG_URLS = ['music/birthday-song.mp3', 'music/allegrova.mp3'];   // играют по очереди
  const SONG_VOLUME = 0.9;    // громкость песни (0–1)
  const INTRO_VOLUME = 0.38;  // громкость весёлой мелодии на заставке
  const CALM_VOLUME = 0.28;   // громкость фона после песни

  const songs = SONG_URLS.map((u) => { const a = new Audio(u); a.preload = 'auto'; a.volume = 0; return a; });
  let cur = 0;                  // какая песня сейчас по очереди
  let songUnlocked = false;

  let ctx = null, master = null, bgGain = null;
  let allowed = false;          // музыка разрешена только после кнопки «Пуск»
  let started = false, muted = false, wantSong = false, songsDone = false;
  let timer = null, nextTime = 0, step = 0;
  let track = 'intro';          // 'intro' | 'calm'
  let songFade = 0;

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- Инструменты ----------
  function tone(type, freq, t, dur, vol, attack = 0.005) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bgGain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function bell(midi, t, dur, vol) {          // звонкий «колокольчик»
    tone('sine', mtof(midi), t, dur, vol);
    tone('sine', mtof(midi) * 2, t, dur * 0.5, vol * 0.3);
    tone('triangle', mtof(midi) * 3.01, t, dur * 0.25, vol * 0.08);
  }

  let noiseBuf = null;
  function hat(t, vol) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f).connect(g).connect(bgGain);
    s.start(t);
    s.stop(t + 0.08);
  }

  // ---------- Трек 1: весёлый вальс «Happy Birthday» ----------
  // 3/4, 140 уд/мин, шаг сетки = шестнадцатая нота. Цикл — 8 тактов (96 шагов),
  // затакт «Хэ-пи» стоит в конце цикла (шаги 92 и 95), поэтому мелодия
  // идёт по кругу без паузы.
  const INTRO_STEP = 60 / 140 / 4;
  const INTRO_BARS = [48, 43, 43, 48, 48, 43, 48, 48];   // корни аккордов (C G G C C G C C)
  const INTRO_MEL = {
    0: [69, 4], 4: [67, 4], 8: [72, 4],                    // happy birthday to
    12: [71, 8], 20: [67, 3], 23: [67, 1],                  // you  / hap-py
    24: [69, 4], 28: [67, 4], 32: [74, 4],
    36: [72, 8], 44: [67, 3], 47: [67, 1],
    48: [79, 4], 52: [76, 4], 56: [72, 4],
    60: [71, 4], 64: [69, 4], 68: [77, 3], 71: [77, 1],
    72: [76, 4], 76: [72, 4], 80: [74, 4],
    84: [72, 8], 92: [67, 3], 95: [67, 1]
  };

  function scheduleIntro(i, t) {
    const pos = i % 96;
    const loop = Math.floor(i / 96);
    const root = INTRO_BARS[Math.floor(pos / 12)];
    const bp = pos % 12;

    // вальсовый аккомпанемент: бас на раз, аккорд на два и три
    if (bp === 0) tone('triangle', mtof(root), t, 0.4, 0.5, 0.01);
    if (bp === 4 || bp === 8) {
      [0, 4, 7].forEach((iv) => tone('triangle', mtof(root + 12 + iv), t, 0.2, 0.1, 0.01));
    }
    if (bp % 4 === 2) hat(t, 0.045);

    // мелодия
    const n = INTRO_MEL[pos];
    if (n) {
      const dur = Math.max(0.35, n[1] * INTRO_STEP + 0.3);
      bell(n[0], t, dur, 0.26);
      if (loop % 2 === 1) bell(n[0] + 12, t, dur * 0.6, 0.07);   // на втором круге — искорки сверху
    }
  }

  // ---------- Трек 2: спокойный фон (после песни) ----------
  const CALM_STEP = 0.25;
  const CALM_BARS = [
    [48, 'M'], [43, 'M'], [45, 'm'], [41, 'M'],
    [48, 'M'], [43, 'M'], [41, 'M'], [43, 'M'],
    [48, 'M'], [45, 'm'], [50, 'm'], [43, 'M'],
    [48, 'M'], [41, 'M'], [43, 'M'], [48, 'M']
  ];
  const TRIAD = { M: [0, 4, 7], m: [0, 3, 7] };
  const PATTERNS = [
    [0, 2, 4, 2, 0, 2, 4, 5],
    [4, 3, 2, 3, 4, 2, 1, 2],
    [0, 1, 2, 4, 5, 4, 2, 1],
    [2, 4, 5, 4, 2, 4, 3, 2]
  ];

  function scheduleCalm(i, t) {
    const bar = Math.floor(i / 8) % CALM_BARS.length;
    const pos = i % 8;
    const [root, kind] = CALM_BARS[bar];
    const triad = TRIAD[kind];

    if (pos === 0) tone('triangle', mtof(root), t, 0.45, 0.5, 0.01);
    if (pos === 4) tone('triangle', mtof(root + 7), t, 0.45, 0.4, 0.01);
    if (pos === 2 || pos === 6) {
      triad.forEach((iv) => tone('triangle', mtof(root + 12 + iv), t, 0.22, 0.12, 0.01));
    }
    if (pos % 2 === 1) hat(t, 0.05);

    const ladder = [...triad, ...triad.map((x) => x + 12)];
    ladder.push(ladder[0] + 24);
    const pat = PATTERNS[Math.floor(bar / 2) % PATTERNS.length];
    if (bar % 4 === 3 && pos >= 4) {
      if (pos === 4) bell(root + 24 + triad[1], t, 1.0, 0.22);
    } else {
      bell(root + 24 + ladder[pat[pos]], t, pos % 2 ? 0.28 : 0.5, 0.2);
    }
  }

  // ---------- Планировщик ----------
  function tick() {
    if (!ctx) return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;   // догоняем после «сна» вкладки
    while (nextTime < ctx.currentTime + 0.5) {
      if (track === 'intro') { scheduleIntro(step, nextTime); nextTime += INTRO_STEP; }
      else { scheduleCalm(step, nextTime); nextTime += CALM_STEP; }
      step++;
    }
  }

  function fadeBg(to, sec) {
    if (!bgGain) return;
    const t = ctx.currentTime;
    bgGain.gain.cancelScheduledValues(t);
    bgGain.gain.setValueAtTime(bgGain.gain.value, t);
    bgGain.gain.linearRampToValueAtTime(Math.max(to, 0.0001), t + sec);
  }

  // ---------- Песни ----------
  function fadeSong(a, to, ms) {
    clearInterval(a._fade);
    const from = a.volume;
    const t0 = performance.now();
    a._fade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) clearInterval(a._fade);
    }, 40);
  }

  function playSong(fadeMs = 1500) {
    const a = songs[cur];
    a.volume = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});      // если браузер не дал — повторим при следующем нажатии
    fadeSong(a, SONG_VOLUME, fadeMs);
    if (cur === 0) fadeBg(0, 1.2);
  }

  songs.forEach((a, i) => a.addEventListener('ended', () => {
    if (i < songs.length - 1) {               // песня закончилась — сразу включаем следующую
      cur = i + 1;
      playSong(300);
      return;
    }
    songsDone = true;                         // последняя закончилась — тихо возвращаем спокойный фон
    track = 'calm';
    step = 0;
    nextTime = ctx ? ctx.currentTime + 0.1 : 0;
    fadeBg(CALM_VOLUME, 3);
  }));

  // ---------- Управление ----------
  const isRunning = () => started && ctx.state === 'running';

  // Создаём звук. Вызывается сразу при загрузке и потом при каждом нажатии:
  // если браузер сперва заблокировал звук, нажатие его «размораживает».
  function start(fromGesture = false) {
    if (!allowed) return;
    if (!started) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      started = true;
      ctx = new AC();
      ctx.onstatechange = refreshButton;
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
      bgGain = ctx.createGain();
      bgGain.gain.value = 0.0001;
      bgGain.connect(master);
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(tick, 100);
      tick();
      if (!wantSong) fadeBg(INTRO_VOLUME, 1.5);
    }
    if (ctx.state === 'suspended') { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); }

    if (wantSong) {
      if (songs[cur].paused && !songsDone) playSong();
    } else if (fromGesture && !songUnlocked) {
      // «Разблокируем» элементы <audio> за это нажатие, чтобы песни потом смогли
      // стартовать сами (особенно важно для Safari / iPhone)
      songUnlocked = true;
      songs.forEach((a) => {
        a.muted = true;
        const p = a.play();
        if (p && p.then) p.then(() => { if (!(wantSong && a === songs[cur])) a.pause(); a.muted = muted; }).catch(() => { a.muted = muted; });
        else a.muted = muted;
      });
    }
    refreshButton();
  }

  function setMuted(v) {
    muted = v;
    songs.forEach((a) => { a.muted = v; });
    if (master) master.gain.setTargetAtTime(v ? 0 : 1, ctx.currentTime, 0.05);
    refreshButton();
  }

  // Вызывается из script.js, когда Артур убежал и появилось поздравление
  function onIntroEnd() {
    wantSong = true;
    if (started) playSong();
  }

  // ---------- Кнопка ----------
  const btn = document.createElement('button');
  btn.className = 'music-btn';
  btn.type = 'button';
  function refreshButton() {
    const on = isRunning() && !muted;
    btn.classList.toggle('off', !on);
    btn.textContent = !isRunning() ? '🎵' : (muted ? '🔇' : '🔊');
    btn.title = !isRunning() ? 'Включить музыку' : (muted ? 'Включить звук' : 'Выключить звук');
    btn.setAttribute('aria-label', btn.title);
  }
  btn.addEventListener('click', () => {
    if (!allowed) return;
    if (!isRunning()) { start(true); return; }
    setMuted(!muted);
  });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));
  if (document.readyState !== 'loading') document.body.appendChild(btn);
  refreshButton();

  // Первое нажатие / касание / клавиша где угодно включает музыку,
  // если браузер не дал сделать это самостоятельно (кроме самой кнопки — она сама)
  const GESTURES = ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'click', 'keydown'];
  const firstGesture = (e) => {
    if (e.target && e.target.closest && e.target.closest('.music-btn')) return;
    start(true);                              // дёшево и безопасно вызывать на каждое нажатие
  };
  GESTURES.forEach((n) => document.addEventListener(n, firstGesture, true));

  // Если браузер не дал песне стартовать сам — запускаем при любом следующем нажатии
  document.addEventListener('pointerdown', () => {
    if (started && wantSong && !songsDone && songs[cur].paused && !songs[cur].ended) {
      const p = songs[cur].play();
      if (p && p.catch) p.catch(() => {});
    }
  }, true);

  // Вкладка скрыта — тишина, вернулись — продолжаем
  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.hidden) {
      ctx.suspend();
      songs.forEach((a) => { if (!a.paused) a.pause(); });
    } else {
      ctx.resume();
      if (wantSong && !songsDone && !songs[cur].ended) { const p = songs[cur].play(); if (p && p.catch) p.catch(() => {}); }
    }
  });

  // Вызывается кнопкой «Пуск»: разрешаем музыку и запускаем (нажатие — это жест пользователя)
  function begin() { allowed = true; start(true); }

  return { start, onIntroEnd, begin };
})();
