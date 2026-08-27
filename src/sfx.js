// ============================================================
// sfx.js — 効果音をWebAudioで合成(音声ファイル不要)。BGMのみ外部mp3。
// ============================================================
const SFX = {
  ctx: null, master: null,
  ac() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.28; this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  // 単音: 周波数f0→f1へスライド、指定の波形とエンベロープで鳴らす
  tone({ f0, f1, type = 'square', t = 0, dur = 0.12, vol = 0.5, decay = null, detune = 0 }) {
    const c = this.ac(); if (!c) return;
    const now = c.currentTime + t;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.detune.value = detune;
    o.frequency.setValueAtTime(f0, now);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + (decay || dur));
    o.connect(g); g.connect(this.master);
    o.start(now); o.stop(now + (decay || dur) + 0.05);
  },
  // ノイズ: 打撃音・ざらつき用
  noise({ t = 0, dur = 0.15, vol = 0.4, f = 1200, q = 1, type = 'bandpass', sweepTo = null }) {
    const c = this.ac(); if (!c) return;
    const now = c.currentTime + t;
    const len = Math.ceil(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.setValueAtTime(f, now); flt.Q.value = q;
    if (sweepTo) flt.frequency.exponentialRampToValueAtTime(sweepTo, now + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(flt); flt.connect(g); g.connect(this.master);
    src.start(now); src.stop(now + dur + 0.02);
  },

  // ---- 各SE ----
  click() { this.tone({ f0: 880, f1: 660, type: 'square', dur: 0.05, vol: 0.2 }); },
  alert() { // 予告・段階悪化: 不安げな二音の繰り返し
    [0, 0.22].forEach(t => {
      this.tone({ f0: 622, type: 'square', t, dur: 0.13, vol: 0.34 });
      this.tone({ f0: 466, type: 'square', t: t + 0.11, dur: 0.16, vol: 0.3 });
      this.tone({ f0: 233, type: 'triangle', t, dur: 0.3, vol: 0.16 });
    });
  },
  hit() { // 打撃: 低い衝撃 + ノイズ
    this.noise({ dur: 0.14, vol: 0.42, f: 2400, sweepTo: 400, type: 'lowpass' });
    this.tone({ f0: 180, f1: 55, type: 'triangle', dur: 0.16, vol: 0.5 });
    this.tone({ f0: 90, f1: 40, type: 'sine', dur: 0.22, vol: 0.35 });
  },
  coin() { // 収入: 明るい二音
    this.tone({ f0: 1318, type: 'square', dur: 0.07, vol: 0.28 });
    this.tone({ f0: 1975, type: 'square', t: 0.07, dur: 0.2, vol: 0.26 });
    this.tone({ f0: 2637, type: 'sine', t: 0.07, dur: 0.22, vol: 0.1 });
  },
  summon() { // 召喚: 上昇スイープ + 到達音
    this.tone({ f0: 110, f1: 880, type: 'sawtooth', dur: 0.5, vol: 0.2 });
    this.noise({ dur: 0.5, vol: 0.16, f: 300, sweepTo: 4000, type: 'bandpass', q: 2 });
    [0, 4, 7, 12].forEach((s, i) => this.tone({ f0: 440 * Math.pow(2, s / 12), type: 'triangle', t: 0.46 + i * 0.02, dur: 0.4, vol: 0.16 }));
  },
  quit() { // 離職: 下降する短調
    this.tone({ f0: 587, type: 'triangle', dur: 0.18, vol: 0.3 });
    this.tone({ f0: 494, type: 'triangle', t: 0.16, dur: 0.2, vol: 0.28 });
    this.tone({ f0: 392, type: 'triangle', t: 0.34, dur: 0.5, vol: 0.26 });
    this.tone({ f0: 196, type: 'sine', t: 0.34, dur: 0.6, vol: 0.18 });
  },
  levelup() { // 研修修了・回復: 上昇アルペジオ
    [523, 659, 784, 1046].forEach((f, i) => {
      this.tone({ f0: f, type: 'square', t: i * 0.075, dur: 0.14, vol: 0.24 });
      this.tone({ f0: f * 2, type: 'sine', t: i * 0.075, dur: 0.16, vol: 0.08 });
    });
  },
};
// 最初のユーザー操作でAudioContextを起こす(ブラウザの自動再生制限対策)
window.addEventListener('pointerdown', () => SFX.ac(), { once: true });
