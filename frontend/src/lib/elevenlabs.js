/**
 * ElevenLabs voice mapping + audio playback helper.
 * All voice IDs verified working on the free tier.
 */

// Best-pick voices for the demo
export const VOICE_MARCO = {
  id: 'nPczCjzI2devNBz1zQrb', // Brian — deep American male, conversational
  name: 'Brian',
  settings: { stability: 0.5, similarity: 0.85, style: 0.4, speakerBoost: true },
};

export const VOICE_AVATAR_DEFAULT = {
  id: 'EXAVITQu4vr4xnSDxMaL', // Sarah — warm American female
  name: 'Sarah',
  settings: { stability: 0.5, similarity: 0.85, style: 0.45, speakerBoost: true },
};

export const VOICES = {
  // === USER ===
  marco: VOICE_MARCO,

  // === AVATAR PERSONAS — all free tier voices ===
  default: VOICE_AVATAR_DEFAULT, // Sarah
  india: {
    id: 'XrExE9yKIg1WjnnlVkGX', // Matilda — warm female
    name: 'Matilda',
    settings: { stability: 0.55, similarity: 0.85, style: 0.5, speakerBoost: true },
  },
  pakistan: {
    id: 'XrExE9yKIg1WjnnlVkGX', // Matilda
    name: 'Matilda',
    settings: { stability: 0.55, similarity: 0.85, style: 0.45, speakerBoost: true },
  },
  latam: {
    id: 'ErXwobaYiN019PkySvjV', // Antoni — warm male, lightly accented
    name: 'Antoni',
    settings: { stability: 0.4, similarity: 0.85, style: 0.65, speakerBoost: true },
  },
  east_asia: {
    id: 'pFZP5JQG7iQjIQuC4Bku', // Lily — soft female
    name: 'Lily',
    settings: { stability: 0.65, similarity: 0.8, style: 0.25, speakerBoost: true },
  },
  southeast_asia: {
    id: 'pFZP5JQG7iQjIQuC4Bku', // Lily
    name: 'Lily',
    settings: { stability: 0.55, similarity: 0.8, style: 0.35, speakerBoost: true },
  },
  africa: {
    id: 'cgSgspJ2msm6clMCkdW9', // Jessica — confident female
    name: 'Jessica',
    settings: { stability: 0.5, similarity: 0.85, style: 0.4, speakerBoost: true },
  },
  middle_east: {
    id: 'FGY2WhTYpPnrIDTdsKH5', // Laura — sophisticated female
    name: 'Laura',
    settings: { stability: 0.55, similarity: 0.85, style: 0.45, speakerBoost: true },
  },
  europe: {
    id: 'FGY2WhTYpPnrIDTdsKH5', // Laura
    name: 'Laura',
    settings: { stability: 0.55, similarity: 0.85, style: 0.4, speakerBoost: true },
  },
  oceania: {
    id: 'IKne3meq5aSn9XLyUdCD', // Charlie — relaxed Australian-ish male
    name: 'Charlie',
    settings: { stability: 0.5, similarity: 0.8, style: 0.35, speakerBoost: true },
  },
  north_america: {
    id: 'JBFqnCBsd6RMkjVDRZzb', // George — sharp male
    name: 'George',
    settings: { stability: 0.45, similarity: 0.85, style: 0.45, speakerBoost: true },
  },
};

export function voiceForPersona(personaId) {
  return VOICES[personaId] || VOICES.default;
}

// === Audio playback ===
const audioCache = new Map();

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
    const audio = new Audio(url);
    if (audioRef) audioRef.current = audio;
    audio.onplay = () => onStart?.();
    audio.onended = () => { onEnd?.(); resolve(); };
    audio.onerror = () => { onEnd?.(); resolve(); };
    audio.play().catch(() => { onEnd?.(); resolve(); });
  });
}

export function stopEleven(audioRef) {
  try {
    if (audioRef?.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
