/* Spark's Snowy Code Quest — grand finale + certificate.
   Finale: full-screen animated night sky; Spark flies Santa's sleigh (pulled by reindeer) across the moon,
           dropping presents, then the "Quest complete" panel appears.
   Certificate: personalised, downloadable PNG with the Spark/AIKids watermark bottom-right (always on). */
(() => {
  const A = window.CARD_ASSETS || {};
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = {};
  const ready = Promise.all(['logo', 'spark'].map(k => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => res(); i.src = A[k] || ''; img[k] = i; })));

  const T = (k, p) => (window.I18N ? I18N.t(k, p) : k);
  const BADGE = { young: '❄️', middle: '🦌', teen: '⭐' };
  /* rank/skill text is looked up live, so it follows the chosen language */
  const TITLES = {};
  ['young', 'middle', 'teen'].forEach(id => Object.defineProperty(TITLES, id, {
    enumerable: true, get: () => ({ rank: T('rank.' + id), badge: BADGE[id], skill: T('skill.' + id) }),
  }));

  /* ======================= FINALE ======================= */
  function finale(opts) {
    const { tierId, simple, stars, maxStars, hooks = {} } = opts;
    const t = TITLES[tierId];
    const el = document.createElement('div');
    el.className = 'finale'; el.dir = 'ltr';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', T('f.aria'));
    const houses = Array.from({ length: 9 }, (_, i) => `<div class="house" style="left:${3 + i * 11}%;--h:${50 + (i * 37) % 45}px;--w:${70 + (i * 23) % 40}px"><i></i><i></i><b class="${i % 2 ? 'r' : 'g'}"></b></div>`).join('');
    const sky = Array.from({ length: 70 }, (_, i) => `<span class="fstar" style="left:${(i * 37) % 100}%;top:${(i * 53) % 62}%;animation-delay:${(i % 10) * 0.3}s;--s:${1 + (i % 3)}px"></span>`).join('');
    el.innerHTML = `
      <div class="f-sky">${sky}<div class="f-moon"></div><div class="f-aurora"></div></div>
      <div class="f-hills"></div>
      <div class="f-town">${houses}</div>
      <div class="f-ride">
        <div class="f-bob">
          <span class="f-trail"></span>
          <span class="f-deer d1">🦌</span><span class="f-deer d2">🦌</span><span class="f-deer d3">🦌</span>
          <svg class="f-reins" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M0 30 Q 80 5 150 22 T 300 18" /></svg>
          <div class="f-sleigh">
            <div class="f-sack">🎁🎁🎁</div>
            <img src="spark.png" alt="${esc(T('f.alt'))}" class="f-spark">
            <svg class="f-body" viewBox="0 0 220 120" aria-hidden="true">
              <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff4d5e"/><stop offset="1" stop-color="#a51d28"/></linearGradient></defs>
              <path d="M20 20 H170 Q205 20 205 50 Q205 88 160 88 H45 Q20 88 20 60 Z" fill="url(#sg)" stroke="#ffd166" stroke-width="6"/>
              <path d="M20 20 Q2 20 6 40" fill="none" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>
              <path d="M30 100 H190 Q215 100 212 80" fill="none" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/>
              <line x1="60" y1="88" x2="55" y2="100" stroke="#ffd166" stroke-width="6"/><line x1="160" y1="88" x2="165" y2="100" stroke="#ffd166" stroke-width="6"/>
              <circle cx="110" cy="54" r="14" fill="#ffd166"/><path d="M104 54 l5 5 l9 -10" stroke="#a51d28" stroke-width="4" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="f-drops"></div>
      <button class="f-skip" type="button">${T(simple ? 'f.skip.s' : 'f.skip')}</button>
      <div class="f-panel" hidden dir="${window.I18N ? I18N.dir : 'ltr'}">
        <img src="spark.png" alt="" class="f-panel-spark">
        <h2 class="rainbow">${T(simple ? 'f.h.s' : 'f.h')}</h2>
        <p class="f-big">${t.badge} ${T('f.rank', { rank: t.rank })} ${t.badge}</p>
        <p class="${simple ? 'simple' : ''}">${simple ? T('f.body.s') : T('f.body', { stars, max: maxStars })}</p>
        <div class="row" style="justify-content:center">
          <button class="btn green pulse" id="fCert">${T('f.cert')}</button>
          <button class="btn ghost" id="fReplay">${T('f.replay')}</button>
          <button class="btn ghost" id="fHome">${T('f.home')}</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    document.body.classList.add('no-scroll');
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const ride = el.querySelector('.f-ride'), drops = el.querySelector('.f-drops'), panel = el.querySelector('.f-panel');

    function dropGifts() {
      // presents fall from the sleigh onto chimneys as it crosses the sky
      const gifts = ['🎁', '🎁', '🎀', '🎁', '⭐', '🎁', '🎁', '🎀', '🎁'];
      gifts.forEach((g, i) => later(() => {
        const r = ride.getBoundingClientRect(), d = document.createElement('span');
        d.className = 'f-gift'; d.textContent = g;
        d.style.left = (r.left + r.width * 0.55) + 'px'; d.style.top = (r.top + r.height * 0.55) + 'px';
        drops.appendChild(d);
        hooks.tone && hooks.tone(660 + (i % 5) * 110, 0.12, 'sine', 0.06);
        setTimeout(() => d.remove(), 2300);
      }, 1500 + i * 420));
    }
    function showPanel() {
      if (!panel.hidden) return;
      el.classList.add('done'); panel.hidden = false;
      panel.querySelector('#fCert').focus({ preventScroll: true });
      hooks.confetti && hooks.confetti();
      if (simple && hooks.speak) hooks.speak(T('f.say', { rank: t.rank }), 'happy');
    }
    function play() {
      timers.splice(0).forEach(clearTimeout);
      el.classList.remove('done', 'go'); panel.hidden = true; drops.innerHTML = '';
      if (calm()) { el.classList.add('static'); showPanel(); return; }
      void el.offsetWidth; el.classList.add('go');
      hooks.sfx && hooks.sfx('win');
      later(() => hooks.tone && [1047, 1319, 1568, 2093].forEach((f, i) => hooks.tone(f, 0.3, 'sine', 0.07, i * 0.12)), 900);
      dropGifts();
      later(showPanel, 6400);
    }
    const close = () => { timers.forEach(clearTimeout); el.remove(); document.body.classList.remove('no-scroll'); removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') { if (panel.hidden) showPanel(); else { close(); hooks.home && hooks.home(); } } };
    addEventListener('keydown', onKey);
    el.querySelector('.f-skip').onclick = () => { timers.forEach(clearTimeout); el.classList.remove('go'); el.classList.add('static'); showPanel(); };
    el.querySelector('#fReplay').onclick = () => { el.classList.remove('static'); play(); };
    el.querySelector('#fHome').onclick = () => { close(); hooks.home && hooks.home(); };
    el.querySelector('#fCert').onclick = () => { close(); certificate({ tierId, simple, stars, maxStars, hooks }); };
    play();
    return { close };
  }

  /* ======================= CERTIFICATE ======================= */
  const CW = 1600, CH = 1131;   // A4 landscape ratio
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function emoji(c, ch, x, y, size, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 0, 0); c.restore(); }
  function star5(c, x, y, r, fill) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } c.closePath(); c.fillStyle = fill; c.fill(); }
  function fit(c, text, font, size, maxW, min = 30) { let s = size; c.font = font.replace('{s}', s); while (c.measureText(text).width > maxW && s > min) { s -= 2; c.font = font.replace('{s}', s); } return s; }

  function drawCert(c, d) {
    const t = TITLES[d.tierId];
    // background parchment
    let g = c.createLinearGradient(0, 0, CW, CH); g.addColorStop(0, '#fffdf5'); g.addColorStop(1, '#fff4dc');
    c.fillStyle = g; c.fillRect(0, 0, CW, CH);
    // candy-cane outer border
    c.save(); rr(c, 24, 24, CW - 48, CH - 48, 40); c.lineWidth = 26; c.strokeStyle = '#ffffff'; c.stroke();
    c.setLineDash([34, 34]); c.strokeStyle = '#e63946'; c.stroke(); c.restore();
    // inner gold border
    c.save(); rr(c, 70, 70, CW - 140, CH - 140, 26); c.lineWidth = 5; c.strokeStyle = '#c9a227'; c.stroke();
    rr(c, 84, 84, CW - 168, CH - 168, 20); c.lineWidth = 2; c.stroke(); c.restore();
    // corner holly + snowflakes
    [[130, 130, 0.4], [CW - 130, 130, -0.4], [130, CH - 130, 2.7]].forEach(([x, y, r]) => { emoji(c, '🌿', x, y, 90, r); emoji(c, '🔴', x + (x < CW / 2 ? 18 : -18), y + (y < CH / 2 ? 18 : -18), 30); });
    for (let i = 0; i < 26; i++) { const x = 160 + ((i * 197) % (CW - 320)), y = 120 + ((i * 131) % 120); c.fillStyle = `rgba(30,167,255,${0.12 + (i % 4) * 0.05})`; c.beginPath(); c.arc(x, y, 3 + (i % 3) * 2, 0, 7); c.fill(); }
    // header ribbon
    c.save(); c.fillStyle = '#1565d8'; c.beginPath();
    c.moveTo(CW / 2 - 470, 150); c.lineTo(CW / 2 + 470, 150); c.lineTo(CW / 2 + 430, 195); c.lineTo(CW / 2 + 470, 240); c.lineTo(CW / 2 - 470, 240); c.lineTo(CW / 2 - 430, 195); c.closePath(); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 52px Georgia, "Times New Roman", serif';
    const ct = T('cert.title'); fit(c, ct, '900 {s}px Georgia, "Times New Roman", "Songti SC", serif', 52, 860, 28); c.fillText(ct, CW / 2, 197); c.restore();
    // body text
    c.fillStyle = '#3b5784'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.direction = window.I18N ? I18N.dir : 'ltr';
    fit(c, T('cert.presented'), 'italic {s}px Georgia, "Songti SC", serif', 34, CW - 500, 20); c.fillText(T('cert.presented'), CW / 2, 330);
    const name = (d.name || '').trim() || T('cert.default');
    const ns = fit(c, name, '900 {s}px "Trebuchet MS", "Nunito", system-ui, sans-serif', 104, CW - 520, 50);
    c.fillStyle = '#10213f'; c.font = `900 ${ns}px "Trebuchet MS", "Nunito", system-ui, sans-serif`; c.fillText(name, CW / 2, 445);
    c.strokeStyle = '#c9a227'; c.lineWidth = 3; c.beginPath(); c.moveTo(CW / 2 - 420, 478); c.lineTo(CW / 2 + 420, 478); c.stroke();
    c.fillStyle = '#3b5784';
    fit(c, T('cert.for'), '{s}px Georgia, "Songti SC", serif', 32, CW - 500, 20); c.fillText(T('cert.for'), CW / 2, 540);
    fit(c, T('cert.becoming'), '{s}px Georgia, "Songti SC", serif', 32, CW - 500, 20); c.fillText(T('cert.becoming'), CW / 2, 590);
    c.fillStyle = '#e63946'; fit(c, t.rank, '900 {s}px Georgia, "Songti SC", serif', 64, CW - 520, 30); c.fillText(`${t.rank}`, CW / 2, 668);
    c.fillStyle = '#3b5784';
    const sk = T('cert.skill', { skill: t.skill }); fit(c, sk, 'italic {s}px Georgia, "Songti SC", serif', 28, CW - 560, 18); c.fillText(sk, CW / 2, 722);
    // stars earned
    const n = Math.round((d.stars / d.maxStars) * 5);
    for (let i = 0; i < 5; i++) star5(c, CW / 2 - 160 + i * 80, 790, 30, i < n ? '#ffc53d' : '#e6dcc0');
    c.fillStyle = '#7a6a3a'; c.font = '700 26px "Trebuchet MS", system-ui, sans-serif'; c.fillText(T('cert.stars', { stars: d.stars, max: d.maxStars }), CW / 2, 856);
    // seal (left) with tier badge
    const sx = 300, sy = 820;
    c.save(); c.fillStyle = '#e63946';
    c.beginPath(); c.moveTo(sx - 50, sy + 40); c.lineTo(sx - 80, sy + 170); c.lineTo(sx - 40, sy + 145); c.lineTo(sx - 15, sy + 180); c.lineTo(sx, sy + 60); c.fill();
    c.beginPath(); c.moveTo(sx + 50, sy + 40); c.lineTo(sx + 80, sy + 170); c.lineTo(sx + 40, sy + 145); c.lineTo(sx + 15, sy + 180); c.lineTo(sx, sy + 60); c.fill();
    c.beginPath(); for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, r = i % 2 ? 98 : 110; c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } c.closePath();
    const sg = c.createRadialGradient(sx - 30, sy - 30, 10, sx, sy, 110); sg.addColorStop(0, '#ffe08a'); sg.addColorStop(1, '#c9a227'); c.fillStyle = sg; c.fill();
    c.beginPath(); c.arc(sx, sy, 78, 0, 7); c.strokeStyle = '#fff6d6'; c.lineWidth = 4; c.stroke(); c.restore();
    emoji(c, t.badge, sx, sy + 4, 82);
    // date + signature line (centre-bottom, kept clear of watermark)
    const date = new Date().toLocaleDateString(window.I18N ? I18N.locale + (I18N.lang === 'ar' ? '-u-nu-latn' : '') : undefined, { day: 'numeric', month: 'long', year: 'numeric' });   // Arabic: keep familiar 0-9 digits, like the rest of the game
    c.fillStyle = '#10213f'; c.font = '700 30px "Trebuchet MS", system-ui, sans-serif'; c.fillText(date, CW / 2 - 140, 960);
    c.strokeStyle = '#3b5784'; c.lineWidth = 2; c.beginPath(); c.moveTo(CW / 2 - 300, 975); c.lineTo(CW / 2 + 20, 975); c.stroke();
    c.fillStyle = '#7a8aa5'; c.font = '22px "Trebuchet MS", system-ui, sans-serif'; c.fillText(T('cert.date'), CW / 2 - 140, 1005);
    // Spark signing in the middle
    if (img.spark.width) { const h = 150, w = h * img.spark.width / img.spark.height; c.drawImage(img.spark, CW / 2 + 70, 870, w, h); }
    c.fillStyle = '#1565d8'; c.font = 'italic 700 34px "Brush Script MT", "Segoe Script", cursive'; c.textAlign = 'left'; c.direction = 'ltr'; c.fillText(T('cert.sign'), CW / 2 + 190, 960);
    c.textAlign = 'center'; c.fillStyle = '#7a8aa5'; c.font = '22px "Trebuchet MS", system-ui, sans-serif'; c.fillText(T('cert.guide'), CW / 2 + 240, 1005);
    // watermark — always last, bottom-right
    const lw = 290, lh = img.logo.width ? lw * img.logo.height / img.logo.width : 130, bw = lw + 44, bh = lh + 62, bx = CW - bw - 110, by = CH - bh - 105;
    c.save(); c.shadowColor = 'rgba(0,0,0,.18)'; c.shadowBlur = 14; c.fillStyle = '#fff'; rr(c, bx, by, bw, bh, 24); c.fill(); c.restore();
    if (img.logo.width) c.drawImage(img.logo, bx + 22, by + 14, lw, lh);
    c.fillStyle = '#3b5784'; c.font = '700 22px "Trebuchet MS", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.direction = 'ltr'; c.fillText(T('card.made'), bx + bw / 2, by + bh - 24, bw - 24);
  }

  function certificate(opts) {
    const { tierId, simple, stars, maxStars, hooks = {} } = opts;
    const screen = document.getElementById('screen');
    const d = { tierId, stars, maxStars, name: '' };
    try { d.name = localStorage.getItem('sparkCertName') || ''; } catch (e) { /* ignore */ }
    screen.innerHTML = `
      <div class="hud">
        <button class="pill" id="ceBack">${T(simple ? 'ce.back.s' : 'ce.back')}</button>
        <span class="pill">${T(simple ? 'ce.hud.s' : 'ce.hud')}</span>
        <span class="pill">${TITLES[tierId].badge} ${TITLES[tierId].rank}</span>
      </div>
      <div class="play cert-layout">
        <div class="cert-preview"><canvas id="certCanvas" width="${CW}" height="${CH}" aria-label="${esc(T('ce.aria'))}"></canvas></div>
        <div class="card panel">
          <div class="frosty"><div class="face"><img src="spark.png" alt="Spark" class="face-img"></div>
            <div class="bubble good ${simple ? 'simple' : ''}"><b>${T(simple ? 'ce.well.s' : 'ce.well')}</b><br>
            ${T(simple ? 'ce.sub.s' : 'ce.sub')}</div></div>
          <label class="clabel">${T(simple ? 'ce.name.s' : 'ce.name')}
            <input class="cinput" id="ceName" maxlength="28" placeholder="${esc(T(simple ? 'ce.ph.s' : 'ce.ph'))}" value="${esc(d.name)}"></label>
          <p class="ctip">${T(simple ? 'ce.tip.s' : 'ce.tip')}</p>
          <div class="row">
            <button class="btn green pulse" id="ceDl">${T(simple ? 'ce.dl.s' : 'ce.dl')}</button>
            <button class="btn ghost" id="ceCard">${T(simple ? 'ce.card.s' : 'ce.card')}</button>
          </div>
          <div id="ceMsg"></div>
        </div>
      </div>`;
    const cv = screen.querySelector('#certCanvas'), ctx = cv.getContext('2d');
    const draw = () => drawCert(ctx, d);
    ready.then(draw);
    const inp = screen.querySelector('#ceName');
    inp.oninput = () => { d.name = inp.value; try { localStorage.setItem('sparkCertName', d.name); } catch (e) { /* ignore */ } draw(); };
    inp.focus({ preventScroll: true });
    if (simple && hooks.speak) hooks.speak(T('ce.well.s') + ' ' + T('ce.sub.s'), 'happy');
    screen.querySelector('#ceBack').onclick = () => hooks.home && hooks.home();
    screen.querySelector('#ceCard').onclick = () => hooks.card && hooks.card();
    screen.querySelector('#ceDl').onclick = () => {
      draw();
      const slug = (d.name.trim() || 'super-coder').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'super-coder';
      const fname = `spark-certificate-${slug}.png`, msg = screen.querySelector('#ceMsg');
      const ok = () => { msg.innerHTML = `<div class="msg ok">${T('card.saved', { file: esc(fname) })}</div>`; hooks.sfx && hooks.sfx('collect'); };
      const save = href => { const a = document.createElement('a'); a.href = href; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); };
      try {
        cv.toBlob(b => {
          if (!b) { try { save(cv.toDataURL('image/png')); ok(); } catch (e) { msg.innerHTML = `<div class="msg err">${T('ce.blocked')}</div>`; } return; }
          const u = URL.createObjectURL(b); save(u); setTimeout(() => URL.revokeObjectURL(u), 4000); ok();
        }, 'image/png');
      } catch (e) { msg.innerHTML = `<div class="msg err">${T('ce.blocked')}</div>`; }
    };
  }

  window.Finale = { play: finale, certificate, drawCert, TITLES, CW, CH, ready };
})();
