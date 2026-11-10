/* Spark's Snowy Code Quest — UI, editors, animation, sound. Depends on logic.js */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const screen = $('#screen');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ARROW = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
  const TILE = { P: '🎁', T: '🎄', M: '⛄', I: '🧊', G: '🛷' };
  const BONK_SIMPLE = {
    edge: 'Oops! That is the edge. Try a new way.',
    tree: 'Bonk! A tree 🎄 is in the way. Try again!',
    snowman: 'Oof! A snowman ⛄ is in the way. Try again!',
    ice: 'Clunk! Ice 🧊! Tap ✨ Melt first.',
  };
  const BONK = {
    edge: 'Whoops! Spark nearly walked off the edge of the map.',
    tree: 'Bonk! Spark bumped into a Christmas tree 🎄.',
    snowman: 'Oof! Spark walked into a snowman ⛄. Sorry, snowman!',
    ice: 'Clunk! That\'s solid ice 🧊. Stand next to it and melt it first.',
  };

  /* ---------------- progress ---------------- */
  const SAVE = 'sparkSnowyCodeQuest.v1';
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(SAVE)) || {}; } catch (e) { progress = {}; }
  const starsOf = (tier, i) => (progress[tier] && progress[tier][i]) || 0;
  function saveStars(tier, i, s) {
    progress[tier] = progress[tier] || [];
    progress[tier][i] = Math.max(progress[tier][i] || 0, s);
    try { localStorage.setItem(SAVE, JSON.stringify(progress)); } catch (e) { /* private mode */ }
  }
  const unlocked = (tier, i) => i === 0 || starsOf(tier, i - 1) > 0;
  const starStr = n => '⭐'.repeat(n) + '☆'.repeat(3 - n);

  /* ---------------- sound ---------------- */
  let soundOn = true, actx = null;
  function tone(freq, dur = 0.12, type = 'sine', vol = 0.12, delay = 0) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* no audio */ }
  }
  const sfx = {
    step: () => tone(520, 0.06, 'triangle', 0.06),
    collect: () => { tone(988, 0.12, 'sine', 0.12); tone(1319, 0.2, 'sine', 0.1, 0.08); },
    bonk: () => tone(140, 0.25, 'square', 0.08),
    melt: () => { tone(700, 0.3, 'sawtooth', 0.04); tone(350, 0.35, 'sine', 0.08, 0.05); },
    good: () => { tone(660, 0.12); tone(880, 0.18, 'sine', 0.12, 0.1); },
    bad: () => tone(260, 0.2, 'triangle', 0.1),
    win: () => [659, 659, 659, 659, 659, 659, 659, 784, 523, 587, 659].forEach((f, i) =>
      tone(f, i === 2 || i === 5 ? 0.35 : 0.16, 'triangle', 0.1, [0, .18, .36, .72, .9, 1.08, 1.44, 1.62, 1.8, 1.98, 2.16][i])),
  };
  $('#musicBtn').onclick = () => window.SparkMusic && SparkMusic.toggle();
  $('#soundBtn').onclick = () => { soundOn = !soundOn; $('#soundBtn').textContent = soundOn ? '🔊 Sound' : '🔇 Muted'; };

  /* ---------- voice: pick the softest, friendliest female English voice on this device ---------- */
  // Ordered best-first. Covers macOS/iOS, Windows, Chrome/Edge (Google & Microsoft online voices) and Android.
  const VOICE_PREFS = [
    /Microsoft (Sonia|Libby|Maisie|Ava|Emma|Jenny|Aria|Ana|Natasha|Clara).*Online/i,  // Edge neural voices: very natural
    /^Google UK English Female/i, /^Google US English/i,
    /^(Serena|Kate|Stephanie|Martha)\b/i,                                     // macOS premium/enhanced UK voices
    /^(Samantha|Ava|Allison|Susan|Zoe|Nicky|Joelle)\b/i,                      // macOS/iOS US voices
    /^(Karen|Moira|Tessa|Fiona|Veena|Tara)\b/i,                               // other English accents
    /^Shelley/i, /^Flo/i, /^Sandy/i,
    /Microsoft (Hazel|Susan|Zira|Libby|Sonia|Catherine|Heera)/i,               // Windows desktop voices
    /female|woman/i,
  ];
  const AVOID = /^(?:Grandma|Grandpa|Whisper|Bad News|Good News|Bahh|Bells|Boing|Bubbles|Cellos|Wobble|Jester|Organ|Superstar|Trinoids|Zarvox|Albert|Fred|Junior|Ralph|Rocko|Eddy|Reed|Daniel|Arthur|Oliver|Rishi|Aman|Gordon|Lee|Thomas|Microsoft (David|Mark|George|Ryan|Guy|Christopher|Eric|Brian))\b/i;   // match whole names at the start (so 'Aman' doesn't hit 'Samantha')
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const all = speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang) && !AVOID.test(v.name));
    for (const re of VOICE_PREFS) {
      const hits = all.filter(v => re.test(v.name));
      // prefer enhanced/premium/neural variants of the same voice
      if (hits.length) { voice = hits.find(v => /enhanced|premium|neural|natural|online/i.test(v.name)) || hits[0]; return; }
    }
    voice = all[0] || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?'’-]/gu, ''));
    if (!voice) pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = 0.88;      // a little slower: calm and easy to follow
    u.pitch = 1.05;     // just a touch brighter — high pitch sounds squeaky, not soft
    u.volume = 0.9;
    const M = window.SparkMusic;
    u.onstart = () => M && M.duck(true);
    u.onend = u.onerror = () => M && M.duck(false);
    speechSynthesis.speak(u);
  }

  /* ---------------- snow background ---------------- */
  (function snowfall() {
    const c = $('#snow'), ctx = c.getContext('2d');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let flakes = [];
    const resize = () => {
      c.width = innerWidth; c.height = innerHeight;
      flakes = Array.from({ length: Math.min(140, Math.floor(innerWidth / 9)) }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 2.6 + 0.8, s: Math.random() * 0.6 + 0.3, d: Math.random() * 6,
      }));
    };
    resize(); addEventListener('resize', resize);
    (function frame(t) {
      ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = 'rgba(255,255,255,.8)';
      for (const f of flakes) {
        f.y += f.s; f.x += Math.sin(t / 1600 + f.d) * 0.35;
        if (f.y > c.height) { f.y = -5; f.x = Math.random() * c.width; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
      }
      requestAnimationFrame(frame);
    })(0);
  })();

  /* ---------------- confetti & modal ---------------- */
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bits = ['❄️', '⭐', '🎁', '✨', '🎄', '🔔'];
    for (let i = 0; i < 40; i++) {
      const d = document.createElement('div');
      d.className = 'confetti'; d.textContent = bits[i % bits.length];
      d.style.left = Math.random() * 100 + 'vw';
      d.style.animationDuration = 2 + Math.random() * 2 + 's';
      d.style.animationDelay = Math.random() * 0.8 + 's';
      document.body.appendChild(d); setTimeout(() => d.remove(), 5000);
    }
  }
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* burst of emoji particles from a point inside an element */
  function burst(host, x, y, bits = ['✨', '⭐', '❄️'], n = 10, dist = 70) {
    if (calm()) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle'; p.textContent = bits[i % bits.length];
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5, d = dist * (0.6 + Math.random() * 0.6);
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.cos(ang) * d + 'px'); p.style.setProperty('--dy', Math.sin(ang) * d + 'px');
      host.appendChild(p); setTimeout(() => p.remove(), 900);
    }
  }
  function floatText(host, x, y, text, cls = '') {
    const f = document.createElement('div');
    f.className = 'floaty ' + cls; f.textContent = text;
    f.style.left = x + 'px'; f.style.top = y + 'px';
    host.appendChild(f); setTimeout(() => f.remove(), 1300);
  }
  function burstAt(el, bits, n, dist) {
    const r = el.getBoundingClientRect();
    burst(document.body, r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY, bits, n, dist);
  }

  function modal(html, wire) {
    $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden');
    wire && wire($('#modalCard'));
    const b = $('#modalCard button'); b && b.focus({ preventScroll: true });
  }
  const closeModal = () => $('#modal').classList.add('hidden');

  /* ---------------- navigation ---------------- */
  let cleanup = null;
  function go(fn) { if (cleanup) { cleanup(); cleanup = null; } closeModal(); if ('speechSynthesis' in window) speechSynthesis.cancel(); fn(); scrollTo(0, 0); }
  $('#homeBtn').onclick = () => go(titleScreen);

  function titleScreen() {
    $('#homeBtn').classList.add('hidden');
    const tiers = Object.values(TIERS);
    screen.innerHTML = `
      <section class="title">
        <div class="hero">
          <img src="spark.png" alt="Spark, a friendly blue robot reading a book" id="heroSpark">
        </div>
        <h2>Spark's Snowy Code Quest</h2>
        <p>A Christmas Eve blizzard has scattered Santa's presents across the North Pole! Help <b>Spark</b> rescue them by
           <b>asking Frosty the AI helper</b> clearly and kindly, then <b>coding</b> Spark's path to the sleigh.</p>
        <p>🗣️ Ask well &nbsp;→&nbsp; 🧩 Code a path &nbsp;→&nbsp; 🎁 Save the presents</p>
      </section>
      <div class="lights" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="animation-delay:${(i % 6) * 0.25}s"></i>`).join('')}</div>
      <div class="tiers">
        ${tiers.map(t => {
          const total = t.missions.reduce((a, _, i) => a + starsOf(t.id, i), 0);
          return `<button class="tier" data-tier="${t.id}">
            <div class="big wiggle">${t.emoji}</div>
            <span class="ages">Ages ${t.ages}</span>
            <h3>${t.name}</h3>
            <p>${t.blurb}</p>
            ${t.simple ? '<p class="parent">👨‍👩‍👧 Little ones may like a grown-up to help!</p>' : ''}
            <div class="stars">⭐ ${total} / ${t.missions.length * 3}${tierDone(t.id) ? ' &nbsp;🏆' : ''}</div>
          </button>`;
        }).join('')}
      </div>
      <button class="bonus pop-in" id="cardBtn">
        <span class="bonus-icon wiggle">🎨</span>
        <span><span class="bonus-tag">⭐ BONUS</span><b>Holiday Card Maker</b>
        <span>Answer 5 fun questions to design your own Christmas card — then save it as a picture!</span></span>
        <span class="bonus-go">Make a card ➜</span>
      </button>`;
    screen.querySelectorAll('.tier').forEach(b => b.onclick = () => go(() => missionList(b.dataset.tier)));
    $('#cardBtn').onclick = () => go(cardScreen);
    $('#heroSpark').onclick = e => { sfx.collect(); burstAt(e.target, ['✨', '⭐', '🎁', '❄️'], 14, 110); e.target.classList.remove('spin'); e.target.offsetWidth; e.target.classList.add('spin'); };
  }

  function tierStars(tierId) { return TIERS[tierId].missions.reduce((a, _, i) => a + starsOf(tierId, i), 0); }
  const finaleHooks = () => ({
    home: () => go(titleScreen), card: () => go(cardScreen), sfx: k => sfx[k] && sfx[k](), tone, speak, confetti,
  });
  function openFinale(tierId) {
    missionList(tierId);                                   // sits underneath, so closing lands somewhere sensible
    Finale.play({ tierId, simple: !!TIERS[tierId].simple, stars: tierStars(tierId), maxStars: TIERS[tierId].missions.length * 3, hooks: finaleHooks() });
  }
  function openCertificate(tierId) {
    $('#homeBtn').classList.remove('hidden');
    Finale.certificate({ tierId, simple: !!TIERS[tierId].simple, stars: tierStars(tierId), maxStars: TIERS[tierId].missions.length * 3, hooks: finaleHooks() });
  }
  const tierDone = tierId => TIERS[tierId].missions.every((_, i) => starsOf(tierId, i) > 0);

  function cardScreen() {
    $('#homeBtn').classList.remove('hidden');
    screen.innerHTML = `<div class="card" style="margin-bottom:16px;text-align:center">
      <h2 style="margin:0 0 10px">🎨 Who is making the card?</h2>
      <div class="row" style="justify-content:center">
        <button class="btn" data-age="simple">❄️ Ages 4–8</button>
        <button class="btn" data-age="full">🦌 Ages 9–12</button>
        <button class="btn" data-age="full">⭐ Ages 13–16</button>
      </div>
      <p class="parent" style="margin-top:14px">👨‍👩‍👧 Little ones may like a grown-up to help!</p></div>`;
    screen.querySelectorAll('[data-age]').forEach(b => b.onclick = () => CardMaker.open(screen, {
      simple: b.dataset.age === 'simple',
      hooks: { home: () => go(titleScreen), sfx: k => sfx[k] && sfx[k](), speak, confetti, burstAt },
    }));
  }

  function missionList(tierId) {
    const tier = TIERS[tierId];
    $('#homeBtn').classList.remove('hidden');
    screen.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <h2 style="margin:0">${tier.emoji} ${tier.name} <span class="ages pill" style="background:var(--sky);font-size:.9rem">Ages ${tier.ages}</span></h2>
        ${tier.simple ? `<p class="simple" style="margin:8px 0 0">🗣️ Ask Frosty for help.<br>➡️ Tap arrows to move Spark.<br>🎁 Get all the gifts. Then go to the sleigh 🛷!</p>
        <div class="parentNote"><span class="pn-icon">👨‍👩‍👧</span><div><b>Grown-ups:</b> younger children may enjoy playing this with you.
          Read the words together, or tap <b>🔈 Read to me</b> to hear them out loud.</div></div>` :
        `<p style="margin:8px 0 0">${tier.blurb} Each mission has two parts: first <b>ask Frosty the AI</b> for help, then <b>code Spark's path</b>.
        Collect every 🎁 and finish on the 🛷. Use fewer ${tier.editor === 'text' ? 'lines' : 'blocks'} to earn more ⭐!</p>`}
        ${tierDone(tierId) ? `<div class="donebar"><span>🏆 <b>${tier.simple ? 'You did them all!' : 'Quest complete!'}</b></span>
          <button class="btn green" id="lCert">📜 ${tier.simple ? 'My certificate' : 'Get certificate'}</button>
          <button class="btn ghost" id="lFinale">🛷 ${tier.simple ? 'See the ending' : 'Watch finale'}</button></div>` : ''}
      </div>
      <div class="missions">
        ${tier.missions.map((m, i) => {
          const open = unlocked(tierId, i);
          return `<button class="mission pop-in ${open ? '' : 'locked'}" style="animation-delay:${i * 0.08}s" data-i="${i}" ${open ? '' : 'aria-disabled="true"'}>
            <div class="num">${open ? i + 1 : '🔒'}</div>
            <div><h3>${esc(m.title)}</h3><div>${open ? esc(m.story.split('!')[0]) + '!' : (tier.simple ? 'Win the one before first! 🔒' : 'Finish the mission before to unlock')}</div></div>
            <div class="stars">${starStr(starsOf(tierId, i))}</div>
          </button>`;
        }).join('')}
      </div>`;
    if ($('#lCert')) { $('#lCert').onclick = () => go(() => openCertificate(tierId)); $('#lFinale').onclick = () => go(() => openFinale(tierId)); }
    screen.querySelectorAll('.mission').forEach(b => b.onclick = () => {
      if (!unlocked(tierId, +b.dataset.i)) { sfx.bad(); return; }
      go(() => playMission(tierId, +b.dataset.i));
    });
  }

  /* ================= MISSION ================= */
  function playMission(tierId, mi) {
    const tier = TIERS[tierId], m = tier.missions[mi], lv = parseMap(m.map);
    const kind = m.prompt.kind;
    const unit = tier.editor === 'text' ? 'commands' : 'blocks';
    let fails = 0, running = false, timers = [];
    $('#homeBtn').classList.remove('hidden');

    screen.innerHTML = `
      <div class="hud">
        <button class="pill" id="backBtn">⬅ ${tier.simple ? 'Back' : 'Missions'}</button>
        <span class="pill">${tier.emoji} ${tier.name}</span>
        <span class="pill">Mission ${mi + 1}: ${esc(m.title)}</span>
        <span class="pill">🎁 <span id="gotN">0</span> / ${lv.presents.length}</span>
        <span class="pill">${tier.simple ? `⭐⭐⭐ = ${m.par} taps` : `⭐⭐⭐ in ${m.par} ${unit} or fewer`}</span>
      </div>
      <div class="play">
        <div class="boardwrap">
          <div class="board" id="board"></div>
        </div>
        <div class="card panel" id="panel"></div>
      </div>`;
    $('#backBtn').onclick = () => go(() => missionList(tierId));

    /* ---------- board ---------- */
    const board = $('#board');
    board.style.setProperty('--ar', lv.w / lv.h);
    board.style.gridTemplateColumns = `repeat(${lv.w}, 1fr)`;
    board.style.setProperty('--spd', tier.speed * 0.9 + 'ms');
    const cells = {};
    m.map.forEach((row, y) => [...row].forEach((c, x) => {
      const d = document.createElement('div');
      d.className = 'cell' + ((x + y) % 2 ? ' alt' : '') + (c === 'G' ? ' goal' : '') + (c === 'I' ? ' ice' : '');
      if (TILE[c]) d.innerHTML = `<span class="ob ${c === 'P' ? 'twinkle' : c === 'G' ? 'sleighbob' : c === 'T' ? 'sway' : ''}" style="animation-delay:${((x * 7 + y * 3) % 10) / 10}s">${TILE[c]}</span>`;
      board.appendChild(d); cells[key(x, y)] = d;
    }));
    const spark = document.createElement('div');
    spark.className = 'spark idle'; spark.innerHTML = '<img src="spark.png" alt="Spark">';
    board.appendChild(spark);
    let veil = null;
    if (kind === 'fog' || kind === 'dark') {
      veil = document.createElement('div');
      veil.className = 'veil ' + kind;
      veil.innerHTML = kind === 'fog'
        ? `<div><span class="big drift">🌨️</span>${tier.simple ? 'Too much snow!<br>Ask Frosty for help!' : 'The blizzard is hiding the map…<br>Ask Frosty for help!'}</div>`
        : `<div><span class="big drift">🌑</span>${tier.simple ? 'Too dark!<br>Ask Frosty for help!' : 'It\'s too dark to see…<br>Ask Frosty for help!'}</div>`;
      board.appendChild(veil);
    }
    function layout() {
      const cs = board.clientWidth / lv.w;
      board.style.fontSize = (cs * 0.6).toFixed(2) + 'px';   // cells inherit this (set directly: more reliable than a CSS variable)
      spark.style.width = spark.style.height = cs + 'px';
    }
    function placeSpark(x, y, instant) {
      const cs = board.clientWidth / lv.w;
      if (instant) spark.style.transition = 'none';
      spark.style.left = x * cs + 'px'; spark.style.top = y * cs + 'px';
      if (instant) { spark.offsetWidth; spark.style.transition = ''; }
      spark.dataset.x = x; spark.dataset.y = y;
    }
    const onResize = () => { layout(); placeSpark(+spark.dataset.x, +spark.dataset.y, true); };
    addEventListener('resize', onResize);
    cleanup = () => { removeEventListener('resize', onResize); timers.forEach(clearTimeout); };
    layout(); placeSpark(lv.start.x, lv.start.y, true);

    function resetBoard() {
      timers.forEach(clearTimeout); timers = [];
      Object.values(cells).forEach(c => c.classList.remove('got', 'melted', 'trail'));
      spark.classList.remove('bonk', 'happy', 'walk'); spark.classList.add('idle');
      placeSpark(lv.start.x, lv.start.y, true);
      $('#gotN').textContent = 0;
    }

    const panel = $('#panel');
    const frostySays = (html, cls = '') => `<div class="frosty"><div class="face">☃️</div><div class="bubble ${cls}">${html}</div></div>`;

    /* ---------- step 1: story ---------- */
    panel.innerHTML = `
      <h2>📖 ${esc(m.title)}</h2>
      <p class="story ${tier.simple ? 'simple' : ''}">${esc(m.story)}</p>
      ${tier.simple ? `<div class="goalcard simple">
          <div><span class="bigemoji twinkle">🎁</span>Get all the gifts</div>
          <div class="arrowgo">➜</div>
          <div><span class="bigemoji sleighbob">🛷</span>Go to the sleigh</div>
        </div>
        <p class="simple">Do not bump into 🎄 ⛄ 🧊</p>
        <p class="parent">👨‍👩‍👧 You can ask a grown-up to help you read.</p>` :
      `<p class="story">Your goal: collect <b>every 🎁</b>, then finish on <b>Santa's sleigh 🛷</b>.<br>
      Watch out for 🎄 trees, ⛄ snowmen and 🧊 ice!</p>`}
      <div class="row">
        <button class="btn" id="startBtn">Let's go! ✨</button>
        ${tierId === 'young' ? '<button class="btn ghost" id="readBtn">🔈 Read to me</button>' : ''}
      </div>`;
    $('#startBtn').onclick = promptStep;
    if ($('#readBtn')) $('#readBtn').onclick = () => speak(m.story + ' Get all the gifts. Then go to the sleigh. Do not bump into trees, snowmen or ice.');

    /* ---------- step 2: prompt Frosty ---------- */
    function promptStep() {
      const intro = tier.simple
        ? `<h2>🗣️ Step 1: Ask Frosty</h2>
           ${frostySays(`<span class="simple">Hi! I am <b>Frosty</b>. I am a helper robot. 🤖<br>${esc(m.prompt.question)}</span>`)}`
        : `<h2>🗣️ Step 1: Ask Frosty the AI</h2>
           ${frostySays(`Hi, I'm <b>Frosty</b>, the North Pole's AI helper! ${esc(m.prompt.question)}`)}`;
      if (tierId === 'young') youngPrompt(intro);
      else if (tierId === 'middle') middlePrompt(intro);
      else teenPrompt(intro);
    }

    function youngPrompt(intro) {
      const opts = shuffle(m.prompt.options);
      panel.innerHTML = intro + `
        <p class="simple"><b>Tap the best one:</b> 👇</p>
        <div class="options">${opts.map((o, i) => `<button class="opt simple pop-in" style="animation-delay:${i * 0.12}s" data-i="${i}"><span class="e">${o.emoji}</span>${esc(o.text)}</button>`).join('')}</div>
        <div id="fb"></div>
        <div class="row"><button class="btn ghost" id="readBtn">🔈 Read to me</button></div>`;
      $('#readBtn').onclick = () => speak(m.prompt.question + ' ' + opts.map((o, i) => `Number ${i + 1}: ${o.text}`).join(' '));
      panel.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const o = opts[+b.dataset.i];
        if (o.good) { sfx.good(); burstAt(b, ['⭐', '✨', '💙'], 14, 90); speak(o.feedback); promptSuccess(esc(o.feedback)); }
        else { sfx.bad(); b.classList.add('wrong', 'shake'); $('#fb').innerHTML = frostySays(`<span class="simple">${esc(o.feedback)}</span>`, 'bad'); speak(o.feedback); }
      });
    }

    function middlePrompt(intro) {
      const rows = m.prompt.rows.map(r => ({ ...r, chips: shuffle(r.chips) }));
      const pick = rows.map(() => null);
      panel.innerHTML = intro + `
        <p><b>Build your prompt — pick one piece from each row.</b> Good prompts say <i>who</i>, <i>what</i> and <i>why</i>.</p>
        <div class="builder">${rows.map((r, ri) => `
          <div class="label">${ri + 1}. ${esc(r.label)}</div>
          <div class="chips">${r.chips.map((c, ci) => `<button class="chip" data-r="${ri}" data-c="${ci}">${esc(c.text)}</button>`).join('')}</div>`).join('')}
        </div>
        <div class="assembled" id="asm">Your prompt will appear here…</div>
        <div class="row"><button class="btn" id="sendBtn" disabled>📨 Send to Frosty</button></div>
        <div id="fb"></div>`;
      const render = () => {
        panel.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', pick[+b.dataset.r] === +b.dataset.c));
        const parts = pick.map((c, ri) => c == null ? '…' : rows[ri].chips[c].text);
        $('#asm').textContent = pick.some(c => c != null) ? '“' + parts.join(' ') + '”' : 'Your prompt will appear here…';
        $('#sendBtn').disabled = pick.some(c => c == null);
      };
      panel.querySelectorAll('.chip').forEach(b => b.onclick = () => { pick[+b.dataset.r] = +b.dataset.c; render(); $('#fb').innerHTML = ''; });
      $('#sendBtn').onclick = () => {
        const bad = pick.map((c, ri) => rows[ri].chips[c]).filter(c => !c.good);
        if (!bad.length) { sfx.good(); promptSuccess('That\'s a great prompt! You told me <b>who</b> you\'re asking, <b>exactly what</b> you need, and <b>why</b>. Clear prompts get clear answers.'); }
        else {
          sfx.bad();
          $('#fb').innerHTML = frostySays(`Hmm, I'm not quite sure what you need. ${bad.length > 1 ? `<b>${bad.length} pieces</b> could be better. Here's one:` : ''}<br>💡 ${esc(bad[0].feedback)}`, 'bad');
        }
      };
    }

    function teenPrompt(intro) {
      const tw = m.prompt.taskWords;
      panel.innerHTML = intro + `
        <p>Write your own prompt. Frosty checks it against a <b>prompt-engineering checklist</b>: you need the
        <b>🎯 clear task</b> plus at least <b>3</b> of the others.</p>
        <textarea id="pText" rows="4" placeholder="e.g. Frosty, please…" aria-label="Your prompt"></textarea>
        <div class="row"><button class="btn" id="sendBtn">📨 Send to Frosty</button></div>
        <ul class="checklist" id="chk"></ul>
        <div id="fb"></div>`;
      const ta = $('#pText');
      const draw = res => $('#chk').innerHTML = res.checks.map(c =>
        `<li class="${res.tried ? (c.ok ? 'ok' : 'no') : ''}">${res.tried ? (c.ok ? '✅' : '⬜') : c.icon} ${esc(c.label)}${c.required ? ' <b>(required)</b>' : ''}</li>`).join('');
      draw({ ...scorePrompt('', tw), tried: false });
      ta.focus({ preventScroll: true });
      $('#sendBtn').onclick = () => {
        const text = ta.value.trim();
        if (!text) { ta.focus(); return; }
        const res = scorePrompt(text, tw);
        draw({ ...res, tried: true });
        if (res.unkind) { sfx.bad(); $('#fb').innerHTML = frostySays('Ouch! I\'ll always try my best, but kind words make for a better team. Could you rephrase that?', 'bad'); return; }
        if (res.pass) {
          sfx.good();
          promptSuccess(`Excellent prompt engineering — ${res.score}/5 on the checklist!${res.polite ? ' And thanks for being polite 😊.' : ''}
            <br><br><i>Your prompt:</i> “${esc(text)}”`);
        } else {
          sfx.bad();
          const miss = res.checks.filter(c => !c.ok);
          $('#fb').innerHTML = frostySays(!res.checks[0].ok
            ? `I can't tell what you want me to <b>do</b>. Name the task clearly (what should happen to the ${{ fog: 'fog', dark: 'darkness', melt: 'ice' }[kind]}?).`
            : `Getting there! Try adding: ${miss.map(c => c.icon + ' ' + c.label.split(' —')[0].toLowerCase()).join(', ')}.`, 'bad');
        }
      };
    }

    function promptSuccess(feedback) {
      const reward = tier.simple ? {
        fog: 'Whoosh! 🌬️ The snow is gone!',
        dark: 'Ta-da! 💡 The lights are on!',
        melt: 'Here is a magic power! ✨ Tap <b>✨ Melt</b> next to the ice. It will melt!',
      }[kind] : {
        fog: 'Whoooosh! 🌬️ I\'ve blown the blizzard away — now you can see the whole map!',
        dark: 'Ta-da! 💡 I\'ve switched on the northern lights — now you can see the whole map!',
        melt: 'I\'ve given Spark a new command: <b>✨ Melt</b>. It melts any 🧊 ice right next to Spark (up, down, left or right).',
      }[kind];
      if (veil) {
        veil.classList.add('gone');
        const v = veil; setTimeout(() => v.remove(), 1300);
        const r = board.getBoundingClientRect();
        burstAt(board, kind === 'fog' ? ['🌬️', '❄️', '☁️'] : ['💡', '✨', '🌟'], 18, Math.min(r.width, r.height) * 0.45);
      } else burstAt(board, ['✨', '🔥', '⭐'], 14, 120);
      if (kind === 'dark' && !calm()) board.classList.add('aurora');
      panel.innerHTML = `<h2>🗣️ Step 1: Ask Frosty${tier.simple ? '' : ' the AI'} ✅</h2>
        <div class="pop-in">${frostySays(tier.simple ? `<span class="simple">${feedback}</span>` : feedback, 'good')}</div>
        <div class="pop-in" style="animation-delay:.3s">${frostySays(tier.simple ? `<span class="simple">${reward}</span>` : reward, 'good')}</div>
        <div class="row"><button class="btn green pulse" id="codeBtn">${tier.simple ? 'Next! ➡️' : 'Start coding! 🧩'}</button></div>`;
      if (tier.simple) speak(reward.replace(/<[^>]+>/g, ''));
      $('#codeBtn').focus({ preventScroll: true });
      $('#codeBtn').onclick = codeStep;
    }

    /* ---------- step 3: code ---------- */
    let prog = [];            // arrows/blocks tokens
    let textSrc = tierId === 'teen' ? `# Mission ${mi + 1}: ${m.title}\n# Write your program below. Try using repeat!\n\n` : '';
    const canMelt = kind === 'melt';

    function codeStep() {
      const editorHTML = {
        arrows: `
          <p class="simple">${tier.simple ? 'Tap the arrows. 👆<br>Then tap <b>▶ Go!</b>' : 'Tap the arrows to plan Spark\'s path, then press <b>Go!</b>'}</p>
          <div class="palette">
            ${Object.keys(ARROW).map(d => `<button class="key" data-add="${d}" aria-label="${d}">${ARROW[d]}</button>`).join('')}
            ${canMelt ? '<button class="key melt" data-add="melt">✨ Melt</button>' : ''}
          </div>
          <div class="program" id="prog"></div>`,
        blocks: `
          <p>Add blocks to build a program. Click a <span class="blk" style="display:inline-flex;padding:0 6px">number</span> to change it.
          Put steps between <b>🔁 Repeat</b> and <b>End</b> to loop them!</p>
          <div class="palette">
            ${Object.keys(ARROW).map(d => `<button class="key" data-add="${d}" aria-label="${d}">${ARROW[d]}</button>`).join('')}
            ${canMelt ? '<button class="key melt" data-add="melt">✨ Melt</button>' : ''}
            <button class="key rep" data-add="repeat">🔁 Repeat</button>
            <button class="key end" data-add="end">⏹ End</button>
          </div>
          <div class="program list" id="prog"></div>`,
        text: `
          <div class="codebox"><div class="gutter" id="gutter">1</div>
            <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor"></textarea></div>
          <div class="ref"><b>Commands:</b> <code>up 2</code> <code>down 1</code> <code>left 3</code> <code>right 4</code>
            ${canMelt ? '<code>melt</code>' : ''} <code>repeat 3 { … }</code> <code># comment</code><br>
            Repeats can go inside repeats! Each command or repeat counts as 1. Press <b>Ctrl/⌘ + Enter</b> to run.</div>`,
      }[tier.editor];

      panel.innerHTML = `<h2>🧩 Step 2: ${tier.simple ? 'Move Spark' : 'Code Spark\'s path'}</h2>
        ${editorHTML}
        <div class="counter" id="counter"></div>
        <div class="row">
          <button class="btn green" id="runBtn">▶ Go!</button>
          ${tier.editor !== 'text' ? '<button class="btn ghost" id="undoBtn">↩ Undo</button>' : ''}
          <button class="btn ghost" id="clearBtn">🗑 Clear</button>
          <button class="btn ghost hidden" id="hintBtn">💡 Hint</button>
        </div>
        <div id="out"></div>`;

      if (tier.editor === 'text') {
        const ta = $('#code'), gut = $('#gutter');
        ta.value = textSrc;
        const sync = () => { textSrc = ta.value; drawGutter(); updateCounter(); };
        ta.oninput = sync;
        ta.onscroll = () => gut.scrollTop = ta.scrollTop;
        ta.onkeydown = e => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
          else if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); sync(); }
        };
        ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length);
      } else {
        panel.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
          if (running) return;
          const a = b.dataset.add;
          if (prog.length >= 60) { msg('warn', 'That\'s a lot of blocks! Try using fewer.'); return; }
          if (a === 'melt') prog.push({ t: 'melt' });
          else if (a === 'repeat') prog.push({ t: 'repeat', n: 2 });
          else if (a === 'end') prog.push({ t: 'end' });
          else prog.push({ t: 'move', dir: a, n: 1 });
          sfx.step(); b.classList.remove('boing'); b.offsetWidth; b.classList.add('boing'); drawProg(); $('#out').innerHTML = '';
        });
        $('#undoBtn').onclick = () => { if (!running) { prog.pop(); drawProg(); } };
      }
      $('#clearBtn').onclick = () => {
        if (running) return;
        resetBoard();
        if (tier.editor === 'text') { $('#code').value = textSrc = ''; drawGutter(); updateCounter(); $('#code').focus(); }
        else { prog = []; drawProg(); }
        $('#out').innerHTML = '';
      };
      $('#hintBtn').onclick = () => msg('info', '💡 ' + esc(m.hint));
      $('#runBtn').onclick = () => running ? stop() : run();
      drawProg(); drawGutter(); updateCounter();
    }

    function drawGutter(now, err) {
      const g = $('#gutter'); if (!g) return;
      const n = Math.max(1, textSrc.split('\n').length);
      g.innerHTML = Array.from({ length: n }, (_, i) => `<span class="${i + 1 === now ? 'now' : i + 1 === err ? 'err' : ''}">${i + 1 === now ? '▶' : ''}${i + 1}</span>`).join('\n');
    }

    function drawProg(now, err) {
      const box = $('#prog'); if (!box) return;
      if (!prog.length) { box.innerHTML = `<div class="empty">${tier.simple ? 'Your arrows go here 👣' : tier.editor === 'arrows' ? 'Your path will appear here… 👣' : 'Your program is empty. Add some blocks!'}</div>`; updateCounter(); return; }
      if (tier.editor === 'arrows') {
        box.innerHTML = prog.map((t, i) => `<div class="tok ${i === now ? 'now' : ''} ${i === prog.length - 1 && now == null ? 'pop-in' : ''}">${t.t === 'melt' ? '✨' : ARROW[t.dir]}</div>`).join('');
      } else {
        let depth = 0;
        box.innerHTML = prog.map((t, i) => {
          if (t.t === 'end') depth = Math.max(0, depth - 1);
          const pad = `margin-left:${depth * 26}px`;
          const cls = `blk ${t.t === 'repeat' ? 'rep' : t.t === 'end' ? 'end' : t.t === 'melt' ? 'melt' : ''} ${i === now ? 'now' : ''} ${i === err ? 'err' : ''}`;
          let body;
          if (t.t === 'repeat') { body = `🔁 Repeat <button class="n" data-n="${i}" aria-label="change repeat count">${t.n}</button> times`; depth++; }
          else if (t.t === 'end') body = '⏹ End repeat';
          else if (t.t === 'melt') body = '✨ Melt';
          else body = `${ARROW[t.dir]} ${t.dir[0].toUpperCase() + t.dir.slice(1)} <button class="n" data-n="${i}" aria-label="change steps">${t.n}</button> ${t.n === 1 ? 'step' : 'steps'}`;
          return `<div class="${cls}" style="${pad}">${body}<button class="x" data-x="${i}" aria-label="remove block">✖</button></div>`;
        }).join('');
        box.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
          if (running) return;
          const t = prog[+b.dataset.n];
          t.n = t.t === 'repeat' ? (t.n >= 9 ? 2 : t.n + 1) : (t.n >= 9 ? 1 : t.n + 1);
          sfx.step(); drawProg();
        });
        box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if (!running) { prog.splice(+b.dataset.x, 1); drawProg(); } });
        if (now != null) { const el = box.children[now]; if (el) box.scrollTop = Math.max(0, el.offsetTop - box.offsetTop - box.clientHeight / 2); }
      }
      updateCounter();
    }

    function getTokens() {
      if (tier.editor === 'text') return parseText(textSrc);
      return prog.map((t, i) => ({ ...t, src: i }));
    }

    function countOf(tokens) { return tier.editor === 'arrows' ? tokens.length : statementCount(tokens); }

    function updateCounter() {
      const c = $('#counter'); if (!c) return;
      let n = '?';
      try { n = countOf(getTokens()); } catch (e) { /* show ? while typing */ }
      c.textContent = tier.simple ? `Taps: ${n}   •   ⭐⭐⭐ = ${m.par} taps` : `${tier.editor === 'text' ? 'Commands' : 'Blocks'} used: ${n}   •   ⭐⭐⭐ target: ${m.par}`;
    }

    function msg(type, html) { $('#out').innerHTML = `<div class="msg ${type}" role="status">${html}</div>`; }

    function setRunning(on) {
      running = on;
      $('#runBtn').textContent = on ? '⏹ Stop' : '▶ Go!';
      $('#runBtn').classList.toggle('red', on); $('#runBtn').classList.toggle('green', !on);
      panel.querySelectorAll('[data-add], #undoBtn, #clearBtn').forEach(b => b.disabled = on);
      if ($('#code')) $('#code').readOnly = on;
    }

    function stop() { timers.forEach(clearTimeout); timers = []; setRunning(false); spark.classList.remove('walk'); spark.classList.add('idle'); drawProg(); drawGutter(); msg('info', tier.simple ? 'Stopped. Try again!' : 'Stopped. Change your program and try again!'); }

    function highlight(src) { if (tier.editor === 'text') drawGutter(src); else drawProg(src); }

    function failed(html) {
      fails++; sfx.bad();
      if (fails >= 2) $('#hintBtn').classList.remove('hidden');
      msg('warn', html + (fails >= 2 ? (tier.simple ? '<br>Need help? Tap <b>💡 Hint</b>. Or ask a grown-up! 👨‍👩‍👧' : '<br>Stuck? Press <b>💡 Hint</b>.') : ''));
      if (tier.simple) speak(html.replace(/<[^>]+>/g, ''));
    }

    function run() {
      resetBoard();
      let tokens, actions;
      try {
        tokens = getTokens();
        if (!tokens.length) { msg('info', tier.simple ? 'Tap some arrows first! 👆' : tier.editor === 'text' ? 'Write some commands first, like <code>right 2</code>.' : 'Add some blocks first!'); return; }
        if (!canMelt && tokens.some(t => t.t === 'melt')) throw new CodeError('Spark doesn\'t have melt power in this mission.', tokens.find(t => t.t === 'melt').src);
        actions = compile(tokens);
      } catch (e) {
        if (!(e instanceof CodeError)) throw e;
        sfx.bad();
        if (tier.editor === 'text') { drawGutter(null, e.line); msg('err', `🐞 Bug on line ${e.line || '?'}: ${esc(e.message)}`); }
        else { drawProg(null, e.line); msg('err', `🐞 ${esc(e.message.replace(/repeat/gi, 'Repeat').replace(/\}/g, 'End'))}`); }
        return;
      }
      const count = countOf(tokens);
      const sim = simulate(lv, actions);
      setRunning(true); msg('info', tier.simple ? 'Go, Spark, go! 🏃' : 'Running… 🏃');
      spark.classList.remove('idle'); spark.classList.add('walk');
      let got = 0;
      sim.ev.forEach((e, i) => timers.push(setTimeout(() => {
        if (e.a) highlight(e.a.src);
        if (e.t === 'step') {
          cells[key(+spark.dataset.x, +spark.dataset.y)].classList.add('trail');
          spark.dataset.face = e.a.dir === 'left' ? 'l' : e.a.dir === 'right' ? 'r' : spark.dataset.face || 'r';
          placeSpark(e.x, e.y); sfx.step();
          if (e.collected) {
            const cell = cells[key(e.x, e.y)], cs = board.clientWidth / lv.w;
            cell.classList.add('got'); $('#gotN').textContent = ++got; sfx.collect();
            burst(board, (e.x + 0.5) * cs, (e.y + 0.5) * cs, ['✨', '⭐', '🎉'], 9, cs * 1.1);
            floatText(board, (e.x + 0.5) * cs, e.y * cs, tier.simple ? 'Yay! 🎁' : '+1 🎁');
            const pill = $('#gotN').parentElement; pill.classList.remove('boing'); pill.offsetWidth; pill.classList.add('boing');
          }
        } else if (e.t === 'melt') {
          const cs = board.clientWidth / lv.w;
          e.cells.forEach(k => { cells[k].classList.add('melted'); const [cx, cy] = k.split(',').map(Number); burst(board, (cx + 0.5) * cs, (cy + 0.5) * cs, ['💧', '✨', '💦'], 8, cs); });
          sfx.melt(); spark.classList.remove('zap'); spark.offsetWidth; spark.classList.add('zap');
          if (!e.cells.length) msg('info', tier.simple ? '✨ Melt! But no ice is here.' : '✨ Melt! …but there was no ice next to Spark.');
        } else if (e.t === 'bonk') {
          spark.classList.remove('bonk'); spark.offsetWidth; spark.classList.add('bonk'); sfx.bonk();
          const cs = board.clientWidth / lv.w, [ddx, ddy] = DIRV[e.dir];
          burst(board, (e.x + 0.5 + ddx * 0.5) * cs, (e.y + 0.5 + ddy * 0.5) * cs, ['💫', '⭐'], 6, cs * 0.6);
          board.classList.remove('shake'); board.offsetWidth; board.classList.add('shake');
        }
      }, i * tier.speed)));
      timers.push(setTimeout(() => finish(sim, count), sim.ev.length * tier.speed + 250));
    }

    function finish(sim, count) {
      setRunning(false);
      highlight(null);
      spark.classList.remove('walk'); spark.classList.add('idle');
      if (sim.result === 'win') { msg('ok', tier.simple ? '🎉 Hooray! You did it!' : '🎉 Spark made it to the sleigh with every present!'); return win(count); }
      if (sim.result === 'bonk') failed(tier.simple ? BONK_SIMPLE[sim.why] : BONK[sim.why] + ' Fix your program and try again!');
      else if (tier.simple) failed(sim.result === 'missing' ? `Get all the gifts first! 🎁 ${sim.left} more to go.` : 'You got all the gifts! 🎉 Now go to the sleigh 🛷.');
      else if (sim.result === 'missing') failed(`Spark still needs to collect <b>${sim.left}</b> more ${sim.left === 1 ? 'present' : 'presents'} 🎁 before going to the sleigh.`);
      else failed('All the presents are collected! 🎉 Now finish on Santa\'s sleigh 🛷.');
    }

    function win(count) {
      const stars = starsFor(count, m.par);
      saveStars(tierId, mi, stars);
      spark.classList.add('happy'); sfx.win(); confetti();
      const last = mi === tier.missions.length - 1;
      const tip = tier.simple ? (stars < 3 ? `You did it! 🎉<br>Can you do it in <b>${m.par}</b> taps? Try again for ⭐⭐⭐!` : 'Wow! The best way! 🌟')
        : stars < 3
        ? `You used ${count} ${unit}. Can you do it in <b>${m.par}</b> for ⭐⭐⭐?${tier.editor !== 'arrows' ? ' (Look for patterns you can repeat!)' : ''}`
        : (tier.editor === 'arrows' ? 'Perfect path — the shortest way!' : 'Super-efficient code — that\'s how real engineers think!');
      const lesson = {
        young: 'You asked nicely. You gave clear steps. That is what coders do! 💙',
        middle: 'You used <b>loops</b> to repeat patterns, and wrote a prompt with <b>who, what and why</b>.',
        teen: 'You engineered a prompt with <b>task, context and limits</b>, and wrote code with <b>loops</b>.',
      }[tierId];
      modal(`
        <div class="winhero"><span class="ray"></span><img src="spark.png" alt="" class="dance"></div>
        <h2 class="rainbow">${last ? '🎄 Christmas is saved! 🎄' : tier.simple ? 'You did it!' : 'Mission complete!'}</h2>
        <div class="stars">${[0, 1, 2].map(i => `<span class="${i < stars ? '' : 'dim'}" style="animation-delay:${i * .25}s">⭐</span>`).join('')}</div>
        <p class="${tier.simple ? 'simple' : ''}">${tip}</p>
        <p class="${tier.simple ? 'simple' : ''}">${lesson}</p>
        ${last && tier.simple ? '<p class="simple">You did ALL of them! 🏆</p>' : ''}${last && !tier.simple ? `<p>You finished every <b>${tier.name}</b> mission! ${tierId !== 'teen' ? 'Ready for a bigger challenge? Try the next age group!' : 'You\'re a true North Star Engineer! ⭐'}</p>` : ''}
        <div class="row" style="justify-content:center">
          <button class="btn green pulse" id="mNext">${last ? (tier.simple ? '🛷 See the ending!' : '🛷 Watch the finale!') : tier.simple ? 'Next ➡️' : 'Next mission ➡'}</button>
          <button class="btn ghost" id="mRetry">🔁 ${tier.simple ? 'Again' : 'Try again'}</button>
        </div>`, card => {
        $('#mNext', card).onclick = () => last ? go(() => openFinale(tierId)) : go(() => playMission(tierId, mi + 1));
        if (tier.simple) speak(last ? 'You did all of them! Hooray!' : 'You did it! Hooray!');
        const st = card.querySelectorAll('.stars span:not(.dim)');
        st.forEach((el, i) => setTimeout(() => { burstAt(el, ['✨', '⭐'], 8, 50); tone(880 + i * 220, 0.15, 'sine', 0.1); }, 350 + i * 260));
        $('#mRetry', card).onclick = () => { closeModal(); resetBoard(); $('#out').innerHTML = ''; };
      });
    }
  }

  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });
  titleScreen();
})();
