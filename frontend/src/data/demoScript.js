// JETZY · ~90-second Investor Demo Script
// Per CEO feedback (Apr 19):
//  - ONE AI agent (Aria). No second "specialist" handoff — fake & slow.
//  - Direct conversation. No chit-chat. Get to recommendations fast.
//  - User stays neutral. No "waiting my whole life" exaggeration.
//  - Better videos via Pexels API (real Perito Moreno, real locations).

const ARIA = {
  id: 'default', name: 'Aria', region: 'Your Companion',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  color: 'from-indigo-500 to-purple-600',
  voiceRate: 0.95, voicePitch: 1.0, accent: 'warm',
};

export const PATAGONIA_DEMO = [
  // ============================================================
  // OPENING — single mission card
  // ============================================================
  {
    type: 'mission',
    title: 'Plan a trip in 90 seconds.',
    subtitle: 'No tabs. No spreadsheets. Just answers.',
    pause: 3000,
  },

  // ============================================================
  // SCENE 1 — Aria opens, references past trip from memory
  // ============================================================
  {
    type: 'background',
    location: 'Welcome',
    video: 'https://videos.pexels.com/video-files/35646306/15106052_1920_1080_30fps.mp4', // Kilimanjaro aerial
    image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=1600&h=1000&fit=crop',
    pause: 200,
  },
  {
    type: 'avatar',
    persona: ARIA,
    text: "Hey Marco. You did Kilimanjaro in February. What's next?",
    mood: 'warm',
    pause: 300,
  },
  {
    type: 'user',
    text: "Patagonia. Eight days, mid-October.",
    pause: 300,
  },

  // ============================================================
  // SCENE 2 — Aria starts building, Buenos Aires
  // ============================================================
  {
    type: 'background',
    location: 'Buenos Aires',
    queries: ['Buenos Aires Argentina', 'Buenos Aires obelisco aerial'],
    image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 1 — Buenos Aires',
    dayNumber: 1,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Day one — Buenos Aires. One night at Mio Hotel in Palermo. Dinner at Don Julio.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'AA Philadelphia → Buenos Aires', location: 'Buenos Aires', price: '$890', detail: 'Round-trip economy', day: 1 },
      { type: 'hotel', name: 'Mio Hotel — Palermo', location: 'Buenos Aires', price: '$220', detail: '1 night', day: 1 },
      { type: 'restaurant', name: 'Don Julio', location: 'Palermo', price: '$95', detail: 'Reservation, 8pm', day: 1 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 3 — Don Julio
  // ============================================================
  {
    type: 'background',
    location: 'Don Julio',
    video: 'https://videos.pexels.com/video-files/7174763/7174763-hd_1920_1080_30fps.mp4',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1600&h=1000&fit=crop',
    pause: 200,
  },

  // ============================================================
  // SCENE 4 — El Chaltén lodge
  // ============================================================
  {
    type: 'background',
    location: 'El Chaltén',
    queries: ['El Chalten Argentina', 'mountain village wooden lodge'],
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 3 — El Chaltén',
    dayNumber: 3,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Day three — fly south to El Calafate, drive to El Chaltén. Senderos Hostería, four nights.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas EZE → FTE', location: 'El Calafate', price: '$185', detail: '3hr', day: 3 },
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$480', detail: '4 nights, breakfast', day: 3 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 5 — Fitz Roy sunrise
  // ============================================================
  {
    type: 'background',
    location: 'Fitz Roy at sunrise',
    queries: ['Fitz Roy sunrise alpenglow', 'snow peak dawn pink alpenglow'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 4 — Sunrise on Fitz Roy',
    dayNumber: 4,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Day four — sunrise on Fitz Roy. Local guide Lucas. Ten hour round trip.",
    mood: 'warm',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Sunrise route', day: 4 },
    ],
    pause: 400,
  },

  // ============================================================
  // MARCO ASKS ABOUT PERITO MORENO
  // ============================================================
  {
    type: 'user',
    text: "What about Perito Moreno?",
    pause: 200,
  },

  // ============================================================
  // SCENE 6 — PERITO MORENO GLACIER (real Pexels video)
  // ============================================================
  {
    type: 'background',
    location: 'Perito Moreno Glacier',
    // Hand-picked: Sergey Guk aerial Perito Moreno glacier 1080p
    video: 'https://videos.pexels.com/video-files/32881620/14014157_1920_1080_25fps.mp4',
    image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 7 — Perito Moreno',
    dayNumber: 7,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Adding it — Day seven. Park entry plus a Big Ice trek. Two hours on the glacier.",
    mood: 'warm',
    cartItems: [
      { type: 'experience', name: 'Perito Moreno Park Entry', location: 'El Calafate', price: '$35', detail: '', day: 7 },
      { type: 'experience', name: 'Big Ice Glacier Trek', location: 'El Calafate', price: '$120', detail: '2hr, crampons + guide', day: 7 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 7 — Mendoza vineyards
  // ============================================================
  {
    type: 'background',
    location: 'Mendoza',
    queries: ['Mendoza vineyard Andes mountains', 'wine country aerial vineyard rows'],
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 8 — Mendoza',
    dayNumber: 8,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Day eight — wind down in Mendoza. Cavas Wine Lodge, tasting at Catena Zapata.",
    mood: 'warm',
    cartItems: [
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Mendoza', price: '$340', detail: '1 night', day: 8 },
      { type: 'experience', name: 'Catena Zapata Tasting', location: 'Mendoza', price: '$85/person', detail: '', day: 8 },
    ],
    pause: 400,
  },

  // ============================================================
  // SCENE 8 — Wine pour close
  // ============================================================
  {
    type: 'background',
    location: 'Wine tasting',
    video: 'https://videos.pexels.com/video-files/8849303/8849303-hd_1920_1080_24fps.mp4',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    pause: 200,
  },
  {
    type: 'avatar',
    text: "Eight days. Three regions. Twenty-four hundred. Want me to book it?",
    mood: 'warm',
    pause: 300,
  },
  {
    type: 'user',
    text: "Yes. Book it.",
    pause: 600,
  },

  // ============================================================
  // FINAL MISSION OVERLAY
  // ============================================================
  {
    type: 'mission',
    title: 'This is Jetzy.',
    subtitle: 'Your travel companion. Plan it, book it, done.',
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
