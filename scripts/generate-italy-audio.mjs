/**
 * Pre-generates ElevenLabs audio for the Romantic Italy tour.
 * Saves MP3s to /public/demo-audio-it/ and a manifest.
 *
 * Run:  ELEVENLABS_API_KEY=xxx node scripts/generate-italy-audio.mjs
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'demo-audio-it');

const VOICE_ARIA  = { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', stability: 0.4,  similarity: 0.88, style: 0.45 };
const VOICE_MARCO = { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',  stability: 0.55, similarity: 0.85, style: 0.25 };

// Romantic Italy: Rome → Amalfi → Capri → Tuscany → Lake Como
const LINES = [
  { id: '01-aria-open',     speaker: 'aria',  text: "Marco. You and Sofia, anniversary trip. What's the move?",                                              scene: 'open' },
  { id: '02-marco-pick',    speaker: 'marco', text: "Italy. Seven days. Make it special.",                                                                    scene: 'open' },
  { id: '03-aria-day1',     speaker: 'aria',  text: "Day one — Rome. Hotel de Russie, garden suite. Dinner at Pierluigi in Piazza de' Ricci.",                scene: 'rome' },
  { id: '04-aria-amalfi',   speaker: 'aria',  text: "Day two — south to the Amalfi coast. Le Sirenuse in Positano. Three nights with the cliff view.",        scene: 'positano' },
  { id: '05-aria-capri',    speaker: 'aria',  text: "Day four — Capri by boat. Lunch at La Fontelina. Cocktails at Anema e Core.",                            scene: 'capri' },
  { id: '06-marco-tuscany', speaker: 'marco', text: "Tuscany?",                                                                                                scene: 'tuscany' },
  { id: '07-aria-tuscany',  speaker: 'aria',  text: "Day five — Borgo Santo Pietro near Siena. Truffle hunt at sunrise. Castello Banfi tasting.",             scene: 'tuscany' },
  { id: '08-aria-como',     speaker: 'aria',  text: "Day seven — Lake Como. Villa d'Este, last night. Private boat at sunset.",                                scene: 'como' },
  { id: '09-aria-close',    speaker: 'aria',  text: "Seven days. Five legendary stays. Forty-eight hundred. Booked?",                                          scene: 'close' },
  { id: '10-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                                  scene: 'close' },
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
  if (!r.ok) throw new Error(`TTS failed: ${r.status} ${await r.text()}`);
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
  if (!process.env.ELEVENLABS_API_KEY) { console.error('ELEVENLABS_API_KEY required'); process.exit(1); }
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
      id: line.id, speaker: line.speaker, voiceName: voice.name,
      text: line.text, scene: line.scene,
      file: `/demo-audio-it/${filename}`,
      duration: Number(duration.toFixed(3)),
    });
    console.log(`   ${duration.toFixed(2)}s · ${(audio.length / 1024).toFixed(0)} KB`);
  }

  await writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n✓ ${manifest.length} Italy audio files generated`);
  console.log(`  Total spoken: ${manifest.reduce((s, m) => s + m.duration, 0).toFixed(1)}s`);
}

run().catch(e => { console.error(e); process.exit(1); });
