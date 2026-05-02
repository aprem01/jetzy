/**
 * Resolves a single representative photo URL for a venue / place name.
 *
 *   GET /api/venue-photo?q=Park+Hyatt+Tokyo
 *   → { url: "https://upload.wikimedia.org/.../Park_Hyatt_Tokyo.jpg", source: "wikipedia" }
 *
 * Strategy:
 *   1. Wikipedia REST page-summary on the exact title (spaces → underscores).
 *      → use `originalimage.source` if present.
 *   2. Wikimedia Commons file search (srnamespace=6) for the query,
 *      then resolve the first File: result via iiprop=url.
 *   3. Otherwise return { url: null }.
 *
 * Results are memoised in-process by query (lowercased) so repeated
 * lookups inside one warm lambda are free. CDN cache header is set to
 * 1d fresh + 7d stale-while-revalidate.
 *
 * NOTE: zero new dependencies — uses the global fetch shipped with
 * Vercel's Node 18+ runtime.
 */

const CACHE = new Map();

function setCorsAndCache(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
}

async function tryWikipediaSummary(q) {
  try {
    const title = q.trim().replace(/\s+/g, '_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Jetzy/1.0 (live-concierge)' } });
    if (!r.ok) return null;
    const data = await r.json();
    const img = data?.originalimage?.source || data?.thumbnail?.source;
    if (!img) return null;
    // Upgrade thumbnail to a larger render if applicable
    const upgraded = img.replace(/\/\d+px-/, '/1600px-');
    return { url: upgraded, source: 'wikipedia' };
  } catch {
    return null;
  }
}

async function tryCommonsFileSearch(q) {
  try {
    // Step 1 — search the File: namespace on Commons
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=3&origin=*`;
    const sr = await fetch(searchUrl, { headers: { 'User-Agent': 'Jetzy/1.0 (live-concierge)' } });
    if (!sr.ok) return null;
    const sdata = await sr.json();
    const hits = sdata?.query?.search || [];
    if (!hits.length) return null;

    // Step 2 — for the first hit, resolve the actual file URL via imageinfo
    for (const hit of hits) {
      const fileTitle = hit.title; // e.g. "File:Park Hyatt Tokyo.jpg"
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=1600&origin=*`;
      const ir = await fetch(infoUrl, { headers: { 'User-Agent': 'Jetzy/1.0 (live-concierge)' } });
      if (!ir.ok) continue;
      const idata = await ir.json();
      const pages = idata?.query?.pages || {};
      const page = Object.values(pages)[0];
      const info = page?.imageinfo?.[0];
      const url = info?.thumburl || info?.url;
      if (url) return { url, source: 'commons' };
    }
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  setCorsAndCache(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const q = (req.query?.q || req.body?.q || '').toString().trim();
  if (!q) {
    return res.status(400).json({ url: null, error: 'q required' });
  }

  const cacheKey = q.toLowerCase();
  if (CACHE.has(cacheKey)) {
    return res.status(200).json(CACHE.get(cacheKey));
  }

  let result = await tryWikipediaSummary(q);
  if (!result) result = await tryCommonsFileSearch(q);
  if (!result) result = { url: null };

  CACHE.set(cacheKey, result);
  return res.status(200).json(result);
}
