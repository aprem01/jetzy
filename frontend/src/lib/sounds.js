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

// Background music — only plays if the asset exists on the deployment.
// Returns the Audio element so callers can stop/fade it.
let bgEl = null;
export function startBackgroundMusic({ volume = 0.18, src = '/sounds/cinematic-bg.mp3' } = {}) {
  if (typeof window === 'undefined') return null;
  if (bgEl) { try { bgEl.pause(); } catch {} bgEl = null; }
  const a = new Audio(src);
  a.loop = true;
  a.volume = 0;
  a.preload = 'auto';
  bgEl = a;
  // Fade in over 1.2s so the music doesn't smack the viewer in the face.
  a.play().then(() => {
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1200);
      a.volume = p * volume;
      if (p < 1 && bgEl === a) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }).catch(() => {
    // No asset / autoplay blocked — silently no-op.
    bgEl = null;
  });
  return a;
}

export function stopBackgroundMusic({ fadeMs = 800 } = {}) {
  const a = bgEl;
  if (!a) return;
  const startVol = a.volume;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / fadeMs);
    a.volume = startVol * (1 - p);
    if (p < 1) requestAnimationFrame(tick);
    else { try { a.pause(); } catch {} if (bgEl === a) bgEl = null; }
  };
  requestAnimationFrame(tick);
}
