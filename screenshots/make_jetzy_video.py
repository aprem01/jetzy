#!/usr/bin/env python3
"""
Jetzy Demo Video Generator — LOCAL RUN
Uses Microsoft Edge's neural TTS (free, no API key) for studio-quality narration.

SETUP (one-time):
  pip install edge-tts Pillow
  # You also need ffmpeg installed:
  #   macOS:   brew install ffmpeg
  #   Ubuntu:  sudo apt install ffmpeg
  #   Windows: https://ffmpeg.org/download.html  (add to PATH)

RUN:
  python make_jetzy_video.py

Output: jetzy-demo.mp4 in the same folder as this script.

VOICE OPTIONS — change VOICE below to any of these (or many more, see:
  `edge-tts --list-voices` in your terminal)

  en-US-GuyNeural          ← Male, confident, great for product demos  (default)
  en-US-AriaNeural         ← Female, warm, upbeat
  en-US-JennyNeural        ← Female, friendly
  en-US-DavisNeural        ← Male, calm, authoritative
  en-US-TonyNeural         ← Male, casual
  en-US-SaraNeural         ← Female, professional
  en-GB-RyanNeural         ← British male
  en-GB-SoniaNeural        ← British female
  en-AU-WilliamNeural      ← Australian male
"""

import asyncio
import os
import json
import subprocess
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFont

# ─────────────────── CONFIG ───────────────────
VOICE = "en-US-GuyNeural"        # Change this — see list above
RATE = "+0%"                      # "-10%" slower, "+10%" faster
PITCH = "+0Hz"

SCRIPT_DIR = Path(__file__).resolve().parent
SCREENSHOTS_DIR = SCRIPT_DIR      # Script lives in the screenshots folder
WORK_DIR = SCRIPT_DIR / "video_work"
OUTPUT_FILE = SCRIPT_DIR / "jetzy-demo.mp4"

VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
FPS = 30
PAD_SECONDS = 1.2                 # Silence after each narration

(WORK_DIR / "audio").mkdir(parents=True, exist_ok=True)
(WORK_DIR / "frames").mkdir(parents=True, exist_ok=True)

# ─────────────────── SCENES ───────────────────
SCENES = [
    {"id": "intro", "title": "JETZY",
     "shots": ["01-onboarding-splash.png"],
     "script": "This is Jetzy — an AI-powered travel companion for serious travelers. Think Soho House meets travel intelligence. I'm going to walk you through every feature we've built. Let's go."},

    {"id": "scene01", "title": "ONBOARDING",
     "shots": ["01-onboarding-splash.png"],
     "script": "The first thing you see is this. Not a signup form — a full-screen photo of Patagonia. Type your name, tap Let's Go. The onboarding is a visual travel quiz — tap photos of how you travel, select your interests, pick countries you've been to, choose your membership tier. Four screens, thirty seconds, and the AI knows exactly who you are."},

    {"id": "scene02", "title": "HOME FEED",
     "shots": ["02-home-feed.png", "29-home-desktop.png"],
     "script": "This is your personalized home feed. Three intelligence cards at the top. The navy card says For You Right Now — the app knows I just got back from hiking and it's recommending one specific lodge. Not a list of fifty. One perfect answer. The gold card nudges me to share what I learned — two members are already planning the same trip. Below that — Live Now broadcasts, trending destinations with photo cards, hidden gems from real members. Here's the same home feed on desktop — fully responsive, fills the screen."},

    {"id": "scene03", "title": "AI COMPANION",
     "shots": ["03-companion-chat.png"],
     "script": "This is the heart of Jetzy. A live AI Companion powered by Claude and grounded by our three-tiered knowledge graph. Four suggested prompts on first open — tap one and it responds with specific trails, specific lodges, specific prices. See the green badge at the bottom of the response? That says Grounded by Knowledge Graph — three entities matched. The AI can't hallucinate because Tier One verified facts override everything. Tier Two community intel adds real member recommendations. The mic button opens voice mode. The wand opens the Concierge Agent."},

    {"id": "scene04", "title": "VOICE MODE",
     "shots": ["04-voice-mode.png"],
     "script": "Full-screen voice mode. Dark navy with a pulsing gold microphone. Tap and speak naturally — What should I pack for Patagonia? Real-time transcription appears as you talk. Animated waveform while listening. When you stop, it sends to the AI, and the answer plays back as audio AND appears as text. Voice in, voice out. This is how travel planning should work."},

    {"id": "scene05", "title": "CONCIERGE AGENT",
     "shots": ["05-concierge-agent.png"],
     "script": "The Concierge Agent doesn't just answer questions — it builds an entire trip. Type Trek in Patagonia, October, four thousand dollar budget, and hit Build My Trip. Watch the agent work — five steps with animated green checkmarks: checking member intel, finding weather windows, locating Select deals, reviewing your past packing list, building the complete plan. The result is a full day-by-day itinerary with specific places, prices, member-sourced tips, Select deals along your route, and members who know this trail. One prompt, complete plan."},

    {"id": "scene06", "title": "DISCOVER",
     "shots": ["06-discover.png", "30-discover-desktop.png"],
     "script": "Discover — search any destination, filter by Adventure, Culinary, or Urban. Photo-forward cards with member check-in counts. The featured destination gets a hero card with a trending badge. On desktop it expands to a multi-column grid."},

    {"id": "scene07", "title": "DESTINATION DETAIL",
     "shots": ["07-destination-detail.png"],
     "script": "Tap Tokyo and you get the full destination page. Vibe check: Ancient precision meets neon chaos. Member recommendations with credibility badges — Recommended by Sofia R, Culinary Nomad, five countries. Hidden Gem tags on insider-only spots. Ask the Companion button. Been to Tokyo? Share a recommendation button. Everything is connected."},

    {"id": "scene08", "title": "CIRCLES",
     "shots": ["08-circles.png"],
     "script": "Eight traveler circles — Summit Seekers, Culinary Nomads, Solo Women Explorers. At the top, Smart Introductions. The AI noticed Marco just got back from Patagonia, and Aisha is heading there next month. One tap to connect them. Tap any circle to expand — see active members, recent activity, join button."},

    {"id": "scene09", "title": "MATCH",
     "shots": ["09-match.png"],
     "script": "Jetzy Match — AI-powered travel companion matching. Your upcoming trip shown at top. Below, three match cards with circular compatibility scores — eighty-seven percent match. Bullet points: Both hiked Kilimanjaro, same travel style. An AI-written introduction in italics. Request Intro button turns green on tap."},

    {"id": "scene10", "title": "FOR TWO",
     "shots": ["10-for-two.png"],
     "script": "Plan a trip with someone who travels differently. Pick a Jetzy member or enter a friend's style. Set destination and duration. The AI finds the overlap and builds a color-coded itinerary — gold days are your picks, navy days are your partner's, both colors mean overlap. Two travel styles, one perfect trip."},

    {"id": "scene11", "title": "PASSPORT",
     "shots": ["11-passport.png"],
     "script": "Your Jetzy Passport — travel identity made visible. Select Black badge, six countries, fourteen trips. Trust Score ninety-four, Gold Trust. Memory Layer — gold chips showing what the app remembers: Prefers off-grid lodges, Regrets overpacking for Kilimanjaro, Met a guide named Honest. These feed into every AI conversation. Trip timeline, badges earned, shared recommendations. Quick links to Match and Intel."},

    {"id": "scene12", "title": "PERKS",
     "shots": ["12-perks.png"],
     "script": "Perks page. Hero stats — four thousand five hundred forty-three dollars total savings available. Jetzy Moment with a live countdown timer — Aman Tokyo seventy-two percent off, tap Claim. Full-bleed perk cards with discount badges, one-tap claiming. JetPoints tab with earn and redeem mechanics."},

    {"id": "scene13", "title": "LIVE",
     "shots": ["13-live.png"],
     "script": "Jetzy Live — real-time broadcasts. Smart Routing at the top — Routed for you, ninety-eight percent match, relevant because you both hiked Fitz Roy. Four broadcasts with I'm Here Too and Message buttons. Broadcasts expire after twenty-four hours."},

    {"id": "scene14", "title": "DEBRIEF",
     "shots": ["14-debrief.png"],
     "script": "Post-trip debrief. Rate your trip, answer five smart questions, publish to the community. Then it connects you with members planning the same trip. Every returning traveler makes the community smarter. That's the data moat."},

    {"id": "scene15", "title": "ADD RECOMMENDATION",
     "shots": ["15-add-rec.png"],
     "script": "Add a recommendation to any destination. Search destination, pick category, write your tip, toggle Hidden Gem, see a live preview of how it'll look. Publish earns fifty JetPoints."},

    {"id": "scene16", "title": "TRANSLATE",
     "shots": ["16-translate.png"],
     "script": "Jetzy Translate — not just words, cultural intelligence. Type entraña con ensalada mixta. It translates AND tells you: Entraña is THE cut to order at any parrilla. Ask for it a punto. Budget eight thousand to twelve thousand Argentine pesos. That context is what makes it Jetzy."},

    {"id": "scene17", "title": "TRIP REPLAY",
     "shots": ["17-replay.png"],
     "script": "Trip Replay — your trip as a visual story. Day-by-day cards with photos and moods. Five days, three trails, two hidden gems, one sunrise that changed everything. Shareable like Spotify Wrapped for travel."},

    {"id": "scene18", "title": "ALERTS",
     "shots": ["18-alerts.png"],
     "script": "Jetzy Alerts — proactive intelligence. Flights to Patagonia dropped forty percent. A member just posted from Torres del Paine. Your dream lodge has a cancellation. Trail conditions after rain. Time-sensitive alerts with gold banners. The app pushes knowledge to you before you need it."},

    {"id": "scene19", "title": "LOCAL FIXERS",
     "shots": ["19-fixers.png"],
     "script": "Local Fixer Network. Not a marketplace — curated by members. Honest in Moshi, forty-eight trips, Trust Score ninety-eight. María in El Chaltén, Yuki in Tokyo. Trust scores, member review counts, specific pricing. Contact button. Real people, verified by the community."},

    {"id": "scene20", "title": "JOURNAL",
     "shots": ["20-journal.png"],
     "script": "Travel Journal. Speak into it each night, AI turns it into polished prose. Past entries with dates, locations, weather, and moods. The sunrise that changed everything — Euphoric. Your travel story, written as you live it."},

    {"id": "scene21", "title": "PACKING AI",
     "shots": ["21-packing.png"],
     "script": "Packing AI — personalized to your past trips. It knows I climbed Kilimanjaro. Keep: hiking boots, merino layers. Add: waterproof hardshell — Patagonia rain is horizontal. Remove: down jacket — too wet for down. Interactive checklist with progress bar. Critical items flagged in red."},

    {"id": "scene22", "title": "COST INTELLIGENCE",
     "shots": ["22-costs.png"],
     "script": "Real prices from members who were just there. El Chaltén: members spend eighty-seven dollars per day. Travel blogs say one twenty. That's twenty-eight percent cheaper. Every item priced in local currency and USD. Budget, mid-range, and luxury tiers. This data is our moat."},

    {"id": "scene23", "title": "SAFETY",
     "shots": ["23-safety.png"],
     "script": "Safety Layer for solo travelers. Location sharing with a trusted contact. Solo check-in timer — if you don't check in, your contact gets notified. Community safety alerts by destination — color-coded low, medium, high risk."},

    {"id": "scene24", "title": "WISHLIST",
     "shots": ["24-wishlist.png"],
     "script": "Wishlist — save destinations and experiences. The AI notices patterns: You've saved mountain destinations — have you considered the Dolomites? Photo cards with personal notes. It learns your travel DNA."},

    {"id": "scene25", "title": "SEASONAL CALENDAR",
     "shots": ["25-calendar.png"],
     "script": "Where to go when. Tap any month. June: Torres del Paine for winter hiking with empty trails. August: Serengeti for Mara River crossings. Weather, crowd levels, member ratings. All sourced from real experience."},

    {"id": "scene26", "title": "GEAR REVIEWS",
     "shots": ["26-gear.png"],
     "script": "Gear Reviews — tested on the actual trail, not in a showroom. Members who hiked Patagonia tell you which jacket survived the wind. Four point nine stars, twenty-three reviews. Expandable cards with member verdicts and top reviews."},

    {"id": "scene27", "title": "EXPENSES",
     "shots": ["27-expenses.png"],
     "script": "Trip Cost Tracker. Log every expense by category. Visual pie breakdown — lodging fifty-one percent, food eighteen percent. Total spend, daily average. Jetzy Insight: You spent twenty-eight percent less than blogs predicted. This data feeds back to Cost Intelligence for the next traveler."},

    {"id": "scene28", "title": "INTELLIGENCE DASHBOARD",
     "shots": ["28-intel.png", "31-intel-desktop.png"],
     "script": "Intelligence Dashboard. Trending destinations with percentage changes. Live heat map with pulsing gold dots. Travel sentiment — adventure up twenty-three percent, culinary up thirty-one percent. Your Travel DNA vs the community — You are two times more adventurous than the average Jetzy member. Knowledge Graph stats. Seventy Tier One verified facts, eighty-seven Tier Two community intel. Every Companion response is grounded by this graph. On desktop, the full data story for investors."},

    {"id": "closing", "title": "JETZY",
     "shots": ["29-home-desktop.png"],
     "script": "Thirty-one features. Live AI with Graph RAG. Voice mode. Agentic trip planning. A knowledge graph that gets smarter with every trip. This is not a travel app with deals. This is the intelligent companion for people who travel with intention. That is Jetzy."},
]


# ─────────────────── TTS ───────────────────
async def synthesize(text: str, output_path: Path):
    """Generate neural TTS audio via Microsoft Edge."""
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(output_path))


def probe_duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
        capture_output=True, text=True
    )
    return float(json.loads(r.stdout)["format"]["duration"])


# ─────────────────── FRAMES ───────────────────
def try_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()


def create_frame(screenshot_path: Path, title: str, output_path: Path):
    img = Image.open(screenshot_path).convert("RGB")
    ar = img.width / img.height
    tar = VIDEO_WIDTH / VIDEO_HEIGHT
    if ar > tar:
        new_h, new_w = VIDEO_HEIGHT, int(VIDEO_HEIGHT * ar)
    else:
        new_w, new_h = VIDEO_WIDTH, int(VIDEO_WIDTH / ar)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - VIDEO_WIDTH) // 2
    top = (new_h - VIDEO_HEIGHT) // 2
    img = img.crop((left, top, left + VIDEO_WIDTH, top + VIDEO_HEIGHT))

    overlay = Image.new("RGBA", (VIDEO_WIDTH, VIDEO_HEIGHT), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(VIDEO_HEIGHT - 180, VIDEO_HEIGHT):
        alpha = int(200 * (y - (VIDEO_HEIGHT - 180)) / 180)
        d.rectangle([(0, y), (VIDEO_WIDTH, y)], fill=(10, 15, 30, alpha))
    for y in range(0, 70):
        alpha = int(160 * (70 - y) / 70)
        d.rectangle([(0, y), (VIDEO_WIDTH, y)], fill=(10, 15, 30, alpha))

    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    d = ImageDraw.Draw(img)
    title_font = try_font(44)
    brand_font = try_font(22)
    gold = (212, 175, 55, 255)

    bbox = d.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    x = (VIDEO_WIDTH - tw) // 2
    y = VIDEO_HEIGHT - 70
    d.text((x + 2, y + 2), title, fill=(0, 0, 0, 180), font=title_font)
    d.text((x, y), title, fill=gold, font=title_font)
    d.text((30, 18), "JETZY", fill=gold, font=brand_font)
    d.rectangle([(VIDEO_WIDTH // 2 - 80, VIDEO_HEIGHT - 85),
                 (VIDEO_WIDTH // 2 + 80, VIDEO_HEIGHT - 83)], fill=gold)

    img.convert("RGB").save(output_path, quality=95)


# ─────────────────── MAIN ───────────────────
async def main():
    print(f"=== JETZY DEMO GENERATOR — voice: {VOICE} ===\n")

    # Verify screenshots
    missing = [s for sc in SCENES for s in sc["shots"]
               if not (SCREENSHOTS_DIR / s).exists()]
    if missing:
        print("ERROR: Missing screenshots:")
        for m in missing:
            print(" ", m)
        return

    # 1. TTS
    print(f"[1/4] Generating neural narration ({len(SCENES)} scenes)...")
    scenes = []
    for i, sc in enumerate(SCENES, 1):
        audio = WORK_DIR / "audio" / f"{sc['id']}.mp3"
        await synthesize(sc["script"], audio)
        dur = probe_duration(audio)
        scenes.append({**sc, "audio": audio, "audio_dur": dur,
                       "total_dur": dur + PAD_SECONDS})
        print(f"  [{i:2d}/{len(SCENES)}] {sc['title']:<24} {dur:5.1f}s")

    total = sum(s["total_dur"] for s in scenes)
    print(f"\n  Total: {total:.0f}s ({total/60:.1f} min)\n")

    # 2. Frames
    print("[2/4] Rendering frames...")
    segments = []
    for s in scenes:
        per = s["total_dur"] / len(s["shots"])
        for j, shot in enumerate(s["shots"]):
            frame = WORK_DIR / "frames" / f"{s['id']}_{j}.png"
            create_frame(SCREENSHOTS_DIR / shot, s["title"], frame)
            segments.append({"frame": frame, "dur": per})
    print(f"  {len(segments)} frames rendered\n")

    # 3. Video (single-pass concat)
    print("[3/4] Encoding video...")
    concat_txt = WORK_DIR / "images.txt"
    with concat_txt.open("w") as f:
        for seg in segments:
            f.write(f"file '{seg['frame']}'\n")
            f.write(f"duration {seg['dur']}\n")
        f.write(f"file '{segments[-1]['frame']}'\n")

    video_only = WORK_DIR / "video_only.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_txt),
        "-vsync", "vfr",
        "-vf", "format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-r", str(FPS),
        str(video_only)
    ], check=True)

    # 4. Audio track (pad each narration to match scene duration)
    print("[4/4] Building audio track and muxing...")
    padded = []
    for s in scenes:
        p = WORK_DIR / "audio" / f"{s['id']}_padded.m4a"
        subprocess.run([
            "ffmpeg", "-y", "-i", str(s["audio"]),
            "-af", f"apad=pad_dur={PAD_SECONDS}",
            "-t", str(s["total_dur"]),
            "-ar", "44100", "-ac", "2",
            "-c:a", "aac", "-b:a", "192k",
            str(p)
        ], check=True, capture_output=True)
        padded.append(p)

    audio_concat = WORK_DIR / "audio.txt"
    with audio_concat.open("w") as f:
        for p in padded:
            f.write(f"file '{p}'\n")

    audio_final = WORK_DIR / "audio_final.m4a"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(audio_concat), "-c", "copy", str(audio_final)
    ], check=True, capture_output=True)

    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(video_only), "-i", str(audio_final),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart",
        str(OUTPUT_FILE)
    ], check=True, capture_output=True)

    size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    dur = probe_duration(OUTPUT_FILE)
    print(f"\n✓ DONE → {OUTPUT_FILE}")
    print(f"  {dur:.0f}s ({dur/60:.1f} min) · {size_mb:.1f} MB · voice: {VOICE}\n")


if __name__ == "__main__":
    asyncio.run(main())
