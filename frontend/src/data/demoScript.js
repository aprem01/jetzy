// JETZY · 3-Minute Investor Demo Script
//
// Tone: confident, human, light. 85% clarity + trust, 15% personality.
// No theatrics. No "mi amor". Real conversation a real person would have.
// People buy confidence, not charm.

export const PATAGONIA_DEMO = [
  // ============================================================
  // OPENING — clear value props (~9s)
  // ============================================================
  {
    type: 'mission',
    title: 'Trip planning is a mess.',
    subtitle: 'Twenty browser tabs. No clear answers.',
    pause: 3000,
  },
  {
    type: 'mission',
    title: 'Jetzy fixes that.',
    subtitle: 'A travel companion that knows you, plus the people who\'ve actually been there.',
    pause: 3500,
  },

  // ============================================================
  // SCENE 1 — ARIA OPENS, NO FLUFF (8s)
  // ============================================================
  {
    type: 'background',
    location: 'Welcome',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=1000&fit=crop',
    video: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    pause: 200,
  },
  {
    type: 'avatar',
    persona: {
      id: 'default', name: 'Aria', region: 'Your Companion',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      color: 'from-indigo-500 to-purple-600',
      voiceRate: 0.95, voicePitch: 1.0, accent: 'warm',
    },
    text: "Hey Marco. Welcome back. So — last time we talked, you were saying Patagonia was on your mind. Still thinking about it?",
    mood: 'warm',
    pause: 400,
  },

  // ============================================================
  // MARCO — REAL PROBLEM (8s)
  // ============================================================
  {
    type: 'user',
    text: "Yeah. I've been planning this for years and I keep getting stuck. I don't even know where to start.",
    pause: 400,
  },

  // ============================================================
  // ARIA HANDS OFF — REFERENCES MARCO'S PROFILE (8s)
  // ============================================================
  {
    type: 'avatar',
    text: "Okay. Given your Kilimanjaro trip last February, I think you'll actually love this. Let me bring in Valentina — she lives in Buenos Aires, she's helped a few of our travelers do Fitz Roy. She'll know what fits you.",
    mood: 'warm',
    pause: 300,
  },

  // ============================================================
  // SCENE 2 — VALENTINA, BUENOS AIRES (12s)
  // ============================================================
  {
    type: 'morph',
    persona: {
      id: 'latam', name: 'Valentina', region: 'Buenos Aires',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
      color: 'from-amber-500 to-rose-600',
      voiceRate: 0.97, voicePitch: 1.05,
      accent: 'Argentine, warm and grounded',
    },
    pause: 200,
  },
  {
    type: 'background',
    location: 'Buenos Aires · Palermo',
    image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=1000&fit=crop',
    video: 'https://videos.pexels.com/video-files/2034115/2034115-hd_1920_1080_30fps.mp4',
    dayLabel: 'Day 1 — Buenos Aires',
    dayNumber: 1,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Hey Marco. Aria filled me in. Patagonia's a great choice — and honestly, since you've already done Kilimanjaro, you're more than ready for this. Let's keep it simple. I'll build the trip, you tell me when something doesn't fit.",
    mood: 'warm',
    pause: 400,
  },

  // ============================================================
  // MARCO AGREES (4s)
  // ============================================================
  {
    type: 'user',
    text: "Perfect. That's exactly what I need.",
    pause: 400,
  },

  // ============================================================
  // VALENTINA BUILDS BUENOS AIRES (15s)
  // ============================================================
  {
    type: 'avatar',
    text: "Day one — fly into Buenos Aires. One night to recover. Eat at Don Julio in Palermo. The entraña is worth it. Then we head south.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'AA Philadelphia → Buenos Aires', location: 'Buenos Aires', price: '$890', detail: 'Round-trip economy', day: 1 },
      { type: 'hotel', name: 'Mio Hotel — Palermo Soho', location: 'Buenos Aires', price: '$220', detail: '1 night, junior suite', day: 1 },
      { type: 'restaurant', name: 'Don Julio — Reservation', location: 'Palermo', price: '$95', detail: 'Skip the line, table for 2', day: 1 },
    ],
    pause: 500,
  },

  // ============================================================
  // MARCO ASKS ABOUT THE HIKE (4s)
  // ============================================================
  {
    type: 'user',
    text: "Sounds good. What about the hike itself?",
    pause: 400,
  },

  // ============================================================
  // SCENE 3 — EL CHALTÉN (12s)
  // ============================================================
  {
    type: 'background',
    location: 'El Chaltén · Patagonia',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop',
    video: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
    dayLabel: 'Day 3 — El Chaltén',
    dayNumber: 3,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Day three you fly to El Calafate, then a bus into El Chaltén. I'd put you at Senderos Hostería — small place, climbers stay there, you'll meet people.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas EZE → FTE', location: 'El Calafate', price: '$185', detail: '3hr scenic flight south', day: 3 },
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$480', detail: '4 nights, mountain view, breakfast', day: 3 },
    ],
    pause: 500,
  },

  // ============================================================
  // MARCO ASKS ABOUT FITZ ROY (3s)
  // ============================================================
  {
    type: 'user',
    text: "And Fitz Roy?",
    pause: 400,
  },

  // ============================================================
  // SCENE 4 — THE SUNRISE (the heart, 18s)
  // ============================================================
  {
    type: 'background',
    location: 'Laguna de los Tres at sunrise',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop',
    video: 'https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4',
    dayLabel: 'Day 4 — Sunrise on Fitz Roy',
    dayNumber: 4,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Day four is the big one. You start at four-thirty in the morning with Lucas — he's our local guide. You'll catch sunrise on Fitz Roy. People come from all over the world for that view, and most of them are actually awake when it happens, which helps.",
    mood: 'warm',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Full day Fitz Roy sunrise route', day: 4 },
    ],
    pause: 800,
  },

  // ============================================================
  // MARCO QUIET (4s)
  // ============================================================
  {
    type: 'user',
    text: "I've been waiting for that moment my whole life.",
    pause: 600,
  },

  // ============================================================
  // THE COMMUNITY MOMENT — THE MOAT (12s)
  // ============================================================
  {
    type: 'avatar',
    text: "Yeah. It lives up to it. Three other Jetzy travelers are on that trail next week — Aisha, James, Sofia. Want me to introduce you? It's easier than figuring it out alone.",
    mood: 'warm',
    pause: 400,
  },
  {
    type: 'user',
    text: "Yes. All three.",
    pause: 500,
  },

  // ============================================================
  // SCENE 5 — MENDOZA (10s)
  // ============================================================
  {
    type: 'background',
    location: 'Cavas Wine Lodge · Mendoza',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    video: 'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4',
    dayLabel: 'Day 8 — Mendoza',
    dayNumber: 8,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "After the trek you'll be wrecked, so we wind down in Mendoza. One night at Cavas Wine Lodge — plunge pool, tasting at Catena Zapata. Soft landing.",
    mood: 'warm',
    cartItems: [
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Mendoza', price: '$340', detail: '1 night, private bungalow + tasting', day: 8 },
      { type: 'experience', name: 'Catena Zapata Tasting', location: 'Mendoza', price: '$85/person', detail: 'Cellar tour + 6 wines', day: 8 },
    ],
    pause: 500,
  },

  // ============================================================
  // CLOSING — VALENTINA WRAPS (8s)
  // ============================================================
  {
    type: 'avatar',
    text: "That's the trip. Eight days, three regions, twenty-four hundred dollars. Pulling up the itinerary now.",
    mood: 'warm',
    pause: 700,
  },

  // ============================================================
  // FINAL MISSION OVERLAY (3.5s)
  // ============================================================
  {
    type: 'mission',
    title: 'This is Jetzy.',
    subtitle: 'Your travel companion, plus the people who\'ve actually been there.',
    pause: 3500,
  },

  // ============================================================
  // NAVIGATE TO ITINERARY
  // ============================================================
  {
    type: 'goto',
    path: '/itinerary?demo=auto',
    pause: 0,
  },
];
