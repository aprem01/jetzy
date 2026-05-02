/**
 * v2 SCRIPTS — rewritten for the "$100M demo" pitch:
 *  - Aria sounds like a true insider — names hidden gems, drops local
 *    knowledge, gives the kind of recommendation only a fixer-turned-
 *    friend would have.
 *  - Marrakech girls' weekend uses a FEMALE friend voice (Sofia · Charlotte)
 *    not Bill, since it's a women-only trip planning conversation.
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'frontend', 'public');

const VOICES = {
  aria:    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',     stability: 0.4,  similarity: 0.88, style: 0.45 },
  marco:   { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',      stability: 0.55, similarity: 0.85, style: 0.25 },
  sofia:   { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', stability: 0.45, similarity: 0.88, style: 0.40 }, // female friend
};

const TOURS = {
  nepal: {
    dir: 'demo-audio-np',
    lines: [
      { id: '01-aria-open',     speaker: 'aria',  text: "Marco. I just opened twelve seats on a private Annapurna trek. Doctors, a chef, a filmmaker — your kind of people. Ten days. In?", scene: 'open' },
      { id: '02-marco-pick',    speaker: 'marco', text: "How fit do I need to be — and what makes this trek different?",                                                                  scene: 'open' },
      { id: '03-aria-pokhara',  speaker: 'aria',  text: "Moderate. We start at Tiger Mountain Pokhara — Adrian Boote built this place. He's saving you the corner room with the Annapurna view. Welcome dinner with the group on the lawn.", scene: 'pokhara' },
      { id: '04-aria-poonhill', speaker: 'aria',  text: "Day three — Ghorepani Poon Hill. We leave at four AM with headlamps. Local guide Pemba has done this trail two hundred times. Tea at the top, before the day-trippers arrive.", scene: 'poonhill' },
      { id: '05-marco-group',   speaker: 'marco', text: "Other hikers vetted?",                                                                                                            scene: 'pokhara' },
      { id: '06-aria-group',    speaker: 'aria',  text: "All twelve. Average age thirty-six. WhatsApp group already humming. Three of them have done Kilimanjaro. You'll trade notes by night two.", scene: 'pokhara' },
      { id: '07-aria-abc',      speaker: 'aria',  text: "Day seven — Annapurna Base Camp at dawn. Pemba knows a kopje just past the cairn for sunrise photos — no other hikers know it. Group portrait, no one else in frame.", scene: 'abc' },
      { id: '08-aria-spa',      speaker: 'aria',  text: "Day nine — back to Tiger Mountain. Surya does the Nepali oil massage — ninety minutes, ask for the deep one. Sunset paddle on Phewa with Annapurna mirrored.", scene: 'spa' },
      { id: '09-aria-close',    speaker: 'aria',  text: "Ten days. Twelve lifelong friends. Three thousand eight hundred all in. Booked?",                                                  scene: 'close' },
      { id: '10-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                                                          scene: 'close' },
    ],
  },
  iceland: {
    dir: 'demo-audio-is',
    lines: [
      { id: '01-aria-open',     speaker: 'aria',  text: "School half-term. You, Sofia, the kids — Iceland in spring. Five days. I've put together the version locals would do with their own kids.", scene: 'open' },
      { id: '02-marco-pick',    speaker: 'marco', text: "Make it magical. Geysers, whales, glaciers — but skip the tourist traps.",                                                       scene: 'open' },
      { id: '03-aria-ion',      speaker: 'aria',  text: "Ion Adventure Hotel — Sigga at the front desk has the kids covered. Two nights. Northern Lights wake-up call, glass-roof bar after they're asleep, and a private guide for the Silfra dive between the continents.", scene: 'ion' },
      { id: '04-aria-golden',   speaker: 'aria',  text: "Day two — the Golden Circle, but the back-roads version. Strokkur erupts every six minutes. Skip Geysir's restaurant — lunch at Friðheimar, eating tomato soup inside the greenhouse where it grows.", scene: 'golden' },
      { id: '05-marco-whales',  speaker: 'marco', text: "And whales?",                                                                                                                     scene: 'whales' },
      { id: '06-aria-husavik',  speaker: 'aria',  text: "Day three — fly to Akureyri. Húsavík with Captain Stefán's RIB — ninety percent humpback rate in May. He'll cut the engine and let you hear them sing through a hydrophone.", scene: 'whales' },
      { id: '07-aria-glacier',  speaker: 'aria',  text: "Day four — Sólheimajökull glacier. Mini crampons, age-eight friendly. Guide Örvar sets up an ice-cave stop the day-trippers miss. Then Seljavallalaug — a 1923 thermal pool the kids will swim in alone.", scene: 'glacier' },
      { id: '08-aria-reykjavik',speaker: 'aria',  text: "Day five — Hallgrímskirkja for the tower view. Skyr and cinnamon snúðar at Brauð and Co before the airport. Unna's bakery secret: ask for them straight from the oven.", scene: 'reykjavik' },
      { id: '09-aria-close',    speaker: 'aria',  text: "Five days. Family of four. Sixty-two hundred. Booked?",                                                                           scene: 'close' },
      { id: '10-marco-yes',     speaker: 'marco', text: "Booked.",                                                                                                                          scene: 'close' },
    ],
  },
  marrakech: {
    dir: 'demo-audio-ma',
    lines: [
      // Note: speaker 'sofia' = female friend voice (Charlotte). NOT Marco.
      { id: '01-aria-open',     speaker: 'aria',  text: "Sofia. Six girls, four days. Marrakech in March is peak — bougainvillea, jasmine, golden hour. I have the city dialed in.", scene: 'open' },
      { id: '02-sofia-pick',    speaker: 'sofia', text: "Spa, food, photos — and somewhere we can fully reset.",                                                                          scene: 'open' },
      { id: '03-aria-mamounia', speaker: 'aria',  text: "La Mamounia, three nights. I held the Mamounia Suite — garden access, Atlas view from the terrace. Karim at the spa knows you're coming. Welcome rose-petal hammam at four.", scene: 'mamounia' },
      { id: '04-aria-hammam',   speaker: 'aria',  text: "Day two — Royal Mansour for the real hammam. Lunch at Nomad rooftop, ask for the table on the medina-facing corner. Le Jardin Secret in the afternoon — Mostafa lets you up the tower before it opens.", scene: 'hammam' },
      { id: '05-aria-balloon',  speaker: 'aria',  text: "Day three — sunrise balloon over the Atlas with Ciel d'Afrique. Berber breakfast in the dunes. Lunch at Fellah, then Sky Bar Renaissance for golden-hour cocktails.", scene: 'balloon' },
      { id: '06-sofia-souks',   speaker: 'sofia', text: "Souks?",                                                                                                                          scene: 'souks' },
      { id: '07-aria-souks',    speaker: 'aria',  text: "Last day — Mahmood Mahjoub. Twenty-two years in the medina. He keeps the touts off you, opens the doors of the workshops the tour groups never see. Argan oil cooperative, lantern atelier, Berber rug seller who'll pour you mint tea before showing the rare ones.", scene: 'souks' },
      { id: '08-aria-close',    speaker: 'aria',  text: "Four days. Six girls. Three thousand each. Booked?",                                                                              scene: 'close' },
      { id: '09-sofia-yes',     speaker: 'sofia', text: "Booked.",                                                                                                                         scene: 'close' },
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
    const voice = VOICES[line.speaker];
    if (!voice) throw new Error(`unknown speaker: ${line.speaker}`);
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
