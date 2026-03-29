export const TRAVEL_STYLES = [
  { id: 'adventure', label: 'Adventure Hiker', icon: '🏔️', emoji: '⛰️' },
  { id: 'culinary', label: 'Culinary Explorer', icon: '🍜', emoji: '🍷' },
  { id: 'luxury', label: 'Luxury Traveler', icon: '✨', emoji: '🥂' },
  { id: 'solo', label: 'Solo Explorer', icon: '🧭', emoji: '🗺️' },
  { id: 'cultural', label: 'Cultural Nomad', icon: '🎭', emoji: '🏛️' },
  { id: 'digital', label: 'Digital Nomad', icon: '💻', emoji: '☕' },
  { id: 'beach', label: 'Beach Lover', icon: '🏖️', emoji: '🌊' },
  { id: 'urban', label: 'Urban Explorer', icon: '🌃', emoji: '🏙️' },
];

export const INTERESTS = [
  'Food', 'Nightlife', 'Hiking', 'Art', 'Music', 'Wellness', 'Sports',
  'Photography', 'History', 'Architecture', 'Wildlife', 'Diving',
];

export const MEMBERSHIP_TIERS = [
  { id: 'explorer', name: 'Explorer', price: 'Free', color: '#4A4A4A', features: ['Community access', 'Basic companion', '5 recs/month'] },
  { id: 'select', name: 'Select', price: '$99/yr', color: '#C9A84C', features: ['Unlimited companion', 'Hotel deals up to 60% off', 'VIP restaurant access', 'Priority introductions'] },
  { id: 'black', name: 'Select Black', price: '$249/yr', color: '#1A1A1A', features: ['Everything in Select', 'Hotel deals up to 85% off', 'Concierge service', 'Exclusive experiences', 'Black card'] },
];

export const SAMPLE_USERS = [
  {
    id: 'u1',
    name: 'Marco V',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
    tier: 'black',
    travelStyles: ['adventure'],
    countries: ['Argentina', 'Tanzania', 'Iceland', 'Peru', 'Nepal', 'India'],
    countryCount: 6,
    tripCount: 14,
    interests: ['Hiking', 'Photography', 'Food', 'Wildlife'],
    recentTrip: { destination: 'El Chaltén, Patagonia', date: 'February 2026', highlight: 'Fitz Roy trek' },
    previousTrip: { destination: 'Kilimanjaro', date: 'February 2025', highlight: 'Machame Route summit' },
    upcomingTrip: { destination: 'Torres del Paine, Chile', date: 'June 2026' },
    jetPoints: 4250,
    badges: ['Summit Seeker', 'Trailblazer', 'Solo Explorer'],
    currentLocation: 'Denver, CO',
    bio: 'Chasing summits and sunsets. 6 countries, 14 trips, zero regrets.',
  },
  {
    id: 'u2',
    name: 'Sofia R',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    tier: 'select',
    travelStyles: ['culinary'],
    countries: ['Japan', 'Italy', 'Mexico', 'Spain', 'Thailand'],
    countryCount: 5,
    tripCount: 11,
    interests: ['Food', 'Art', 'Nightlife', 'Music'],
    recentTrip: { destination: 'Tokyo', date: 'February 2026', highlight: 'Tsukiji outer market at 5am' },
    upcomingTrip: { destination: 'San Sebastián, Spain', date: 'August 2026' },
    jetPoints: 3100,
    badges: ['Culinary Nomad', 'Urban Explorer'],
    currentLocation: 'Mexico City',
    bio: 'Eating my way around the world. Every city has a story told through food.',
  },
  {
    id: 'u3',
    name: 'James T',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    tier: 'explorer',
    travelStyles: ['digital'],
    countries: ['Colombia', 'Portugal', 'Indonesia', 'Vietnam'],
    countryCount: 4,
    tripCount: 8,
    interests: ['Nightlife', 'Food', 'Music', 'Wellness'],
    recentTrip: { destination: 'Medellín', date: 'March 2026', highlight: 'Found the perfect coworking-rooftop combo' },
    jetPoints: 1200,
    badges: ['Digital Nomad', 'Coffee Hunter'],
    currentLocation: 'Medellín, Colombia',
    bio: 'Laptop, passport, good wifi. That\'s the recipe.',
  },
  {
    id: 'u4',
    name: 'Aisha M',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
    tier: 'black',
    travelStyles: ['solo', 'cultural'],
    countries: ['Morocco', 'Jordan', 'Kenya', 'India', 'Sri Lanka'],
    countryCount: 5,
    tripCount: 9,
    interests: ['Art', 'History', 'Wellness', 'Photography'],
    recentTrip: { destination: 'Serengeti', date: 'March 2026', highlight: 'Witnessed the Great Migration' },
    upcomingTrip: { destination: 'Oman', date: 'November 2026' },
    jetPoints: 5600,
    badges: ['Solo Explorer', 'Cultural Nomad', 'Trailblazer'],
    currentLocation: 'London, UK',
    bio: 'Traveling solo taught me every conversation is a door. I keep knocking.',
  },
];

export const DESTINATIONS = [
  {
    id: 'd1', name: 'El Chaltén', country: 'Argentina', region: 'Patagonia',
    image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&h=600&fit=crop',
    vibe: 'A tiny mountain village where every trail leads to a postcard',
    memberCheckIns: 12,
  },
  {
    id: 'd2', name: 'Kilimanjaro', country: 'Tanzania', region: 'East Africa',
    image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800&h=600&fit=crop',
    vibe: 'The roof of Africa — where altitude meets attitude',
    memberCheckIns: 8,
  },
  {
    id: 'd3', name: 'Serengeti', country: 'Tanzania', region: 'East Africa',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
    vibe: 'Endless plains where nature writes the screenplay',
    memberCheckIns: 6,
  },
  {
    id: 'd4', name: 'Tokyo', country: 'Japan', region: 'East Asia',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    vibe: 'Ancient precision meets neon chaos in the best way possible',
    memberCheckIns: 22,
  },
  {
    id: 'd5', name: 'Buenos Aires', country: 'Argentina', region: 'South America',
    image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800&h=600&fit=crop',
    vibe: 'Tango, steak, and conversations that last until 4am',
    memberCheckIns: 15,
  },
  {
    id: 'd6', name: 'Lisbon', country: 'Portugal', region: 'Europe',
    image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop',
    vibe: 'Europe\'s best-kept secret is out — and it\'s still worth it',
    memberCheckIns: 19,
  },
  {
    id: 'd7', name: 'Medellín', country: 'Colombia', region: 'South America',
    image: 'https://images.unsplash.com/photo-1583997052301-0042b33fc598?w=800&h=600&fit=crop',
    vibe: 'Spring weather, mountain views, and the best coffee on earth',
    memberCheckIns: 14,
  },
  {
    id: 'd8', name: 'New York City', country: 'USA', region: 'North America',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    vibe: 'Eight million stories, and you only need five good ones',
    memberCheckIns: 31,
  },
];

export const RECOMMENDATIONS = [
  // El Chaltén
  { id: 'r1', destId: 'd1', userId: 'u1', category: 'Hiking', title: 'Laguna de los Tres at sunrise',
    text: 'Start the trail at 4:30am from the campsite. Yes, it\'s dark and cold. Yes, it\'s worth every frozen step. The moment Fitz Roy catches first light, you\'ll forget your name. Bring a headlamp and extra layers — the wind at the top is no joke.',
    upvotes: 47, isHiddenGem: true },
  { id: 'r2', destId: 'd1', userId: 'u1', category: 'Food', title: 'La Cervecería — craft beer with a view',
    text: 'After 8 hours on the trail, this is where you go. Their stout is the best I\'ve had south of the equator. Sit outside if the wind isn\'t insane. The lamb empanadas pair perfectly. About $8 for a flight of 4.',
    upvotes: 32 },
  { id: 'r3', destId: 'd1', userId: 'u4', category: 'Stay', title: 'Senderos Hostería — the only place worth booking',
    text: 'Skip the hostels unless you\'re 22. Senderos is $120/night but you get breakfast, mountain views from bed, and the owner María gives trail beta that isn\'t on AllTrails. Book 3 months ahead for Feb.',
    upvotes: 28 },
  // Tokyo
  { id: 'r4', destId: 'd4', userId: 'u2', category: 'Food', title: 'Tsukiji outer market — skip the sushi, find the tamagoyaki',
    text: 'Everyone goes for the $50 sushi sets. Walk past them. Find the tiny tamagoyaki (egg omelette) stall near Gate 4. ¥300 for the best egg you\'ll ever eat. Go before 7am or don\'t bother. The lady running it has been there 30 years.',
    upvotes: 61, isHiddenGem: true },
  { id: 'r5', destId: 'd4', userId: 'u2', category: 'Nightlife', title: 'Golden Gai — pick the bar with no sign',
    text: 'Every bar in Golden Gai is a character. My rule: find the one with no English sign and fewer than 6 seats. Order whatever the bartender recommends. Budget ¥3000 for the night. Cover charge varies (¥500-1000) but it\'s the price of an experience you can\'t buy elsewhere.',
    upvotes: 44, isHiddenGem: true },
  { id: 'r6', destId: 'd4', userId: 'u3', category: 'Work', title: 'Fabricca — best coworking in Shibuya',
    text: 'Forget the chain coworking spaces. Fabricca on the 7th floor near Miyashita Park has ¥1500 day passes, great coffee, and a crowd that actually builds things. Fast wifi, quiet corners, and they don\'t care if you stay 10 hours.',
    upvotes: 19 },
  // Medellín
  { id: 'r7', destId: 'd7', userId: 'u3', category: 'Food', title: 'Altos del Poblado — the arepa lady on Calle 10',
    text: 'No name, no Google listing. Just a woman with a cart on Calle 10 near Parque Lleras, weekday mornings only. Arepa de choclo con queso for 5,000 COP ($1.20). I\'ve been going every morning for 3 weeks.',
    upvotes: 38, isHiddenGem: true },
  { id: 'r8', destId: 'd7', userId: 'u3', category: 'Work', title: 'Selina rooftop — work mornings, pool afternoons',
    text: 'The rooftop coworking at Selina Medellín is the move. 70,000 COP day pass gets you the workspace AND pool access. Wifi is solid (50+ Mbps). The real trick: book the corner desk by the railing. Best view in Poblado.',
    upvotes: 25 },
  // Lisbon
  { id: 'r9', destId: 'd6', userId: 'u3', category: 'Food', title: 'Time Out Market is a trap — go to Ramiro instead',
    text: 'Time Out Market is where tourists eat. Cervejaria Ramiro on Avenida Almirante Reis is where Lisboetas go for seafood. Order the tiger prawns and a bifana (pork sandwich) to finish. Budget €35-40pp. Go at 7pm, not 8:30, unless you want a 45-min wait.',
    upvotes: 52, isHiddenGem: true },
  { id: 'r10', destId: 'd6', userId: 'u4', category: 'Culture', title: 'LX Factory on a Tuesday morning',
    text: 'Everyone hits LX Factory on weekends when it\'s a zoo. Tuesday mornings it\'s just you, the artists, and the best bookshop in Lisbon (Ler Devagar). The vintage shop on the second floor has leather jackets for €40 that would cost €300 in London.',
    upvotes: 33 },
  // Buenos Aires
  { id: 'r11', destId: 'd5', userId: 'u1', category: 'Food', title: 'Don Julio — book 2 weeks ahead or don\'t bother',
    text: 'The best steak in Buenos Aires, maybe the world. But here\'s the insider move: skip the reservation hassle and go for lunch instead. Same menu, half the wait. Order the entraña (skirt steak) medium-rare and the provoleta to start. About 25,000 ARS pp.',
    upvotes: 45 },
  { id: 'r12', destId: 'd5', userId: 'u2', category: 'Nightlife', title: 'La Catedral — tango for people who don\'t do tango',
    text: 'This isn\'t the tourist tango show. La Catedral is a raw, dimly-lit warehouse where real porteños dance. Milonga nights (Tue/Thu) have a mix of ages and skill levels. Entry about 3,000 ARS. Dress down, not up. The energy is unreal.',
    upvotes: 37 },
  // Kilimanjaro
  { id: 'r13', destId: 'd2', userId: 'u1', category: 'Hiking', title: 'Machame Route — the whiskey route lives up to the name',
    text: 'Skip Marangu (the tourist route). Machame takes 6-7 days and the scenery changes every single day. Key tip: hire through a local operator in Moshi, not through a US/UK company. You\'ll pay $1,800 instead of $3,500 for the same guides. My guide Honest (yes, real name) was incredible.',
    upvotes: 56, isHiddenGem: true },
  { id: 'r14', destId: 'd2', userId: 'u1', category: 'Gear', title: 'Don\'t buy gear — rent in Moshi',
    text: 'The shops on the main road in Moshi rent everything: sleeping bags (-20°C rated), poles, gaiters. About $5-8/day per item. The gear is well-maintained. Save your luggage space and your wallet. Only bring your own boots — those need to be broken in.',
    upvotes: 41 },
  // Serengeti
  { id: 'r15', destId: 'd3', userId: 'u4', category: 'Experience', title: 'Skip the lodges, book a mobile camp',
    text: 'The lodges are comfortable but you\'re behind fences. Mobile camps follow the migration — you wake up with wildebeest literally outside your tent. I booked through Wayo Africa. 3 nights in a mobile camp costs about the same as a mid-range lodge but the experience is incomparable.',
    upvotes: 49, isHiddenGem: true },
  { id: 'r16', destId: 'd3', userId: 'u4', category: 'Photography', title: 'The crossing happens at dawn — be at the Mara River by 5:30',
    text: 'Everyone wants to see the wildebeest crossing. The guides know the likely spots. Tell your guide you want to be first at the Mara River. 5:30am. Bring a 200-400mm lens minimum. The crossing can happen in 10 minutes or 3 hours. Patience is the only gear that matters.',
    upvotes: 38 },
  // NYC
  { id: 'r17', destId: 'd8', userId: 'u2', category: 'Food', title: 'Di Fara Pizza in Midwood — the real NYC slice',
    text: 'Forget the Manhattan pizza discourse. Take the Q train to Avenue J. Dom DeMarco\'s grandson is keeping the flame alive. $6 a slice, cash only. The wait is part of the ritual. This is pizza as religion.',
    upvotes: 43 },
  { id: 'r18', destId: 'd8', userId: 'u3', category: 'Nightlife', title: 'Bembe in Williamsburg — best dance floor in Brooklyn',
    text: 'Live Afro-Latin bands, no cover before 10pm, and a crowd that actually dances. Get there early on Saturdays for the rooftop. Two mezcal cocktails and you\'re in. $14-16 per drink. Don\'t wear sneakers — this is a dress-up kind of night.',
    upvotes: 29 },
  { id: 'r19', destId: 'd8', userId: 'u4', category: 'Culture', title: 'The Cloisters at 10am on a Wednesday',
    text: 'Everyone does the Met. The Cloisters in Fort Tryon Park is the Met\'s medieval branch and it\'s transcendent. Wednesday mornings it\'s nearly empty. The Unicorn Tapestries room alone is worth the trip uptown. Same $30 ticket covers both museums.',
    upvotes: 35 },
  { id: 'r20', destId: 'd8', userId: 'u1', category: 'Running', title: 'Central Park reservoir at 6am',
    text: 'The 1.58-mile loop around the Jacqueline Kennedy Onassis Reservoir is the best urban run I\'ve done anywhere. 6am, you\'ll share it with serious runners and the Manhattan skyline. Enter at 90th and Fifth. The light hitting the buildings at that hour is something else.',
    upvotes: 22 },
];

export const CIRCLES = [
  { id: 'c1', name: 'Summit Seekers', desc: 'Hikers and mountaineers', icon: '🏔️', members: 2840, color: '#2D5016' },
  { id: 'c2', name: 'Culinary Nomads', desc: 'Food-focused travelers', icon: '🍜', members: 4120, color: '#8B4513' },
  { id: 'c3', name: 'Solo Women Explorers', desc: 'Fearless solo female travelers', icon: '✨', members: 3650, color: '#6B21A8' },
  { id: 'c4', name: 'Adventure Couples', desc: 'Partners in wanderlust', icon: '💑', members: 1890, color: '#BE185D' },
  { id: 'c5', name: 'Digital Nomads', desc: 'Work from anywhere tribe', icon: '💻', members: 5200, color: '#0369A1' },
  { id: 'c6', name: 'Luxury Flashpackers', desc: 'Premium travel, local soul', icon: '🥂', members: 2100, color: '#C9A84C' },
  { id: 'c7', name: 'Urban Explorers', desc: 'City lovers and street seekers', icon: '🌃', members: 3800, color: '#475569' },
  { id: 'c8', name: 'Singles Who Explore', desc: 'Solo and social', icon: '🗺️', members: 2950, color: '#DC2626' },
];

export const PERKS = [
  { id: 'p1', title: 'Aman Tokyo — 3 nights', subtitle: '72% off rack rate', tier: 'black', category: 'Hotel', originalPrice: '$2,400', price: '$672', image: 'https://images.unsplash.com/photo-1590490360182-c33d955e9d6c?w=400&h=300&fit=crop' },
  { id: 'p2', title: 'Don Julio VIP Table', subtitle: 'Skip the line, chef\'s table', tier: 'select', category: 'Restaurant', originalPrice: '$180', price: '$95', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' },
  { id: 'p3', title: 'Aesop Travel Kit', subtitle: 'Member exclusive set', tier: 'select', category: 'Lifestyle', originalPrice: '$120', price: '$72', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop' },
  { id: 'p4', title: 'Safari Mobile Camp Upgrade', subtitle: 'Wayo Africa premium tent', tier: 'black', category: 'Experience', originalPrice: '$800', price: '$320', image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=300&fit=crop' },
  { id: 'p5', title: 'Away Luggage — Carry-On', subtitle: '40% off for Select members', tier: 'select', category: 'Lifestyle', originalPrice: '$295', price: '$177', image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=300&fit=crop' },
  { id: 'p6', title: 'Park Hyatt Lisbon Suite', subtitle: '65% off, 2 nights min', tier: 'black', category: 'Hotel', originalPrice: '$1,600', price: '$560', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop' },
];

export const LIVE_BROADCASTS = [
  { id: 'l1', userId: 'u1', text: 'Just summited Fitz Roy. Who\'s in El Chaltén tonight? Beers at La Cervecería.', location: 'El Chaltén, Argentina', time: '2h ago', lat: -49.33, lng: -72.89 },
  { id: 'l2', userId: 'u3', text: 'Found an incredible rooftop in Medellín with 3 open spots for dinner. DM me.', location: 'Medellín, Colombia', time: '45m ago', lat: 6.25, lng: -75.57 },
  { id: 'l3', userId: 'u4', text: 'Solo dinner in Lisbon tonight — anyone want to join? Cervejaria Ramiro at 8pm.', location: 'Lisbon, Portugal', time: '1h ago', lat: 38.72, lng: -9.14 },
  { id: 'l4', userId: 'u2', text: 'Standing in line at Tsukiji. The tamagoyaki stall just opened. Life-changing egg incoming.', location: 'Tokyo, Japan', time: '3h ago', lat: 35.66, lng: 139.77 },
];

export const BADGES = [
  { id: 'b1', name: 'Summit Seeker', icon: '🏔️', desc: 'Hiked above 4,000m' },
  { id: 'b2', name: 'Culinary Nomad', icon: '🍜', desc: '10+ food recommendations' },
  { id: 'b3', name: 'Solo Explorer', icon: '🧭', desc: '3+ solo trips completed' },
  { id: 'b4', name: 'Trailblazer', icon: '🔥', desc: 'First to review a destination' },
  { id: 'b5', name: 'Coffee Hunter', icon: '☕', desc: 'Reviewed cafes in 5+ countries' },
  { id: 'b6', name: 'Digital Nomad', icon: '💻', desc: 'Worked from 3+ countries' },
  { id: 'b7', name: 'Cultural Nomad', icon: '🎭', desc: 'Visited 5+ UNESCO sites' },
  { id: 'b8', name: 'Urban Explorer', icon: '🌃', desc: 'Explored 10+ cities' },
];

export const COMPANION_PROMPTS = [
  "I'm heading to El Chaltén next month — what do I need to know?",
  "Best local spots in Tokyo for someone who loves street food",
  "What should I pack for 7 days hiking in Patagonia in February?",
  "Find me a Jetzy member who's been to Ngorongoro Crater",
];

export const POINTS_ACTIONS = [
  { action: 'Share a recommendation', points: 50, icon: '💬' },
  { action: 'Complete a trip check-in', points: 100, icon: '📍' },
  { action: 'Connect with a new member', points: 25, icon: '🤝' },
  { action: 'Refer a friend', points: 500, icon: '🎁' },
  { action: 'Daily app open', points: 10, icon: '👋' },
];

export const POINTS_REWARDS = [
  { title: 'Hotel Night Credit', points: 2000, icon: '🏨' },
  { title: 'Flight Credit ($50)', points: 3000, icon: '✈️' },
  { title: 'Experience Voucher', points: 1500, icon: '🎟️' },
  { title: 'Select Upgrade (1 month)', points: 5000, icon: '⭐' },
];

// Helper to get user by id
export const getUserById = (id) => SAMPLE_USERS.find(u => u.id === id);

// Helper to get recommendations for a destination
export const getRecsForDest = (destId) => RECOMMENDATIONS.filter(r => r.destId === destId);

// Countries list for onboarding
export const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh','Belgium','Bolivia','Brazil','Cambodia','Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Laos','Lebanon','Malaysia','Mexico','Mongolia','Morocco','Mozambique','Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Nigeria','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Singapore','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Taiwan','Tanzania','Thailand','Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Zimbabwe'
];
