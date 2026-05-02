/**
 * Pre-generates ElevenLabs audio for the Tanzania safari + Zanzibar tour.
 * The "live concierge demo" — a back-and-forth between Marco and Aria that
 * shows what the real-time concierge will feel like, fully scripted so it
 * never breaks on stage.
 *
 * Run:  ELEVENLABS_API_KEY=xxx node scripts/generate-tanzania-audio.mjs
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'demo-audio-tz');

const VOICE_ARIA  = { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', stability: 0.4,  similarity: 0.88, style: 0.45 };
const VOICE_MARCO = { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',  stability: 0.55, similarity: 0.85, style: 0.25 };

// "Concierge live" demo — Tanzania safari + Zanzibar wind-down. Naturally
// follows from "you did Kilimanjaro in February" in the Argentina opener.
// Iconic name density: Singita Sasakwa, Serengeti, Out of Africa balloon,
// &Beyond Mnemba Island.
const LINES = [
  { id: '01-aria-open',     speaker: 'aria',  text: "Marco. Anniversary year. You and Sofia, never been to Africa. Where to start?",                          scene: 'open' },
  { id: '02-marco-pick',    speaker: 'marco', text: "You tell me. Big Five. Five days max.",                                                                  scene: 'serengeti' },
  { id: '03-aria-singita',  speaker: 'aria',  text: "Tanzania. Singita Sasakwa, Serengeti — Out of Africa-style lodge. Three nights. Big Five guaranteed.",   scene: 'singita' },
  { id: '04-aria-balloon',  speaker: 'aria',  text: "Day three at sunrise — hot-air balloon over the Mara River crossing. Champagne breakfast on the savanna.", scene: 'balloon' },
  { id: '05-marco-beach',   speaker: 'marco', text: "Beach to wind down?",                                                                                     scene: 'mnemba' },
  { id: '06-aria-mnemba',   speaker: 'aria',  text: "Two nights at andBeyond Mnemba Island, Zanzibar. Private island — eight villas, no other guests, dive the reef at dawn.", scene: 'mnemba' },
  { id: '07-aria-close',    speaker: 'aria',  text: "Five days. Two icons. Twelve thousand. Booked?",                                                          scene: 'close' },
  { id: '08-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                                  scene: 'close' },
];

async function tts(text, voice) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text, model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: voice.stability, similarity_boost: voice.similarity, style: voice.style, use_speaker_boost: true },
    }),
  });
  if (!r.ok) throw new Error(`TTS failed: ${r.status} ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

function durationOf(filePath, fileSize) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
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
      file: `/demo-audio-tz/${filename}`,
      duration: Number(duration.toFixed(3)),
    });
    console.log(`   ${duration.toFixed(2)}s · ${(audio.length / 1024).toFixed(0)} KB`);
  }
  await writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n✓ ${manifest.length} Tanzania audio files generated`);
  console.log(`  Total spoken: ${manifest.reduce((s, m) => s + m.duration, 0).toFixed(1)}s`);
}

run().catch(e => { console.error(e); process.exit(1); });
