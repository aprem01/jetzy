/**
 * Pre-generates ElevenLabs audio for every line in the investor demo,
 * saves MP3s to frontend/public/demo-audio/, measures durations with
 * ffprobe, writes a manifest at frontend/public/demo-audio/manifest.json.
 *
 * Run:  ELEVENLABS_API_KEY=xxx node scripts/generate-demo-audio.mjs
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'demo-audio');

// === VOICES (free-tier verified) ===
const VOICE_ARIA  = { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', stability: 0.4,  similarity: 0.88, style: 0.45 };
const VOICE_MARCO = { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',  stability: 0.55, similarity: 0.85, style: 0.25 };

// === DIALOG SCRIPT — same as live demo, in order ===
// Each line: speaker, text, scene tag (matches a video in render-demo.js)
const LINES = [
  { id: '01-aria-open',     speaker: 'aria',  text: "Hey Marco. You did Kilimanjaro in February. What's next?",                                  scene: 'kilimanjaro' },
  { id: '02-marco-pick',    speaker: 'marco', text: "Patagonia. Eight days, mid-October.",                                                       scene: 'kilimanjaro' },
  { id: '03-aria-day1',     speaker: 'aria',  text: "Day one — Buenos Aires. One night at Mio Hotel in Palermo. Dinner at Don Julio.",          scene: 'buenos_aires' },
  { id: '04-aria-don-julio',speaker: 'aria',  text: "The entraña is worth it.",                                                                   scene: 'don_julio' },
  { id: '05-aria-day3',     speaker: 'aria',  text: "Day three — fly south to El Calafate, drive to El Chaltén. Senderos Hostería, four nights.", scene: 'el_chalten' },
  { id: '06-aria-day4',     speaker: 'aria',  text: "Day four — sunrise on Fitz Roy. Local guide Lucas. Ten hour round trip.",                  scene: 'fitz_roy' },
  { id: '07-marco-perito',  speaker: 'marco', text: "What about Perito Moreno?",                                                                 scene: 'fitz_roy' },
  { id: '08-aria-perito',   speaker: 'aria',  text: "Adding it — Day seven. Park entry plus a Big Ice trek. Two hours on the glacier.",         scene: 'perito_moreno' },
  { id: '09-aria-mendoza',  speaker: 'aria',  text: "Day eight — wind down in Mendoza. Cavas Wine Lodge, tasting at Catena Zapata.",            scene: 'mendoza' },
  { id: '10-aria-close',    speaker: 'aria',  text: "Eight days. Three regions. Twenty-four hundred. Want me to book it?",                      scene: 'wine_pour' },
  { id: '11-marco-yes',     speaker: 'marco', text: "Yes. Book it.",                                                                              scene: 'wine_pour' },
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

function durationOf(filePath) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`)
    .toString().trim();
  return parseFloat(out);
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

    const duration = durationOf(filepath);
    manifest.push({
      id: line.id,
      speaker: line.speaker,
      voiceName: voice.name,
      text: line.text,
      scene: line.scene,
      file: `/demo-audio/${filename}`,
      duration: Number(duration.toFixed(3)),
    });
    console.log(`   ${duration.toFixed(2)}s · ${(audio.length / 1024).toFixed(0)} KB`);
  }

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ ${manifest.length} audio files generated`);
  console.log(`  Total spoken: ${manifest.reduce((s, m) => s + m.duration, 0).toFixed(1)}s`);
  console.log(`  Manifest: ${manifestPath}`);
}

run().catch(e => { console.error(e); process.exit(1); });
