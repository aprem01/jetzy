/**
 * Pre-generates ElevenLabs audio for the Japan tour. Same pipeline as the
 * Argentina script — saves MP3s to /public/demo-audio-jp/ and a manifest
 * with measured durations.
 *
 * Run:  ELEVENLABS_API_KEY=xxx node scripts/generate-japan-audio.mjs
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'demo-audio-jp');

// Same voices as Argentina demo for continuity.
const VOICE_ARIA  = { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', stability: 0.4,  similarity: 0.88, style: 0.45 };
const VOICE_MARCO = { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',  stability: 0.55, similarity: 0.85, style: 0.25 };

// Iconic Japan: Park Hyatt → Sukiyabashi Jiro → Hakone ryokan + Fuji →
// Aman Kyoto → Fushimi Inari sunrise → cherry blossoms → Osaka street food
const LINES = [
  { id: '01-aria-open',     speaker: 'aria',  text: "Marco, you're back. Where to?",                                                                            scene: 'open' },
  { id: '02-marco-pick',    speaker: 'marco', text: "Tokyo. Spring. Ten days.",                                                                                  scene: 'tokyo' },
  { id: '03-aria-day1',     speaker: 'aria',  text: "Tokyo, day one. Park Hyatt for arrival — Lost in Translation views. Sukiyabashi Jiro for dinner.",          scene: 'park_hyatt' },
  { id: '04-aria-jiro',     speaker: 'aria',  text: "Three Michelin stars. Twenty pieces. Twenty minutes.",                                                      scene: 'jiro' },
  { id: '05-aria-hakone',   speaker: 'aria',  text: "Day three — Hakone. Gora Kadan ryokan. Onsen with Fuji on the horizon.",                                    scene: 'hakone' },
  { id: '06-aria-kyoto',    speaker: 'aria',  text: "Day five — Kyoto. Aman Kyoto, four nights in a hidden forest.",                                              scene: 'aman_kyoto' },
  { id: '07-marco-cherry',  speaker: 'marco', text: "Cherry blossoms?",                                                                                          scene: 'aman_kyoto' },
  { id: '08-aria-fushimi',  speaker: 'aria',  text: "Sunrise at Fushimi Inari. Ten thousand torii gates before the crowds. Hanami in Maruyama Park after.",      scene: 'fushimi' },
  { id: '09-aria-osaka',    speaker: 'aria',  text: "Day nine — Osaka. Dotonbori street food crawl with Den's chef as guide.",                                   scene: 'osaka' },
  { id: '10-aria-close',    speaker: 'aria',  text: "Ten days. Eight icons. Forty-two hundred. Booked?",                                                          scene: 'close' },
  { id: '11-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                                    scene: 'close' },
];

async function tts(text, voice) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: voice.stability,
        similarity_boost: voice.similarity,
        style: voice.style,
        use_speaker_boost: true,
      },
    }),
  });
  if (!r.ok) throw new Error(`TTS ${voice.id} failed: ${r.status} ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

function durationOf(filePath, fileSize) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { stdio: ['pipe', 'pipe', 'pipe'] },
    ).toString().trim();
    const d = parseFloat(out);
    if (Number.isFinite(d) && d > 0) return d;
  } catch {}
  return (fileSize * 8) / (128 * 1000);
}

async function run() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY required'); process.exit(1);
  }
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];

  for (const line of LINES) {
    const voice = line.speaker === 'aria' ? VOICE_ARIA : VOICE_MARCO;
    const filename = `${line.id}.mp3`;
    const filepath = path.join(OUT_DIR, filename);

    console.log(`→ ${line.id} (${voice.name})  "${line.text.slice(0, 50)}..."`);
    const audio = await tts(line.text, voice);
    await writeFile(filepath, audio);

    const duration = durationOf(filepath, audio.length);
    manifest.push({
      id: line.id,
      speaker: line.speaker,
      voiceName: voice.name,
      text: line.text,
      scene: line.scene,
      file: `/demo-audio-jp/${filename}`,
      duration: Number(duration.toFixed(3)),
    });
    console.log(`   ${duration.toFixed(2)}s · ${(audio.length / 1024).toFixed(0)} KB`);
  }

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ ${manifest.length} Japan audio files generated`);
  console.log(`  Total spoken: ${manifest.reduce((s, m) => s + m.duration, 0).toFixed(1)}s`);
}

run().catch(e => { console.error(e); process.exit(1); });
