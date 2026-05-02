/**
 * Geocodes a location name to coordinates using OpenStreetMap Nominatim.
 * Falls back to a known-locations lookup map for common destinations
 * when Nominatim returns no results.
 */

const KNOWN_LOCATIONS = {
  'fitz roy': {
    lat: -49.27,
    lng: -73.04,
    displayName: 'Mount Fitz Roy, Patagonia, Argentina',
    type: 'mountain',
    country: 'Argentina',
  },
  'perito moreno': {
    lat: -50.49,
    lng: -73.04,
    displayName: 'Perito Moreno Glacier, Santa Cruz, Argentina',
    type: 'glacier',
    country: 'Argentina',
  },
  mahabalipuram: {
    lat: 12.62,
    lng: 80.19,
    displayName: 'Mahabalipuram, Tamil Nadu, India',
    type: 'town',
    country: 'India',
  },
  'buenos aires': {
    lat: -34.6,
    lng: -58.38,
    displayName: 'Buenos Aires, Argentina',
    type: 'city',
    country: 'Argentina',
  },
  'el chalten': {
    lat: -49.33,
    lng: -72.89,
    displayName: 'El Chaltén, Santa Cruz, Argentina',
    type: 'town',
    country: 'Argentina',
  },
  mendoza: {
    lat: -32.89,
    lng: -68.84,
    displayName: 'Mendoza, Argentina',
    type: 'city',
    country: 'Argentina',
  },
  kilimanjaro: {
    lat: -3.07,
    lng: 37.36,
    displayName: 'Mount Kilimanjaro, Tanzania',
    type: 'mountain',
    country: 'Tanzania',
  },
  tokyo: {
    lat: 35.68,
    lng: 139.69,
    displayName: 'Tokyo, Japan',
    type: 'city',
    country: 'Japan',
  },
};

const USER_AGENT = 'Jetzy/1.0 (https://jetzy-app.vercel.app)';

function normalizeKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function knownLookup(q) {
  const key = normalizeKey(q);
  if (KNOWN_LOCATIONS[key]) {
    const k = KNOWN_LOCATIONS[key];
    return {
      name: q,
      lat: k.lat,
      lng: k.lng,
      displayName: k.displayName,
      type: k.type,
      country: k.country,
      bbox: null,
    };
  }
  // Try first segment before comma
  const first = normalizeKey(String(q).split(',')[0]);
  if (first && KNOWN_LOCATIONS[first]) {
    const k = KNOWN_LOCATIONS[first];
    return {
      name: q,
      lat: k.lat,
      lng: k.lng,
      displayName: k.displayName,
      type: k.type,
      country: k.country,
      bbox: null,
    };
  }
  return null;
}

async function callNominatim(q, extraParams = '') {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    q
  )}&format=json&limit=1&addressdetails=1${extraParams}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const hit = data[0];
  const lat = parseFloat(hit.lat);
  const lng = parseFloat(hit.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  let bbox = null;
  if (Array.isArray(hit.boundingbox) && hit.boundingbox.length === 4) {
    const [s, n, w, e] = hit.boundingbox.map(parseFloat);
    if (![s, n, w, e].some(Number.isNaN)) {
      // [west, south, east, north]
      bbox = [w, s, e, n];
    }
  }
  const country =
    hit.address?.country ||
    (typeof hit.display_name === 'string'
      ? hit.display_name.split(',').pop().trim()
      : null);
  return {
    name: q,
    lat,
    lng,
    displayName: hit.display_name || q,
    type: hit.type || hit.class || null,
    country: country || null,
    bbox,
  };
}

export default async function handler(req, res) {
  const q = req.query?.q || req.body?.q;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ url: null, error: 'q parameter required' });
  }

  try {
    // 1. Primary Nominatim lookup
    let result = await callNominatim(q);

    // 2. Retry with featuretype=city if first try failed
    if (!result) {
      result = await callNominatim(q, '&featuretype=city');
    }

    // 3. Fall back to known-locations map
    if (!result) {
      result = knownLookup(q);
    }

    if (!result) {
      return res.status(200).json({ url: null, error: 'no results found' });
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=604800, stale-while-revalidate=86400'
    );
    return res.status(200).json(result);
  } catch (err) {
    // Last-ditch: try known map even on network error
    const fallback = knownLookup(q);
    if (fallback) {
      res.setHeader('Cache-Control', 's-maxage=604800');
      return res.status(200).json(fallback);
    }
    return res
      .status(200)
      .json({ url: null, error: err?.message || 'geocode failed' });
  }
}
