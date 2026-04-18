// JETZY · 3-Minute Investor Demo Script
// Mission: "Build the intelligent travel companion that knows you,
//          guides you, and connects you with real travelers who've been there."
//
// Tight, emotional, real conversation. ElevenLabs voices.
// Background morphs through 8 cinematic scenes. ~3 minutes total.

export const PATAGONIA_DEMO = [
  // ============================================================
  // OPENING — MISSION STATEMENT (4 seconds)
  // ============================================================
  {
    type: 'mission',
    title: 'The intelligent travel companion',
    subtitle: 'that knows you, guides you, and connects you with real travelers who\'ve been there.',
    pause: 3500,
  },

  // ============================================================
  // SCENE 1 — ARIA OPENS (12s)
  // ============================================================
  {
    type: 'background',
    location: 'Welcome',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=1000&fit=crop',
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
    text: "Hey Marco. I've been thinking about you. Where in the world has been calling you lately?",
    mood: 'warm',
    pause: 400,
  },

  // ============================================================
  // MARCO OPENS UP (8s)
  // ============================================================
  {
    type: 'user',
    text: "Honestly? Patagonia. I've wanted to hike Fitz Roy my entire life. But I've never even been to South America. I don't know where to start.",
    pause: 500,
  },

  // ============================================================
  // ARIA HANDS OFF (5s)
  // ============================================================
  {
    type: 'avatar',
    text: "Then you need to talk to Diego. He grew up in Buenos Aires, hiked Fitz Roy seventeen times, and just got back from the W Circuit last month with another Jetzy member. One second.",
    mood: 'excited',
    pause: 300,
  },

  // ============================================================
  // SCENE 2 — DIEGO MORPHS IN, BUENOS AIRES (15s)
  // ============================================================
  {
    type: 'morph',
    persona: {
      id: 'latam', name: 'Diego', region: 'Buenos Aires',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
      color: 'from-amber-500 to-red-600',
      voiceRate: 0.95, voicePitch: 0.95,
      accent: 'Argentine, theatrical',
    },
    pause: 200,
  },
  {
    type: 'background',
    location: 'Buenos Aires · Palermo',
    image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 1 — Buenos Aires',
    dayNumber: 1,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Marco, brother. So we start in Buenos Aires. One night, Palermo Soho — Mio Hotel. That night you eat at Don Julio. Order the entraña medium-rare and trust me on the Malbec. This is the kindest way to land in Argentina.",
    mood: 'excited',
    cartItems: [
      { type: 'flight', name: 'AA Philadelphia → Buenos Aires', location: 'Buenos Aires', price: '$890', detail: 'Round-trip economy', day: 1 },
      { type: 'hotel', name: 'Mio Hotel — Palermo Soho', location: 'Buenos Aires', price: '$220', detail: '1 night, junior suite', day: 1 },
      { type: 'restaurant', name: 'Don Julio — VIP Table', location: 'Palermo', price: '$95', detail: 'Skip the line, chef\'s table for 2', day: 1 },
    ],
    pause: 700,
  },

  // ============================================================
  // SCENE 3 — MARCO ASKS FOR THE HIKE (8s)
  // ============================================================
  {
    type: 'user',
    text: "I want the hiking part to be unforgettable. I've been training six months for this.",
    pause: 400,
  },

  // ============================================================
  // SCENE 4 — EL CHALTÉN (15s)
  // ============================================================
  {
    type: 'background',
    location: 'El Chaltén · Patagonia',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 3 — El Chaltén',
    dayNumber: 3,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Then we fly south. El Chaltén — the trekking capital of South America. I'm putting you at Senderos Hostería for four nights. María at reception draws trail maps on napkins. The other guests are climbers. You'll find your tribe.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas EZE → FTE', location: 'El Calafate', price: '$185', detail: '3hr scenic flight south', day: 3 },
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$480', detail: '4 nights, mountain view, breakfast', day: 3 },
    ],
    pause: 700,
  },

  // ============================================================
  // SCENE 5 — THE SUNRISE MOMENT (20s — the heart of the demo)
  // ============================================================
  {
    type: 'background',
    location: 'Laguna de los Tres at sunrise',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 4 — Sunrise on Fitz Roy',
    dayNumber: 4,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "And then — day four. Four-thirty in the morning. Headlamp on. You hike three hours in the dark with Lucas, my mountain guide. And then Fitz Roy catches first light. Pink, then orange, then pure gold. You stand there for twenty minutes and forget your name. This is why people fly to the end of the earth.",
    mood: 'dreamy',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Full day Fitz Roy sunrise route', day: 4 },
    ],
    pause: 1200,
  },

  // ============================================================
  // SCENE 6 — MARCO EMOTIONAL (5s)
  // ============================================================
  {
    type: 'user',
    text: "Diego... that's the moment I've been waiting my whole life for.",
    pause: 600,
  },

  // ============================================================
  // SCENE 7 — THE COMMUNITY MOMENT (15s — the moat)
  // ============================================================
  {
    type: 'avatar',
    text: "Then I'm doing one more thing. There are three other Jetzy travelers on that trail next week. Aisha just summited Kilimanjaro. James is descending from the W Circuit and has every detail you'll need. Want me to introduce you?",
    mood: 'curious',
    pause: 400,
  },
  {
    type: 'user',
    text: "Yes. All three. That's exactly what I want.",
    pause: 500,
  },

  // ============================================================
  // SCENE 8 — MENDOZA WIND-DOWN (12s)
  // ============================================================
  {
    type: 'background',
    location: 'Cavas Wine Lodge · Mendoza',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 8 — Mendoza',
    dayNumber: 8,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "After the mountains you'll be raw. So we end soft. Mendoza wine country. Cavas Wine Lodge — private bungalow, plunge pool, the Andes on the horizon, a tasting at Catena Zapata. This is how the trip ends.",
    mood: 'dreamy',
    cartItems: [
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Mendoza', price: '$340', detail: '1 night, private bungalow + tasting', day: 8 },
      { type: 'experience', name: 'Catena Zapata Premium Tasting', location: 'Mendoza', price: '$85/person', detail: 'Cellar tour + 6 wines', day: 8 },
    ],
    pause: 700,
  },

  // ============================================================
  // CLOSE — DIEGO LANDS IT (10s)
  // ============================================================
  {
    type: 'avatar',
    text: "Eight days. Three regions. Eight bookings. Two thousand four hundred dollars. You leave October twelfth a tourist. You come back October twentieth a different person. Let me take you to the itinerary.",
    mood: 'warm',
    pause: 800,
  },

  // ============================================================
  // FINAL MISSION OVERLAY (3s before nav)
  // ============================================================
  {
    type: 'mission',
    title: 'This is Jetzy.',
    subtitle: 'We don\'t just plan trips. We connect you to the people who\'ve already been.',
    pause: 3000,
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
