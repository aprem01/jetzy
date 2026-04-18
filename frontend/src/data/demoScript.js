// Self-running Patagonia demo script for Virtual Travel
// Each step has a delay (ms before this step fires) and a type/payload

export const PATAGONIA_DEMO = [
  // 0. Aria greets (immediately on demo start)
  {
    delay: 800,
    type: 'avatar',
    persona: {
      id: 'default', name: 'Aria', region: 'World',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      color: 'from-indigo-500 to-purple-600',
      voiceRate: 0.95, voicePitch: 1.0, accent: 'warm, neutral English',
    },
    text: "Hi Marco — I'm your travel companion. Tell me about a place you've been dreaming about, and I'll take you there.",
    mood: 'warm',
  },

  // 1. User asks about Patagonia (after avatar finishes speaking)
  {
    delay: 5500,
    type: 'user',
    text: "I want to plan a hiking trip to Patagonia.",
  },

  // 2. Diego morphs in
  {
    delay: 1800,
    type: 'morph',
    persona: {
      id: 'latam', name: 'Diego', region: 'Latin America',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
      color: 'from-amber-500 to-red-600',
      voiceRate: 0.95, voicePitch: 0.95,
      accent: 'Argentine English, theatrical',
    },
  },

  // 3. Background change to Fitz Roy
  {
    delay: 800,
    type: 'background',
    location: 'Fitz Roy',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop',
  },

  // 4. Diego speaks first response
  {
    delay: 800,
    type: 'avatar',
    text: "Patagonia! Che, you have excellent taste. The wind there is going to push you around like a child — and that's the best part. Are we talking El Chaltén for Fitz Roy, or Torres del Paine for the W Circuit?",
    mood: 'excited',
  },

  // 5. User picks El Chaltén
  {
    delay: 9500,
    type: 'user',
    text: "Let's do El Chaltén. I want to hike Laguna de los Tres.",
  },

  // 6. Background to Laguna de los Tres
  {
    delay: 1500,
    type: 'background',
    location: 'Laguna de los Tres',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop',
  },

  // 7. Diego responds + adds flight + hotel
  {
    delay: 600,
    type: 'avatar',
    text: "Brilliant choice. Ten hours round trip, 4:30 in the morning if you want Fitz Roy at sunrise — and you do. Let me set this up. Flight to El Calafate, then I'm putting you at Senderos Hostería for five nights. María at the front desk draws trail maps on napkins.",
    mood: 'warm',
    cartItems: [
      { type: 'flight', name: 'LATAM EZE → FTE', location: 'El Calafate', price: '$480', detail: 'Round trip, October dates' },
      { type: 'hotel', name: 'Senderos Hostería', location: 'El Chaltén', price: '$600', detail: '5 nights, mountain view, breakfast included' },
    ],
  },

  // 8. User asks about a guide
  {
    delay: 11000,
    type: 'user',
    text: "Yes, do it. What about a guide for the trail?",
  },

  // 9. Diego adds the guide
  {
    delay: 1500,
    type: 'avatar',
    text: "You don't strictly need one, but I'd hire Lucas. Local mountaineer, knows every viewpoint that isn't on Instagram. He'll have you at the lake before any of the day-trippers get there.",
    mood: 'curious',
    cartItems: [
      { type: 'fixer', name: 'Lucas — Mountain Guide', location: 'El Chaltén', price: '$180', detail: 'Private guide, Fitz Roy sunrise route' },
    ],
  },

  // 10. User asks about food
  {
    delay: 9500,
    type: 'user',
    text: "What should I eat after a 10-hour hike?",
  },

  // 11. Diego adds restaurant
  {
    delay: 1500,
    type: 'avatar',
    text: "Ah, the most important question. La Cervecería. Best craft stout south of the equator, lamb empanadas the size of your hand. I'll book you a table for the night you come down off the trail.",
    mood: 'excited',
    cartItems: [
      { type: 'restaurant', name: 'La Cervecería — Reservation', location: 'El Chaltén', price: '$50', detail: 'Table for 2, post-hike dinner' },
    ],
  },

  // 12. User asks about Perito Moreno
  {
    delay: 9000,
    type: 'user',
    text: "Can we add Perito Moreno on the way out?",
  },

  // 13. Background to Perito Moreno
  {
    delay: 1200,
    type: 'background',
    location: 'Perito Moreno Glacier',
    image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1600&h=1000&fit=crop',
  },

  // 14. Diego adds glacier experiences
  {
    delay: 600,
    type: 'avatar',
    text: "Of course. National park entry, plus a guided ice trek. Two hours on the glacier with crampons. You'll never look at ice the same way again. Trust me.",
    mood: 'adventurous',
    cartItems: [
      { type: 'experience', name: 'Perito Moreno Park Entry', location: 'El Calafate', price: '$35', detail: 'National park access' },
      { type: 'experience', name: 'Big Ice Glacier Trek', location: 'El Calafate', price: '$120', detail: '2 hours on the glacier, crampons + lead guide' },
    ],
  },

  // 15. User asks for vineyard rest day
  {
    delay: 9000,
    type: 'user',
    text: "Add a rest day at a vineyard somewhere on the way back.",
  },

  // 16. Background to Mendoza vineyard
  {
    delay: 1200,
    type: 'background',
    location: 'Cavas Wine Lodge, Mendoza',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=1000&fit=crop',
  },

  // 17. Diego adds vineyard
  {
    delay: 600,
    type: 'avatar',
    text: "Mendoza is the move. Cavas Wine Lodge — boutique vineyard, private bungalow, wine tasting included. You'll thank me after five days of trail food.",
    mood: 'dreamy',
    cartItems: [
      { type: 'hotel', name: 'Cavas Wine Lodge', location: 'Mendoza', price: '$340', detail: '1 night, private bungalow + tasting' },
    ],
  },

  // 18. Diego wraps up
  {
    delay: 9000,
    type: 'avatar',
    text: "Alright, that's a complete trip — flights, lodge, guide, dinner, glacier, and a vineyard finish. Tap the cart and let's send you to the itinerary to lock it in.",
    mood: 'warm',
  },

  // 19. Auto-navigate to itinerary (for auto-checkout)
  {
    delay: 6000,
    type: 'goto',
    path: '/itinerary?demo=auto',
  },
];
