/* Spark's Holiday Card Maker — bonus feature.
   5 guided questions → festive card drawn on a <canvas> → download as PNG.
   The Spark + AIKids logo watermark is ALWAYS drawn last, bottom-right, and cannot be turned off. */
(() => {
  const W = 1200, H = 1600;                       // portrait card (3:4), crisp for printing
  const A = window.CARD_ASSETS || {};
  const img = {};
  const ready = Promise.all(['logo', 'spark'].map(k => new Promise(res => {
    const i = new Image(); i.onload = () => res(); i.onerror = () => res(); i.src = A[k] || ''; img[k] = i;
  })));

  /* ---------------- the 5 questions ---------------- */
  const SCENES = [
    { id: 'night', emoji: '🌙', label: 'Snowy night', simple: 'Snowy night' },
    { id: 'aurora', emoji: '🌌', label: 'Northern lights', simple: 'Magic lights' },
    { id: 'fireside', emoji: '🔥', label: 'Cosy fireplace', simple: 'Cosy fire' },
    { id: 'candy', emoji: '🍭', label: 'Candy cane land', simple: 'Candy land' },
  ];
  const STARS = [
    { id: 'tree', emoji: '🎄', label: 'Christmas tree' },
    { id: 'snowman', emoji: '⛄', label: 'Snowman' },
    { id: 'reindeer', emoji: '🦌', label: 'Reindeer' },
    { id: 'santa', emoji: '🎅', label: 'Santa' },
    { id: 'gift', emoji: '🎁', label: 'Big present' },
    { id: 'spark', emoji: '<img src="spark.png" alt="" class="ce-img">', label: 'Spark', html: true },
  ];
  const EXTRAS = [
    { id: 'snow', emoji: '❄️', label: 'Snowflakes' },
    { id: 'stars', emoji: '⭐', label: 'Stars' },
    { id: 'lights', emoji: '💡', label: 'Fairy lights' },
    { id: 'gifts', emoji: '🎁', label: 'Presents' },
    { id: 'baubles', emoji: '🔴', label: 'Baubles' },
    { id: 'holly', emoji: '🌿', label: 'Holly' },
  ];
  const GREETINGS = [
    'Merry Christmas!', 'Happy Holidays!', 'Season\'s Greetings!', 'Let It Snow!', 'Ho Ho Ho!', 'Joy to the World!',
  ];
  const STYLES = [
    { id: 'classic', label: 'Classic', font: 'Georgia, "Times New Roman", serif', color: '#ffffff', glow: '#ffd23f' },
    { id: 'bubbly', label: 'Bubbly', font: '"Trebuchet MS", "Nunito", system-ui, sans-serif', color: '#ffe066', glow: '#ff4d8d' },
    { id: 'gold', label: 'Golden', font: 'Georgia, serif', color: '#ffd166', glow: '#ffffff' },
    { id: 'candy', label: 'Candy', font: '"Trebuchet MS", system-ui, sans-serif', color: '#ffffff', glow: '#e63946', stripe: true },
  ];

  const state = { scene: null, star: null, extras: [], greeting: null, custom: '', to: '', from: '', style: 'classic', seed: 7 };

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
    const text = (state.custom.trim() || state.greeting || '').slice(0, 40);
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
      c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = `900 ${size}px ${st.font}`;
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
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(-0.03); c.translate(-(x + w / 2), -(y + h / 2));
    c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8;
    c.fillStyle = '#fffdf4'; rr(c, x, y, w, h, 22); c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = '#e63946'; c.lineWidth = 6; c.setLineDash([18, 12]); rr(c, x + 12, y + 12, w - 24, h - 24, 14); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#10213f'; c.textBaseline = 'middle'; c.font = '700 52px "Trebuchet MS", system-ui, sans-serif';
    let ly = y + (to && from ? 68 : h / 2);
    if (to) { c.fillText('To: ' + to, x + 40, ly, w - 80); ly += 72; }
    if (from) c.fillText('From: ' + from, x + 40, ly, w - 80);
    c.restore();
  }

  /* ---------------- watermark (always on, always last) ---------------- */
  function drawWatermark(c) {
    const pad = 36, lw = 330, lh = img.logo.width ? lw * img.logo.height / img.logo.width : 150;
    const bw = lw + 50, bh = lh + 70, bx = W - bw - pad, by = H - bh - pad;
    c.save();
    c.globalAlpha = 0.9; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 18;
    c.fillStyle = '#ffffff'; rr(c, bx, by, bw, bh, 28); c.fill();
    c.shadowColor = 'transparent'; c.globalAlpha = 1;
    if (img.logo.width) c.drawImage(img.logo, bx + 25, by + 18, lw, lh);
    else { c.fillStyle = '#1565d8'; c.font = '900 80px system-ui'; c.textAlign = 'center'; c.fillText('AIKids', bx + bw / 2, by + bh / 2); }
    c.fillStyle = '#3b5784'; c.font = '700 26px "Trebuchet MS", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('Made with Spark ✨', bx + bw / 2, by + bh - 28);
    c.restore();
  }

  function render(c) {
    seed(state.seed);
    c.clearRect(0, 0, W, H);
    drawScene(c, state.scene || 'night');
    drawExtras(c, state.extras.filter(e => e !== 'snow'));
    if (state.star) drawStar(c, state.star);
    if (state.extras.includes('snow')) drawExtras(c, ['snow']);
    drawGreeting(c);
    drawNote(c);
    // white card border
    c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 18; rr(c, 9, 9, W - 18, H - 18, 40); c.stroke(); c.restore();
    drawWatermark(c);
  }

  /* ================= UI ================= */
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function open(screen, opts = {}) {
    const simple = !!opts.simple;
    const hooks = opts.hooks || {};
    let step = 0;
    const Q = [
      { title: simple ? 'Where is your card?' : 'Question 1: Where is your card set?', sub: simple ? 'Tap a picture.' : 'Pick a festive scene for the background.',
        speak: 'Where is your card? Tap a picture.' },
      { title: simple ? 'Who is on your card?' : 'Question 2: Who is the star of your card?', sub: simple ? 'Tap one.' : 'Choose the main character.',
        speak: 'Who is on your card? Tap one.' },
      { title: simple ? 'Add some sparkle!' : 'Question 3: What decorations shall we add?', sub: simple ? 'Tap as many as you like!' : 'Pick as many as you like.',
        speak: 'Add some sparkle! Tap as many as you like.' },
      { title: simple ? 'What should it say?' : 'Question 4: What should your card say?', sub: simple ? 'Tap a message.' : 'Pick a greeting, or write your own — then choose a lettering style.',
        speak: 'What should your card say? Tap a message.' },
      { title: simple ? 'Who is it for?' : 'Question 5: Who is your card for?', sub: simple ? 'Type their name. A grown-up can help! (You can skip this.)' : 'Add who it\'s to and from. Use first names only — it\'s safer online!',
        speak: 'Who is the card for? Type their name. A grown-up can help.' },
    ];

    screen.innerHTML = `
      <div class="hud">
        <button class="pill" id="cBack">⬅ Back</button>
        <span class="pill">🎨 Holiday Card Maker</span>
        <span class="pill" id="cStep"></span>
      </div>
      <div class="play card-maker">
        <div class="card-preview">
          <canvas id="cardCanvas" width="${W}" height="${H}" aria-label="Your holiday card preview"></canvas>
          <button class="pill shuffle" id="cShuffle" title="Move the sparkles around">🔀 ${simple ? 'Mix up' : 'Shuffle sparkles'}</button>
        </div>
        <div class="card panel" id="cPanel"></div>
      </div>`;
    const canvas = screen.querySelector('#cardCanvas'), ctx = canvas.getContext('2d');
    const panel = screen.querySelector('#cPanel');
    screen.querySelector('#cBack').onclick = () => hooks.home && hooks.home();
    const draw = () => render(ctx);
    screen.querySelector('#cShuffle').onclick = () => { state.seed = Math.floor(Math.random() * 1e6); draw(); hooks.sfx && hooks.sfx('step'); };
    ready.then(draw);

    const dots = () => `<div class="qdots">${Q.map((_, i) => `<span class="${i < step ? 'done' : i === step ? 'now' : ''}">${i < step ? '✓' : i + 1}</span>`).join('')}</div>`;
    const picks = (items, sel, multi, attr) => `<div class="cgrid">${items.map(it => `
      <button class="cpick pop-in ${multi ? (sel.includes(it.id) ? 'on' : '') : sel === it.id ? 'on' : ''}" data-${attr}="${it.id}">
        <span class="ce">${it.html ? it.emoji : esc(it.emoji)}</span><span>${esc(simple && it.simple ? it.simple : it.label)}</span></button>`).join('')}</div>`;
    const canNext = () => [state.scene, state.star, true, state.greeting || state.custom.trim(), true][step];

    function show() {
      screen.querySelector('#cStep').textContent = step < 5 ? `${simple ? 'Step' : 'Question'} ${step + 1} of 5` : '🎉 Ready!';
      if (step === 5) return finish();
      const q = Q[step];
      let body = '';
      if (step === 0) body = picks(SCENES, state.scene, false, 'scene');
      if (step === 1) body = picks(STARS, state.star, false, 'star');
      if (step === 2) body = picks(EXTRAS, state.extras, true, 'extra');
      if (step === 3) body = `
        <div class="chips">${GREETINGS.map(g => `<button class="chip ${state.greeting === g && !state.custom.trim() ? 'on' : ''}" data-greet="${esc(g)}">${esc(g)}</button>`).join('')}</div>
        ${simple ? '' : `<div class="label" style="margin-top:14px;font-weight:800;color:#3b5784">…or write your own (max 40 letters):</div>
          <input class="cinput" id="cCustom" maxlength="40" placeholder="e.g. Have a sparkly Christmas!" value="${esc(state.custom)}">`}
        <div class="label" style="margin-top:14px;font-weight:800;color:#3b5784">${simple ? 'Pick your letters:' : 'Lettering style:'}</div>
        <div class="chips">${STYLES.map(s => `<button class="chip ${state.style === s.id ? 'on' : ''}" data-style="${s.id}" style="font-family:${s.font.replace(/"/g, '&quot;')}">${s.label}</button>`).join('')}</div>`;
      if (step === 4) body = `
        <label class="clabel">${simple ? 'To:' : 'To (who is it for?)'}<input class="cinput" id="cTo" maxlength="24" placeholder="${simple ? 'Grandma' : 'e.g. Grandma'}" value="${esc(state.to)}"></label>
        <label class="clabel">${simple ? 'From:' : 'From (your first name)'}<input class="cinput" id="cFrom" maxlength="24" placeholder="${simple ? 'Your name' : 'e.g. Sam'}" value="${esc(state.from)}"></label>
        <p class="ctip">🛡️ ${simple ? 'Only use first names.' : 'Tip: use first names only — never put your address or school on things you share.'}</p>`;
      panel.innerHTML = `${dots()}
        <div class="frosty"><div class="face"><img src="spark.png" alt="Spark" class="face-img"></div><div class="bubble ${simple ? 'simple' : ''}"><b>${esc(q.title)}</b><br>${esc(q.sub)}</div></div>
        ${body}
        <div class="row">
          ${step > 0 ? `<button class="btn ghost" id="cPrev">⬅ Back</button>` : ''}
          <button class="btn green ${canNext() ? 'pulse' : ''}" id="cNext" ${canNext() ? '' : 'disabled'}>${step === 4 ? (simple ? 'Make my card! 🎉' : 'Finish my card! 🎉') : 'Next ➡'}</button>
          ${simple ? '<button class="btn ghost" id="cRead">🔈 Read to me</button>' : ''}
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
        state.greeting = b.dataset.greet; state.custom = ''; const ci = panel.querySelector('#cCustom'); if (ci) ci.value = '';
        mark('[data-greet]', b); tap(b); refresh();
      });
      panel.querySelectorAll('[data-style]').forEach(b => b.onclick = () => { state.style = b.dataset.style; mark('[data-style]', b); tap(b); refresh(); });
      const ci = panel.querySelector('#cCustom');
      if (ci) ci.oninput = () => { state.custom = ci.value; panel.querySelectorAll('[data-greet]').forEach(x => x.classList.toggle('on', !ci.value.trim() && state.greeting === x.dataset.greet)); refresh(); };
      const to = panel.querySelector('#cTo'), from = panel.querySelector('#cFrom');
      if (to) { to.oninput = () => { state.to = to.value; draw(); }; from.oninput = () => { state.from = from.value; draw(); }; to.focus({ preventScroll: true }); }
      panel.querySelector('#cNext').onclick = () => { if (!canNext()) return; step++; hooks.sfx && hooks.sfx('good'); show(); };
      const prev = panel.querySelector('#cPrev'); if (prev) prev.onclick = () => { step--; show(); };
      const rd = panel.querySelector('#cRead'); if (rd) rd.onclick = () => hooks.speak && hooks.speak(q.speak);
      if (simple && hooks.speak) hooks.speak(q.speak);
    }
    function mark(sel, b) { panel.querySelectorAll(sel).forEach(x => x.classList.toggle('on', x === b)); }
    function tap(b) { b.classList.remove('boing'); b.offsetWidth; b.classList.add('boing'); hooks.sfx && hooks.sfx('step'); hooks.burstAt && hooks.burstAt(b, ['✨', '⭐'], 6, 50); }

    function finish() {
      draw();
      panel.innerHTML = `${dots()}
        <div class="frosty"><div class="face"><img src="spark.png" alt="Spark" class="face-img"></div><div class="bubble good ${simple ? 'simple' : ''}">
          <b>${simple ? 'Wow! Your card is ready! 🎉' : 'Your card is ready! 🎉'}</b><br>
          ${simple ? 'Tap the big button to save it.' : 'Download it as a picture to print, or to send to family (ask a grown-up first!).'}
        </div></div>
        <div class="row">
          <button class="btn green pulse" id="cDl">⬇️ ${simple ? 'Save my card' : 'Download PNG'}</button>
          <button class="btn ghost" id="cEdit">✏️ ${simple ? 'Change it' : 'Edit card'}</button>
          <button class="btn ghost" id="cNew">🆕 ${simple ? 'New card' : 'Start a new card'}</button>
        </div>
        <p class="ctip">👨‍👩‍👧 ${simple ? 'Ask a grown-up before you send it to anyone.' : 'Always check with a grown-up before sharing pictures online.'}</p>
        <div id="cMsg"></div>`;
      hooks.sfx && hooks.sfx('win'); hooks.confetti && hooks.confetti();
      if (simple && hooks.speak) hooks.speak('Wow! Your card is ready! Tap the big button to save it.');
      panel.querySelector('#cDl').onclick = download;
      panel.querySelector('#cEdit').onclick = () => { step = 0; show(); };
      panel.querySelector('#cNew').onclick = () => {
        Object.assign(state, { scene: null, star: null, extras: [], greeting: null, custom: '', to: '', from: '', style: 'classic' });
        step = 0; show(); draw();
      };
    }

    function download() {
      const msg = panel.querySelector('#cMsg');
      const name = 'christmas-card' + (state.to.trim() ? '-for-' + state.to.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '') + '.png';
      const fallback = () => {
        try {
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
          done();
        } catch (e) { msg.innerHTML = '<div class="msg err">Sorry — this browser blocked the download. Try right-clicking the card and choosing “Save image as…”.</div>'; }
      };
      const done = () => { msg.innerHTML = `<div class="msg ok">✅ Saved! Look for <b>${esc(name)}</b> in your Downloads.</div>`; hooks.sfx && hooks.sfx('collect'); };
      try {
        canvas.toBlob(b => {
          if (!b) return fallback();
          const url = URL.createObjectURL(b), a = document.createElement('a');
          a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000); done();
        }, 'image/png');
      } catch (e) { fallback(); }
    }

    show();
  }

  window.CardMaker = { open, render, state, W, H, ready };
})();
