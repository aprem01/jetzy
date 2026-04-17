/**
 * Fetches a high-quality image for ANY location name.
 * Tries Wikipedia REST API first (free, fast, CORS-enabled),
 * falls back to a generic travel image.
 */

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=1000&fit=crop';

async function tryWikipedia(location) {
  try {
    // Try the exact title first
    const titleVariants = [
      location,
      location.replace(/\s+/g, '_'),
      location.split(',')[0].trim(),
      location.split(',')[0].trim().replace(/\s+/g, '_'),
    ];

    for (const title of titleVariants) {
      const encoded = encodeURIComponent(title);
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
        headers: { 'User-Agent': 'Jetzy/1.0' }
      });
      if (!res.ok) continue;
      const data = await res.json();

      // Prefer the original (full-size) image, fall back to thumbnail
      const img = data.originalimage?.source || data.thumbnail?.source;
      if (img) {
        // Upgrade thumbnail URL to higher resolution if it's a Wikipedia thumbnail path
        const upgraded = img.replace(/\/\d+px-/, '/1600px-');
        return {
          image: upgraded,
          title: data.title,
          extract: data.extract,
        };
      }
    }
  } catch (e) {
    console.log('Wikipedia fetch error:', e.message);
  }
  return null;
}

async function tryWikipediaSearch(location) {
  try {
    // Search for the location, get first result, then fetch its summary
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(location)}&format=json&origin=*`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    const firstResult = data?.query?.search?.[0];
    if (!firstResult) return null;
    return await tryWikipedia(firstResult.title);
  } catch (e) {
    console.log('Wikipedia search error:', e.message);
    return null;
  }
}

export default async function handler(req, res) {
  const location = req.query.location || req.body?.location;
  if (!location) {
    return res.status(400).json({ error: 'location required' });
  }

  // Try direct Wikipedia lookup, then search fallback
  let result = await tryWikipedia(location);
  if (!result) result = await tryWikipediaSearch(location);

  if (!result) {
    return res.status(200).json({ image: FALLBACK_IMG, title: location, extract: '' });
  }

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).json(result);
}
