/* Spark's Snowy Code Quest — UI, editors, animation, sound. Depends on logic.js */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const screen = $('#screen');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ARROW = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
  const TILE = { P: '🎁', T: '🎄', M: '⛄', I: '🧊', G: '🛷' };
  const t = (k, p) => I18N.t(k, p);
  /* "simple" text variant for ages 4–8 lives under key + '.s' */
  const ts = (simple, k, p) => t(simple ? k + '.s' : k, p);
  const tierName = id => t(`tier.${id}.name`), tierBlurb = id => t(`tier.${id}.blurb`);
  const errText = e => (e.key ? t(e.key, e.params) : e.message);

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
    rustle: () => [1400, 1150, 1600, 1250].forEach((f, i) => tone(f, 0.05, 'triangle', 0.035, 0.12 + i * 0.07)),
    splat: () => { tone(520, 0.12, 'sine', 0.05, 0.1); tone(170, 0.18, 'triangle', 0.12, 0.42); tone(120, 0.2, 'sine', 0.08, 0.44); },
    melt: () => { tone(700, 0.3, 'sawtooth', 0.04); tone(350, 0.35, 'sine', 0.08, 0.05); },
    good: () => { tone(660, 0.12); tone(880, 0.18, 'sine', 0.12, 0.1); },
    bad: () => tone(260, 0.2, 'triangle', 0.1),
    win: () => [659, 659, 659, 659, 659, 659, 659, 784, 523, 587, 659].forEach((f, i) =>
      tone(f, i === 2 || i === 5 ? 0.35 : 0.16, 'triangle', 0.1, [0, .18, .36, .72, .9, 1.08, 1.44, 1.62, 1.8, 1.98, 2.16][i])),
  };
  $('#musicBtn').onclick = () => window.SparkMusic && SparkMusic.toggle();
  const drawSoundBtn = () => { $('#soundBtn').textContent = soundOn ? t('btn.sound') : t('btn.muted'); };
  $('#soundBtn').onclick = () => { soundOn = !soundOn; drawSoundBtn(); };

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
  /* Soft, female voices for the other languages, best-first (macOS/iOS, Edge neural, Chrome/Google, Windows, Android). */
  const VOICE_PREFS_BY_LANG = {
    zh: [/Microsoft (Xiaoxiao|Xiaoyi|Xiaohan|Xiaomo).*Online/i, /^Google (普通话|Mandarin)/i, /^(Tingting|Ting-Ting|Lili|Yu-shu|Meijia|Mei-Jia)\b/i, /^(Flo|Shelley|Sandy)/i, /Microsoft (Huihui|Yaoyao)/i, /female|女/i],
    hi: [/Microsoft (Swara).*Online/i, /^Google हिन्दी/i, /^Google Hindi/i, /^(Lekha|Kiyara|Soumya)\b/i, /Microsoft (Kalpana)/i, /female/i],
    es: [/Microsoft (Elvira|Dalia|Paloma|Elena|Salome|Ximena).*Online/i, /^Google español/i, /^(Mónica|Monica|Paulina|Marisol|Angelica|Soledad)\b/i, /^(Flo|Shelley|Sandy)/i, /Microsoft (Helena|Laura|Sabina)/i, /female|mujer/i],
    fr: [/Microsoft (Denise|Eloise|Vivienne|Sylvie|Ariane).*Online/i, /^Google français/i, /^(Amélie|Amelie|Audrey|Aurélie|Marie)\b/i, /^(Flo|Shelley|Sandy)/i, /Microsoft (Hortense|Julie|Caroline)/i, /female|femme/i],
    ar: [/Microsoft (Zariyah|Salma|Fatima|Amany|Laila|Sana|Mouna).*Online/i, /^Google العربية/i, /^(Mariam|Laila|Amira|Tarik)\b/i, /Microsoft (Hoda|Naayf)/i, /female/i],
  };
  const AVOID_BY_LANG = {
    zh: /^(Sinji|Li-mu|Kangkang|Yunxi|Yunjian|Yunyang)\b|Microsoft (Kangkang|Yunxi|Yunjian|Yunyang)/i,
    hi: /^(Rishi|Aman)\b|Microsoft (Hemant|Madhur)/i,
    es: /^(Jorge|Diego|Juan|Eddy|Reed|Rocko|Grandpa|Grandma)\b|Microsoft (Pablo|Raul|Alvaro|Jorge)/i,
    fr: /^(Thomas|Jacques|Eddy|Reed|Rocko|Grandpa|Grandma|Nicolas)\b|Microsoft (Paul|Henri|Claude)/i,
    ar: /^(Majed|Maged|Tarik)\b|Microsoft (Naayf|Hamed|Shakir)/i,
  };
  let voice = null;
  function pickVoice() {
    voice = null;
    if (!('speechSynthesis' in window)) return;
    const L = I18N.lang, re0 = new RegExp('^' + L + '([-_]|$)', 'i');
    const avoid = L === 'en' ? AVOID : (AVOID_BY_LANG[L] || /^$/);
    const loc = String(I18N.locale || '').toLowerCase(), norm = l => String(l).toLowerCase().replace('_', '-');
    const all = speechSynthesis.getVoices().filter(v => re0.test(v.lang) && !avoid.test(v.name))
      .sort((a, b) => (norm(b.lang) === loc) - (norm(a.lang) === loc));   // exact region first (e.g. zh-CN before zh-TW)
    const prefs = L === 'en' ? VOICE_PREFS : VOICE_PREFS_BY_LANG[L] || [];
    const GOOD = /enhanced|premium|neural|natural|online/i;   // high-quality voices sound far more human
    // 1st pass: a high-quality version of a voice we like; 2nd pass: any voice we like
    for (const needGood of [true, false]) for (const re of prefs) {
      const hits = all.filter(v => re.test(v.name) && (!needGood || GOOD.test(v.name)));
      if (hits.length) { voice = hits.find(v => GOOD.test(v.name)) || hits[0]; return; }
    }
    voice = all[0] || null;   // a voice in the right language, even if we couldn't confirm it's female
    // last resort: any voice in this language (even one we'd normally skip) beats reading it in the wrong accent
    if (!voice) voice = speechSynthesis.getVoices().find(v => re0.test(v.lang)) || null;
  }
  let noVoiceShown = '';
  function noVoiceNotice() {
    if (noVoiceShown === I18N.lang) return; noVoiceShown = I18N.lang;
    const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = '🔈 ' + t('voice.none');
    document.body.appendChild(d); setTimeout(() => d.remove(), 5000);
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); }

  /* Speak like a friendly person, not a robot: one sentence at a time (natural pauses), with the tone matching the moment.
     mood: 'happy' (bright, bouncy) · 'gentle' (soft, for "try again") · 'story' (calm storyteller). Guessed if not given. */
  const MOODS = {
    happy:  { rate: 1.0,  pitch: 1.18 },
    gentle: { rate: 0.86, pitch: 1.02 },
    story:  { rate: 0.92, pitch: 1.08 },
  };
  function speak(text, mood) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const clean = String(text).replace(/<[^>]+>/g, ' ')
      .replace(/\s*[—–:;]\s*/g, ', ')                       // dashes and colons become a short breath
      .replace(/…/g, '... ')
      .replace(/[^\p{L}\p{M}\p{N}\s.,!?'’\-。，！？、؟،।]/gu, '')
      .replace(/\s+/g, ' ').replace(/\s+([.,!?。，！？؟،।])/g, '$1').trim();
    if (!clean) return;
    if (!voice) pickVoice();
    if (!voice && I18N.lang !== 'en' && speechSynthesis.getVoices().length) { noVoiceNotice(); return; }   // no voice for this language here
    if (!mood) mood = /^(yay|yes|great|well done|hooray|you did it|amazing|brilliant|super|perfect|wow)/i.test(clean) ? 'happy' : 'story';
    const base = MOODS[mood] || MOODS.story;
    // split into sentences, keeping the end mark so each one gets its own tune
    const parts = clean.match(/[^.!?。！？؟।]+[.!?。！？؟।]*/g) || [clean];
    const M = window.SparkMusic;
    parts.map(p => p.trim()).filter(p => /[\p{L}\p{N}]/u.test(p)).forEach((p, i, all) => {
      const u = new SpeechSynthesisUtterance(p);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = I18N.locale;
      const excited = /[!！]$/.test(p), question = /[?？؟]$/.test(p);
      const wobble = ((i * 37) % 7 - 3) * 0.012;              // tiny variation so sentences don't all sound the same
      u.pitch = Math.min(1.32, base.pitch + wobble + (excited ? 0.08 : 0) + (question ? 0.05 : 0));
      u.rate = base.rate + (excited ? 0.04 : 0) + (i === all.length - 1 && !excited ? -0.03 : 0);   // slow a touch at the end, like a person
      u.volume = 0.95;
      if (i === 0) u.onstart = () => M && M.duck(true);
      if (i === all.length - 1) u.onend = u.onerror = () => M && M.duck(false);
      speechSynthesis.speak(u);
    });
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
  let go = function (fn) { if (cleanup) { cleanup(); cleanup = null; } closeModal(); if ('speechSynthesis' in window) speechSynthesis.cancel(); fn(); scrollTo(0, 0); };
  $('#homeBtn').onclick = () => go(titleScreen);

  function titleScreen() {
    const t_ = t;
    $('#homeBtn').classList.add('hidden');
    const tiers = Object.values(TIERS);
    screen.innerHTML = `
      <section class="title">
        <div class="hero">
          <img src="spark.png" alt="${esc(t('alt.spark'))}" id="heroSpark">
        </div>
        <h2>${t('app.title')}</h2>
        <p>${t('home.intro')}</p>
        <p>${t('home.steps')}</p>
      </section>
      <div class="lights" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="animation-delay:${(i % 6) * 0.25}s"></i>`).join('')}</div>
      <div class="tiers">
        ${tiers.map(tt => {
          const total = tt.missions.reduce((a, _, i) => a + starsOf(tt.id, i), 0);
          return `<button class="tier" data-tier="${tt.id}">
            <div class="big wiggle">${tt.emoji}</div>
            <span class="ages">${t_('tier.ages', { ages: tt.ages })}</span>
            <h3>${tierName(tt.id)}</h3>
            <p>${tierBlurb(tt.id)}</p>
            ${tt.simple ? `<p class="parent">${t_('home.grownup')}</p>` : ''}
            <div class="stars">⭐ ${total} / ${tt.missions.length * 3}${tierDone(tt.id) ? ' &nbsp;🏆' : ''}</div>
          </button>`;
        }).join('')}
      </div>
      <button class="bonus pop-in" id="cardBtn">
        <span class="bonus-icon wiggle">🎨</span>
        <span><span class="bonus-tag">${t('bonus.tag')}</span><b>${t('bonus.title')}</b>
        <span>${t('bonus.desc')}</span></span>
        <span class="bonus-go">${t('bonus.go')}</span>
      </button>`;
    screen.querySelectorAll('.tier').forEach(b => b.onclick = () => go(() => missionList(b.dataset.tier)));
    $('#cardBtn').onclick = () => go(cardScreen);
    $('#heroSpark').onclick = e => { sfx.collect(); burstAt(e.target, ['✨', '⭐', '🎁', '❄️'], 14, 110); e.target.classList.remove('spin'); e.target.offsetWidth; e.target.classList.add('spin'); };
  }

  function tierStars(tierId) { return TIERS[tierId].missions.reduce((a, _, i) => a + starsOf(tierId, i), 0); }
  const finaleHooks = () => ({
    home: () => go(titleScreen), card: () => go(cardScreen), sfx: k => sfx[k] && sfx[k](), tone, speak, confetti, t,
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
      <h2 style="margin:0 0 10px">${t('cardpick.title')}</h2>
      <div class="row" style="justify-content:center">
        <button class="btn" data-age="simple">❄️ ${t('tier.ages', { ages: '4–8' })}</button>
        <button class="btn" data-age="full">🦌 ${t('tier.ages', { ages: '9–12' })}</button>
        <button class="btn" data-age="full">⭐ ${t('tier.ages', { ages: '13–16' })}</button>
      </div>
      <p class="parent" style="margin-top:14px">${t('home.grownup')}</p></div>`;
    screen.querySelectorAll('[data-age]').forEach(b => b.onclick = () => CardMaker.open(screen, {
      simple: b.dataset.age === 'simple',
      hooks: { home: () => go(titleScreen), sfx: k => sfx[k] && sfx[k](), speak, confetti, burstAt, t },
    }));
  }

  /* first sentence of a story, in any script (! ? . 。 ！ ？ ।) */
  function firstSentence(s) { const m = String(s).match(/^.*?[!?.。！？।؟](?=\s|$)/u); return m ? m[0] : s; }

  function missionList(tierId) {
    const tier = TIERS[tierId];
    $('#homeBtn').classList.remove('hidden');
    screen.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <h2 style="margin:0">${tier.emoji} ${tierName(tierId)} <span class="ages pill" style="background:var(--sky);font-size:.9rem">${t('tier.ages', { ages: tier.ages })}</span></h2>
        ${tier.simple ? `<p class="simple" style="margin:8px 0 0">${t('list.simple')}</p>
        <div class="parentNote"><span class="pn-icon">👨‍👩‍👧</span><div>${t('list.parent')}</div></div>` :
        `<p style="margin:8px 0 0">${t('list.full', { blurb: tierBlurb(tierId), unit: t(tier.editor === 'text' ? 'unit.lines' : 'unit.blocks') })}</p>`}
        ${tierDone(tierId) ? `<div class="donebar"><span>🏆 <b>${ts(tier.simple, 'list.done')}</b></span>
          <button class="btn green" id="lCert">${ts(tier.simple, 'list.cert')}</button>
          <button class="btn ghost" id="lFinale">${ts(tier.simple, 'list.finale')}</button></div>` : ''}
      </div>
      <div class="missions">
        ${tier.missions.map((m, i) => {
          const open = unlocked(tierId, i);
          return `<button class="mission pop-in ${open ? '' : 'locked'}" style="animation-delay:${i * 0.08}s" data-i="${i}" ${open ? '' : 'aria-disabled="true"'}>
            <div class="num">${open ? i + 1 : '🔒'}</div>
            <div><h3>${esc(m.title)}</h3><div>${open ? esc(firstSentence(m.story)) : ts(tier.simple, 'list.locked')}</div></div>
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
    const unit = t(tier.editor === 'text' ? 'unit.commands' : 'unit.blocks');
    let fails = 0, running = false, timers = [], resetT = [];
    $('#homeBtn').classList.remove('hidden');

    screen.innerHTML = `
      <div class="hud">
        <button class="pill" id="backBtn">${ts(tier.simple, 'hud.back')}</button>
        <span class="pill">${tier.emoji} ${tierName(tierId)}</span>
        <span class="pill">${t('hud.mission', { n: mi + 1, title: esc(m.title) })}</span>
        <span class="pill">🎁 <span id="gotN">0</span> / ${lv.presents.length}</span>
        <span class="pill">${ts(tier.simple, 'hud.par', { par: m.par, unit })}</span>
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
    board.style.gridTemplateColumns = `repeat(${lv.w}, minmax(0, 1fr))`;
    board.style.gridTemplateRows = `repeat(${lv.h}, minmax(0, 1fr))`;   // equal rows: emoji can't stretch a row any more
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
    board.dir = 'ltr';   // the map is a grid with real left/right — keep it the same in right-to-left languages
    board.appendChild(spark);
    let veil = null;
    if (kind === 'fog' || kind === 'dark') {
      veil = document.createElement('div');
      veil.className = 'veil ' + kind;
      veil.innerHTML = kind === 'fog'
        ? `<div><span class="big drift">🌨️</span>${ts(tier.simple, 'veil.fog')}</div>`
        : `<div><span class="big drift">🌑</span>${ts(tier.simple, 'veil.dark')}</div>`;
      board.appendChild(veil);
    }
    const cellW = () => board.clientWidth / lv.w, cellH = () => board.clientHeight / lv.h;
    function layout() {
      const cs = Math.min(cellW(), cellH());
      board.style.fontSize = (cs * 0.6).toFixed(2) + 'px';   // cells inherit this (set directly: more reliable than a CSS variable)
      spark.style.width = cellW() + 'px'; spark.style.height = cellH() + 'px';
    }
    function placeSpark(x, y, instant) {
      if (instant) spark.style.transition = 'none';
      spark.style.left = x * cellW() + 'px'; spark.style.top = y * cellH() + 'px';
      if (instant) { spark.offsetWidth; spark.style.transition = ''; }
      spark.dataset.x = x; spark.dataset.y = y;
    }
    const onResize = () => { layout(); placeSpark(+spark.dataset.x, +spark.dataset.y, true); };
    addEventListener('resize', onResize);
    cleanup = () => { removeEventListener('resize', onResize); timers.forEach(clearTimeout); resetT.forEach(clearTimeout); };
    layout(); placeSpark(lv.start.x, lv.start.y, true);

    /* After a failed run, count down on the board and put Spark back at the start by itself.
       The program is kept, so the player only has to fix it and press Go again. */
    const RESET_SECS = 3;
    function cancelReset() {
      resetT.forEach(clearTimeout); resetT = [];
      board.querySelectorAll('.resetnote').forEach(n => n.remove());
    }
    function boardNote(text, cls = '') {
      const n = document.createElement('div');
      n.className = 'resetnote ' + cls; n.dir = I18N.dir; n.setAttribute('role', 'status'); n.textContent = text;
      board.appendChild(n); return n;
    }
    function scheduleReset() {
      cancelReset();
      const note = boardNote('');
      let n = RESET_SECS;
      const tick = () => {
        if (n > 0) { note.textContent = '🔄 ' + ts(tier.simple, 'reset.msg', { n }); n--; resetT.push(setTimeout(tick, 1000)); return; }
        resetBoard();                                   // also clears the countdown note
        boardNote('✅ ' + ts(tier.simple, 'reset.done'), 'done');
        resetT.push(setTimeout(cancelReset, 2200));
      };
      tick();
    }

    /* Fun reaction when Spark bumps a tree (leaves fall) or a snowman (it throws a snowball back). */
    function hitFx(kind, ox, oy, sx, sy) {
      const ob = cells[key(ox, oy)] && cells[key(ox, oy)].querySelector('.ob');
      if (ob) { ob.classList.remove('rustle', 'wobble'); ob.offsetWidth; ob.classList.add(kind === 'tree' ? 'rustle' : 'wobble'); setTimeout(() => ob.classList.remove('rustle', 'wobble'), 700); }
      if (kind === 'tree') sfx.rustle(); else sfx.splat();
      if (calm()) return;
      const cw = cellW(), ch = cellH();
      const add = (cls, text, x, y, vars, life) => {
        const el = document.createElement('span');
        el.className = 'hitfx ' + cls; el.textContent = text;
        el.style.left = x + 'px'; el.style.top = y + 'px';
        for (const v in vars) el.style.setProperty(v, vars[v]);
        board.appendChild(el); setTimeout(() => el.remove(), life);
      };
      if (kind === 'tree') {
        ['🍃', '🍂', '🍃', '❄️', '🍂', '🍃'].forEach((leaf, i) => add('leaf', leaf,
          (ox + 0.2 + Math.random() * 0.6) * cw, (oy + 0.15 + Math.random() * 0.3) * ch,
          { '--fall': ch * (0.9 + Math.random() * 0.5) + 'px', '--sway': cw * (0.15 + Math.random() * 0.15) * (i % 2 ? 1 : -1) + 'px', animationDelay: i * 0.12 + 's' }, 2200));
      } else {
        add('snowball', '', (ox + 0.5) * cw, (oy + 0.3) * ch, { '--dx': (sx - ox) * cw + 'px', '--dy': ((sy - oy) + 0.2) * ch + 'px', '--arc': ch * 0.6 + 'px' }, 900);
        setTimeout(() => {
          burst(board, (sx + 0.5) * cw, (sy + 0.5) * ch, ['❄️', '⚪', '❄️'], 8, cw * 0.55);
          add('splat', '', (sx + 0.5) * cw, (sy + 0.45) * ch, { '--s': cw * 0.7 + 'px' }, 900);
        }, 450);
      }
    }

    function resetBoard() {
      cancelReset();
      board.querySelectorAll('.hitfx').forEach(el => el.remove());
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
          <div><span class="bigemoji twinkle">🎁</span>${t('story.gifts.s')}</div>
          <div class="arrowgo">➜</div>
          <div><span class="bigemoji sleighbob">🛷</span>${t('story.sleigh.s')}</div>
        </div>
        <p class="simple">${t('story.avoid.s')}</p>
        <p class="parent">${t('story.read.s')}</p>` :
      `<p class="story">${t('story.goal')}</p>`}
      <div class="row">
        <button class="btn" id="startBtn">${t('btn.go')}</button>
        ${tierId === 'young' ? `<button class="btn ghost" id="readBtn">${t('btn.read')}</button>` : ''}
      </div>`;
    $('#startBtn').onclick = promptStep;
    if ($('#readBtn')) $('#readBtn').onclick = () => speak(m.story + ' ' + t('speak.story'));

    /* ---------- step 2: prompt Frosty ---------- */
    function promptStep() {
      const intro = tier.simple
        ? `<h2>${t('p.h.s')}</h2>
           ${frostySays(`<span class="simple">${t('p.hi.s')}<br>${esc(m.prompt.question)}</span>`)}`
        : `<h2>${t('p.h')}</h2>
           ${frostySays(`${t('p.hi')} ${esc(m.prompt.question)}`)}`;
      if (tierId === 'young') youngPrompt(intro);
      else if (tierId === 'middle') middlePrompt(intro);
      else teenPrompt(intro);
    }

    function youngPrompt(intro) {
      const opts = shuffle(m.prompt.options);
      panel.innerHTML = intro + `
        <p class="simple">${t('p.tap.s')}</p>
        <div class="options">${opts.map((o, i) => `<button class="opt simple pop-in" style="animation-delay:${i * 0.12}s" data-i="${i}"><span class="e">${o.emoji}</span>${esc(o.text)}</button>`).join('')}</div>
        <div id="fb"></div>
        <div class="row"><button class="btn ghost" id="readBtn">${t('btn.read')}</button></div>`;
      $('#readBtn').onclick = () => speak(m.prompt.question + ' ' + opts.map((o, i) => t('speak.number', { n: i + 1, text: o.text })).join(' '));
      panel.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const o = opts[+b.dataset.i];
        if (o.good) { sfx.good(); burstAt(b, ['⭐', '✨', '💙'], 14, 90); speak(o.feedback, 'happy'); promptSuccess(esc(o.feedback)); }
        else { sfx.bad(); b.classList.add('wrong', 'shake'); $('#fb').innerHTML = frostySays(`<span class="simple">${esc(o.feedback)}</span>`, 'bad'); speak(o.feedback, 'gentle'); }
      });
    }

    function middlePrompt(intro) {
      const rows = m.prompt.rows.map(r => ({ ...r, chips: shuffle(r.chips) }));
      const pick = rows.map(() => null);
      panel.innerHTML = intro + `
        <p>${t('p.build')}</p>
        <div class="builder">${rows.map((r, ri) => `
          <div class="label">${ri + 1}. ${esc(r.label)}</div>
          <div class="chips">${r.chips.map((c, ci) => `<button class="chip" data-r="${ri}" data-c="${ci}">${esc(c.text)}</button>`).join('')}</div>`).join('')}
        </div>
        <div class="assembled" id="asm">${t('p.asm')}</div>
        <div class="row"><button class="btn" id="sendBtn" disabled>${t('p.send')}</button></div>
        <div id="fb"></div>`;
      const render = () => {
        panel.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', pick[+b.dataset.r] === +b.dataset.c));
        const parts = pick.map((c, ri) => c == null ? '…' : rows[ri].chips[c].text);
        $('#asm').textContent = pick.some(c => c != null) ? t('p.q1') + parts.join(t('p.joiner')) + t('p.q2') : t('p.asm');
        $('#sendBtn').disabled = pick.some(c => c == null);
      };
      panel.querySelectorAll('.chip').forEach(b => b.onclick = () => { pick[+b.dataset.r] = +b.dataset.c; render(); $('#fb').innerHTML = ''; });
      $('#sendBtn').onclick = () => {
        const bad = pick.map((c, ri) => rows[ri].chips[c]).filter(c => !c.good);
        if (!bad.length) { sfx.good(); promptSuccess(t('p.great')); }
        else {
          sfx.bad();
          $('#fb').innerHTML = frostySays(`${t('p.unsure')} ${bad.length > 1 ? t('p.pieces', { n: bad.length }) : ''}<br>💡 ${esc(bad[0].feedback)}`, 'bad');
        }
      };
    }

    function teenPrompt(intro) {
      const tw = m.prompt.taskWords;
      panel.innerHTML = intro + `
        <p>${t('p.write')}</p>
        <textarea id="pText" rows="4" placeholder="${esc(t('p.placeholder'))}" aria-label="${esc(t('p.aria'))}"></textarea>
        <div class="row"><button class="btn" id="sendBtn">${t('p.send')}</button></div>
        <ul class="checklist" id="chk"></ul>
        <div id="fb"></div>`;
      const ta = $('#pText');
      const draw = res => $('#chk').innerHTML = res.checks.map(c =>
        `<li class="${res.tried ? (c.ok ? 'ok' : 'no') : ''}">${res.tried ? (c.ok ? '✅' : '⬜') : c.icon} ${esc(t('chk.' + c.id))}${c.required ? ` <b>${t('p.required')}</b>` : ''}</li>`).join('');
      draw({ ...scorePrompt('', tw, I18N.rubric()), tried: false });
      ta.focus({ preventScroll: true });
      $('#sendBtn').onclick = () => {
        const text = ta.value.trim();
        if (!text) { ta.focus(); return; }
        const res = scorePrompt(text, tw, I18N.rubric());
        draw({ ...res, tried: true });
        if (res.unkind) { sfx.bad(); $('#fb').innerHTML = frostySays(t('p.unkind'), 'bad'); return; }
        if (res.pass) {
          sfx.good();
          promptSuccess(`${t('p.excellent', { score: res.score })}${res.polite ? t('p.polite') : ''}
            <br><br><i>${t('p.yours')}</i> ${t('p.q1')}${esc(text)}${t('p.q2')}`);
        } else {
          sfx.bad();
          const miss = res.checks.filter(c => !c.ok);
          $('#fb').innerHTML = frostySays(!res.checks[0].ok
            ? t('p.notask', { thing: t('thing.' + kind) })
            : t('p.tryadd', { list: miss.map(c => c.icon + ' ' + t('chk.' + c.id + '.short')).join(t('p.sep')) }), 'bad');
        }
      };
    }

    function promptSuccess(feedback) {
      const reward = ts(tier.simple, 'r.' + kind);
      if (veil) {
        veil.classList.add('gone');
        const v = veil; setTimeout(() => v.remove(), 1300);
        const r = board.getBoundingClientRect();
        burstAt(board, kind === 'fog' ? ['🌬️', '❄️', '☁️'] : ['💡', '✨', '🌟'], 18, Math.min(r.width, r.height) * 0.45);
      } else burstAt(board, ['✨', '🔥', '⭐'], 14, 120);
      if (kind === 'dark' && !calm()) board.classList.add('aurora');
      panel.innerHTML = `<h2>${ts(tier.simple, 'p.h')} ✅</h2>
        <div class="pop-in">${frostySays(tier.simple ? `<span class="simple">${feedback}</span>` : feedback, 'good')}</div>
        <div class="pop-in" style="animation-delay:.3s">${frostySays(tier.simple ? `<span class="simple">${reward}</span>` : reward, 'good')}</div>
        <div class="row"><button class="btn green pulse" id="codeBtn">${ts(tier.simple, 'btn.code')}</button></div>`;
      if (tier.simple) speak(reward.replace(/<[^>]+>/g, ''), 'happy');
      $('#codeBtn').focus({ preventScroll: true });
      $('#codeBtn').onclick = codeStep;
    }

    /* ---------- step 3: code ---------- */
    let prog = [];            // arrows/blocks tokens
    let textSrc = tierId === 'teen' ? t('code.comment', { n: mi + 1, title: m.title }) : '';
    const canMelt = kind === 'melt';

    function codeStep() {
      const editorHTML = {
        arrows: `
          <p class="simple">${ts(tier.simple, 'c.arrows')}</p>
          <div class="palette">
            ${Object.keys(ARROW).map(d => `<button class="key" data-add="${d}" aria-label="${esc(t('dir.' + d))}">${ARROW[d]}</button>`).join('')}
            ${canMelt ? `<button class="key melt" data-add="melt">${t('key.melt')}</button>` : ''}
          </div>
          <div class="program" id="prog"></div>`,
        blocks: `
          <p>${t('c.blocks', { number: `<span class="blk" style="display:inline-flex;padding:0 6px">${t('c.number')}</span>` })}</p>
          <div class="palette">
            ${Object.keys(ARROW).map(d => `<button class="key" data-add="${d}" aria-label="${esc(t('dir.' + d))}">${ARROW[d]}</button>`).join('')}
            ${canMelt ? `<button class="key melt" data-add="melt">${t('key.melt')}</button>` : ''}
            <button class="key rep" data-add="repeat">${t('key.repeat')}</button>
            <button class="key end" data-add="end">${t('key.end')}</button>
          </div>
          <div class="program list" id="prog"></div>`,
        text: `
          <div class="codebox" dir="ltr"><div class="gutter" id="gutter">1</div>
            <textarea id="code" dir="ltr" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${esc(t('c.aria'))}"></textarea></div>
          <div class="ref">${t('c.ref')} <bdi dir="ltr"><code>up 2</code> <code>down 1</code> <code>left 3</code> <code>right 4</code>
            ${canMelt ? '<code>melt</code>' : ''} <code>repeat 3 { … }</code> <code># comment</code></bdi><br>
            ${t('c.ref2')}</div>`,
      }[tier.editor];

      panel.innerHTML = `<h2>${ts(tier.simple, 'c.h')}</h2>
        ${editorHTML}
        <div class="counter" id="counter"></div>
        <div class="row">
          <button class="btn green" id="runBtn">${t('btn.run')}</button>
          ${tier.editor !== 'text' ? `<button class="btn ghost" id="undoBtn">${t('btn.undo')}</button>` : ''}
          <button class="btn ghost" id="clearBtn">${t('btn.clear')}</button>
          <button class="btn ghost hidden" id="hintBtn">${t('btn.hint')}</button>
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
          if (prog.length >= 60) { msg('warn', t('c.toomany')); return; }
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
      if (!prog.length) { box.innerHTML = `<div class="empty">${t(tier.simple ? 'c.empty.s' : tier.editor === 'arrows' ? 'c.empty.a' : 'c.empty.b')}</div>`; updateCounter(); return; }
      if (tier.editor === 'arrows') {
        box.innerHTML = prog.map((b, i) => `<div class="tok ${i === now ? 'now' : ''} ${i === prog.length - 1 && now == null ? 'pop-in' : ''}">${b.t === 'melt' ? '✨' : ARROW[b.dir]}</div>`).join('');
      } else {
        let depth = 0;
        box.innerHTML = prog.map((b, i) => {
          if (b.t === 'end') depth = Math.max(0, depth - 1);
          const pad = `margin-inline-start:${depth * 26}px`;
          const cls = `blk ${b.t === 'repeat' ? 'rep' : b.t === 'end' ? 'end' : b.t === 'melt' ? 'melt' : ''} ${i === now ? 'now' : ''} ${i === err ? 'err' : ''}`;
          const nBtn = label => `<button class="n" data-n="${i}" aria-label="${esc(t(label))}">${b.n}</button>`;
          let body;
          if (b.t === 'repeat') { body = t('b.repeat', { n: nBtn('aria.repeatN') }); depth++; }
          else if (b.t === 'end') body = t('b.end');
          else if (b.t === 'melt') body = t('b.melt');
          else body = t(b.n === 1 ? 'b.move1' : 'b.moveN', { arrow: ARROW[b.dir], dir: t('dir.' + b.dir), n: nBtn('aria.stepsN') });
          return `<div class="${cls}" style="${pad}">${body}<button class="x" data-x="${i}" aria-label="${esc(t('aria.remove'))}">✖</button></div>`;
        }).join('');
        box.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
          if (running) return;
          const bk = prog[+b.dataset.n];
          bk.n = bk.t === 'repeat' ? (bk.n >= 9 ? 2 : bk.n + 1) : (bk.n >= 9 ? 1 : bk.n + 1);
          sfx.step(); drawProg();
        });
        box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if (!running) { prog.splice(+b.dataset.x, 1); drawProg(); } });
        if (now != null) { const el = box.children[now]; if (el) box.scrollTop = Math.max(0, el.offsetTop - box.offsetTop - box.clientHeight / 2); }
      }
      updateCounter();
    }

    function getTokens() {
      if (tier.editor === 'text') return parseText(textSrc);
      return prog.map((b, i) => ({ ...b, src: i }));
    }

    function countOf(tokens) { return tier.editor === 'arrows' ? tokens.length : statementCount(tokens); }

    function updateCounter() {
      const c = $('#counter'); if (!c) return;
      let n = '?';
      try { n = countOf(getTokens()); } catch (e) { /* show ? while typing */ }
      c.textContent = t(tier.simple ? 'cnt.s' : tier.editor === 'text' ? 'cnt.commands' : 'cnt.blocks', { n, par: m.par });
    }

    function msg(type, html) { $('#out').innerHTML = `<div class="msg ${type}" role="status">${html}</div>`; }

    function setRunning(on) {
      running = on;
      $('#runBtn').textContent = on ? t('btn.stop') : t('btn.run');
      $('#runBtn').classList.toggle('red', on); $('#runBtn').classList.toggle('green', !on);
      panel.querySelectorAll('[data-add], #undoBtn, #clearBtn').forEach(b => b.disabled = on);
      if ($('#code')) $('#code').readOnly = on;
    }

    function stop() { timers.forEach(clearTimeout); timers = []; setRunning(false); spark.classList.remove('walk'); spark.classList.add('idle'); drawProg(); drawGutter(); msg('info', ts(tier.simple, 'stop')); }

    function highlight(src) { if (tier.editor === 'text') drawGutter(src); else drawProg(src); }

    function failed(html) {
      fails++; sfx.bad();
      if (fails >= 2) $('#hintBtn').classList.remove('hidden');
      msg('warn', html + (fails >= 2 ? ts(tier.simple, 'fail.hint') : ''));
      scheduleReset();
      if (tier.simple) speak(html.replace(/<[^>]+>/g, ''), 'gentle');
    }

    function run() {
      resetBoard();
      let tokens, actions;
      try {
        tokens = getTokens();
        if (!tokens.length) { msg('info', t(tier.simple ? 'run.empty.s' : tier.editor === 'text' ? 'run.empty.t' : 'run.empty.b')); return; }
        if (!canMelt && tokens.some(k => k.t === 'melt')) throw new CodeError('Spark doesn\'t have melt power in this mission.', tokens.find(k => k.t === 'melt').src, 'e.nomelt');
        actions = compile(tokens);
      } catch (e) {
        if (!(e instanceof CodeError)) throw e;
        sfx.bad();
        if (tier.editor === 'text') { drawGutter(null, e.line); msg('err', t('err.line', { line: e.line || '?', msg: esc(errText(e)) })); }
        else { drawProg(null, e.line); msg('err', t('err.plain', { msg: esc(I18N.lang === 'en' ? errText(e).replace(/repeat/gi, 'Repeat').replace(/\}/g, 'End') : errText(e)) })); }
        return;
      }
      const count = countOf(tokens);
      const sim = simulate(lv, actions);
      setRunning(true); msg('info', ts(tier.simple, 'run.go'));
      spark.classList.remove('idle'); spark.classList.add('walk');
      let got = 0;
      sim.ev.forEach((e, i) => timers.push(setTimeout(() => {
        if (e.a) highlight(e.a.src);
        if (e.t === 'step') {
          cells[key(+spark.dataset.x, +spark.dataset.y)].classList.add('trail');
          spark.dataset.face = e.a.dir === 'left' ? 'l' : e.a.dir === 'right' ? 'r' : spark.dataset.face || 'r';
          placeSpark(e.x, e.y); sfx.step();
          if (e.collected) {
            const cell = cells[key(e.x, e.y)], cs = cellW();
            cell.classList.add('got'); $('#gotN').textContent = ++got; sfx.collect();
            burst(board, (e.x + 0.5) * cs, (e.y + 0.5) * cs, ['✨', '⭐', '🎉'], 9, cs * 1.1);
            floatText(board, (e.x + 0.5) * cs, e.y * cs, ts(tier.simple, 'yay'));
            const pill = $('#gotN').parentElement; pill.classList.remove('boing'); pill.offsetWidth; pill.classList.add('boing');
          }
        } else if (e.t === 'melt') {
          const cs = board.clientWidth / lv.w;
          e.cells.forEach(k => { cells[k].classList.add('melted'); const [cx, cy] = k.split(',').map(Number); burst(board, (cx + 0.5) * cs, (cy + 0.5) * cs, ['💧', '✨', '💦'], 8, cs); });
          sfx.melt(); spark.classList.remove('zap'); spark.offsetWidth; spark.classList.add('zap');
          if (!e.cells.length) msg('info', ts(tier.simple, 'melt.none'));
        } else if (e.t === 'bonk') {
          spark.classList.remove('bonk'); spark.offsetWidth; spark.classList.add('bonk'); sfx.bonk();
          const cs = board.clientWidth / lv.w, [ddx, ddy] = DIRV[e.dir];
          if (e.why === 'tree' || e.why === 'snowman') hitFx(e.why, e.x + ddx, e.y + ddy, e.x, e.y);
          else burst(board, (e.x + 0.5 + ddx * 0.5) * cs, (e.y + 0.5 + ddy * 0.5) * cs, ['💫', '⭐'], 6, cs * 0.6);
          board.classList.remove('shake'); board.offsetWidth; board.classList.add('shake');
        }
      }, i * tier.speed)));
      timers.push(setTimeout(() => finish(sim, count), sim.ev.length * tier.speed + 250));
    }

    function finish(sim, count) {
      setRunning(false);
      highlight(null);
      spark.classList.remove('walk'); spark.classList.add('idle');
      if (sim.result === 'win') { msg('ok', ts(tier.simple, 'win.msg')); return win(count); }
      if (sim.result === 'bonk') failed(tier.simple ? t('bonk.' + sim.why + '.s') : t('bonk.' + sim.why) + t('fail.fix'));
      else if (tier.simple) failed(sim.result === 'missing' ? t('miss.s', { n: sim.left }) : t('notgoal.s'));
      else if (sim.result === 'missing') failed(t(sim.left === 1 ? 'miss.one' : 'miss.many', { n: sim.left }));
      else failed(t('notgoal'));
    }

    function win(count) {
      const stars = starsFor(count, m.par);
      saveStars(tierId, mi, stars);
      spark.classList.add('happy'); sfx.win(); confetti();
      const last = mi === tier.missions.length - 1;
      const tip = tier.simple ? (stars < 3 ? t('w.retry.s', { par: m.par }) : t('w.best.s'))
        : stars < 3
        ? t('w.retry', { count, unit, par: m.par }) + (tier.editor !== 'arrows' ? t('w.pattern') : '')
        : t(tier.editor === 'arrows' ? 'w.best.arrows' : 'w.best.code');
      const lesson = t('w.lesson.' + tierId);
      modal(`
        <div class="winhero"><span class="ray"></span><img src="spark.png" alt="" class="dance"></div>
        <h2 class="rainbow">${last ? t('w.saved') : ts(tier.simple, 'w.complete')}</h2>
        <div class="stars">${[0, 1, 2].map(i => `<span class="${i < stars ? '' : 'dim'}" style="animation-delay:${i * .25}s">⭐</span>`).join('')}</div>
        <p class="${tier.simple ? 'simple' : ''}">${tip}</p>
        <p class="${tier.simple ? 'simple' : ''}">${lesson}</p>
        ${last && tier.simple ? `<p class="simple">${t('w.all.s')}</p>` : ''}${last && !tier.simple ? `<p>${t('w.all', { tier: tierName(tierId) })} ${t(tierId !== 'teen' ? 'w.nexttier' : 'w.true')}</p>` : ''}
        <div class="row" style="justify-content:center">
          <button class="btn green pulse" id="mNext">${ts(tier.simple, last ? 'w.finale' : 'w.next')}</button>
          <button class="btn ghost" id="mRetry">${ts(tier.simple, 'w.again')}</button>
        </div>`, card => {
        $('#mNext', card).onclick = () => last ? go(() => openFinale(tierId)) : go(() => playMission(tierId, mi + 1));
        if (tier.simple) speak(t(last ? 'speak.alldone' : 'speak.done'), 'happy');
        const st = card.querySelectorAll('.stars span:not(.dim)');
        st.forEach((el, i) => setTimeout(() => { burstAt(el, ['✨', '⭐'], 8, 50); tone(880 + i * 220, 0.15, 'sine', 0.1); }, 350 + i * 260));
        $('#mRetry', card).onclick = () => { closeModal(); resetBoard(); $('#out').innerHTML = ''; };
      });
    }
  }

  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });

  /* ---------------- language ---------------- */
  let current = titleScreen;               // last screen shown, so changing language can redraw it
  const _go = go;
  go = fn => { current = fn; _go(fn); };
  function applyChrome() {
    document.title = t('app.title');
    $('.topbar h1').textContent = t('app.title');
    $('#homeBtn').textContent = t('btn.home');
    $('#musicBtn').title = t('music.title');
    drawSoundBtn();
    if (window.SparkMusic) SparkMusic.relabel();
    const sel = $('#langSel'); if (sel) { sel.value = I18N.lang; sel.setAttribute('aria-label', t('lang.label')); }
  }
  function setLanguage(code) {
    I18N.set(code); I18N.applyMissions(TIERS); pickVoice(); applyChrome();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const fin = document.querySelector('.finale'); if (fin) { fin.remove(); document.body.classList.remove('no-scroll'); }
    closeModal(); cleanup && (cleanup(), cleanup = null);
    current(); scrollTo(0, 0);
  }
  const sel = $('#langSel');
  sel.innerHTML = I18N.langs().map(l => `<option value="${l.code}">${l.name}</option>`).join('');
  sel.onchange = () => setLanguage(sel.value);
  I18N.init(); I18N.applyMissions(TIERS); pickVoice(); applyChrome();
  window.SparkGame = { setLanguage };
  titleScreen();
})();
