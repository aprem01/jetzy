/**
 * ElevenLabs voice mapping + audio playback helper.
 *
 * Default voice IDs are from ElevenLabs' free voice library (no clones needed).
 * Each persona has its own voice tuned to match the personality.
 */

export const VOICES = {
  // === USER ===
  marco: {
    id: 'pNInz6obpgDQGcFmaJgB', // Adam — deep American male
    settings: { stability: 0.55, similarity: 0.8, style: 0.25, speakerBoost: true },
  },

  // === AVATAR PERSONAS ===
  default: {
    // Aria — neutral warm
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel — warm female American
    settings: { stability: 0.5, similarity: 0.8, style: 0.3, speakerBoost: true },
  },
  india: {
    // Priya — warm Indian aunt energy
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi — strong female
    settings: { stability: 0.6, similarity: 0.75, style: 0.45, speakerBoost: true },
  },
  pakistan: {
    // Zara — hospitable Lahori
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi
    settings: { stability: 0.6, similarity: 0.75, style: 0.4, speakerBoost: true },
  },
  latam: {
    // Diego — theatrical porteño
    id: 'ErXwobaYiN019PkySvjV', // Antoni — warm male, lightly accented
    settings: { stability: 0.4, similarity: 0.85, style: 0.6, speakerBoost: true },
  },
  east_asia: {
    // Yuki — calm precise
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella — soft female
    settings: { stability: 0.7, similarity: 0.75, style: 0.2, speakerBoost: true },
  },
  southeast_asia: {
    // Mai — quietly playful
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella
    settings: { stability: 0.55, similarity: 0.78, style: 0.35, speakerBoost: true },
  },
  africa: {
    // Amara — adventurous, grounded
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi
    settings: { stability: 0.5, similarity: 0.8, style: 0.4, speakerBoost: true },
  },
  middle_east: {
    // Layla — rich storyteller
    id: 'XB0fDUnXU5powFXDhCwa', // Charlotte — sophisticated female
    settings: { stability: 0.55, similarity: 0.8, style: 0.45, speakerBoost: true },
  },
  europe: {
    // Sophie — sophisticated Lisboeta
    id: 'XB0fDUnXU5powFXDhCwa', // Charlotte
    settings: { stability: 0.55, similarity: 0.8, style: 0.35, speakerBoost: true },
  },
  oceania: {
    // Kai — easy Australian
    id: 'TxGEqnHWrfWFTfGW9XjX', // Josh — younger male
    settings: { stability: 0.5, similarity: 0.8, style: 0.35, speakerBoost: true },
  },
  north_america: {
    // Jordan — sharp NYC
    id: 'pNInz6obpgDQGcFmaJgB', // Adam
    settings: { stability: 0.45, similarity: 0.8, style: 0.4, speakerBoost: true },
  },
};

export function voiceForPersona(personaId) {
  return VOICES[personaId] || VOICES.default;
}

// === Audio playback helper ===
// Returns a Promise that resolves when audio finishes (or fails).
// Calls onStart and onEnd callbacks.
//
// In-memory cache so the same line plays instantly the second time.
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
        body: JSON.stringify({
          text,
          voiceId,
          ...(settings || {}),
        }),
      });
      if (!res.ok) {
        throw new Error(`TTS failed: ${res.status}`);
      }
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      audioCache.set(cacheKey, url);
    } catch (e) {
      console.error('ElevenLabs TTS failed, falling back:', e);
      onEnd?.();
      throw e; // caller can fall back to browser TTS
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
