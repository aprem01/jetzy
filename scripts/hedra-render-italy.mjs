/**
 * Pre-renders Aria-talking videos for the Romantic Italy tour.
 * Same pipeline; reads from /demo-audio-it/, writes to /demo-aria-it/.
 *
 * Run:  HEDRA_API_KEY=xxx node scripts/hedra-render-italy.mjs
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'frontend/public');
const ARIA_IMG = path.join(PUBLIC, 'aria-character.png');
const AUDIO_DIR = path.join(PUBLIC, 'demo-audio-it');
const OUT_DIR = path.join(PUBLIC, 'demo-aria-it');

const HEDRA_BASE = 'https://api.hedra.com/web-app/public';
const CHARACTER_3_ID = 'd1dd37a3-e39a-4854-a298-6510289f9cf2';
const KEY = process.env.HEDRA_API_KEY;
if (!KEY) { console.error('HEDRA_API_KEY required'); process.exit(1); }

const headers = { 'X-API-Key': KEY };

async function createAsset(name, type) {
  const r = await fetch(`${HEDRA_BASE}/assets`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) });
  if (!r.ok) throw new Error(`createAsset failed: ${r.status} ${await r.text()}`);
  return r.json();
}
async function uploadAsset(id, filePath, mime) {
  const data = await readFile(filePath);
  const fd = new FormData();
  fd.append('file', new Blob([data], { type: mime }), path.basename(filePath));
  const r = await fetch(`${HEDRA_BASE}/assets/${id}/upload`, { method: 'POST', headers, body: fd });
  if (!r.ok) throw new Error(`upload failed: ${r.status} ${await r.text()}`);
  return r.json();
}
async function generateVideo({ imageId, audioId }) {
  const r = await fetch(`${HEDRA_BASE}/generations`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'video', ai_model_id: CHARACTER_3_ID, start_keyframe_id: imageId, audio_id: audioId, generated_video_inputs: { text_prompt: 'A friendly woman speaking warmly and naturally to camera, gentle head movement, soft confident smile', aspect_ratio: '1:1', resolution: '720p' } }) });
  if (!r.ok) throw new Error(`generate failed: ${r.status} ${await r.text()}`);
  return r.json();
}
async function pollUntilDone(id) {
  const start = Date.now();
  while (Date.now() - start < 900_000) {
    const r = await fetch(`${HEDRA_BASE}/generations/${id}/status`, { headers });
    const s = await r.json();
    process.stdout.write(`     [${s.status}] ${(s.progress*100).toFixed(0)}% · ${((Date.now()-start)/1000).toFixed(0)}s     \r`);
    if (s.status === 'complete') { console.log(''); return s; }
    if (s.status === 'error') throw new Error(`gen error: ${s.error_message}`);
    await new Promise(res => setTimeout(res, 5000));
  }
  throw new Error('timeout');
}
async function downloadTo(url, dest) {
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function run() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  const audioManifest = JSON.parse(await readFile(path.join(AUDIO_DIR, 'manifest.json'), 'utf8'));
  const ariaLines = audioManifest.filter(l => l.speaker === 'aria');
  console.log(`Found ${ariaLines.length} Italy Aria lines`);

  const existingManifestPath = path.join(OUT_DIR, 'manifest.json');
  let outManifest = [];
  if (existsSync(existingManifestPath)) {
    try { outManifest = JSON.parse(await readFile(existingManifestPath, 'utf8')); console.log(`Resume: ${outManifest.length} done`); } catch {}
  }
  const doneIds = new Set(outManifest.map(m => m.id));
  outManifest = (await Promise.all(outManifest.map(async m => {
    const p = path.join(PUBLIC, m.videoFile.replace(/^\//, ''));
    return existsSync(p) ? m : null;
  }))).filter(Boolean);

  const todo = ariaLines.filter(l => !doneIds.has(l.id));
  if (todo.length === 0) { console.log('Nothing to do'); return; }

  console.log('\n→ Uploading Aria image');
  const img = await createAsset('aria-character.png', 'image');
  await uploadAsset(img.id, ARIA_IMG, 'image/png');

  for (let i = 0; i < todo.length; i++) {
    const line = todo[i];
    const audioPath = path.join(PUBLIC, line.file);
    const outFile = `${line.id}.mp4`;
    const outPath = path.join(OUT_DIR, outFile);

    console.log(`\n[${i + 1}/${todo.length}] ${line.id} (${line.duration.toFixed(1)}s)`);
    console.log(`  "${line.text.slice(0, 60)}..."`);
    console.log('  → upload audio');
    const aud = await createAsset(`${line.id}.mp3`, 'audio');
    await uploadAsset(aud.id, audioPath, 'audio/mpeg');

    console.log('  → start gen');
    const gen = await generateVideo({ imageId: img.id, audioId: aud.id });
    const done = await pollUntilDone(gen.id || gen.generation_id);
    const bytes = await downloadTo(done.url, outPath);
    console.log(`  ✓ ${outFile} (${(bytes / 1024).toFixed(0)} KB)`);

    outManifest.push({ id: line.id, speaker: line.speaker, text: line.text, scene: line.scene, duration: line.duration, audioFile: line.file, videoFile: `/demo-aria-it/${outFile}` });
    await writeFile(existingManifestPath, JSON.stringify(outManifest, null, 2));
  }
  console.log('\n✓ Italy Hedra done');
}
run().catch(e => { console.error('\n✗', e.message); process.exit(1); });
