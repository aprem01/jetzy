// Lightweight Web Audio helpers for the Travel Earth demo.
//
// We synthesize the UX sounds in-process so the demo doesn't ship audio
// assets. Whoosh fires when the camera flies between tour stops; chime
// fires when a new itinerary item lands in the cart. Optional background
// music plays from /sounds/cinematic-bg.mp3 if that file exists — we
// silently skip if it doesn't.

let ctxRef = null;
function ctx() {
  if (typeof window === 'undefined') return null;
  if (!ctxRef) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { ctxRef = new C(); } catch { return null; }
  }
  if (ctxRef?.state === 'suspended') {
    try { ctxRef.resume(); } catch {}
  }
  return ctxRef;
}

// Soft jet-stream whoosh — pink noise sweep through a low-pass filter.
export function playWhoosh({ volume = 0.18 } = {}) {
  const c = ctx();
  if (!c) return;
  try {
    const dur = 0.9;
    const t = c.currentTime;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < data.length; i++) {
      // Pink-ish noise via 1-pole IIR low-pass on white noise.
      const white = Math.random() * 2 - 1;
      lastOut = 0.97 * lastOut + 0.03 * white;
      data[i] = lastOut;
    }
    const src = c.createBufferSource();
    src.buffer = buf;

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(2200, t + 0.45);
    filter.frequency.exponentialRampToValueAtTime(400, t + dur);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.15);
    gain.gain.linearRampToValueAtTime(0, t + dur);

    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
    src.stop(t + dur + 0.05);
  } catch {}
}

// Subtle premium chime — two-tone bell when a cart item lands.
export function playChime({ volume = 0.18 } = {}) {
  const c = ctx();
  if (!c) return;
  try {
    const t = c.currentTime;
    const tones = [880, 1320]; // perfect fifth above
    tones.forEach((freq, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = c.createGain();
      const start = t + i * 0.04;
      const dur = 1.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch {}
}

// Procedural cinematic ambient bed — sustained low drone + slow detuned
// arpeggio over a C-minor pad. All synthesized via Web Audio so we don't
// ship an MP3 asset and the music loops indefinitely without an end seam.
// Falls back to /sounds/cinematic-bg.mp3 if you drop a real track in there.

let bgNodes = null;       // { stop: () => void, masterGain }
let bgFile = null;        // optional <audio> element if file-based

function fadeGain(gain, target, ms = 1200) {
  if (!gain) return;
  const ctx = gain.context;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(target, now + ms / 1000);
}

function startProceduralAmbient(volume) {
  const c = ctx();
  if (!c) return null;

  const master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.connect(c.destination);

  // Subtle low-pass + slap-back delay → cinematic, hall-like
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2400;
  lp.Q.value = 0.5;
  lp.connect(master);

  const delay = c.createDelay(1.0);
  delay.delayTime.value = 0.42;
  const fb = c.createGain();
  fb.gain.value = 0.32;
  delay.connect(fb).connect(delay);
  delay.connect(master);

  // Drone bass: detuned sawtooth pair on C2/G2 — body of the track
  const droneGain = c.createGain();
  droneGain.gain.value = 0.18;
  droneGain.connect(lp);
  const droneFreqs = [65.41, 98.00]; // C2, G2
  const droneOscs = droneFreqs.flatMap((f) => {
    const a = c.createOscillator();
    a.type = 'sawtooth'; a.frequency.value = f; a.detune.value = -7;
    const b = c.createOscillator();
    b.type = 'sawtooth'; b.frequency.value = f; b.detune.value = +7;
    a.connect(droneGain); b.connect(droneGain);
    a.start(); b.start();
    return [a, b];
  });

  // Pad chord: triangle waves on Eb4 G4 Bb4 C5 with very slow LFO on filter
  const padGain = c.createGain();
  padGain.gain.value = 0.12;
  const padFilter = c.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 800;
  padFilter.Q.value = 1.2;
  padFilter.connect(padGain).connect(lp);

  const padFreqs = [311.13, 392.00, 466.16, 523.25]; // Eb4 G4 Bb4 C5
  const padOscs = padFreqs.map((f) => {
    const o = c.createOscillator();
    o.type = 'triangle'; o.frequency.value = f;
    o.connect(padFilter);
    o.start();
    return o;
  });

  // Slow filter LFO — gives the pad a "breathing" motion
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.08; // 1 cycle every 12.5s
  const lfoGain = c.createGain();
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain).connect(padFilter.frequency);
  lfo.start();

  // Soft arpeggio: gentle plucks on C5/Eb5/G5 every ~3s, sent through the delay
  const arpGain = c.createGain();
  arpGain.gain.value = 0.0;
  arpGain.connect(delay);
  arpGain.connect(lp);
  const arpFreqs = [523.25, 622.25, 783.99, 622.25]; // C5 Eb5 G5 Eb5
  let arpIdx = 0;
  const arpInterval = setInterval(() => {
    const t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = arpFreqs[arpIdx % arpFreqs.length];
    arpIdx += 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.10, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    o.connect(g).connect(arpGain);
    o.start(t);
    o.stop(t + 2.5);
  }, 3000);

  // Fade in
  fadeGain(master, volume, 1500);

  return {
    masterGain: master,
    stop: (fadeMs = 1500) => {
      try { clearInterval(arpInterval); } catch {}
      fadeGain(master, 0, fadeMs);
      setTimeout(() => {
        try {
          [...droneOscs, ...padOscs, lfo].forEach((o) => o.stop());
          master.disconnect();
        } catch {}
      }, fadeMs + 100);
    },
  };
}

export function startBackgroundMusic({ volume = 0.16, src = '/sounds/cinematic-bg.mp3' } = {}) {
  if (typeof window === 'undefined') return null;
  // If a real music file exists, prefer it. Otherwise use procedural synth.
  if (bgFile) { try { bgFile.pause(); } catch {} bgFile = null; }
  if (bgNodes) { try { bgNodes.stop(0); } catch {} bgNodes = null; }

  // Try file-based first (1-shot, no retry on failure).
  const a = new Audio(src);
  a.loop = true;
  a.volume = 0;
  a.preload = 'auto';
  a.play().then(() => {
    bgFile = a;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1200);
      a.volume = p * volume;
      if (p < 1 && bgFile === a) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }).catch(() => {
    // No file — fall back to procedural ambient.
    bgNodes = startProceduralAmbient(volume);
  });
}

export function stopBackgroundMusic({ fadeMs = 1200 } = {}) {
  if (bgFile) {
    const a = bgFile;
    const startVol = a.volume;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / fadeMs);
      a.volume = startVol * (1 - p);
      if (p < 1) requestAnimationFrame(tick);
      else { try { a.pause(); } catch {} if (bgFile === a) bgFile = null; }
    };
    requestAnimationFrame(tick);
  }
  if (bgNodes) {
    bgNodes.stop(fadeMs);
    bgNodes = null;
  }
}
