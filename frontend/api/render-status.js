/**
 * Polls Shotstack render status. Returns { status, url } when complete.
 */

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'id required' });

  const apiKey = process.env.SHOTSTACK_SANDBOX_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SHOTSTACK_SANDBOX_KEY not set' });

  try {
    const r = await fetch(`https://api.shotstack.io/edit/stage/render/${id}`, {
      headers: { 'x-api-key': apiKey },
    });
    const data = await r.json();
    if (!data?.success) return res.status(500).json({ error: 'Status check failed', detail: data });

    const resp = data.response || {};
    return res.status(200).json({
      id,
      status: resp.status,         // queued, fetching, rendering, saving, done, failed
      url: resp.url || null,        // populated when done
      error: resp.error || null,
      duration: resp.duration,
      created: resp.created,
      updated: resp.updated,
      poster: resp.poster,
      thumbnail: resp.thumbnail,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Status error', detail: e.message });
  }
}
