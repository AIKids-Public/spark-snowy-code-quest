/* "Snowfall Lullaby" — an original, calm holiday waltz for Spark's Snowy Code Quest.
   Generated live with the Web Audio API (no audio files, no copyright worries):
   soft pad chords + gentle bass + a music-box melody + the odd sleigh-bell shimmer, through a warm reverb.
   window.SparkMusic = { toggle(), start(), stop(), isOn(), duck(bool) } */
(() => {
  const BPM = 72, BEAT = 60 / BPM, BAR = BEAT * 3;          // 3/4 waltz, ~2.5 s per bar
  const VOLUME = 0.55;                                      // master level when playing
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  // 16-bar loop (~40 s). Chords: [bass, ...pad notes]
  const CH = {
    C: [48, 60, 64, 67], Am: [45, 57, 60, 64], F: [41, 57, 60, 65], G: [43, 55, 59, 62], Em: [40, 55, 59, 64],
  };
  const SONG = [
    ['C', [[76, 2], [67, 1]]],
    ['Am', [[69, 1], [72, 1], [76, 1]]],
    ['F', [[74, 2], [72, 1]]],
    ['G', [[71, 3]]],
    ['C', [[76, 2], [79, 1]]],
    ['Em', [[71, 1], [76, 2]]],
    ['F', [[74, 1], [72, 1], [69, 1]]],
    ['G', [[67, 3]]],
    ['Am', [[72, 2], [76, 1]]],
    ['F', [[77, 1], [76, 1], [74, 1]]],
    ['C', [[76, 2], [72, 1]]],
    ['G', [[74, 3]]],
    ['F', [[69, 1], [72, 1], [77, 1]]],
    ['G', [[76, 1], [74, 1], [71, 1]]],
    ['C', [[72, 3]]],
    ['C', [[null, 3]]],                                     // breathing bar with a sparkle
  ];

  /* ---------- instruments (all schedule into ctx at time t, output to `out`) ---------- */
  function musicBox(ctx, out, midi, t, len, vol = 0.16) {
    const f = mtof(midi), g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + Math.max(1.6, len * 1.4));
    g.connect(out);
    [[1, 1], [2, 0.18], [3.01, 0.05]].forEach(([mult, amp]) => {   // bell-like partials
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * mult; og.gain.value = amp;
      o.connect(og).connect(g); o.start(t); o.stop(t + Math.max(1.7, len * 1.5));
    });
  }
  function pad(ctx, out, notes, t, len, vol = 0.035) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + len * 0.35);
    g.gain.setValueAtTime(vol, t + len * 0.75); g.gain.linearRampToValueAtTime(0, t + len + 0.6);
    lp.connect(g).connect(out);
    notes.forEach(m => [-5, 5].forEach(det => {                     // two gently detuned voices per note
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m); o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + len + 0.7);
    }));
  }
  function bass(ctx, out, midi, t, vol = 0.09) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + BAR * 0.95);
    o.connect(g).connect(out); o.start(t); o.stop(t + BAR);
  }
  let noiseBuf = null;
  function shimmer(ctx, out, t, vol = 0.012) {                       // tiny sleigh-bell sparkle
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    for (let k = 0; k < 3; k++) {
      const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain(), tt = t + k * 0.09;
      s.buffer = noiseBuf; hp.type = 'bandpass'; hp.frequency.value = 7000 + k * 900; hp.Q.value = 6;
      g.gain.setValueAtTime(vol, tt); g.gain.exponentialRampToValueAtTime(0.0005, tt + 0.25);
      s.connect(hp).connect(g).connect(out); s.start(tt); s.stop(tt + 0.3);
    }
  }
  function makeReverb(ctx) {
    const len = ctx.sampleRate * 3, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    const cv = ctx.createConvolver(); cv.buffer = ir; return cv;
  }

  /* Schedule one bar of the song. Exposed for testing with an OfflineAudioContext. */
  function scheduleBar(ctx, out, barIndex, t) {
    const [chord, melody] = SONG[barIndex % SONG.length], c = CH[chord];
    bass(ctx, out, c[0], t);
    pad(ctx, out, c.slice(1), t, BAR);
    musicBox(ctx, out, c[1] - 12 + 12, t + BEAT, BEAT, 0.035);       // soft waltz "oom-pah-pah" plucks
    musicBox(ctx, out, c[2], t + BEAT * 2, BEAT, 0.03);
    let beat = 0;
    for (const [m, len] of melody) {
      if (m != null) musicBox(ctx, out, m, t + beat * BEAT, len * BEAT);
      beat += len;
    }
    if (barIndex % SONG.length === 15) { [84, 88, 91, 96].forEach((m, i) => musicBox(ctx, out, m, t + i * 0.32, 0.5, 0.05)); shimmer(ctx, out, t + 1.4); }
    else if (barIndex % 4 === 3) shimmer(ctx, out, t + BEAT * 2.5);
  }
  function buildChain(ctx, dest) {
    const input = ctx.createGain(), dry = ctx.createGain(), wet = ctx.createGain(), rv = makeReverb(ctx);
    const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 6500;
    dry.gain.value = 0.75; wet.gain.value = 0.45;
    input.connect(dry).connect(warm); input.connect(rv).connect(wet).connect(warm); warm.connect(dest);
    return input;
  }

  /* ---------- real-time player ---------- */
  const PREF = 'sparkMusic.on';
  let ctx = null, master = null, input = null, timer = null, nextBar = 0, nextTime = 0, on = false, ducked = false;

  function ensureCtx() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    input = buildChain(ctx, master);
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
    });
    return true;
  }
  function tick() {
    while (nextTime < ctx.currentTime + 1.2) { scheduleBar(ctx, input, nextBar++, nextTime); nextTime += BAR; }
  }
  function level() { return ducked ? VOLUME * 0.3 : VOLUME; }
  function start() {
    if (!ensureCtx()) return;
    ctx.resume();
    on = true; save();
    if (!timer) { nextBar = 0; nextTime = ctx.currentTime + 0.15; tick(); timer = setInterval(tick, 300); }
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(level(), ctx.currentTime, 0.8);       // slow, gentle fade-in
    render();
  }
  function stop() {
    on = false; save(); render();
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
    const c = ctx;
    setTimeout(() => { if (!on) { clearInterval(timer); timer = null; c.suspend(); } }, 1800);
  }
  function duck(d) {                                                  // softly lower music while the voice talks
    ducked = d; if (!on || !ctx) return;
    master.gain.setTargetAtTime(level(), ctx.currentTime, d ? 0.15 : 0.6);
  }
  function save() { try { localStorage.setItem(PREF, on ? '1' : '0'); } catch (e) { /* ignore */ } }
  function render() {
    const b = document.getElementById('musicBtn'); if (!b) return;
    b.textContent = on ? '🎵 Music on' : '🎵 Music off';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.classList.toggle('on', on);
  }
  const toggle = () => (on ? stop() : start());

  // Browsers only allow audio after a tap/click, so if music was left on last time, start it on the first tap.
  let wanted = false; try { wanted = localStorage.getItem(PREF) === '1'; } catch (e) { /* ignore */ }
  if (wanted) {
    const kick = e => { if (e.target && e.target.id === 'musicBtn') return; removeEventListener('pointerdown', kick, true); removeEventListener('keydown', kick, true); if (!on) start(); };
    addEventListener('pointerdown', kick, true); addEventListener('keydown', kick, true);
  }
  document.addEventListener('DOMContentLoaded', render);

  window.SparkMusic = { start, stop, toggle, duck, isOn: () => on, scheduleBar, buildChain, BAR, BARS: SONG.length };
})();
