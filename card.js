/* Spark's Holiday Card Maker — bonus feature.
   5 guided questions → festive card drawn on a <canvas> → download as PNG.
   Two looks: bright "kids" art for ages 4–8, and a calmer "designer" style for ages 9–16.
   The Spark + AIKids logo watermark is ALWAYS drawn last, bottom-right, and cannot be turned off. */
(() => {
  const W = 1200, H = 1600;                       // portrait card (3:4), crisp for printing
  const A = window.CARD_ASSETS || {};
  const img = {};
  const ready = Promise.all(['logo', 'spark'].map(k => new Promise(res => {
    const i = new Image(); i.onload = () => res(); i.onerror = () => res(); i.src = A[k] || ''; img[k] = i;
  })));

  /* ---------------- the 5 questions ---------------- */
  const T = (k, p) => (window.I18N ? I18N.t(k, p) : k);
  const STARS = [
    { id: 'tree', emoji: '🎄', label: 'Christmas tree' },
    { id: 'snowman', emoji: '⛄', label: 'Snowman' },
    { id: 'reindeer', emoji: '🦌', label: 'Reindeer' },
    { id: 'santa', emoji: '🎅', label: 'Santa' },
    { id: 'gift', emoji: '🎁', label: 'Big present' },
    { id: 'spark', emoji: '<img src="spark.png" alt="" class="ce-img">', label: 'Spark', html: true },
  ];
  const STYLES = [
    { id: 'classic', label: 'Classic', font: 'Georgia, "Times New Roman", serif', color: '#ffffff', glow: '#ffd23f' },
    { id: 'bubbly', label: 'Bubbly', font: '"Trebuchet MS", "Nunito", system-ui, sans-serif', color: '#ffe066', glow: '#ff4d8d' },
    { id: 'gold', label: 'Golden', font: 'Georgia, serif', color: '#ffd166', glow: '#ffffff' },
    { id: 'candy', label: 'Candy', font: '"Trebuchet MS", system-ui, sans-serif', color: '#ffffff', glow: '#e63946', stripe: true },
  ];

  const state = { mode: null, scene: null, star: null, extras: [], greetKey: null, custom: '', to: '', from: '', style: 'classic', seed: 7 };

  /* ---------------- tiny seeded random so the preview doesn't jump about ---------------- */
  let _s = 1;
  const rnd = () => (_s = (_s * 16807) % 2147483647) / 2147483647;
  const seed = n => { _s = n * 9973 + 1; };

  /* ---------------- drawing helpers ---------------- */
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function emoji(c, ch, x, y, size, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 0, 0); c.restore();
  }
  function star5(c, x, y, r, fill) {
    c.save(); c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    c.closePath(); c.fillStyle = fill; c.shadowColor = fill; c.shadowBlur = r; c.fill(); c.restore();
  }
  function flake(c, x, y, r, a = 0.9) {
    c.save(); c.translate(x, y); c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = Math.max(2, r / 6); c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -r);
      c.moveTo(0, -r * 0.55); c.lineTo(r * 0.25, -r * 0.8); c.moveTo(0, -r * 0.55); c.lineTo(-r * 0.25, -r * 0.8); c.stroke();
    }
    c.restore();
  }
  function wrapLines(c, text, maxW) {
    const words = text.split(/\s+/), lines = []; let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line); return lines;
  }

  /* ---------------- scenes (backgrounds) ---------------- */
  const GROUND_Y = H * 0.72;
  function drawScene(c, id) {
    let g;
    if (id === 'night') {
      g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#061433'); g.addColorStop(0.6, '#173a7a'); g.addColorStop(1, '#2d5fa8');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`; c.beginPath(); c.arc(rnd() * W, rnd() * H * 0.6, rnd() * 2.6 + 0.6, 0, 7); c.fill(); }
      // moon
      c.save(); c.shadowColor = '#fff6c9'; c.shadowBlur = 80; c.fillStyle = '#fff6d6'; c.beginPath(); c.arc(W * 0.8, H * 0.16, 85, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#173a7a'; c.beginPath(); c.arc(W * 0.8 + 38, H * 0.16 - 20, 78, 0, 7); c.fill();
      snowHills(c, '#dfeeff', '#ffffff');
    } else if (id === 'aurora') {
      g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#020a1f'); g.addColorStop(0.7, '#0b2a4a'); g.addColorStop(1, '#16466b');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`; c.beginPath(); c.arc(rnd() * W, rnd() * H * 0.65, rnd() * 2.2 + 0.5, 0, 7); c.fill(); }
      const bands = [['rgba(62,224,143,', 0.32], ['rgba(76,195,255,', 0.42], ['rgba(190,110,255,', 0.25]];
      bands.forEach(([col, yy], bi) => {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 26; k++) {
          const x = (k / 25) * W, y = H * yy + Math.sin(k * 0.5 + bi) * 70;
          const gg = c.createLinearGradient(x, y - 200, x, y + 120); gg.addColorStop(0, col + '0)'); gg.addColorStop(0.7, col + '0.35)'); gg.addColorStop(1, col + '0)');
          c.fillStyle = gg; c.fillRect(x - 30, y - 200, 64, 320);
        }
        c.restore();
      });
      // pine silhouettes
      c.fillStyle = '#071a2e';
      for (let i = 0; i < 14; i++) { const x = i * (W / 13), h = 120 + rnd() * 120; c.beginPath(); c.moveTo(x - 50, GROUND_Y + 10); c.lineTo(x, GROUND_Y - h); c.lineTo(x + 50, GROUND_Y + 10); c.fill(); }
      snowHills(c, '#cfe6ff', '#f3f9ff');
    } else if (id === 'fireside') {
      g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#6b1d1d'); g.addColorStop(1, '#3d0f12');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      // wallpaper stripes
      c.fillStyle = 'rgba(255,255,255,.05)'; for (let x = 0; x < W; x += 80) c.fillRect(x, 0, 40, GROUND_Y);
      // window with snow
      c.fillStyle = '#5b3a24'; rr(c, W * 0.08, H * 0.1, 300, 360, 18); c.fill();
      const wg = c.createLinearGradient(0, H * 0.1, 0, H * 0.1 + 330); wg.addColorStop(0, '#0d2557'); wg.addColorStop(1, '#3567b0');
      c.fillStyle = wg; rr(c, W * 0.08 + 18, H * 0.1 + 18, 264, 324, 10); c.fill();
      for (let i = 0; i < 25; i++) { c.fillStyle = '#fff'; c.beginPath(); c.arc(W * 0.08 + 30 + rnd() * 240, H * 0.1 + 30 + rnd() * 300, rnd() * 4 + 2, 0, 7); c.fill(); }
      c.fillStyle = '#5b3a24'; c.fillRect(W * 0.08 + 145, H * 0.1 + 18, 10, 324); c.fillRect(W * 0.08 + 18, H * 0.1 + 175, 264, 10);
      // fireplace
      const fx = W * 0.56, fw = 440, fy = GROUND_Y - 380;
      c.fillStyle = '#8a4b3a'; c.fillRect(fx, fy, fw, 380);
      c.fillStyle = '#6e3a2c'; for (let r = 0; r < 9; r++) for (let k = 0; k < 6; k++) c.fillRect(fx + k * 76 + (r % 2) * 38 - 8, fy + r * 42, 68, 34);
      c.fillStyle = '#4a2a20'; c.fillRect(fx - 30, fy - 40, fw + 60, 46);
      c.fillStyle = '#1a0a08'; rr(c, fx + 80, fy + 120, fw - 160, 260, 40); c.fill();
      const fg = c.createRadialGradient(fx + fw / 2, GROUND_Y - 40, 10, fx + fw / 2, GROUND_Y - 60, 200);
      fg.addColorStop(0, '#fff3a3'); fg.addColorStop(0.35, '#ffb020'); fg.addColorStop(0.7, '#ff4d1a'); fg.addColorStop(1, 'rgba(255,60,0,0)');
      c.fillStyle = fg; c.beginPath(); c.ellipse(fx + fw / 2, GROUND_Y - 80, 120, 140, 0, 0, 7); c.fill();
      // stockings
      ['#e63946', '#2a9d5c', '#e63946'].forEach((col, i) => {
        const sx = fx + 60 + i * 140, sy = fy - 10;
        c.fillStyle = col; rr(c, sx, sy, 56, 110, 14); c.fill(); rr(c, sx, sy + 80, 100, 50, 25); c.fill();
        c.fillStyle = '#fff'; rr(c, sx - 6, sy - 6, 68, 30, 12); c.fill();
      });
      // floor
      g = c.createLinearGradient(0, GROUND_Y, 0, H); g.addColorStop(0, '#7a4a2a'); g.addColorStop(1, '#4b2b18');
      c.fillStyle = g; c.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      c.fillStyle = 'rgba(0,0,0,.15)'; for (let y = GROUND_Y + 30; y < H; y += 60) c.fillRect(0, y, W, 4);
      c.fillStyle = '#b8323c'; c.beginPath(); c.ellipse(W / 2, GROUND_Y + 170, 420, 90, 0, 0, 7); c.fill();
      c.strokeStyle = '#ffd166'; c.lineWidth = 8; c.stroke();
    } else if (id === 'candy') {
      g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffd6e8'); g.addColorStop(1, '#fff0f6');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.globalAlpha = 0.18; c.fillStyle = '#ff4d8d';
      for (let i = -H; i < W; i += 110) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 55, 0); c.lineTo(i + 55 + H, H); c.lineTo(i + H, H); c.fill(); }
      c.restore();
      // gumdrop hills
      ['#ff8fb8', '#9be7c4', '#ffd166'].forEach((col, i) => {
        c.fillStyle = col; c.beginPath(); c.ellipse(W * (0.15 + i * 0.35), GROUND_Y + 40, 320, 200, 0, Math.PI, 0); c.fill();
      });
      // candy canes
      [[W * 0.07, 1], [W * 0.93, -1]].forEach(([x, dir]) => candyCane(c, x, GROUND_Y + 60, 380, dir));
      // lollipops
      [[W * 0.24, 0.48], [W * 0.78, 0.52]].forEach(([x, yy]) => {
        c.fillStyle = '#fff'; c.fillRect(x - 7, H * yy, 14, GROUND_Y - H * yy);
        for (let r = 70; r > 0; r -= 14) { c.fillStyle = (r / 14) % 2 ? '#ff4d8d' : '#fff'; c.beginPath(); c.arc(x, H * yy, r, 0, 7); c.fill(); }
      });
      g = c.createLinearGradient(0, GROUND_Y, 0, H); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffe3ef');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, GROUND_Y + 40); c.quadraticCurveTo(W / 2, GROUND_Y - 30, W, GROUND_Y + 40); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      for (let i = 0; i < 40; i++) { c.fillStyle = ['#ff4d8d', '#2a9d5c', '#4cc3ff', '#ffd166'][i % 4]; c.save(); c.translate(rnd() * W, GROUND_Y + 80 + rnd() * (H - GROUND_Y - 100)); c.rotate(rnd() * 3); c.fillRect(-10, -3, 20, 6); c.restore(); }
    }
  }
  function snowHills(c, back, front) {
    c.fillStyle = back; c.beginPath(); c.moveTo(0, GROUND_Y + 20);
    c.quadraticCurveTo(W * 0.3, GROUND_Y - 90, W * 0.6, GROUND_Y + 10); c.quadraticCurveTo(W * 0.85, GROUND_Y - 50, W, GROUND_Y - 10);
    c.lineTo(W, H); c.lineTo(0, H); c.fill();
    c.fillStyle = front; c.beginPath(); c.moveTo(0, GROUND_Y + 90); c.quadraticCurveTo(W * 0.5, GROUND_Y + 10, W, GROUND_Y + 100); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    c.fillStyle = 'rgba(170,205,240,.35)'; c.beginPath(); c.ellipse(W * 0.5, GROUND_Y + 160, 380, 40, 0, 0, 7); c.fill();
  }
  function candyCane(c, x, baseY, h, dir) {
    c.save(); c.lineCap = 'round'; c.lineWidth = 46;
    const path = () => { c.beginPath(); c.moveTo(x, baseY); c.lineTo(x, baseY - h); c.arc(x + dir * 70, baseY - h, 70, Math.PI, dir > 0 ? 0 : Math.PI * 2, dir < 0); };
    c.strokeStyle = '#fff'; path(); c.stroke();
    c.setLineDash([30, 30]); c.strokeStyle = '#e63946'; path(); c.stroke(); c.restore();
  }

  /* ---------------- star of the card ---------------- */
  function drawStar(c, id) {
    const cx = W / 2, by = GROUND_Y + 120;
    c.save(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(cx, by + 10, 230, 36, 0, 0, 7); c.fill(); c.restore();
    if (id === 'spark' && img.spark.width) {
      const h = 620, w = h * img.spark.width / img.spark.height;
      c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 30; c.shadowOffsetY = 12;
      c.drawImage(img.spark, cx - w / 2, by - h, w, h); c.restore();
      return;
    }
    const ch = STARS.find(s => s.id === id).emoji;
    c.save(); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 30; c.shadowOffsetY = 14;
    emoji(c, ch, cx, by - 300, 560); c.restore();
  }

  /* ---------------- decorations ---------------- */
  function drawExtras(c, list) {
    const set = new Set(list);
    if (set.has('lights')) {
      c.save(); c.strokeStyle = '#1f3d1f'; c.lineWidth = 4;
      c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, 70 + Math.sin(x / W * Math.PI * 3) * 40); c.stroke();
      const cols = ['#ff4d5e', '#ffd23f', '#3ee08f', '#4cc3ff', '#c77dff'];
      for (let i = 0; i < 16; i++) {
        const x = 40 + i * ((W - 80) / 15), y = 70 + Math.sin(x / W * Math.PI * 3) * 40 + 24;
        c.shadowColor = cols[i % 5]; c.shadowBlur = 30; c.fillStyle = cols[i % 5];
        c.beginPath(); c.ellipse(x, y, 14, 22, 0, 0, 7); c.fill();
        c.shadowBlur = 0; c.fillStyle = '#555'; c.fillRect(x - 8, y - 30, 16, 12);
      }
      c.restore();
    }
    if (set.has('holly')) {
      [[70, 70, 0.3], [W - 70, 70, -0.3]].forEach(([x, y, r]) => { emoji(c, '🌿', x, y + 10, 120, r); emoji(c, '🔴', x + 10, y + 20, 34); emoji(c, '🔴', x + 36, y + 6, 30); });
      emoji(c, '🌿', 60, H - 260, 100, 2.6);
    }
    if (set.has('stars')) {
      for (let i = 0; i < 14; i++) star5(c, 60 + rnd() * (W - 120), 140 + rnd() * H * 0.42, 10 + rnd() * 18, ['#ffd23f', '#fff6c9', '#ffffff'][i % 3]);
    }
    if (set.has('baubles')) {
      const cols = ['#e63946', '#ffd23f', '#4cc3ff', '#2a9d5c', '#c77dff'];
      [[0.15, 0.15], [0.3, 0.22], [0.7, 0.2], [0.86, 0.13]].forEach(([fx, fy], i) => {
        const x = W * fx, y = H * fy;
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y - 46); c.stroke();
        c.fillStyle = '#c9a227'; c.fillRect(x - 12, y - 52, 24, 16);
        const bg = c.createRadialGradient(x - 14, y - 14, 4, x, y, 44); bg.addColorStop(0, '#fff'); bg.addColorStop(0.25, cols[i]); bg.addColorStop(1, cols[i]);
        c.fillStyle = bg; c.beginPath(); c.arc(x, y, 42, 0, 7); c.fill();
      });
    }
    if (set.has('gifts')) {
      [[W * 0.2, 'r', 150], [W * 0.8, 'g', 130], [W * 0.31, 'b', 100], [W * 0.69, 'y', 110]].forEach(([x, col, s]) => {
        const y = GROUND_Y + 150 - s, colors = { r: ['#e63946', '#ffd23f'], g: ['#2a9d5c', '#ffffff'], b: ['#4cc3ff', '#e63946'], y: ['#ffd23f', '#2a9d5c'] }[col];
        c.save(); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 16; c.fillStyle = colors[0]; c.fillRect(x - s / 2, y, s, s); c.restore();
        c.fillStyle = colors[1]; c.fillRect(x - 10, y, 20, s); c.fillRect(x - s / 2, y + s / 2 - 10, s, 20);
        c.beginPath(); c.ellipse(x - 22, y - 8, 24, 14, -0.4, 0, 7); c.ellipse(x + 22, y - 8, 24, 14, 0.4, 0, 7); c.fill();
      });
    }
    if (set.has('snow')) {
      for (let i = 0; i < 55; i++) { c.fillStyle = `rgba(255,255,255,${0.5 + rnd() * 0.5})`; c.beginPath(); c.arc(rnd() * W, rnd() * H * 0.9, rnd() * 6 + 3, 0, 7); c.fill(); }
      for (let i = 0; i < 12; i++) flake(c, rnd() * W, rnd() * H * 0.8, 18 + rnd() * 22);
    }
  }

  /* ---------------- greeting text ---------------- */
  function drawGreeting(c) {
    const text = (state.custom.trim() || (state.greetKey ? T(state.greetKey) : '') || '').slice(0, 40);
    if (!text) return;
    const st = STYLES.find(s => s.id === state.style);
    let size = 130; c.font = `900 ${size}px ${st.font}`;
    let lines = wrapLines(c, text, W - 180);
    while ((lines.length > 2 || lines.some(l => c.measureText(l).width > W - 160)) && size > 60) { size -= 6; c.font = `900 ${size}px ${st.font}`; lines = wrapLines(c, text, W - 180); }
    const y0 = state.extras.includes('lights') ? 250 : 200;
    // banner behind text so it is readable on any scene
    const bh = lines.length * size * 1.15 + 50;
    c.save(); c.fillStyle = state.style === 'candy' ? 'rgba(40,90,60,.55)' : state.scene === 'candy' ? 'rgba(230,57,70,.85)' : 'rgba(5,15,40,.35)';
    rr(c, 60, y0 - size * 0.85 - 10, W - 120, bh, 40); c.fill(); c.restore();
    lines.forEach((ln, i) => {
      const y = y0 + i * size * 1.15;
      c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = `900 ${size}px ${st.font}`; c.direction = window.I18N ? I18N.dir : 'ltr';
      c.lineJoin = 'round'; c.lineWidth = size * 0.12; c.strokeStyle = 'rgba(0,0,0,.35)'; c.strokeText(ln, W / 2, y + 6);
      c.shadowColor = st.glow; c.shadowBlur = 30; c.fillStyle = st.color; c.fillText(ln, W / 2, y);
      c.restore();
      if (st.stripe) {
        // stripes clipped to the letters only: draw on a scratch canvas, then copy across
        const o = document.createElement('canvas'); o.width = W; o.height = Math.ceil(size * 1.5);
        const oc = o.getContext('2d'), top = y - size * 1.1;
        oc.font = `900 ${size}px ${st.font}`; oc.textAlign = 'center'; oc.textBaseline = 'alphabetic';
        oc.fillStyle = '#000'; oc.fillText(ln, W / 2, y - top);
        oc.globalCompositeOperation = 'source-in'; oc.fillStyle = 'rgba(230,57,70,.9)';
        oc.beginPath();   // one path for all stripes: 'source-in' must be a single fill
        for (let x = -o.height; x < W; x += 54) { oc.moveTo(x, 0); oc.lineTo(x + 24, 0); oc.lineTo(x + 24 + o.height, o.height); oc.lineTo(x + o.height, o.height); oc.closePath(); }
        oc.fill();
        c.drawImage(o, 0, top);
      }
    });
  }

  /* ---------------- to / from note ---------------- */
  function drawNote(c) {
    const to = state.to.trim().slice(0, 24), from = state.from.trim().slice(0, 24);
    if (!to && !from) return;
    const x = 70, y = H - 290, w = 560, h = to && from ? 200 : 130;
    const rtl = window.I18N && I18N.dir === 'rtl';
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(-0.03); c.translate(-(x + w / 2), -(y + h / 2));
    c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8;
    c.fillStyle = '#fffdf4'; rr(c, x, y, w, h, 22); c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = '#e63946'; c.lineWidth = 6; c.setLineDash([18, 12]); rr(c, x + 12, y + 12, w - 24, h - 24, 14); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#10213f'; c.textBaseline = 'middle'; c.font = '700 52px "Trebuchet MS", system-ui, sans-serif';
    c.direction = rtl ? 'rtl' : 'ltr'; c.textAlign = rtl ? 'right' : 'left';
    const tx = rtl ? x + w - 40 : x + 40;
    let ly = y + (to && from ? 68 : h / 2);
    if (to) { c.fillText(T('card.k.toLine', { name: to }), tx, ly, w - 80); ly += 72; }
    if (from) c.fillText(T('card.k.fromLine', { name: from }), tx, ly, w - 80);
    c.restore();
  }

  /* =====================================================================
     DESIGNER MODE (ages 9–16): a more grown-up, "stationery shop" look.
     Vector art only (no emoji), muted jewel palettes, gold accents, serif type.
     ===================================================================== */
  const PAL = {
    midnight: { bg: ['#0b1d2a', '#12324a', '#1d4a63'], ink: '#f3ead7', gold: '#d8b46a', accent: '#7fb3a6', dark: '#07141d', snow: 'rgba(243,234,215,' },
    aurora:   { bg: ['#050b18', '#0f2236', '#16354a'], ink: '#eaf4f1', gold: '#cfd9c8', accent: '#61d4b3', dark: '#040a14', snow: 'rgba(234,244,241,' },
    velvet:   { bg: ['#3a0d17', '#5a1424', '#2a0910'], ink: '#f6e7cf', gold: '#e1b866', accent: '#9e2b3b', dark: '#1f060b', snow: 'rgba(246,231,207,' },
    nordic:   { bg: ['#f2efe8', '#ece7dc', '#e3ddd0'], ink: '#24323b', gold: '#b8894a', accent: '#a23b3b', dark: '#2f4a44', snow: 'rgba(36,50,59,' },
  };
  const pal = () => PAL[state.scene] || PAL.midnight;

  function dScene(c, id) {
    const P = PAL[id] || PAL.midnight;
    const g = c.createLinearGradient(0, 0, 0, H); P.bg.forEach((col, i) => g.addColorStop(i / (P.bg.length - 1), col));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (id === 'midnight' || id === 'aurora') {
      // fine star field
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.55})`; c.beginPath(); c.arc(rnd() * W, rnd() * H * 0.62, rnd() * 1.6 + 0.3, 0, 7); c.fill(); }
    }
    if (id === 'aurora') {
      c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(28px)';
      [['rgba(97,212,179,', 0.22, 0], ['rgba(110,160,255,', 0.3, 1.4], ['rgba(170,120,230,', 0.18, 2.6]].forEach(([col, yy, ph]) => {
        c.beginPath(); c.moveTo(-50, H * yy);
        for (let x = -50; x <= W + 50; x += 30) c.lineTo(x, H * yy + Math.sin(x / 170 + ph) * 60);
        c.lineTo(W + 50, H * yy + 220); for (let x = W + 50; x >= -50; x -= 30) c.lineTo(x, H * yy + 220 + Math.sin(x / 140 + ph) * 40);
        c.closePath(); const gg = c.createLinearGradient(0, H * yy - 60, 0, H * yy + 240); gg.addColorStop(0, col + '0)'); gg.addColorStop(0.4, col + '.55)'); gg.addColorStop(1, col + '0)');
        c.fillStyle = gg; c.fill();
      });
      c.restore();
    }
    if (id === 'midnight' || id === 'aurora') {
      // layered pine ridges
      const layers = id === 'aurora' ? ['#0c2133', '#081827', P.dark] : ['#16384d', '#0f2b3c', P.dark];
      layers.forEach((col, li) => {
        const base = H * (0.66 + li * 0.07), size = 90 + li * 50;
        c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
        for (let x = -size; x < W + size; x += size * 0.55) {
          const h = size * (1.6 + rnd() * 1.3);
          c.lineTo(x, base); c.lineTo(x + size * 0.27, base - h); c.lineTo(x + size * 0.55, base);
        }
        c.lineTo(W, H); c.closePath(); c.fill();
      });
      c.fillStyle = P.dark; c.fillRect(0, H * 0.86, W, H * 0.14);
    }
    if (id === 'velvet') {
      // damask-like diamond lattice
      c.save(); c.strokeStyle = 'rgba(225,184,102,.10)'; c.lineWidth = 2;
      for (let x = -H; x < W + H; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); c.beginPath(); c.moveTo(x + H, 0); c.lineTo(x, H); c.stroke(); }
      c.restore();
      const v = c.createRadialGradient(W / 2, H * 0.48, 80, W / 2, H * 0.5, H * 0.75); v.addColorStop(0, 'rgba(255,220,160,.16)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
      c.fillStyle = v; c.fillRect(0, 0, W, H);
    }
    if (id === 'nordic') {
      // paper texture + soft hills
      for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(80,70,50,${rnd() * 0.035})`; c.fillRect(rnd() * W, rnd() * H, 2, 2); }
      c.fillStyle = '#e6e0d3'; c.beginPath(); c.moveTo(0, H * 0.8); c.bezierCurveTo(W * 0.3, H * 0.72, W * 0.6, H * 0.84, W, H * 0.76); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.fillStyle = '#ddd6c7'; c.beginPath(); c.moveTo(0, H * 0.88); c.bezierCurveTo(W * 0.4, H * 0.82, W * 0.7, H * 0.92, W, H * 0.86); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    }
  }

  /* --- centrepieces --- */
  function goldGrad(c, x0, y0, x1, y1, P) { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#f6e3a8'); g.addColorStop(0.45, P.gold); g.addColorStop(1, '#8a6a2e'); return g; }
  function dHero(c, id) {
    const P = pal(), cx = W / 2, cy = H * 0.52;
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    if (id === 'pine') {
      // geometric line-art tree with gold baubles
      const top = cy - 360, bottom = cy + 260;
      c.strokeStyle = goldGrad(c, cx - 200, top, cx + 200, bottom, P); c.lineWidth = 7;
      for (let i = 0; i < 6; i++) {
        const y = top + 60 + i * 95, half = 60 + i * 42;
        c.beginPath(); c.moveTo(cx - half, y + 40); c.lineTo(cx, y - 60); c.lineTo(cx + half, y + 40); c.stroke();
      }
      c.beginPath(); c.moveTo(cx, top - 20); c.lineTo(cx, bottom); c.stroke();
      c.fillStyle = P.accent; [[-90, 0.48], [70, 0.62], [-40, 0.78], [120, 0.88], [-150, 0.94]].forEach(([dx, f]) => { c.beginPath(); c.arc(cx + dx, top + (bottom - top) * f, 13, 0, 7); c.fill(); });
      starOutline(c, cx, top - 46, 44, P.gold);
    } else if (id === 'flake') {
      c.translate(cx, cy - 40);
      c.strokeStyle = P.ink; c.lineWidth = 9; c.shadowColor = P.ink; c.shadowBlur = 18;
      for (let i = 0; i < 6; i++) {
        c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -300); c.stroke();
        [[110, 70], [190, 60], [255, 38]].forEach(([d, l]) => { c.beginPath(); c.moveTo(0, -d); c.lineTo(l, -d - l * 0.8); c.moveTo(0, -d); c.lineTo(-l, -d - l * 0.8); c.stroke(); });
      }
      c.shadowBlur = 0; c.strokeStyle = P.gold; c.lineWidth = 4;
      c.beginPath(); for (let i = 0; i < 7; i++) { const a = i * Math.PI / 3; c.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); } c.stroke();
    } else if (id === 'ornament') {
      const r = 230, oy = cy + 10;
      c.strokeStyle = P.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, oy - r - 60); c.stroke();
      c.fillStyle = goldGrad(c, cx - 40, oy - r - 70, cx + 40, oy - r, P); rr(c, cx - 44, oy - r - 66, 88, 56, 10); c.fill();
      const g = c.createRadialGradient(cx - 80, oy - 90, 20, cx, oy, r); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(0.18, P.accent); g.addColorStop(1, shade(P.accent, -0.55));
      c.fillStyle = g; c.beginPath(); c.arc(cx, oy, r, 0, 7); c.fill();
      c.save(); c.beginPath(); c.arc(cx, oy, r, 0, 7); c.clip();
      c.strokeStyle = 'rgba(255,240,200,.75)'; c.lineWidth = 5;
      [-0.45, 0, 0.45].forEach(f => { c.beginPath(); c.ellipse(cx, oy + r * f, r, r * 0.16, 0, 0, 7); c.stroke(); });
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(cx - 90, oy - 110, 50, 26, -0.6, 0, 7); c.fill();
    } else if (id === 'wreath') {
      const R = 250, wy = cy - 20;
      for (let i = 0; i < 70; i++) {
        const a = (i / 70) * Math.PI * 2, rr2 = R + (rnd() - 0.5) * 40, x = cx + Math.cos(a) * rr2, y = wy + Math.sin(a) * rr2;
        c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2 + (rnd() - 0.5));
        c.fillStyle = ['#2f5b45', '#3d6e53', '#24493a'][i % 3]; c.beginPath(); c.ellipse(0, 0, 46, 14, 0, 0, 7); c.fill(); c.restore();
      }
      for (let i = 0; i < 14; i++) { const a = rnd() * Math.PI * 2, x = cx + Math.cos(a) * R, y = wy + Math.sin(a) * R; c.fillStyle = '#a3283a'; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(x - 4, y - 4, 4, 0, 7); c.fill(); }
      // bow
      c.fillStyle = goldGrad(c, cx - 100, wy + R - 60, cx + 100, wy + R + 80, P);
      c.beginPath(); c.moveTo(cx, wy + R); c.bezierCurveTo(cx - 130, wy + R - 110, cx - 150, wy + R + 60, cx, wy + R); c.fill();
      c.beginPath(); c.moveTo(cx, wy + R); c.bezierCurveTo(cx + 130, wy + R - 110, cx + 150, wy + R + 60, cx, wy + R); c.fill();
      c.beginPath(); c.moveTo(cx - 10, wy + R + 10); c.lineTo(cx - 60, wy + R + 150); c.lineTo(cx - 20, wy + R + 135); c.lineTo(cx, wy + R + 10); c.fill();
      c.beginPath(); c.moveTo(cx + 10, wy + R + 10); c.lineTo(cx + 60, wy + R + 150); c.lineTo(cx + 20, wy + R + 135); c.lineTo(cx, wy + R + 10); c.fill();
      c.beginPath(); c.arc(cx, wy + R, 20, 0, 7); c.fill();
    } else if (id === 'cabin') {
      const bw = 420, bh = 260, bx = cx - bw / 2, by = cy + 40;
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(cx, by + bh + 20, 330, 30, 0, 0, 7); c.fill();
      c.fillStyle = '#5a3a2a'; c.fillRect(bx, by, bw, bh);
      c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 3; for (let y = by + 26; y < by + bh; y += 26) { c.beginPath(); c.moveTo(bx, y); c.lineTo(bx + bw, y); c.stroke(); }
      c.fillStyle = '#3b2519'; c.beginPath(); c.moveTo(bx - 50, by + 10); c.lineTo(cx, by - 200); c.lineTo(bx + bw + 50, by + 10); c.closePath(); c.fill();
      c.fillStyle = '#f4f1ea'; c.beginPath(); c.moveTo(bx - 60, by + 14); c.lineTo(cx, by - 214); c.lineTo(bx + bw + 60, by + 14); c.lineTo(bx + bw + 30, by + 30); c.lineTo(cx, by - 170); c.lineTo(bx - 30, by + 30); c.closePath(); c.fill();
      c.fillStyle = '#4a3020'; c.fillRect(bx + bw - 110, by - 150, 50, 110);
      const glow = c.createRadialGradient(cx, by + 130, 10, cx, by + 130, 220); glow.addColorStop(0, 'rgba(255,200,110,.55)'); glow.addColorStop(1, 'rgba(255,200,110,0)');
      c.fillStyle = glow; c.fillRect(bx - 120, by - 60, bw + 240, bh + 200);
      [[bx + 60, by + 80], [bx + bw - 140, by + 80]].forEach(([x, y]) => { c.fillStyle = '#ffd38a'; c.fillRect(x, y, 80, 80); c.strokeStyle = '#3b2519'; c.lineWidth = 8; c.strokeRect(x, y, 80, 80); c.beginPath(); c.moveTo(x + 40, y); c.lineTo(x + 40, y + 80); c.moveTo(x, y + 40); c.lineTo(x + 80, y + 40); c.stroke(); });
      c.fillStyle = '#2a1a10'; rr(c, cx - 38, by + bh - 130, 76, 130, 10); c.fill();
      c.fillStyle = '#2f5b45'; c.beginPath(); c.arc(cx, by + bh - 160, 30, 0, 7); c.lineWidth = 10; c.strokeStyle = '#2f5b45'; c.stroke();
      // smoke
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 10; c.beginPath(); c.moveTo(bx + bw - 85, by - 160);
      c.bezierCurveTo(bx + bw - 40, by - 220, bx + bw - 130, by - 270, bx + bw - 70, by - 340); c.stroke();
    } else if (id === 'spark' && img.spark.width) {
      // Spark framed inside a gold medallion — still the same Spark, but presented like a keepsake
      const R = 290, my = cy - 20;
      c.strokeStyle = P.gold; c.lineWidth = 6; c.beginPath(); c.arc(cx, my, R, 0, 7); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.arc(cx, my, R - 18, 0, 7); c.stroke();
      for (let i = 0; i < 48; i++) { const a = i * Math.PI / 24; c.beginPath(); c.moveTo(cx + Math.cos(a) * (R + 10), my + Math.sin(a) * (R + 10)); c.lineTo(cx + Math.cos(a) * (R + 24), my + Math.sin(a) * (R + 24)); c.stroke(); }
      const h = 440, w = h * img.spark.width / img.spark.height;
      c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 26; c.shadowOffsetY = 10;
      c.drawImage(img.spark, cx - w / 2, my - h / 2 + 10, w, h);
    }
    c.restore();
  }
  function starOutline(c, x, y, r, col) {
    c.save(); c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    c.closePath(); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 24; c.fill(); c.restore();
  }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, m = v => Math.max(0, Math.min(255, Math.round(v + (f < 0 ? v * f : (255 - v) * f))));
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }

  /* --- finishing touches --- */
  function dExtras(c, list, layer) {
    const P = pal(), set = new Set(list);
    if (layer === 'back') {
      if (set.has('bokeh')) {
        c.save(); c.globalCompositeOperation = 'screen';
        for (let i = 0; i < 26; i++) {
          const x = rnd() * W, y = rnd() * H * 0.8, r = 20 + rnd() * 60, g = c.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(255,225,160,${0.12 + rnd() * 0.18})`); g.addColorStop(1, 'rgba(255,225,160,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
        }
        c.restore();
      }
      if (set.has('stars')) for (let i = 0; i < 18; i++) sparkle(c, 80 + rnd() * (W - 160), 120 + rnd() * H * 0.55, 8 + rnd() * 16, P.gold);
      return;
    }
    if (set.has('garland')) {
      // pine garland swag along the top
      c.save();
      for (let s = 0; s < 2; s++) {
        const x0 = s ? W / 2 : 0, x1 = s ? W : W / 2;
        for (let i = 0; i <= 26; i++) {
          const f = i / 26, x = x0 + (x1 - x0) * f, y = 40 + Math.sin(f * Math.PI) * 120;
          for (let k = 0; k < 4; k++) { c.save(); c.translate(x + (rnd() - 0.5) * 20, y + (rnd() - 0.5) * 16); c.rotate(rnd() * Math.PI); c.fillStyle = ['#2f5b45', '#3d6e53', '#24493a'][k % 3]; c.beginPath(); c.ellipse(0, 0, 30, 8, 0, 0, 7); c.fill(); c.restore(); }
          if (i % 5 === 2) { c.fillStyle = P.gold; c.beginPath(); c.arc(x, y + 20, 10, 0, 7); c.fill(); }
        }
      }
      c.restore();
    }
    if (set.has('confetti')) {
      for (let i = 0; i < 70; i++) {
        c.save(); c.translate(rnd() * W, rnd() * H * 0.95); c.rotate(rnd() * Math.PI);
        c.fillStyle = i % 3 ? P.gold : shade(P.gold, 0.35); c.globalAlpha = 0.5 + rnd() * 0.5;
        if (i % 2) c.fillRect(-7, -2, 14, 4); else { c.beginPath(); c.arc(0, 0, 3.5, 0, 7); c.fill(); }
        c.restore();
      }
    }
    if (set.has('snow')) {
      for (let i = 0; i < 120; i++) { c.fillStyle = P.snow + (0.25 + rnd() * 0.55) + ')'; c.beginPath(); c.arc(rnd() * W, rnd() * H, rnd() * 3.2 + 0.8, 0, 7); c.fill(); }
    }
    if (set.has('frame')) {
      c.save(); c.strokeStyle = P.gold; c.lineWidth = 4; rr(c, 54, 54, W - 108, H - 108, 8); c.stroke();
      c.lineWidth = 1.5; rr(c, 70, 70, W - 140, H - 140, 6); c.stroke();
      [[54, 54], [W - 54, 54], [54, H - 54], [W - 54, H - 54]].forEach(([x, y]) => { c.fillStyle = P.gold; c.beginPath(); c.moveTo(x, y - 16); c.lineTo(x + 16, y); c.lineTo(x, y + 16); c.lineTo(x - 16, y); c.closePath(); c.fill(); });
      c.restore();
    }
  }
  function sparkle(c, x, y, r, col) {
    c.save(); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = r;
    c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); c.restore();
  }

  /* --- typography --- */
  const D_STYLES = {
    serif:  { font: 'Georgia, "Times New Roman", "Songti SC", "Noto Serif", serif', weight: '400', size: 118, track: 2 },
    script: { font: '"Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", "Kaiti SC", cursive', weight: '400', size: 132, track: 0 },
    modern: { font: '"Avenir Next", "Helvetica Neue", "PingFang SC", "Segoe UI", system-ui, sans-serif', weight: '300', size: 96, track: 10, upper: true },
    foil:   { font: 'Didot, "Bodoni 72", Georgia, "Songti SC", serif', weight: '700', size: 118, track: 3, foil: true },
  };
  function dGreeting(c) {
    const text = (state.custom.trim() || (state.greetKey ? T(state.greetKey) : '') || '').slice(0, 40);
    if (!text) return;
    const P = pal(), st = D_STYLES[state.style] || D_STYLES.serif, shown = st.upper ? text.toLocaleUpperCase() : text;
    let size = st.size; const setF = () => { c.font = `${st.weight} ${size}px ${st.font}`; if ('letterSpacing' in c) c.letterSpacing = st.track + 'px'; };
    setF(); let lines = wrapLines(c, shown, W - 260);
    while ((lines.length > 2 || lines.some(l => c.measureText(l).width > W - 240)) && size > 54) { size -= 6; setF(); lines = wrapLines(c, shown, W - 260); }
    const y0 = state.extras.includes('garland') ? 330 : 270;
    lines.forEach((ln, i) => {
      const y = y0 + i * size * 1.18;
      c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; setF();
      c.direction = I18N.dir;
      if (st.foil) { c.fillStyle = goldGrad(c, 0, y - size, 0, y + 10, P); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10; c.shadowOffsetY = 3; }
      else { c.fillStyle = P.ink; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 8; }
      c.fillText(ln, W / 2, y); c.restore();
    });
    if ('letterSpacing' in c) c.letterSpacing = '0px';   // don't let the lettering style leak into later text
    // small ornament rule under the greeting
    const ry = y0 + (lines.length - 1) * size * 1.18 + 50;
    c.save(); c.strokeStyle = P.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2 - 160, ry); c.lineTo(W / 2 - 22, ry); c.moveTo(W / 2 + 22, ry); c.lineTo(W / 2 + 160, ry); c.stroke();
    c.fillStyle = P.gold; c.beginPath(); c.moveTo(W / 2, ry - 10); c.lineTo(W / 2 + 10, ry); c.lineTo(W / 2, ry + 10); c.lineTo(W / 2 - 10, ry); c.closePath(); c.fill(); c.restore();
  }
  function dNote(c) {
    const to = state.to.trim().slice(0, 24), from = state.from.trim().slice(0, 24);
    if (!to && !from) return;
    const P = pal(), line = to && from ? T('card.m.noteBoth', { to, from }) : to ? T('card.m.noteTo', { to }) : T('card.m.noteFrom', { from });
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = I18N.dir;
    c.font = 'italic 46px Georgia, "Songti SC", serif'; c.fillStyle = P.ink; c.globalAlpha = 0.92;
    // keep clear of the bottom-right watermark: sit centred, above it
    c.fillText(line, W / 2 - 120, H - 300, W - 520); c.restore();
  }
  function renderDesigner(c) {
    seed(state.seed); c.clearRect(0, 0, W, H);
    dScene(c, state.scene || 'midnight');
    dExtras(c, state.extras, 'back');
    if (state.star) dHero(c, state.star);
    dExtras(c, state.extras, 'front');
    dGreeting(c); dNote(c);
    drawWatermark(c);
  }
  /* ---------------- watermark (always on, always last) ---------------- */
  function drawWatermark(c) {
    const pad = 36, lw = 330, lh = img.logo.width ? lw * img.logo.height / img.logo.width : 150;
    const bw = lw + 50, bh = lh + 70, bx = W - bw - pad, by = H - bh - pad;
    c.save();
    c.globalAlpha = 0.92; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 18;
    c.fillStyle = '#ffffff'; rr(c, bx, by, bw, bh, 28); c.fill();
    c.shadowColor = 'transparent'; c.globalAlpha = 1;
    if (img.logo.width) c.drawImage(img.logo, bx + 25, by + 18, lw, lh);
    else { c.fillStyle = '#1565d8'; c.font = '900 80px system-ui'; c.textAlign = 'center'; c.fillText('AIKids', bx + bw / 2, by + bh / 2); }
    c.fillStyle = '#3b5784'; c.font = '700 26px "Trebuchet MS", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.direction = 'ltr'; if ('letterSpacing' in c) c.letterSpacing = '0px';
    c.fillText(T('card.made'), bx + bw / 2, by + bh - 28, bw - 30);
    c.restore();
  }

  function renderKids(c) {
    seed(state.seed);
    c.clearRect(0, 0, W, H);
    drawScene(c, state.scene || 'night');
    drawExtras(c, state.extras.filter(e => e !== 'snow'));
    if (state.star) drawStar(c, state.star);
    if (state.extras.includes('snow')) drawExtras(c, ['snow']);
    drawGreeting(c);
    drawNote(c);
    c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 18; rr(c, 9, 9, W - 18, H - 18, 40); c.stroke(); c.restore();
    drawWatermark(c);
  }
  const render = c => (state.mode === 'designer' ? renderDesigner(c) : renderKids(c));

  /* ================= UI ================= */
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /* Option lists per mode. Labels come from translations; ids drive the drawing. */
  const KIDS = {
    scenes: [['night', '🌙'], ['aurora', '🌌'], ['fireside', '🔥'], ['candy', '🍭']],
    stars: [['tree', '🎄'], ['snowman', '⛄'], ['reindeer', '🦌'], ['santa', '🎅'], ['gift', '🎁'], ['spark', null]],
    extras: [['snow', '❄️'], ['stars', '⭐'], ['lights', '💡'], ['gifts', '🎁'], ['baubles', '🔴'], ['holly', '🌿']],
    styles: ['classic', 'bubbly', 'gold', 'candy'],
  };
  const DESIGN = {
    scenes: ['midnight', 'aurora', 'velvet', 'nordic'],
    stars: ['pine', 'flake', 'ornament', 'wreath', 'cabin', 'spark'],
    extras: ['snow', 'bokeh', 'garland', 'stars', 'frame', 'confetti'],
    styles: ['serif', 'script', 'modern', 'foil'],
  };

  /* small preview tiles drawn with the real designer renderer, so the buttons look like the result */
  function thumb(kind, id) {
    const cv = document.createElement('canvas'); cv.width = 240; cv.height = 320;
    const c = cv.getContext('2d'), keep = { ...state, extras: [...state.extras] };
    c.scale(240 / W, 320 / H);
    seed(3);
    if (kind === 'scene') { dScene(c, id); }
    else if (kind === 'hero') { state.scene = state.scene || 'midnight'; dScene(c, state.scene); dHero(c, id); }
    else if (kind === 'extra') { state.scene = state.scene || 'midnight'; dScene(c, state.scene); dExtras(c, [id], 'back'); dExtras(c, [id], 'front'); }
    Object.assign(state, keep);
    return cv.toDataURL('image/png');
  }

  function open(screen, opts = {}) {
    const simple = !!opts.simple;
    const hooks = opts.hooks || {};
    const mode = simple ? 'kids' : 'designer';
    if (state.mode !== mode) Object.assign(state, { mode, scene: null, star: null, extras: [], greetKey: null, custom: '', to: '', from: '', style: simple ? 'classic' : 'serif' });
    const P = simple ? 'card.k.' : 'card.m.';
    const L = k => T(P + k);
    let step = 0;

    screen.innerHTML = `
      <div class="hud">
        <button class="pill" id="cBack">${T('card.back')}</button>
        <span class="pill">${T('card.hud')}</span>
        <span class="pill" id="cStep"></span>
      </div>
      <div class="play card-maker ${simple ? '' : 'designer'}">
        <div class="card-preview">
          <canvas id="cardCanvas" width="${W}" height="${H}" aria-label="${esc(T('card.aria'))}"></canvas>
          <button class="pill shuffle" id="cShuffle">${L('shuffle')}</button>
        </div>
        <div class="card panel" id="cPanel"></div>
      </div>`;
    const canvas = screen.querySelector('#cardCanvas'), ctx = canvas.getContext('2d');
    const panel = screen.querySelector('#cPanel');
    screen.querySelector('#cBack').onclick = () => hooks.home && hooks.home();
    const draw = () => render(ctx);
    screen.querySelector('#cShuffle').onclick = () => { state.seed = Math.floor(Math.random() * 1e6); draw(); hooks.sfx && hooks.sfx('step'); };
    ready.then(draw);

    const dots = () => `<div class="qdots">${[0, 1, 2, 3, 4].map(i => `<span class="${i < step ? 'done' : i === step ? 'now' : ''}">${i < step ? '✓' : i + 1}</span>`).join('')}</div>`;
    const kidPick = (list, sel, multi, attr, prefix) => `<div class="cgrid">${list.map(([id, em]) => `
      <button class="cpick pop-in ${multi ? (sel.includes(id) ? 'on' : '') : sel === id ? 'on' : ''}" data-${attr}="${id}">
        <span class="ce">${em ? esc(em) : '<img src="spark.png" alt="" class="ce-img">'}</span><span>${esc(T(prefix + id))}</span></button>`).join('')}</div>`;
    const designPick = (list, sel, multi, attr, prefix, kind) => `<div class="cgrid dgrid">${list.map(id => `
      <button class="cpick dpick ${multi ? (sel.includes(id) ? 'on' : '') : sel === id ? 'on' : ''}" data-${attr}="${id}">
        <img class="dthumb" src="${thumb(kind, id)}" alt=""><span>${esc(T(prefix + id))}</span></button>`).join('')}</div>`;
    const greets = () => [0, 1, 2, 3, 4, 5].map(i => P + 'g' + i);
    const canNext = () => [state.scene, state.star, true, state.greetKey || state.custom.trim(), true][step];

    function show() {
      screen.querySelector('#cStep').textContent = step < 5 ? T(P + 'step', { n: step + 1 }) : T('card.ready');
      if (step === 5) return finish();
      const qTitle = L('q' + (step + 1)), qSub = L('q' + (step + 1) + 's');
      let body = '';
      if (simple) {
        if (step === 0) body = kidPick(KIDS.scenes, state.scene, false, 'scene', 'card.k.scene.');
        if (step === 1) body = kidPick(KIDS.stars, state.star, false, 'star', 'card.k.star.');
        if (step === 2) body = kidPick(KIDS.extras, state.extras, true, 'extra', 'card.k.extra.');
      } else {
        if (step === 0) body = designPick(DESIGN.scenes, state.scene, false, 'scene', 'card.m.scene.', 'scene');
        if (step === 1) body = designPick(DESIGN.stars, state.star, false, 'star', 'card.m.hero.', 'hero');
        if (step === 2) body = designPick(DESIGN.extras, state.extras, true, 'extra', 'card.m.extra.', 'extra');
      }
      const styles = simple ? KIDS.styles : DESIGN.styles;
      const styleFont = id => (simple ? (STYLES.find(s => s.id === id) || {}).font : (D_STYLES[id] || {}).font) || 'inherit';
      if (step === 3) body = `
        <div class="chips">${greets().map(k => `<button class="chip ${state.greetKey === k && !state.custom.trim() ? 'on' : ''}" data-greet="${k}">${esc(T(k))}</button>`).join('')}</div>
        ${simple ? '' : `<div class="label clabel2">${L('own')}</div>
          <input class="cinput" id="cCustom" maxlength="40" placeholder="${esc(L('ownPh'))}" value="${esc(state.custom)}">`}
        <div class="label clabel2">${simple ? L('letters') : L('lettering')}</div>
        <div class="chips">${styles.map(id => `<button class="chip ${state.style === id ? 'on' : ''}" data-style="${id}" style="font-family:${styleFont(id).replace(/"/g, '&quot;')}">${esc(T(P + 'style.' + id))}</button>`).join('')}</div>`;
      if (step === 4) body = `
        <label class="clabel">${L('to')}<input class="cinput" id="cTo" maxlength="24" placeholder="${esc(L('toPh'))}" value="${esc(state.to)}"></label>
        <label class="clabel">${L('from')}<input class="cinput" id="cFrom" maxlength="24" placeholder="${esc(L('fromPh'))}" value="${esc(state.from)}"></label>
        <p class="ctip">${L('safe')}</p>`;
      panel.innerHTML = `${dots()}
        <div class="frosty"><div class="face"><img src="spark.png" alt="Spark" class="face-img"></div><div class="bubble ${simple ? 'simple' : ''}"><b>${esc(qTitle)}</b><br>${esc(qSub)}</div></div>
        ${body}
        <div class="row">
          ${step > 0 ? `<button class="btn ghost" id="cPrev">${T('card.prev')}</button>` : ''}
          <button class="btn green ${canNext() ? 'pulse' : ''}" id="cNext" ${canNext() ? '' : 'disabled'}>${step === 4 ? L('finish') : T('card.next')}</button>
          ${simple ? `<button class="btn ghost" id="cRead">${T('btn.read')}</button>` : ''}
        </div>`;
      const refresh = () => { const b = panel.querySelector('#cNext'); b.disabled = !canNext(); b.classList.toggle('pulse', !!canNext()); draw(); };
      panel.querySelectorAll('[data-scene]').forEach(b => b.onclick = () => { state.scene = b.dataset.scene; mark('[data-scene]', b); tap(b); refresh(); });
      panel.querySelectorAll('[data-star]').forEach(b => b.onclick = () => { state.star = b.dataset.star; mark('[data-star]', b); tap(b); refresh(); });
      panel.querySelectorAll('[data-extra]').forEach(b => b.onclick = () => {
        const id = b.dataset.extra, i = state.extras.indexOf(id);
        if (i >= 0) state.extras.splice(i, 1); else state.extras.push(id);
        b.classList.toggle('on', i < 0); tap(b); refresh();
      });
      panel.querySelectorAll('[data-greet]').forEach(b => b.onclick = () => {
        state.greetKey = b.dataset.greet; state.custom = ''; const ci = panel.querySelector('#cCustom'); if (ci) ci.value = '';
        mark('[data-greet]', b); tap(b); refresh();
      });
      panel.querySelectorAll('[data-style]').forEach(b => b.onclick = () => { state.style = b.dataset.style; mark('[data-style]', b); tap(b); refresh(); });
      const ci = panel.querySelector('#cCustom');
      if (ci) ci.oninput = () => { state.custom = ci.value; panel.querySelectorAll('[data-greet]').forEach(x => x.classList.toggle('on', !ci.value.trim() && state.greetKey === x.dataset.greet)); refresh(); };
      const to = panel.querySelector('#cTo'), from = panel.querySelector('#cFrom');
      if (to) { to.oninput = () => { state.to = to.value; draw(); }; from.oninput = () => { state.from = from.value; draw(); }; to.focus({ preventScroll: true }); }
      panel.querySelector('#cNext').onclick = () => { if (!canNext()) return; step++; hooks.sfx && hooks.sfx('good'); show(); };
      const prev = panel.querySelector('#cPrev'); if (prev) prev.onclick = () => { step--; show(); };
      const say = `${qTitle} ${qSub}`;
      const rd = panel.querySelector('#cRead'); if (rd) rd.onclick = () => hooks.speak && hooks.speak(say);
      if (simple && hooks.speak) hooks.speak(say);
    }
    function mark(sel, b) { panel.querySelectorAll(sel).forEach(x => x.classList.toggle('on', x === b)); }
    function tap(b) {
      b.classList.remove('boing'); b.offsetWidth; b.classList.add('boing'); hooks.sfx && hooks.sfx('step');
      if (simple && hooks.burstAt) hooks.burstAt(b, ['✨', '⭐'], 6, 50);          // calmer feedback for older players
    }

    function finish() {
      draw();
      panel.innerHTML = `${dots()}
        <div class="frosty"><div class="face"><img src="spark.png" alt="Spark" class="face-img"></div><div class="bubble good ${simple ? 'simple' : ''}">
          <b>${L('done')}</b><br>${L('doneSub')}
        </div></div>
        <div class="row">
          <button class="btn green pulse" id="cDl">${L('dl')}</button>
          <button class="btn ghost" id="cEdit">${L('edit')}</button>
          <button class="btn ghost" id="cNew">${L('new')}</button>
        </div>
        <p class="ctip">${L('share')}</p>
        <div id="cMsg"></div>`;
      hooks.sfx && hooks.sfx(simple ? 'win' : 'good');
      if (simple) { hooks.confetti && hooks.confetti(); hooks.speak && hooks.speak(`${L('done')} ${L('doneSub')}`, 'happy'); }
      panel.querySelector('#cDl').onclick = download;
      panel.querySelector('#cEdit').onclick = () => { step = 0; show(); };
      panel.querySelector('#cNew').onclick = () => {
        Object.assign(state, { scene: null, star: null, extras: [], greetKey: null, custom: '', to: '', from: '', style: simple ? 'classic' : 'serif' });
        step = 0; show(); draw();
      };
    }

    function download() {
      const msg = panel.querySelector('#cMsg');
      const slug = state.to.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const name = 'christmas-card' + (slug ? '-for-' + slug : '') + '.png';
      const done = () => { msg.innerHTML = `<div class="msg ok">${T('card.saved', { file: esc(name) })}</div>`; hooks.sfx && hooks.sfx('collect'); };
      const save = href => { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
      const fallback = () => { try { save(canvas.toDataURL('image/png')); done(); } catch (e) { msg.innerHTML = `<div class="msg err">${T('card.blocked')}</div>`; } };
      try {
        canvas.toBlob(b => {
          if (!b) return fallback();
          const url = URL.createObjectURL(b); save(url); setTimeout(() => URL.revokeObjectURL(url), 4000); done();
        }, 'image/png');
      } catch (e) { fallback(); }
    }

    show();
  }

  window.CardMaker = { open, render, state, W, H, ready };
})();
