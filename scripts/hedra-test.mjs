/**
 * End-to-end Hedra Character-3 test.
 * Uploads aria-character.png + one demo audio file, generates a talking video,
 * polls until ready, downloads MP4 to /tmp/aria-test.mp4.
 *
 * Run:  HEDRA_API_KEY=xxx node scripts/hedra-test.mjs
 */
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const HEDRA_BASE = 'https://api.hedra.com/web-app/public';
const CHARACTER_3_ID = 'd1dd37a3-e39a-4854-a298-6510289f9cf2';
const KEY = process.env.HEDRA_API_KEY;
if (!KEY) { console.error('HEDRA_API_KEY required'); process.exit(1); }

const headers = { 'X-API-Key': KEY };

async function createAsset(name, type) {
  const r = await fetch(`${HEDRA_BASE}/assets`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type }),
  });
  if (!r.ok) throw new Error(`createAsset failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

async function uploadAsset(id, filePath, mime) {
  const data = await readFile(filePath);
  const fd = new FormData();
  fd.append('file', new Blob([data], { type: mime }), path.basename(filePath));
  const r = await fetch(`${HEDRA_BASE}/assets/${id}/upload`, {
    method: 'POST', headers, body: fd,
  });
  if (!r.ok) throw new Error(`uploadAsset failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

async function generateVideo({ imageId, audioId }) {
  const body = {
    type: 'video',
    ai_model_id: CHARACTER_3_ID,
    start_keyframe_id: imageId,
    audio_id: audioId,
    generated_video_inputs: {
      text_prompt: 'A friendly woman speaking warmly to camera, gentle natural head movement, soft smile',
      aspect_ratio: '1:1',
      resolution: '720p',
    },
  };
  const r = await fetch(`${HEDRA_BASE}/generations`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`generate failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

async function pollStatus(id, { intervalMs = 4000, timeoutMs = 300_000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = await fetch(`${HEDRA_BASE}/generations/${id}/status`, { headers });
    const s = await r.json();
    process.stdout.write(`  [${s.status}] progress=${(s.progress * 100).toFixed(0)}%\r`);
    if (s.status === 'complete') { console.log(''); return s; }
    if (s.status === 'error') throw new Error(`Generation errored: ${s.error_message}`);
    await new Promise(res => setTimeout(res, intervalMs));
  }
  throw new Error('Polling timeout');
}

async function run() {
  console.log('1. Create image asset');
  const img = await createAsset('aria-character.png', 'image');
  console.log(`   id=${img.id}`);

  console.log('2. Upload image');
  await uploadAsset(img.id, path.join(ROOT, 'frontend/public/aria-character.png'), 'image/png');
  console.log('   uploaded');

  console.log('3. Create audio asset');
  const aud = await createAsset('03-aria-day1.mp3', 'audio');
  console.log(`   id=${aud.id}`);

  console.log('4. Upload audio');
  await uploadAsset(aud.id, path.join(ROOT, 'frontend/public/demo-audio/03-aria-day1.mp3'), 'audio/mpeg');
  console.log('   uploaded');

  console.log('5. Start generation');
  const gen = await generateVideo({ imageId: img.id, audioId: aud.id });
  console.log(`   generation id=${gen.id || JSON.stringify(gen)}`);

  const genId = gen.id || gen.generation_id;
  console.log('6. Poll status');
  const done = await pollStatus(genId);
  console.log(`   done. url=${done.url}`);

  if (done.url) {
    const vr = await fetch(done.url);
    const buf = Buffer.from(await vr.arrayBuffer());
    const out = '/tmp/aria-test.mp4';
    await writeFile(out, buf);
    console.log(`✓ saved ${out} (${(buf.length/1024).toFixed(0)} KB)`);
  }
}

run().catch(e => { console.error('\n✗', e.message); process.exit(1); });
