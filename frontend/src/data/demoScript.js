// Self-running 10-day Argentina journey demo.
// Travels through 9 distinct scenes — each background image change is
// a new leg of the trip. Cart items tagged with `day` for the
// itinerary screen to group them chronologically.
//
// Step types:
//   { type: 'avatar', text, mood, persona?, cartItems?, pause? }
//   { type: 'user', text, pause? }
//   { type: 'morph', persona, pause? }
//   { type: 'background', location, image, dayLabel?, dayNumber?, pause? }
//   { type: 'goto', path, pause? }

export const PATAGONIA_DEMO = [
  // === ARRIVAL — meeting Aria ===
  {
    type: 'avatar',
    persona: {
      id: 'default', name: 'Aria', region: 'World',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      color: 'from-indigo-500 to-purple-600',
      voiceRate: 0.95, voicePitch: 1.0, accent: 'warm, neutral English',
    },
    text: "Hi Marco — I'm your travel companion. Tell me about a place you've been dreaming about, and I'll take you there.",
    mood: 'warm',
    pause: 500,
  },

  // === USER PITCHES THE TRIP ===
  {
    type: 'user',
    text: "I want to plan a 10-day trip through Argentina — start in Buenos Aires, hike Patagonia, end in the wine country.",
    pause: 600,
  },

  // === DIEGO MORPHS IN ===
  {
    type: 'morph',
    persona: {
      id: 'latam', name: 'Diego', region: 'Latin America',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
      color: 'from-amber-500 to-red-600',
      voiceRate: 0.95, voicePitch: 0.95,
      accent: 'Argentine English, theatrical',
    },
    pause: 200,
  },

  // ============ DAY 1: BUENOS AIRES ============
  {
    type: 'background',
    location: 'Buenos Aires',
    image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 1 — Buenos Aires',
    dayNumber: 1,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "Che, perfect. We start in Buenos Aires. Land Wednesday, settle into Palermo Soho — Mio Hotel, beautiful boutique. That night, we eat. Don Julio. Skip-the-line table, entraña medium-rare, a bottle of Mendoza Malbec.",
    mood: 'excited',
    cartItems: [
      { type: 'flight', name: 'AA Philly → EZE Buenos Aires', location: 'Buenos Aires', price: '$890', detail: 'Round-trip economy + 1 stop', day: 1 },
      { type: 'hotel', name: 'Mio Buenos Aires', location: 'Palermo Soho', price: '$220/night', detail: '2 nights, junior suite', day: 1 },
      { type: 'restaurant', name: 'Don Julio — VIP Table', location: 'Palermo', price: '$95', detail: 'Skip the line, chef\'s table for 2', day: 1 },
    ],
    pause: 600,
  },

  // ============ DAY 2: TANGO NIGHT ============
  {
    type: 'user',
    text: "I want to see real tango, not the tourist show.",
    pause: 500,
  },
  {
    type: 'background',
    location: 'La Catedral, San Telmo',
    image: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 2 — Tango Night',
    dayNumber: 2,
    pause: 300,
  },
  {
    type: 'avatar',
    text: "La Catedral. Raw warehouse, dim lights, real porteños dancing. Tuesday milonga. I'll get you in for free, but bring cash for the bar. Wear something simple — overdressed gringo is a tell.",
    mood: 'curious',
    cartItems: [
      { type: 'experience', name: 'La Catedral Milonga + Lesson', location: 'San Telmo', price: '$45', detail: 'Beginner class + entry to milonga', day: 2 },
    ],
    pause: 600,
  },

  // ============ DAY 3: FLIGHT TO PATAGONIA ============
  {
    type: 'background',
    location: 'Patagonian Steppe',
    image: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 3 — Fly south',
    dayNumber: 3,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Friday morning, we fly south. Aerolíneas to El Calafate — three hours over endless steppe. From the air, you'll see Lago Argentino turn turquoise. From there, a three-hour bus to El Chaltén. Worth every minute.",
    mood: 'adventurous',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas EZE → FTE', location: 'El Calafate', price: '$185', detail: '1-way, 3hr', day: 3 },
      { type: 'transport', name: 'Chaltén Travel Bus', location: 'El Calafate → El Chaltén', price: '$22', detail: '3hr scenic transfer', day: 3 },
    ],
    pause: 600,
  },

  // ============ DAY 4: ARRIVE EL CHALTÉN ============
  {
    type: 'background',
    location: 'El Chaltén Village',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 4 — El Chaltén',
    dayNumber: 4,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Senderos Hostería for four nights. María at the front desk draws trail maps on napkins. That afternoon, easy walk to Mirador de los Cóndores — small hill, big view of Fitz Roy. Sunset wine at Patagonicus.",
    mood: 'warm',
    cartItems: [
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$480', detail: '4 nights, mountain view, breakfast', day: 4 },
    ],
    pause: 600,
  },

  // ============ DAY 5: THE BIG HIKE — LAGUNA DE LOS TRES ============
  {
    type: 'user',
    text: "Day five is Laguna de los Tres — the sunrise hike, right?",
    pause: 500,
  },
  {
    type: 'background',
    location: 'Laguna de los Tres at sunrise',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 5 — Laguna de los Tres',
    dayNumber: 5,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Yes. Headlamp on at 4:30 a.m., ten hours round trip. I'm putting Lucas with you — local mountaineer, 100% sunrise success rate. Post-hike, La Cervecería. Best stout south of the equator. Lamb empanadas the size of your hand.",
    mood: 'excited',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Full-day Fitz Roy sunrise route', day: 5 },
      { type: 'restaurant', name: 'La Cervecería — Reservation', location: 'El Chaltén', price: '$50', detail: 'Post-hike dinner for 2', day: 5 },
    ],
    pause: 600,
  },

  // ============ DAY 6: LAGUNA TORRE ============
  {
    type: 'background',
    location: 'Laguna Torre',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 6 — Laguna Torre',
    dayNumber: 6,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Easier day. Six-hour hike to Laguna Torre — Cerro Torre's impossible spire reflected in the glacier lake. The refugio there sells the best hot chocolate in Patagonia, made with real Bariloche chocolate. Two thousand pesos — pay cash.",
    mood: 'calm',
    cartItems: [
      { type: 'experience', name: 'Laguna Torre self-guided trail', location: 'El Chaltén', price: '$0', detail: 'Trail access free, refugio cash only', day: 6 },
    ],
    pause: 600,
  },

  // ============ DAY 7: PERITO MORENO GLACIER ============
  {
    type: 'background',
    location: 'Perito Moreno Glacier',
    image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 7 — Perito Moreno',
    dayNumber: 7,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "We bus back to El Calafate, into the national park. Perito Moreno — sixty meters of ice cracking and calving in front of you. I'm booking the Big Ice trek. Two hours on the glacier with crampons. You'll never look at ice the same way.",
    mood: 'adventurous',
    cartItems: [
      { type: 'experience', name: 'Perito Moreno Park Entry', location: 'El Calafate', price: '$35', detail: 'National park access', day: 7 },
      { type: 'experience', name: 'Big Ice Glacier Trek', location: 'El Calafate', price: '$120', detail: '2 hours on the ice + lead guide', day: 7 },
      { type: 'hotel', name: 'Esplendor El Calafate', location: 'El Calafate', price: '$165', detail: '1 night, lake view', day: 7 },
    ],
    pause: 600,
  },

  // ============ DAY 8: BARILOCHE LAKE STOP ============
  {
    type: 'user',
    text: "Can we stop in Bariloche on the way back?",
    pause: 500,
  },
  {
    type: 'background',
    location: 'Bariloche Lake District',
    image: 'https://images.unsplash.com/photo-1531176175280-33e81d2bcb1b?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 8 — Bariloche',
    dayNumber: 8,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Done. One night at Llao Llao on the lake. Late lunch at Cassis — fresh trout, lake-front terrace. Drive the Circuito Chico in the afternoon. Mountains, lakes, chocolate shops. The Argentina Switzerland.",
    mood: 'dreamy',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas FTE → BRC', location: 'Bariloche', price: '$140', detail: '1-way, 1.5hr', day: 8 },
      { type: 'hotel', name: 'Llao Llao Resort', location: 'Bariloche', price: '$540', detail: '1 night, lakefront classic room', day: 8 },
    ],
    pause: 600,
  },

  // ============ DAY 9: MENDOZA WINE COUNTRY ============
  {
    type: 'background',
    location: 'Mendoza Vineyards',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 9 — Mendoza',
    dayNumber: 9,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Final stretch. Cavas Wine Lodge in Lujan de Cuyo — boutique vineyard, private bungalow, your own plunge pool. Tasting at Catena Zapata in the afternoon. Andes on the horizon. This is how the trip should end.",
    mood: 'dreamy',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas BRC → MDZ', location: 'Mendoza', price: '$130', detail: '1-way, 1.5hr', day: 9 },
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Lujan de Cuyo', price: '$340', detail: '1 night, private bungalow', day: 9 },
      { type: 'experience', name: 'Catena Zapata — Tasting', location: 'Mendoza', price: '$85/person', detail: 'Premium tasting + cellar tour', day: 9 },
    ],
    pause: 600,
  },

  // ============ DAY 10: HOME ============
  {
    type: 'background',
    location: 'Mendoza → Home',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&h=1000&fit=crop',
    dayLabel: 'Day 10 — Home',
    dayNumber: 10,
    pause: 400,
  },
  {
    type: 'avatar',
    text: "Day ten — slow morning at the vineyard, then Mendoza to Buenos Aires, then home. That's the whole trip. Three regions, ten days, and you'll come back changed. Let me take you to the itinerary.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'Aerolíneas MDZ → EZE → PHL', location: 'Mendoza → Philly', price: '$0', detail: 'Already covered in opening flight', day: 10 },
    ],
    pause: 700,
  },

  // === FINAL: AUTO-NAVIGATE ===
  {
    type: 'goto',
    path: '/itinerary?demo=auto',
    pause: 0,
  },
];
