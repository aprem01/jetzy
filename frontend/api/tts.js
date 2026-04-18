/**
 * ElevenLabs Text-to-Speech proxy.
 * POST { text, voiceId, modelId? } → returns audio/mpeg bytes.
 *
 * Caches in CDN for 24h via Vercel headers — repeat plays of the same
 * line are instant and don't re-bill ElevenLabs credits.
 */

const ELEVEN_API = 'https://api.elevenlabs.io/v1/text-to-speech';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });
  }

  const { text, voiceId, modelId, stability, similarity, style, speakerBoost } = req.body || {};
  if (!text || !voiceId) {
    return res.status(400).json({ error: 'text and voiceId required' });
  }

  // Cap text length defensively (ElevenLabs has its own limits)
  const safeText = String(text).slice(0, 2500);

  try {
    const response = await fetch(`${ELEVEN_API}/${voiceId}?optimize_streaming_latency=2&output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: safeText,
        model_id: modelId || 'eleven_turbo_v2_5',
        voice_settings: {
          stability: stability ?? 0.5,
          similarity_boost: similarity ?? 0.75,
          style: style ?? 0.3,
          use_speaker_boost: speakerBoost ?? true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', response.status, errText);
      return res.status(response.status).json({ error: 'ElevenLabs request failed', detail: errText });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Length', String(audioBuffer.byteLength));
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (e) {
    console.error('TTS proxy error:', e);
    res.status(500).json({ error: 'TTS proxy error', detail: e.message });
  }
}
