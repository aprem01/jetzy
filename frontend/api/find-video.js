/**
 * Searches Pexels for a video matching a query (e.g. "Fitz Roy sunrise"
 * or "Buenos Aires city night"). Returns the best matching MP4 URL.
 *
 * Requires PEXELS_API_KEY env var (free at https://pexels.com/api/new).
 *
 * Falls back to a curated map of known-good Pexels video IDs if the
 * API key isn't set or the search fails.
 */

const FALLBACKS = {
  welcome: 'https://videos.pexels.com/video-files/3576378/3576378-hd_1920_1080_25fps.mp4',
  city: 'https://videos.pexels.com/video-files/856975/856975-hd_1920_1080_25fps.mp4',
  steakhouse: 'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4',
  tango: 'https://videos.pexels.com/video-files/6981411/6981411-hd_1920_1080_25fps.mp4',
  steppe: 'https://videos.pexels.com/video-files/2421545/2421545-hd_1920_1080_30fps.mp4',
  village: 'https://videos.pexels.com/video-files/2611250/2611250-hd_1920_1080_30fps.mp4',
  lodge: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
  trail: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4',
  mountain: 'https://videos.pexels.com/video-files/1192116/1192116-hd_1920_1080_30fps.mp4',
  sunrise: 'https://videos.pexels.com/video-files/2421545/2421545-hd_1920_1080_30fps.mp4',
  hiker: 'https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4',
  vineyard: 'https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4',
  wine: 'https://videos.pexels.com/video-files/5057522/5057522-hd_1920_1080_25fps.mp4',
  default: 'https://videos.pexels.com/video-files/3576378/3576378-hd_1920_1080_25fps.mp4',
};

function pickFallback(query) {
  const q = (query || '').toLowerCase();
  // Most specific first
  if (q.includes('vineyard') || q.includes('mendoza')) return FALLBACKS.vineyard;
  if (q.includes('wine') || q.includes('tasting')) return FALLBACKS.wine;
  if (q.includes('sunrise') || q.includes('dawn') || q.includes('fitz roy')) return FALLBACKS.sunrise;
  if (q.includes('hiker') || q.includes('hiking') || q.includes('trail')) return FALLBACKS.hiker;
  if (q.includes('mountain') || q.includes('peak')) return FALLBACKS.mountain;
  if (q.includes('lodge') || q.includes('hostería') || q.includes('cabin')) return FALLBACKS.lodge;
  if (q.includes('village') || q.includes('chaltén') || q.includes('chalten')) return FALLBACKS.village;
  if (q.includes('steppe') || q.includes('aerial') || q.includes('flight')) return FALLBACKS.steppe;
  if (q.includes('tango') || q.includes('dance') || q.includes('nightlife')) return FALLBACKS.tango;
  if (q.includes('steak') || q.includes('asado') || q.includes('parrilla') || q.includes('restaurant') || q.includes('don julio')) return FALLBACKS.steakhouse;
  if (q.includes('city') || q.includes('buenos aires') || q.includes('palermo') || q.includes('urban')) return FALLBACKS.city;
  if (q.includes('welcome') || q.includes('travel') || q.includes('world')) return FALLBACKS.welcome;
  return FALLBACKS.default;
}

function pickBestVideoFile(videoFiles) {
  if (!videoFiles || videoFiles.length === 0) return null;
  // Prefer ~1920x1080 mp4. Pexels returns various qualities.
  const sorted = [...videoFiles].sort((a, b) => {
    // Penalize files that are too large or too small
    const idealHeight = 1080;
    const aDist = Math.abs((a.height || 0) - idealHeight);
    const bDist = Math.abs((b.height || 0) - idealHeight);
    return aDist - bDist;
  });
  const mp4 = sorted.find(f => (f.file_type || '').includes('mp4')) || sorted[0];
  return mp4?.link || null;
}

export default async function handler(req, res) {
  const query = req.query.q || req.body?.query;
  const n = Math.min(Math.max(parseInt(req.query.n || '1', 10) || 1, 1), 8);
  if (!query) return res.status(400).json({ error: 'q (query) required' });

  const apiKey = process.env.PEXELS_API_KEY;

  // No API key — return curated fallback immediately
  if (!apiKey) {
    const url = pickFallback(query);
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).json({
      url, urls: [url], query, source: 'fallback-no-api-key',
    });
  }

  try {
    const perPage = Math.max(n, 8);
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=medium`;
    const r = await fetch(url, { headers: { Authorization: apiKey } });
    if (!r.ok) {
      const detail = await r.text();
      const u = pickFallback(query);
      return res.status(200).json({
        url: u, urls: [u], query, source: 'fallback-api-error', detail,
      });
    }
    const data = await r.json();
    const videos = (data.videos || []).slice(0, n);
    const urls = videos.map(v => pickBestVideoFile(v.video_files)).filter(Boolean);
    const photographers = videos.map(v => v.user?.name).filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({
      url: urls[0] || pickFallback(query),
      urls: urls.length ? urls : [pickFallback(query)],
      query,
      source: urls.length ? 'pexels' : 'fallback-no-results',
      photographer: photographers[0] || null,
      photographers,
    });
  } catch (e) {
    const u = pickFallback(query);
    return res.status(200).json({
      url: u, urls: [u], query, source: 'fallback-exception', error: e.message,
    });
  }
}
