/**
 * Renders the Jetzy demo as a shareable MP4 via Shotstack.
 * POST → returns { id } that can be polled at /api/render-status?id=...
 *
 * Uses the sandbox env (free, watermarked output) for now.
 * Switch to v1 prod URL + SHOTSTACK_PROD_KEY when ready to ship.
 */

const SHOTSTACK_URL = 'https://api.shotstack.io/edit/stage/render';

// Hand-curated demo timeline — 8 scenes + 2 mission cards = ~50s total
// Each clip ~5s. Captions overlay text. Background music ties it together.

const SCENES = [
  // Mission opener
  {
    type: 'mission',
    duration: 4,
    title: 'Plan a trip in 90 seconds',
    subtitle: 'No tabs. No spreadsheets. Just answers.',
  },
  // Aria's opening with Kilimanjaro reference
  {
    type: 'video',
    duration: 5,
    src: 'https://videos.pexels.com/video-files/35646306/15106052_1920_1080_30fps.mp4',
    caption: 'Aria: "Hey Marco. You did Kilimanjaro in February. What\'s next?"',
  },
  // Marco answer
  {
    type: 'video',
    duration: 4,
    src: 'https://videos.pexels.com/video-files/2034115/2034115-hd_1920_1080_30fps.mp4',
    caption: 'Marco: "Patagonia. Eight days, mid-October."',
  },
  // Buenos Aires
  {
    type: 'video',
    duration: 5,
    src: 'https://videos.pexels.com/video-files/856975/856975-hd_1920_1080_25fps.mp4',
    caption: 'Day 1 — Buenos Aires. Mio Hotel + Don Julio.',
  },
  // Don Julio
  {
    type: 'video',
    duration: 5,
    src: 'https://videos.pexels.com/video-files/7174763/7174763-hd_1920_1080_30fps.mp4',
    caption: 'Day 1 — Dinner at Don Julio. The entraña is worth it.',
  },
  // El Chaltén
  {
    type: 'video',
    duration: 5,
    src: 'https://videos.pexels.com/video-files/2611250/2611250-hd_1920_1080_30fps.mp4',
    caption: 'Day 3 — El Chaltén. Senderos Hostería, 4 nights.',
  },
  // Fitz Roy sunrise
  {
    type: 'video',
    duration: 5,
    src: 'https://videos.pexels.com/video-files/2421545/2421545-hd_1920_1080_30fps.mp4',
    caption: 'Day 4 — Sunrise on Fitz Roy. Local guide Lucas.',
  },
  // Perito Moreno
  {
    type: 'video',
    duration: 5,
    // Using older URL format that Shotstack can fetch (32881620 path is blocked)
    src: 'https://videos.pexels.com/video-files/8318417/8318417-hd_1920_1080_25fps.mp4',
    caption: 'Day 7 — Perito Moreno glacier. Big Ice trek.',
  },
  // Mendoza
  {
    type: 'video',
    duration: 5,
    src: 'https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4',
    caption: 'Day 8 — Mendoza. Cavas Wine Lodge.',
  },
  // Wine pour
  {
    type: 'video',
    duration: 4,
    src: 'https://videos.pexels.com/video-files/8849303/8849303-hd_1920_1080_24fps.mp4',
    caption: '8 days. 3 regions. $2,400. Booked.',
  },
  // Mission close
  {
    type: 'mission',
    duration: 5,
    title: 'This is Jetzy',
    subtitle: 'Your travel companion. Plan it, book it, done.',
  },
];

function buildTimeline() {
  // Compute running start times
  let t = 0;
  const videoTrack = [];
  const captionTrack = [];

  for (const scene of SCENES) {
    if (scene.type === 'mission') {
      // Solid color background + big title text
      videoTrack.push({
        asset: { type: 'html',
          html: `<div style="width:1280px;height:720px;background:#1B2B4B;display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:'Playfair Display',Georgia,serif;">
            <div style="font-size:14px;letter-spacing:6px;color:#C9A84C;margin-bottom:24px;font-weight:bold;">JETZY</div>
            <div style="font-size:64px;color:white;font-weight:700;text-align:center;margin:0 80px;line-height:1.1;">${scene.title}</div>
            <div style="font-size:24px;color:rgba(255,255,255,0.7);text-align:center;margin:30px 80px 0;font-family:Inter,system-ui,sans-serif;font-weight:400;">${scene.subtitle}</div>
          </div>`,
          width: 1280, height: 720,
        },
        start: t,
        length: scene.duration,
        transition: { in: 'fade', out: 'fade' },
      });
    } else if (scene.type === 'video') {
      videoTrack.push({
        asset: { type: 'video', src: scene.src, volume: 0 },
        start: t,
        length: scene.duration,
        fit: 'cover',
        scale: 1,
        transition: { in: 'fade', out: 'fade' },
      });
      // Caption overlay (lower third, gold accent)
      if (scene.caption) {
        captionTrack.push({
          asset: { type: 'html',
            html: `<div style="width:1100px;display:flex;justify-content:center;"><div style="background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);padding:18px 28px;border-radius:18px;border:1px solid rgba(201,168,76,0.3);max-width:1100px;"><div style="color:white;font-size:26px;font-family:Inter,system-ui,sans-serif;font-weight:500;line-height:1.4;text-align:center;">${scene.caption}</div></div></div>`,
            width: 1100, height: 120,
          },
          start: t + 0.3,
          length: scene.duration - 0.5,
          position: 'bottom',
          offset: { y: -0.05 },
          transition: { in: 'fade', out: 'fade' },
        });
      }
    }
    t += scene.duration;
  }

  return {
    timeline: {
      background: '#000000',
      tracks: [
        { clips: captionTrack }, // top
        { clips: videoTrack },   // bottom
      ],
      // Royalty-free background music from Shotstack's library
      soundtrack: {
        src: 'https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/lit.mp3',
        effect: 'fadeInFadeOut',
        volume: 0.35,
      },
    },
    output: {
      format: 'mp4',
      resolution: 'hd', // 1280x720
      fps: 30,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SHOTSTACK_SANDBOX_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SHOTSTACK_SANDBOX_KEY not set' });

  try {
    const payload = buildTimeline();

    const r = await fetch(SHOTSTACK_URL, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    if (!r.ok || !data?.success) {
      return res.status(500).json({ error: 'Shotstack render failed', detail: data });
    }

    return res.status(200).json({
      id: data.response?.id,
      message: data.response?.message,
      poll: `/api/render-status?id=${data.response?.id}`,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Render error', detail: e.message });
  }
}
