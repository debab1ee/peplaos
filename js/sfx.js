/* =========================================================
   PeplaOS sound effects — synthesized with WebAudio
   (no files needed). SFX.play("open") etc.
   ========================================================= */
(() => {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem("pepla-muted") === "1"; } catch {}

  const ac = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  // one oscillator "blip"
  function tone({ f = 440, f2 = null, t = 0.12, type = "sine", vol = 0.15, delay = 0, attack = 0.005 }) {
    const c = ac(), now = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    o.connect(g).connect(c.destination);
    o.start(now);
    o.stop(now + t + 0.02);
  }

  // filtered noise burst (whooshes, poofs)
  function noise({ t = 0.25, vol = 0.12, from = 800, to = 3000, delay = 0, q = 1 }) {
    const c = ac(), now = c.currentTime + delay;
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * t), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = q;
    bp.frequency.setValueAtTime(from, now);
    bp.frequency.exponentialRampToValueAtTime(to, now + t);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + t * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(now);
  }

  const sounds = {
    click:   () => tone({ f: 1800, t: 0.03, type: "square", vol: 0.04 }),
    open:    () => { tone({ f: 520, f2: 880, t: 0.12, type: "triangle", vol: 0.12 }); tone({ f: 1320, t: 0.08, vol: 0.05, delay: 0.06 }); },
    close:   () => tone({ f: 700, f2: 300, t: 0.12, type: "triangle", vol: 0.1 }),
    minimize:() => noise({ t: 0.25, vol: 0.08, from: 3000, to: 500 }),
    notify:  () => { tone({ f: 988, t: 0.18, vol: 0.12 }); tone({ f: 1319, t: 0.3, vol: 0.12, delay: 0.1 }); },
    error:   () => { tone({ f: 180, t: 0.18, type: "square", vol: 0.08 }); tone({ f: 140, t: 0.25, type: "square", vol: 0.08, delay: 0.12 }); },
    pop:     () => tone({ f: 600, f2: 1200, t: 0.07, type: "sine", vol: 0.12 }),
    send:    () => noise({ t: 0.2, vol: 0.08, from: 600, to: 4000, q: 2 }),
    key:     () => tone({ f: 2400 + Math.random() * 600, t: 0.015, type: "square", vol: 0.02 }),
    boop:    () => tone({ f: 330, f2: 220, t: 0.15, type: "sine", vol: 0.15 }),
    swap:    () => { tone({ f: 400, f2: 900, t: 0.08, type: "sawtooth", vol: 0.05 }); },
    pour:    () => { for (let i = 0; i < 7; i++) tone({ f: 500 + i * 90, t: 0.06, vol: 0.06, delay: i * 0.06, type: "sine" }); },
    blow:    () => noise({ t: 0.35, vol: 0.12, from: 400, to: 1200, q: 0.5 }),
    magic:   () => [880, 1109, 1319, 1760, 2217].forEach((f, i) => tone({ f, t: 0.25, vol: 0.06, delay: i * 0.07 })),
    seal:    () => { tone({ f: 300, f2: 500, t: 0.12, type: "sawtooth", vol: 0.07 }); tone({ f: 300, f2: 520, t: 0.14, type: "sawtooth", vol: 0.07, delay: 0.18 }); },
    unlock:  () => [523, 659, 784, 1047].forEach((f, i) => tone({ f, t: 0.2, type: "triangle", vol: 0.1, delay: i * 0.09 })),
    party:   () => {
      noise({ t: 0.15, vol: 0.2, from: 2000, to: 800 });
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone({ f, t: 0.18, type: "square", vol: 0.05, delay: 0.12 + i * 0.1 }));
    },
  };

  window.SFX = {
    play(name) {
      if (muted || !sounds[name]) return;
      try { sounds[name](); } catch {}
    },
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      try { localStorage.setItem("pepla-muted", muted ? "1" : "0"); } catch {}
      return muted;
    },
  };
})();
