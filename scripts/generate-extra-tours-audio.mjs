/**
 * Pre-generates ElevenLabs audio for 3 new themed tours:
 *   - Nepal Annapurna · Group Hike (social, hiking, 12 Jetzy hikers)
 *   - Iceland Family Adventure (family with kids, 5 days)
 *   - Marrakech Girls' Weekend (girls trip, 4 days)
 *
 * Saves MP3s to /public/demo-audio-{np|is|ma}/ + manifest.json each.
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');

const VOICE_ARIA  = { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', stability: 0.4,  similarity: 0.88, style: 0.45 };
const VOICE_MARCO = { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',  stability: 0.55, similarity: 0.85, style: 0.25 };

const TOURS = {
  nepal: {
    dir: 'demo-audio-np',
    lines: [
      { id: '01-aria-open',     speaker: 'aria',  text: "Marco. Group adventure — twelve Jetzy hikers, Annapurna Base Camp, ten days. In?",       scene: 'open' },
      { id: '02-marco-pick',    speaker: 'marco', text: "I'm in. How fit do I need to be?",                                                        scene: 'open' },
      { id: '03-aria-pokhara',  speaker: 'aria',  text: "Moderate. Pokhara to ABC — classic. Tiger Mountain Lodge to start. Welcome dinner with your group.", scene: 'pokhara' },
      { id: '04-aria-poonhill', speaker: 'aria',  text: "Day three — Ghorepani Poon Hill at sunrise. Dhaulagiri and Annapurna in one frame.",       scene: 'poonhill' },
      { id: '05-marco-group',   speaker: 'marco', text: "Other hikers good?",                                                                       scene: 'pokhara' },
      { id: '06-aria-group',    speaker: 'aria',  text: "Two doctors, a chef, a documentary filmmaker. Average age thirty-six. You'll like them.", scene: 'pokhara' },
      { id: '07-aria-abc',      speaker: 'aria',  text: "Day seven — Annapurna Base Camp at dawn. Group photo at fourteen-thousand feet.",         scene: 'abc' },
      { id: '08-aria-spa',      speaker: 'aria',  text: "Day nine — back to Tiger Mountain. Massage. Lake Phewa sunset paddle.",                   scene: 'spa' },
      { id: '09-aria-close',    speaker: 'aria',  text: "Ten days. Twelve new friends. Thirty-eight hundred all in. Booked?",                       scene: 'close' },
      { id: '10-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                   scene: 'close' },
    ],
  },
  iceland: {
    dir: 'demo-audio-is',
    lines: [
      { id: '01-aria-open',     speaker: 'aria',  text: "School half-term. You, Sofia, the kids — never been to Iceland. Five days?",              scene: 'open' },
      { id: '02-marco-pick',    speaker: 'marco', text: "Make it magical. Kids first. Geysers, whales, glaciers.",                                  scene: 'open' },
      { id: '03-aria-ion',      speaker: 'aria',  text: "Ion Adventure Hotel near Thingvellir. Two nights. Northern lights from the glass-roof bar after the kids are asleep.", scene: 'ion' },
      { id: '04-aria-golden',   speaker: 'aria',  text: "Day two — the Golden Circle. Strokkur geyser. Gullfoss waterfall. Lunch at Friðheimar tomato farm.", scene: 'golden' },
      { id: '05-marco-whales',  speaker: 'marco', text: "Whales?",                                                                                   scene: 'whales' },
      { id: '06-aria-husavik',  speaker: 'aria',  text: "Day three — fly to Akureyri. Húsavík whale watching. Humpbacks ninety percent of the time in May.", scene: 'whales' },
      { id: '07-aria-glacier',  speaker: 'aria',  text: "Day four — glacier walk on Sólheimajökull. Kids in mini crampons with a guide. Thermal pool after.", scene: 'glacier' },
      { id: '08-aria-reykjavik',speaker: 'aria',  text: "Day five — Hallgrímskirkja in Reykjavík. Skyr and pastries at Brauð and Co before the flight.",     scene: 'reykjavik' },
      { id: '09-aria-close',    speaker: 'aria',  text: "Five days. Family of four. Sixty-two hundred. Booked?",                                    scene: 'close' },
      { id: '10-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                   scene: 'close' },
    ],
  },
  marrakech: {
    dir: 'demo-audio-ma',
    lines: [
      { id: '01-aria-open',     speaker: 'aria',  text: "Sofia and the girls. Long weekend. Where to?",                                              scene: 'open' },
      { id: '02-marco-pick',    speaker: 'marco', text: "Somewhere we can fully reset. Spa, food, photos.",                                          scene: 'open' },
      { id: '03-aria-mamounia', speaker: 'aria',  text: "Marrakech. La Mamounia, three nights. Mamounia Suite with garden access.",                  scene: 'mamounia' },
      { id: '04-aria-hammam',   speaker: 'aria',  text: "Day two — hammam at Royal Mansour. Lunch on the rooftop at Nomad. Le Jardin Secret in the afternoon.", scene: 'hammam' },
      { id: '05-aria-balloon',  speaker: 'aria',  text: "Day three — sunrise hot-air balloon over the Atlas. Lunch at Fellah Hotel. Sky Bar Renaissance for cocktails.", scene: 'balloon' },
      { id: '06-marco-souks',   speaker: 'marco', text: "Souks?",                                                                                    scene: 'souks' },
      { id: '07-aria-souks',    speaker: 'aria',  text: "Last day. Mahmood Mahjoub guide. Argan oil, lanterns, leather. He keeps the touts off you.", scene: 'souks' },
      { id: '08-aria-close',    speaker: 'aria',  text: "Four days. Six girls. Three thousand each. Booked?",                                        scene: 'close' },
      { id: '09-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                    scene: 'close' },
    ],
  },
};

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

async function runOne(tourKey) {
  const tour = TOURS[tourKey];
  const outDir = path.join(PUBLIC, tour.dir);
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

  console.log(`\n━━━ ${tourKey.toUpperCase()} ━━━`);
  const manifest = [];
  for (const line of tour.lines) {
    const voice = line.speaker === 'aria' ? VOICE_ARIA : VOICE_MARCO;
    const filename = `${line.id}.mp3`;
    const filepath = path.join(outDir, filename);
    console.log(`→ ${line.id} (${voice.name})  "${line.text.slice(0, 50)}..."`);
    const audio = await tts(line.text, voice);
    await writeFile(filepath, audio);
    const duration = durationOf(filepath, audio.length);
    manifest.push({
      id: line.id, speaker: line.speaker, voiceName: voice.name,
      text: line.text, scene: line.scene,
      file: `/${tour.dir}/${filename}`,
      duration: Number(duration.toFixed(3)),
    });
    console.log(`   ${duration.toFixed(2)}s · ${(audio.length / 1024).toFixed(0)} KB`);
  }
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`✓ ${manifest.length} files · ${manifest.reduce((s,m)=>s+m.duration,0).toFixed(1)}s total`);
}

async function run() {
  if (!process.env.ELEVENLABS_API_KEY) { console.error('ELEVENLABS_API_KEY required'); process.exit(1); }
  for (const k of Object.keys(TOURS)) await runOne(k);
}

run().catch(e => { console.error(e); process.exit(1); });
