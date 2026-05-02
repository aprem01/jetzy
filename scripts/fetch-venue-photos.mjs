/**
 * Fetches verified, on-topic venue photos from Pexels and saves them
 * locally to frontend/public/venue-photos/. Local hosting means:
 *   - the photos are guaranteed to be on-topic (no random elephants),
 *   - they're served from our own CDN (faster, no third-party flake),
 *   - we control them — they can never break.
 *
 * Run:  PEXELS_API_KEY=xxx node scripts/fetch-venue-photos.mjs
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'venue-photos');

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) { console.error('PEXELS_API_KEY required'); process.exit(1); }

// Each venue: a slug for the filename, a primary search query, and a list of
// fallback queries to try if the primary returns nothing usable. We prefer
// landscape photos at 900x500 ratio for the spotlight hero.
const VENUES = [
  {
    slug: 'faena-hotel',
    queries: [
      'modern luxury hotel skyline buenos aires',
      'puerto madero buenos aires waterfront',
      'buenos aires luxury hotel',
    ],
  },
  {
    slug: 'don-julio',
    queries: [
      'argentine asado parrilla grill',
      'argentinian steak restaurant',
      'wine cellar restaurant interior',
    ],
  },
  {
    slug: 'eolo-lodge',
    queries: [
      'patagonia steppe ranch',
      'patagonia lodge',
      'argentina patagonia landscape',
    ],
  },
  {
    slug: 'fitz-roy',
    queries: [
      'fitz roy patagonia',
      'el chalten mountain',
      'patagonia granite peak',
    ],
  },
  {
    slug: 'perito-moreno',
    queries: [
      'perito moreno glacier',
      'argentina glacier ice',
      'patagonia glacier',
    ],
  },
  {
    slug: 'cavas-mendoza',
    queries: [
      'mendoza vineyard andes argentina',
      'malbec vineyard mountains',
      'argentina wine country vineyard',
    ],
  },
];

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&size=large`;
  const r = await fetch(url, { headers: { Authorization: KEY } });
  if (!r.ok) throw new Error(`Pexels ${r.status} ${await r.text()}`);
  const data = await r.json();
  return data.photos || [];
}

async function downloadTo(src, dest) {
  const r = await fetch(src);
  if (!r.ok) throw new Error(`download ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function run() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  for (const v of VENUES) {
    console.log(`\n→ ${v.slug}`);
    let photo = null;
    let queryUsed = null;

    for (const q of v.queries) {
      try {
        const photos = await searchPexels(q);
        if (photos.length > 0) {
          photo = photos[0];
          queryUsed = q;
          break;
        }
      } catch (e) {
        console.warn(`   search failed for "${q}":`, e.message);
      }
    }

    if (!photo) {
      console.warn(`   ✗ no photo found for ${v.slug}`);
      continue;
    }

    // Pexels gives us multiple sizes — `large2x` is ~1880px wide, perfect.
    const src = photo.src.large2x || photo.src.large || photo.src.original;
    const dest = path.join(OUT_DIR, `${v.slug}.jpg`);
    const bytes = await downloadTo(src, dest);

    console.log(`   query: "${queryUsed}"`);
    console.log(`   by: ${photo.photographer} (${photo.photographer_url})`);
    console.log(`   src: ${src}`);
    console.log(`   ✓ ${(bytes / 1024).toFixed(0)} KB → /venue-photos/${v.slug}.jpg`);
  }

  console.log('\n────────────────────────────────────');
  console.log('All venue photos cached locally.');
}

run().catch((e) => { console.error(e); process.exit(1); });
