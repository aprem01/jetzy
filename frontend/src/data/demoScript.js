// JETZY · 3-Minute Investor Demo Script
//
// Each background step uses a `query` field — at runtime the app calls
// /api/find-video?q=<query> to fetch the best matching Pexels video.
// Falls back to a curated map if no PEXELS_API_KEY is set.
//
// Architecture: every time the conversation shifts to a new topic
// (steakhouse, sunrise, vineyard, hiking trail), the background shifts
// to a video that actually depicts that topic. Real virtual travel.

export const PATAGONIA_DEMO = [
  // ============================================================
  // OPENING — clear value props
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
  // SCENE 1 — ARIA OPENS
  // ============================================================
  {
    type: 'background',
    location: 'Welcome',
    queries: ['tropical beach palm trees vacation', 'turquoise ocean island paradise', 'maldives overwater bungalow drone'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=1000&fit=crop',
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
  // MARCO — REAL PROBLEM
  // ============================================================
  {
    type: 'user',
    text: "Yeah. I've been planning this for years and I keep getting stuck. I don't even know where to start.",
    pause: 400,
  },

  // ============================================================
  // ARIA HANDS OFF
  // ============================================================
  {
    type: 'avatar',
    text: "Okay. Given your Kilimanjaro trip last February, I think you'll actually love this. Let me bring in Valentina — she's our Argentina specialist. She's helped a few of our travelers do Fitz Roy and she'll know what fits you.",
    mood: 'warm',
    pause: 300,
  },

  // ============================================================
  // SCENE 2 — VALENTINA APPEARS, BUENOS AIRES STREETS
  // ============================================================
  {
    type: 'morph',
    persona: {
      id: 'latam', name: 'Valentina', region: 'Argentina Specialist',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
      color: 'from-amber-500 to-rose-600',
      voiceRate: 0.97, voicePitch: 1.05,
      accent: 'Argentine, warm and grounded',
    },
    pause: 200,
  },
  {
    type: 'background',
    location: 'Buenos Aires',
    queries: ['Buenos Aires Argentina', 'Buenos Aires obelisco', 'Buenos Aires Palermo street', 'Argentina city aerial'],
    image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=1000&fit=crop',
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
  // MARCO AGREES
  // ============================================================
  {
    type: 'user',
    text: "Perfect. That's exactly what I need.",
    pause: 400,
  },

  // ============================================================
  // SCENE 3 — DON JULIO STEAKHOUSE
  // ============================================================
  {
    type: 'background',
    location: 'Don Julio · Palermo',
    queries: ['argentine asado grill', 'steak being cooked grill', 'argentine restaurant interior dim', 'red wine pour glass restaurant'],
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 1 — Don Julio',
    dayNumber: 1,
    pause: 400,
  },
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
  // MARCO ASKS ABOUT THE HIKE
  // ============================================================
  {
    type: 'user',
    text: "Sounds good. What about the hike itself?",
    pause: 400,
  },

  // ============================================================
  // SCENE 4 — FLYING SOUTH OVER PATAGONIA
  // ============================================================
  {
    type: 'background',
    location: 'Patagonian Steppe',
    queries: ['Patagonia landscape', 'plane window mountain view', 'Patagonia road empty steppe'],
    image: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 3 — Flying south',
    dayNumber: 3,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Day three you fly to El Calafate, then a bus into El Chaltén.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas EZE → FTE', location: 'El Calafate', price: '$185', detail: '3hr scenic flight south', day: 3 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 5 — EL CHALTÉN VILLAGE / LODGE
  // ============================================================
  {
    type: 'background',
    location: 'El Chaltén',
    queries: ['El Chalten Argentina', 'mountain village wooden lodge', 'Patagonia hostel hikers'],
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 3 — Senderos Hostería',
    dayNumber: 3,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "I'd put you at Senderos Hostería — small place, climbers stay there, you'll meet people right away.",
    mood: 'warm',
    cartItems: [
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$480', detail: '4 nights, mountain view, breakfast', day: 3 },
    ],
    pause: 500,
  },

  // ============================================================
  // MARCO ASKS ABOUT FITZ ROY
  // ============================================================
  {
    type: 'user',
    text: "And Fitz Roy?",
    pause: 400,
  },

  // ============================================================
  // SCENE 6 — HIKING TRAIL AT DAWN
  // ============================================================
  {
    type: 'background',
    location: 'On the trail · Dawn',
    queries: ['hiker headlamp dawn dark', 'hiking boots trail rocks', 'mountain trail morning light'],
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 4 — On the trail',
    dayNumber: 4,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Day four is the big one. You start at four-thirty in the morning with Lucas — he's our local guide.",
    mood: 'warm',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Full day Fitz Roy sunrise route', day: 4 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 7 — FITZ ROY SUNRISE (the heart of the demo)
  // ============================================================
  {
    type: 'background',
    location: 'Laguna de los Tres at sunrise',
    queries: ['Fitz Roy sunrise alpenglow', 'Patagonia mountain golden light', 'snow peak dawn pink', 'mountain reflection lake sunrise'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 4 — Sunrise on Fitz Roy',
    dayNumber: 4,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "You'll catch sunrise on Fitz Roy. People come from all over the world for that view, and most of them are actually awake when it happens, which helps.",
    mood: 'warm',
    pause: 800,
  },

  // ============================================================
  // MARCO QUIET
  // ============================================================
  {
    type: 'user',
    text: "I've been waiting for that moment my whole life.",
    pause: 600,
  },

  // ============================================================
  // SCENE 8 — COMMUNITY (hikers together)
  // ============================================================
  {
    type: 'background',
    location: 'On the trail · Together',
    queries: ['hikers group friends mountain', 'travelers backpack adventure', 'campfire mountain friends'],
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&h=1000&fit=crop',
    pause: 300,
  },
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
  // SCENE 9 — MENDOZA VINEYARDS
  // ============================================================
  {
    type: 'background',
    location: 'Mendoza Vineyards',
    queries: ['Mendoza vineyard Andes', 'wine country aerial vineyard rows', 'vineyard sunset Argentina', 'malbec grapes vine'],
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 8 — Mendoza',
    dayNumber: 8,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "After the trek you'll be wrecked, so we wind down in Mendoza. One night at Cavas Wine Lodge — plunge pool, Andes in your window.",
    mood: 'warm',
    cartItems: [
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Mendoza', price: '$340', detail: '1 night, private bungalow', day: 8 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 10 — WINE TASTING / POUR
  // ============================================================
  {
    type: 'background',
    location: 'Catena Zapata · Tasting',
    queries: ['red wine pour glass slow motion', 'wine cellar barrels', 'wine swirl glass tasting'],
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Tasting at Catena Zapata at sunset. Soft landing. Then home.",
    mood: 'warm',
    cartItems: [
      { type: 'experience', name: 'Catena Zapata Tasting', location: 'Mendoza', price: '$85/person', detail: 'Cellar tour + 6 wines', day: 8 },
    ],
    pause: 500,
  },

  // ============================================================
  // CLOSING — VALENTINA WRAPS
  // ============================================================
  {
    type: 'avatar',
    text: "That's the trip. Eight days, three regions, twenty-four hundred dollars. Pulling up the itinerary now.",
    mood: 'warm',
    pause: 700,
  },

  // ============================================================
  // FINAL MISSION OVERLAY
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
