// JETZY · 3-Minute Investor Demo Script
// Mission: "Build the intelligent travel companion that knows you,
//          guides you, and connects you with real travelers who've been there."
//
// Real conversation. Fun. Emotional. ElevenLabs HD voices.
// Two personas: Aria (warm female guide), Valentina (Argentine female local).

export const PATAGONIA_DEMO = [
  // ============================================================
  // OPENING — THE HOOK (~12s)
  // ============================================================
  {
    type: 'mission',
    title: 'Travel is broken.',
    subtitle: 'Forty browser tabs. Fake reviews. Missed magic.',
    pause: 3500,
  },
  {
    type: 'mission',
    title: 'What if you had ONE friend',
    subtitle: 'who\'d been everywhere?',
    pause: 3500,
  },
  {
    type: 'mission',
    title: 'Meet Jetzy.',
    subtitle: 'Your intelligent travel companion. Powered by people who\'ve already been.',
    pause: 3000,
  },

  // ============================================================
  // SCENE 1 — ARIA OPENS (10s)
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
    text: "Hey Marco. So — I've been thinking about you. Where in the world has been calling you lately?",
    mood: 'warm',
    pause: 400,
  },

  // ============================================================
  // MARCO OPENS UP (8s)
  // ============================================================
  {
    type: 'user',
    text: "Honestly? Patagonia. I've wanted to hike Fitz Roy my whole life. But I've never been to South America. I have no idea where to start.",
    pause: 500,
  },

  // ============================================================
  // ARIA HANDS OFF — to Valentina (5s)
  // ============================================================
  {
    type: 'avatar',
    text: "Then you don't need me. You need Valentina. She grew up in Buenos Aires, she's hiked Fitz Roy fifteen times, and she's the reason my sister came back from Argentina different. One second.",
    mood: 'excited',
    pause: 300,
  },

  // ============================================================
  // SCENE 2 — VALENTINA MORPHS IN, BUENOS AIRES (15s)
  // ============================================================
  {
    type: 'morph',
    persona: {
      id: 'latam', name: 'Valentina', region: 'Buenos Aires',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
      color: 'from-amber-500 to-rose-600',
      voiceRate: 0.97, voicePitch: 1.05,
      accent: 'Argentine, warm and theatrical',
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
    text: "Marco, mi amor. Listen — I'm going to ruin you. By the end of this trip, you'll never look at a regular Tuesday the same way again. You ready?",
    mood: 'excited',
    pause: 500,
  },

  // ============================================================
  // MARCO LAUGHS (5s)
  // ============================================================
  {
    type: 'user',
    text: "Okay, that is exactly the energy I want. Let's do this.",
    pause: 400,
  },

  // ============================================================
  // VALENTINA STARTS BUILDING — DON JULIO (15s)
  // ============================================================
  {
    type: 'avatar',
    text: "Perfect. We start in Buenos Aires. One night, Palermo Soho, Mio Hotel. Then dinner at Don Julio. Order the entraña medium-rare. Cry a little. Then go to bed. The real trip starts tomorrow.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'AA Philadelphia → Buenos Aires', location: 'Buenos Aires', price: '$890', detail: 'Round-trip economy', day: 1 },
      { type: 'hotel', name: 'Mio Hotel — Palermo Soho', location: 'Buenos Aires', price: '$220', detail: '1 night, junior suite', day: 1 },
      { type: 'restaurant', name: 'Don Julio — VIP Table', location: 'Palermo', price: '$95', detail: 'Skip the line, chef\'s table for 2', day: 1 },
    ],
    pause: 600,
  },

  // ============================================================
  // MARCO GOES FOR IT (5s)
  // ============================================================
  {
    type: 'user',
    text: "I want the hiking part to wreck me. I've been training six months for this.",
    pause: 400,
  },

  // ============================================================
  // SCENE 3 — EL CHALTÉN (15s)
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
    text: "Then we go south. Day three, you fly to El Calafate, then a bus into El Chaltén. Stay at Senderos Hostería — María at the front desk draws trail maps on napkins. The other guests are climbers. You'll find your tribe immediately.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas EZE → FTE', location: 'El Calafate', price: '$185', detail: '3hr scenic flight south', day: 3 },
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$480', detail: '4 nights, mountain view, breakfast', day: 3 },
    ],
    pause: 600,
  },

  // ============================================================
  // SCENE 4 — THE SUNRISE (the heart of the demo, 22s)
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
    text: "And then... day four. Four-thirty in the morning. You hike three hours in the dark with my friend Lucas — he's been guiding Fitz Roy for twelve years. And then the sky turns pink. Then orange. Then Fitz Roy catches first light, and Marco — you stand there for twenty minutes, and you forget your name. This is the moment. This is why people come.",
    mood: 'dreamy',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Full day Fitz Roy sunrise route', day: 4 },
    ],
    pause: 1200,
  },

  // ============================================================
  // MARCO EMOTIONAL (5s)
  // ============================================================
  {
    type: 'user',
    text: "Valentina... that's the moment I've been waiting for my whole life.",
    pause: 700,
  },

  // ============================================================
  // THE COMMUNITY MOMENT — THE MOAT (15s)
  // ============================================================
  {
    type: 'avatar',
    text: "I know, mi amor. That's why I'm telling you. And listen — there are three other Jetzy travelers on that exact trail next week. Aisha just summited Kilimanjaro. James is descending from the W Circuit right now. Sofia is flying in from Lisbon. They've all been waiting too. I'm introducing you to all three. You won't hike alone.",
    mood: 'curious',
    pause: 500,
  },
  {
    type: 'user',
    text: "Yes. All three. Please.",
    pause: 600,
  },

  // ============================================================
  // SCENE 5 — MENDOZA WIND-DOWN (12s)
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
    text: "After the mountains, you'll be raw. So we end soft. Mendoza wine country. Cavas Wine Lodge. Private bungalow, plunge pool, the Andes in your window, a tasting at Catena Zapata at sunset. This is how you come home.",
    mood: 'dreamy',
    cartItems: [
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Mendoza', price: '$340', detail: '1 night, private bungalow + tasting', day: 8 },
      { type: 'experience', name: 'Catena Zapata Premium Tasting', location: 'Mendoza', price: '$85/person', detail: 'Cellar tour + 6 wines', day: 8 },
    ],
    pause: 600,
  },

  // ============================================================
  // VALENTINA LANDS THE CLOSE (10s)
  // ============================================================
  {
    type: 'avatar',
    text: "Eight days. Three regions. Eight bookings. Twenty-four hundred dollars. You leave October twelfth a tourist. You come back a different person. Trust me. I know.",
    mood: 'warm',
    pause: 800,
  },

  // ============================================================
  // FINAL MISSION OVERLAY (4s)
  // ============================================================
  {
    type: 'mission',
    title: 'This is Jetzy.',
    subtitle: 'We don\'t just plan trips. We connect you to the people who\'ve already been.',
    pause: 4000,
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
