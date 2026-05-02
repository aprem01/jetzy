#!/usr/bin/env node
/**
 * Tiny end-to-end probe for the live concierge endpoint.
 *
 *   1. Start the dev server in another terminal:   vercel dev
 *   2. In a separate terminal:                     node scripts/test-voice-chat.mjs
 *
 * The script POSTs a single user turn and pretty-prints the JSON the
 * client would receive — including the new `scenes` array so you can
 * sanity-check the cinematic camera + spotlight payload shape against
 * /src/data/tours.js.
 *
 * Override the URL via env if you're testing a deployed preview:
 *   ENDPOINT=https://your-preview.vercel.app/api/voice-chat node scripts/test-voice-chat.mjs
 */

const ENDPOINT = process.env.ENDPOINT || 'http://localhost:3000/api/voice-chat';

const body = {
  messages: [
    { role: 'user', content: '5 days in Tokyo for an anniversary, surprise me' },
  ],
  user: { name: 'Marco' },
};

async function main() {
  console.log(`POST ${ENDPOINT}`);
  console.log('Request:', JSON.stringify(body, null, 2));

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('\nNetwork error — is `vercel dev` running?');
    console.error(e.message);
    process.exit(1);
  }

  const json = await res.json().catch(() => ({}));
  console.log(`\nStatus: ${res.status}`);

  if (!res.ok) {
    console.log('Body:', JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log('\n--- spoken response ---');
  console.log(json.response);

  console.log('\n--- mood / locations ---');
  console.log({ mood: json.mood, locations: json.locations });

  console.log('\n--- persona ---');
  console.log(json.persona);

  console.log('\n--- legacy cartItems ---');
  console.log(JSON.stringify(json.cartItems, null, 2));

  console.log('\n--- scenes (NEW — cinematic payload) ---');
  if (!Array.isArray(json.scenes) || json.scenes.length === 0) {
    console.log('(no scenes returned — Aria did not name a specific venue this turn)');
  } else {
    json.scenes.forEach((scene, i) => {
      console.log(`\nscene[${i}] · ${scene.venue}`);
      console.log(`  camera : lat=${scene.lat} lng=${scene.lng} h=${scene.height}m pitch=${scene.pitch} heading=${scene.heading} dur=${scene.duration}s`);
      console.log(`  spotlight: ${scene.spotlight?.name} — ${scene.spotlight?.tag}`);
      if (scene.spotlight?.subtitle) console.log(`           "${scene.spotlight.subtitle}"`);
      (scene.spotlight?.details || []).forEach(d => console.log(`           · ${d.label}: ${d.value}`));
      (scene.spotlight?.picks || []).forEach(p => console.log(`           pick [${p.kind}] ${p.name} — ${p.note || ''}`));
      (scene.cart || []).forEach(c => console.log(`  cart   : ${c.kind} · ${c.name} · $${c.price}${c.day ? ` · day ${c.day}` : ''}`));
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
