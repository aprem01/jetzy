/**
 * ElevenLabs voice mapping + audio playback helper.
 * All voice IDs verified working on the free tier.
 */

// All voices use eleven_multilingual_v2 for more natural human sound
// Settings tuned for warmth, conversational delivery (lower stability =
// more emotion, higher similarity = closer to original voice).

export const VOICE_MARCO = {
  id: 'pqHfZKP75CvOlQylNhV4', // Bill — trustworthy, narrative, natural-sounding
  name: 'Bill',
  // Higher stability + lower style = less synthetic, more grounded delivery
  settings: { stability: 0.55, similarity: 0.85, style: 0.25, speakerBoost: true },
};

export const VOICE_AVATAR_DEFAULT = {
  id: 'EXAVITQu4vr4xnSDxMaL', // Sarah — warm American female
  name: 'Sarah',
  settings: { stability: 0.4, similarity: 0.88, style: 0.45, speakerBoost: true },
};

export const VOICES = {
  marco: VOICE_MARCO,
  default: VOICE_AVATAR_DEFAULT,
  india: {
    id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda',
    settings: { stability: 0.45, similarity: 0.88, style: 0.5, speakerBoost: true },
  },
  pakistan: {
    id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda',
    settings: { stability: 0.45, similarity: 0.88, style: 0.45, speakerBoost: true },
  },
  latam: {
    id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica',
    settings: { stability: 0.4, similarity: 0.88, style: 0.55, speakerBoost: true },
  },
  east_asia: {
    id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily',
    settings: { stability: 0.55, similarity: 0.85, style: 0.3, speakerBoost: true },
  },
  southeast_asia: {
    id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily',
    settings: { stability: 0.5, similarity: 0.85, style: 0.4, speakerBoost: true },
  },
  africa: {
    id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica',
    settings: { stability: 0.45, similarity: 0.88, style: 0.4, speakerBoost: true },
  },
  middle_east: {
    id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura',
    settings: { stability: 0.45, similarity: 0.88, style: 0.45, speakerBoost: true },
  },
  europe: {
    id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura',
    settings: { stability: 0.45, similarity: 0.88, style: 0.4, speakerBoost: true },
  },
  oceania: {
    id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie',
    settings: { stability: 0.45, similarity: 0.85, style: 0.4, speakerBoost: true },
  },
  north_america: {
    id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',
    settings: { stability: 0.4, similarity: 0.88, style: 0.45, speakerBoost: true },
  },
};

export function voiceForPersona(personaId) {
  return VOICES[personaId] || VOICES.default;
}

// === Audio playback ===
// iOS Safari requires audio to be initiated within a user gesture handler.
// We keep ONE persistent Audio element that gets unlocked on the user's
// first tap, then reuse it for all subsequent playback. Once unlocked,
// iOS allows updating the src and replaying.
const audioCache = new Map();
let persistentAudio = null;
let audioUnlocked = false;

// 0.05s of silent MP3, base64 encoded
const SILENT_MP3 = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN';

/**
 * MUST be called synchronously inside a user gesture (button click).
 * Creates and primes the persistent audio element so iOS allows future
 * programmatic playback in the same session.
 */
export function unlockAudio() {
  if (audioUnlocked) return;
  try {
    if (!persistentAudio) {
      persistentAudio = new Audio();
      persistentAudio.setAttribute('playsinline', 'true');
      persistentAudio.setAttribute('webkit-playsinline', 'true');
    }
    persistentAudio.src = SILENT_MP3;
    persistentAudio.muted = false;
    persistentAudio.volume = 1.0;
    const playPromise = persistentAudio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => { audioUnlocked = true; }).catch(() => {});
    } else {
      audioUnlocked = true;
    }

    // Also unlock SpeechSynthesis (Safari needs a synthesis call inside gesture)
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {
    console.warn('Audio unlock failed:', e);
  }
}

export async function playEleven({ text, voiceId, settings, onStart, onEnd, audioRef }) {
  if (!text || !voiceId) {
    onEnd?.();
    return;
  }

  const cacheKey = `${voiceId}:${text}`;
  let url = audioCache.get(cacheKey);

  if (!url) {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, ...(settings || {}) }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`TTS ${res.status}: ${txt.slice(0, 200)}`);
      }
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      audioCache.set(cacheKey, url);
    } catch (e) {
      console.error('ElevenLabs TTS failed, falling back:', e);
      onEnd?.();
      throw e;
    }
  }

  return new Promise((resolve) => {
    // Reuse the persistent audio element so iOS allows playback
    if (!persistentAudio) {
      persistentAudio = new Audio();
      persistentAudio.setAttribute('playsinline', 'true');
      persistentAudio.setAttribute('webkit-playsinline', 'true');
    }
    const audio = persistentAudio;
    if (audioRef) audioRef.current = audio;

    const cleanup = () => {
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
    };
    audio.onplay = () => onStart?.();
    audio.onended = () => { cleanup(); onEnd?.(); resolve(); };
    audio.onerror = () => { cleanup(); onEnd?.(); resolve(); };

    audio.src = url;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { cleanup(); onEnd?.(); resolve(); });
    }
  });
}

export function stopEleven(audioRef) {
  try {
    const a = audioRef?.current || persistentAudio;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  } catch {}
}

// Pre-cache an array of texts so the demo plays without network delays
export async function precacheTexts(items) {
  // Fire all requests in parallel; ignore failures
  await Promise.all(items.map(({ text, voiceId, settings }) =>
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId, ...(settings || {}) }),
    })
      .then(r => r.ok ? r.blob() : null)
      .then(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          audioCache.set(`${voiceId}:${text}`, url);
        }
      })
      .catch(() => {})
  ));
}
