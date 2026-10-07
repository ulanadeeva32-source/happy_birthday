// ================= Гирлянда флажков =================
const bunting = document.getElementById('bunting');
const flagColors = ['#ff6b6b', '#ffd43b', '#4dabf7', '#69db7c', '#f783ac', '#9775fa'];
const flagCount = Math.max(10, Math.floor(window.innerWidth / 55));
for (let i = 0; i < flagCount; i++) {
  const f = document.createElement('span');
  f.className = 'flag';
  f.style.setProperty('--c', flagColors[i % flagColors.length]);
  f.style.animationDelay = (-Math.random() * 2.6).toFixed(2) + 's';
  bunting.appendChild(f);
}

// ================= Летающие эмодзи =================
const floatersBox = document.getElementById('floaters');
const emojis = ['🎂', '🎈', '🎁', '🎉', '💛', '⭐', '🌷', '🥳', '🍰', '🌟', '💐', '🎈'];

function spawnFloater() {
  const el = document.createElement('span');
  el.className = 'floater';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.fontSize = 18 + Math.random() * 30 + 'px';
  el.style.animationDuration = 9 + Math.random() * 10 + 's';
  floatersBox.appendChild(el);
  setTimeout(() => el.remove(), 20000);
}
let started = false;   // false — пока не нажата кнопка «Пуск», всё стоит на паузе
setInterval(() => { if (started) spawnFloater(); }, 900);

// ================= Падающее конфетти =================
const confetti = ['🎊', '🎉', '✨', '🍬'];
function spawnConfetti() {
  const el = document.createElement('span');
  el.className = 'leaf';
  el.textContent = confetti[Math.floor(Math.random() * confetti.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.fontSize = 18 + Math.random() * 16 + 'px';
  const dur = 8 + Math.random() * 7;
  el.style.animationDuration = dur + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}
setInterval(() => { if (started) spawnConfetti(); }, 1300);

// ================= Холст: салют, сердечки, искры =================
const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const particles = [];
const hearts = [];
const sparks = [];

function firework(x, y) {
  const hue = Math.random() * 360;
  for (let i = 0; i < 90; i++) {
    const angle = (Math.PI * 2 * i) / 90;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      color: `hsl(${hue + Math.random() * 50}, 100%, 62%)`,
      size: 2 + Math.random() * 2
    });
  }
}

function launchSalute() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      firework(
        canvas.width * (0.1 + Math.random() * 0.8),
        canvas.height * (0.12 + Math.random() * 0.4)
      );
    }, i * 380);
  }
}

function launchHearts() {
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      hearts.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        size: 14 + Math.random() * 26,
        speed: 1.5 + Math.random() * 3,
        sway: Math.random() * Math.PI * 2,
        char: ['❤️', '💛', '💖', '🧡'][Math.floor(Math.random() * 4)]
      });
    }, i * 90);
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.99;
    p.life -= p.decay;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // искры за курсором
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.04;
    s.life -= 0.025;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    ctx.globalAlpha = s.life;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.y -= h.speed;
    h.sway += 0.05;
    h.x += Math.sin(h.sway) * 1.2;
    if (h.y < -40) { hearts.splice(i, 1); continue; }
    ctx.font = h.size + 'px serif';
    ctx.fillText(h.char, h.x, h.y);
  }

  requestAnimationFrame(loop);
}
loop();

// Искры за курсором (если водить мышкой по экрану)
document.addEventListener('mousemove', (e) => {
  if (!started) return;
  for (let i = 0; i < 2; i++) {
    sparks.push({
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2 - 0.5,
      life: 1,
      size: 3 + Math.random() * 4,
      color: `hsl(${Math.random() * 60 + 20}, 100%, 60%)`
    });
  }
});

// Клик в любом месте — салют
document.addEventListener('click', (e) => {
  if (!started) return;
  if (e.target.closest('.overlay') || e.target.closest('.btn') || e.target.closest('#intro')) return;
  firework(e.clientX, e.clientY);
});

// ================= Автоматические эффекты =================
let overlayOpen = true;                               // пока идёт заставка или открыт подарок, фоновый салют молчит
setInterval(() => { if (!overlayOpen) launchSalute(); }, 9000);   // салют каждые 9 секунд
setTimeout(() => { if (!overlayOpen) launchHearts(); }, 5000);
setInterval(() => { if (!overlayOpen) launchHearts(); }, 16000);  // сердечки каждые 16 секунд

// ================= Сменяющиеся пожелания =================
const wishes = [
  'От всей души поздравляем Вас с Днём рождения! 🎉',
  'Спасибо за Ваши знания, терпение и поддержку 💛',
  'Благодаря Вам учиться интереснее, а трудные темы — понятнее 📚',
  'Желаем крепкого здоровья, бесконечной энергии и хорошего настроения! 🌞',
  'Пусть студенты радуют Вас успехами, а не только дедлайнами! 🎓',
  'Терпения, вдохновения и побольше тихих пар! 🤫',
  'Пусть мечты сбываются так же легко, как у нас — «пятёрки» по Вашему предмету! ⭐',
  'Счастья Вам, тепла и красивых букетов! 💐',
  'Пусть этот год будет самым ярким и счастливым! 🎂'
];

const wishEl = document.getElementById('wishText');
const dotsEl = document.getElementById('dots');
wishes.forEach(() => dotsEl.appendChild(document.createElement('span')));
const dots = dotsEl.querySelectorAll('span');
let current = 0;

function showWish(i) {
  wishEl.classList.remove('in');
  wishEl.classList.add('out');
  setTimeout(() => {
    wishEl.textContent = wishes[i];
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
    wishEl.classList.remove('out');
    wishEl.classList.add('in');
  }, 550);
}

wishEl.textContent = wishes[0];
dots[0].classList.add('active');
setInterval(() => {
  current = (current + 1) % wishes.length;
  showWish(current);
}, 5500);

// ================= Подарок и поздравления от студентов =================
const overlay = document.getElementById('overlay');
const giftStage = document.getElementById('giftStage');
const boxesStage = document.getElementById('boxesStage');
const gift = document.getElementById('gift');
const boxesEl = document.getElementById('boxes');
const openedCountEl = document.getElementById('openedCount');
const totalCountEl = document.getElementById('totalCount');
const hintEl = document.getElementById('boxesHint');
const letterWrap = document.getElementById('letterWrap');
const letterTitle = document.getElementById('letterTitle');
const typed = document.getElementById('typed');
const letterSign = document.getElementById('letterSign');
const letterPhoto = document.getElementById('letterPhoto');

const btnMain = document.getElementById('btnMain');
const arthurPop = document.getElementById('arthurPop');
const arthurSvg = document.getElementById('arthurSvg');
const arthurJump = document.getElementById('arthurJump');
const arthurText = document.getElementById('arthurText');
const finalText = document.getElementById('finalText');
const arthurHTML = document.getElementById('heroSvg').innerHTML;   // копия Артура из заставки (она потом удаляется)
arthurSvg.innerHTML = arthurHTML;
let arthurTimer = 0;
let arthurBusy = false;

let giftOpened = false;
let giftBusy = false;
let allDone = false;
let typingTimer = null;
let currentMini = null;
const openedSet = new Set();

totalCountEl.textContent = students.length;

function openOverlay() {
  overlay.classList.add('open');
  overlayOpen = true;
  if (giftOpened) {
    giftStage.classList.add('hidden');
    boxesStage.classList.remove('hidden');
    btnMain.hidden = false;
  }
}

function closeOverlay() {
  closeLetter();
  resetMainGift();
  overlay.classList.remove('open');
  overlayOpen = false;
}

function buildBoxes() {
  students.forEach((s, i) => {
    const m = document.createElement('div');
    m.className = 'mini';
    m.style.setProperty('--i', i);
    m.innerHTML =
      '<div class="mini-box"><div class="mini-lid"></div><div class="mini-body"></div></div>' +
      '<div class="mini-label"></div>';
    m.querySelector('.mini-label').textContent = s.name;
    m.addEventListener('click', () => openLetter(i, m));
    boxesEl.appendChild(m);
  });
}

// Клик по большому подарку: крышка улетает, вспышка, салют
gift.addEventListener('click', () => {
  if (giftBusy || giftOpened) return;
  giftBusy = true;
  gift.classList.add('open');
  const r = gift.getBoundingClientRect();
  firework(r.left + r.width / 2, r.top + 20);
  setTimeout(() => firework(r.left + 20, r.top + 70), 250);
  setTimeout(() => firework(r.right - 20, r.top + 70), 450);
  setTimeout(() => {
    giftOpened = true;
    giftBusy = false;
    giftStage.classList.add('hidden');
    boxesStage.classList.remove('hidden');
    btnMain.hidden = false;
    buildBoxes();
  }, 1400);
});

// Клик по маленькой коробочке: открывается крышка, потом письмо с печатающимся текстом
function openLetter(i, mini) {
  if (letterWrap.classList.contains('open') || mini.classList.contains('opening')) return;
  currentMini = mini;
  mini.classList.add('opening');
  const r = mini.getBoundingClientRect();
  firework(r.left + r.width / 2, r.top + 10);

  setTimeout(() => {
    const s = students[i];
    letterTitle.textContent = 'Поздравление от: ' + s.name + ' 💌';
    letterSign.textContent = '— ' + s.name + ', группа 346-П';
    if (s.photo) {
      letterPhoto.src = s.photo;
      letterPhoto.alt = s.name;
      letterPhoto.hidden = false;
    } else {
      letterPhoto.hidden = true;
      letterPhoto.removeAttribute('src');
    }
    letterSign.classList.remove('show');
    typed.textContent = '';
    typed.classList.add('typing');
    letterWrap.classList.add('open');

    if (!openedSet.has(i)) {
      openedSet.add(i);
      openedCountEl.textContent = openedSet.size;
    }

    clearInterval(typingTimer);
    let k = 0;
    setTimeout(() => {
      typingTimer = setInterval(() => {
        typed.textContent = s.text.slice(0, ++k);
        if (k >= s.text.length) {
          clearInterval(typingTimer);
          typed.classList.remove('typing');
          letterSign.classList.add('show');
        }
      }, 32);
    }, 500);
  }, 550);
}

function closeLetter() {
  clearInterval(typingTimer);
  letterWrap.classList.remove('open');
  if (currentMini) {
    currentMini.classList.remove('opening');
    currentMini.classList.add('opened');
    currentMini = null;
  }
  if (!allDone && openedSet.size === students.length) {
    allDone = true;
    hintEl.textContent = 'Все поздравления прочитаны 💛';
    launchSalute();
    launchHearts();
  }
}

// Артур выезжает сбоку и говорит, что дальше будет основной подарок
function resetMainGift() {
  hideArthur();
  overlay.classList.remove('final');
  document.body.classList.remove('final-mode');
  finalText.hidden = true;
  finalText.classList.remove('show');
  if (giftOpened) {
    boxesStage.classList.remove('hidden');
    btnMain.hidden = false;
  }
}

function hideArthur() {
  clearInterval(arthurTimer);
  arthurPop.classList.remove('show', 'speaking', 'talking');
  arthurBusy = false;
}

btnMain.addEventListener('click', async () => {
  if (arthurBusy) return;
  arthurBusy = true;
  closeLetter();
  btnMain.hidden = true;
  const text = 'А вот и я снова! 🎉 Маленькие подарочки — это только начало. Теперь начинается самое главное — ОСНОВНОЙ ПОДАРОК! 🎁';
  arthurText.textContent = '';
  arthurPop.classList.add('show');
  await sleep(700);
  if (!arthurBusy) return;
  arthurJump.classList.remove('jump');
  void arthurJump.offsetWidth;
  arthurJump.classList.add('jump');
  const r = arthurPop.getBoundingClientRect();
  firework(r.left + r.width / 2, r.top - 60);
  await sleep(650);                          // пусть допрыгает, потом облачко над головой
  if (!arthurBusy) return;
  arthurPop.classList.add('speaking', 'talking');
  let i = 0;
  arthurTimer = setInterval(async () => {
    arthurText.textContent = text.slice(0, ++i);
    if (i < text.length) return;
    clearInterval(arthurTimer);
    arthurPop.classList.remove('talking');
    await sleep(2800);
    if (!arthurBusy) return;
    // Артур уезжает, на экране остаётся только надпись
    hideArthur();
    boxesStage.classList.add('hidden');
    overlay.classList.add('final');
    document.body.classList.add('final-mode');
    finalText.hidden = false;
    finalText.classList.remove('show');
    void finalText.offsetWidth;
    finalText.classList.add('show');
    launchSalute();
    launchHearts();
  }, 32);
});

document.getElementById('btnOpen').addEventListener('click', openOverlay);
document.getElementById('btnClose').addEventListener('click', closeOverlay);
document.getElementById('btnLetterClose').addEventListener('click', closeLetter);
letterWrap.addEventListener('click', (e) => { if (e.target === letterWrap) closeLetter(); });
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (letterWrap.classList.contains('open')) closeLetter();
  else if (overlay.classList.contains('open')) closeOverlay();
});

// ================= Заставка с Артуром =================
const introEl = document.getElementById('intro');
const heroEl = document.getElementById('hero');
const heroJump = document.getElementById('heroJump');
const heroFlip = document.getElementById('heroFlip');
const heroSvg = document.getElementById('heroSvg');
const bubbleEl = document.getElementById('bubble');
const bubbleText = document.getElementById('bubbleText');
const choicesEl = document.getElementById('choices');
const nudgeEl = document.getElementById('nudge');
const skipBtn = document.getElementById('skip');
const mainWrap = document.querySelector('.wrap');

let hx = -300;            // текущая позиция героя по X
let targetX = -300;       // куда он идёт
let dir = 1;              // куда смотрит
let walking = false;
let running = false;
let arriveResolve = null;
let introDone = false;
let wander = false;
let heroLast = performance.now();
let heroRaf = 0;
let nudgeTimer = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const heroW = () => heroEl.offsetWidth;

function walkTo(x, run = false) {
  if (arriveResolve) { arriveResolve(false); arriveResolve = null; }
  targetX = x;
  running = run;
  return new Promise((res) => { arriveResolve = res; });
}

// Каждый кадр: двигаем героя и привязываем облачко к его голове
function heroFrame(now) {
  if (introDone) return;
  const dt = Math.min(0.05, (now - heroLast) / 1000);
  heroLast = now;
  const w = heroW();
  const dx = targetX - hx;

  if (Math.abs(dx) > 2) {
    const speed = (running ? 480 : 150) * (w / 200);
    hx += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
    dir = Math.sign(dx);
    walking = true;
  } else {
    walking = false;
    if (arriveResolve) { const r = arriveResolve; arriveResolve = null; r(true); }
  }

  heroEl.style.transform = 'translateX(' + hx + 'px)';
  heroFlip.style.transform = dir < 0 ? 'scaleX(-1)' : 'scaleX(1)';
  heroEl.classList.toggle('walking', walking);

  const bw = bubbleEl.offsetWidth;
  const cx = hx + w / 2;
  const left = Math.min(Math.max(cx - bw / 2, 10), Math.max(10, window.innerWidth - bw - 10));
  const tail = Math.min(Math.max(cx - left, 28), bw - 28);
  bubbleEl.style.left = left + 'px';
  bubbleEl.style.setProperty('--tail', tail + 'px');
  bubbleEl.style.bottom = (window.innerHeight - heroEl.getBoundingClientRect().top + 10) + 'px';

  heroRaf = requestAnimationFrame(heroFrame);
}

// Герой гуляет по экрану, пока не сказано остановиться
async function wanderLoop() {
  while (wander && !introDone) {
    const min = 10;
    const max = Math.max(min, window.innerWidth - heroW() - 10);
    await walkTo(min + Math.random() * (max - min));
    if (!wander) break;
    await sleep(600 + Math.random() * 1400);
  }
}

// Герой говорит: текст печатается в облачке, рот открывается и закрывается
function say(text, speed = 34) {
  return new Promise((resolve) => {
    if (introDone) return resolve();
    clearTimeout(nudgeTimer);
    nudgeEl.classList.remove('show');
    choicesEl.innerHTML = '';
    bubbleText.textContent = '';
    bubbleEl.classList.remove('pop');
    void bubbleEl.offsetWidth;
    bubbleEl.classList.add('show', 'pop');
    heroEl.classList.add('talking');
    let i = 0;
    const t = setInterval(() => {
      if (introDone) { clearInterval(t); return resolve(); }
      bubbleText.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(t);
        heroEl.classList.remove('talking');
        resolve();
      }
    }, speed);
  });
}

// Варианты ответа в облачке
function showChoices(opts) {
  return new Promise((resolve) => {
    choicesEl.innerHTML = '';
    opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'choice' + (o.used ? ' wrong' : '');
      b.textContent = o.t;
      b.disabled = !!o.used;
      b.addEventListener('click', () => {
        clearTimeout(nudgeTimer);
        nudgeEl.classList.remove('show');
        choicesEl.innerHTML = '';
        resolve(i);
      });
      choicesEl.appendChild(b);
    });
    nudgeTimer = setTimeout(() => nudgeEl.classList.add('show'), 11000);
  });
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function jumpHero() {
  heroJump.classList.remove('jump');
  void heroJump.offsetWidth;
  heroJump.classList.add('jump');
}

function popEmoji(x, y, ch) {
  const s = document.createElement('span');
  s.className = 'pop-emoji';
  s.textContent = ch;
  s.style.left = x + 'px';
  s.style.top = y + 'px';
  introEl.appendChild(s);
  setTimeout(() => s.remove(), 1100);
}

// Клик по герою: подпрыгивает и разбрасывает эмодзи
heroEl.addEventListener('click', () => {
  if (introDone) return;
  jumpHero();
  const r = heroEl.getBoundingClientRect();
  ['💛', '⭐', '🎉', '✨', '🎈'].forEach((c, k) => {
    setTimeout(() => popEmoji(r.left + r.width * Math.random(), r.top + 20, c), k * 80);
  });
});

function endIntro() {
  if (introDone) return;
  introDone = true;
  Music.onIntroEnd();               // Артур убежал — включаем песню
  wander = false;
  cancelAnimationFrame(heroRaf);
  introEl.classList.add('leave');
  mainWrap.classList.remove('hidden');
  overlayOpen = false;
  setTimeout(() => introEl.remove(), 900);
  setTimeout(launchSalute, 600);
  setTimeout(launchHearts, 2200);
}
skipBtn.addEventListener('click', endIntro);

async function runIntro() {
  hx = -heroW() - 30;
  targetX = hx;
  heroLast = performance.now();
  heroRaf = requestAnimationFrame(heroFrame);

  await sleep(400);
  await walkTo(Math.max(10, window.innerWidth * 0.25 - heroW() / 2));
  if (introDone) return;

  wander = true;
  wanderLoop();
  await say('Ой, здравствуйте! 👋 Я — Артур, главный по праздникам!');
  await sleep(1300);
  await say('Сегодня какой-то особенный день, я это чувствую! 🎈');
  await sleep(1300);
  await say('Интересно, а у кого сегодня день рождения? 🤔');
  await sleep(900);
  if (introDone) return;

  wander = false;
  await walkTo(window.innerWidth / 2 - heroW() / 2);
  if (introDone) return;

  const opts = shuffle([
    { t: 'У Деда Мороза 🎅',         r: 'Нет-нет, он до декабря занят подготовкой подарков! 😄' },
    { t: 'У Владимира Владимировича Путина 🏰', r: 'Владимир Владимирович тоже родился 7 октября, но сегодня праздник у другого человека! 😄' },
    { t: 'У вас, Артур 🎂',      r: 'Я бы не отказался от торта, но нет, не у меня! 😆' },
    { t: 'У Лилии Ильдаровны 🎉',    ok: true }
  ]);

  let wrong = 0;
  for (;;) {
    const i = await showChoices(opts);
    if (introDone) return;
    if (opts[i].ok) break;

    opts[i].used = true;
    wrong++;
    heroSvg.classList.remove('nope');
    void heroSvg.offsetWidth;
    heroSvg.classList.add('nope');
    await say(opts[i].r);
    await sleep(1100);
    if (wrong === 2) {
      await say('Подсказка: сегодня поздравлять будут любимого преподавателя! 🎁');
      await sleep(1200);
    }
    await say('Так у кого же сегодня праздник? 🤔');
  }

  // правильный ответ
  jumpHero();
  const r = heroEl.getBoundingClientRect();
  firework(r.left + r.width / 2, r.top - 40);
  setTimeout(() => firework(r.left - 40, r.top + 40), 300);
  setTimeout(() => firework(r.right + 40, r.top + 40), 600);
  await say('ВЕРНО!!! 🎉 Сегодня день рождения у Лилии Ильдаровны — самого лучшего преподавателя!', 30);
  await sleep(1600);
  await say('Скорее, надо успеть подготовить поздравление! Бегу! 🎁');
  await sleep(1000);
  if (introDone) return;

  bubbleEl.classList.remove('show');
  await walkTo(window.innerWidth + heroW() + 40, true);
  endIntro();
}

// ================= Кнопка «Пуск» =================
const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', () => {
  if (started) return;
  started = true;
  startBtn.remove();                       // кнопка пропадает навсегда — на паузу больше не поставить
  document.body.classList.remove('paused');
  Music.begin();
  for (let i = 0; i < 14; i++) setTimeout(spawnFloater, i * 350);
  runIntro();
});
