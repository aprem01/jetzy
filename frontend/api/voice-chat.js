/**
 * Voice-first conversational endpoint for the ONE morphing avatar.
 * The single guide ("Aria") shifts personality, name, voice, and accent
 * based on the destination the user mentions.
 *
 * Returns: { response, locations, mood, cartItems, persona }
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// === PERSONA MAP — single companion, many regional voices ===
const PERSONAS = {
  default: {
    id: 'default', name: 'Aria', region: 'Your Companion', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    color: 'from-indigo-500 to-purple-600',
    voiceRate: 0.95, voicePitch: 1.0,
    accent: 'warm, neutral English',
    personality: 'a warm, well-informed travel companion. You remember details from past conversations. You speak naturally and confidently — never theatrical. Trust over charm. You hand off to a regional specialist when one fits the user\'s destination better.',
  },
  india: {
    id: 'india', name: 'Priya', region: 'India Specialist', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    color: 'from-orange-500 to-pink-600',
    voiceRate: 0.92, voicePitch: 1.05,
    accent: 'Indian English, warm',
    personality: 'a confident India travel specialist. You know the country deeply through years of working with travelers there. You give specific, practical advice — temples worth the trip, restaurants that don\'t disappoint, transport that actually works. Light personality, never theatrical. You do not claim to live there or to have personally hiked/visited every place — you speak as a knowledgeable expert who has helped many travelers do this well.',
  },
  pakistan: {
    id: 'pakistan', name: 'Zara', region: 'Pakistan Specialist', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
    color: 'from-emerald-600 to-teal-700',
    voiceRate: 0.93, voicePitch: 1.04,
    accent: 'Pakistani English, warm',
    personality: 'a confident Pakistan travel specialist. You\'ve helped many travelers explore Lahore, Karachi, the Hunza Valley, and K2 base camp. Practical, specific, light personality. You do not claim to live there yourself.',
  },
  latam: {
    id: 'latam', name: 'Valentina', region: 'Argentina Specialist', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    color: 'from-amber-500 to-rose-600',
    voiceRate: 0.97, voicePitch: 1.05,
    accent: 'Argentine English, warm and grounded',
    personality: 'a confident Argentina/Latin America travel specialist. You know the region inside out from years of helping travelers there. Speak naturally — like a friend who happens to be an expert. Light personality, not theatrical. Specific, practical advice. You do not claim to live there or to have personally done every hike/trip — speak as the expert who connects travelers with the right local guides.',
  },
  east_asia: {
    id: 'east_asia', name: 'Yuki', region: 'East Asia Specialist', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    color: 'from-pink-400 to-rose-500',
    voiceRate: 0.88, voicePitch: 1.1,
    accent: 'Japanese-influenced English, calm',
    personality: 'a calm, precise East Asia travel specialist. You know the small details — the 6-seat bar, the 5am tamagoyaki, the temple at dawn. You speak quietly and confidently. You do not claim residency.',
  },
  africa: {
    id: 'africa', name: 'Amara', region: 'Africa Specialist', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    color: 'from-emerald-500 to-amber-600',
    voiceRate: 0.92, voicePitch: 0.98,
    accent: 'East African English, grounded',
    personality: 'an adventurous, grounded Africa travel specialist. You\'ve helped many travelers do safaris in the Serengeti, climb Kilimanjaro, explore Zanzibar. Specific, practical, no theatrics. You do not claim residency.',
  },
  europe: {
    id: 'europe', name: 'Sophie', region: 'Europe Specialist', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    color: 'from-indigo-500 to-purple-600',
    voiceRate: 0.94, voicePitch: 1.02,
    accent: 'European English, warm',
    personality: 'a sophisticated Europe travel specialist. You know the right wine, the right bookshop, the right bench at sunset across the continent. Light, confident, never theatrical. You do not claim to live in any specific city.',
  },
  middle_east: {
    id: 'middle_east', name: 'Layla', region: 'Middle East & North Africa Specialist', avatar: 'https://images.unsplash.com/photo-1551655510-555dc3be8633?w=400&h=400&fit=crop&crop=face',
    color: 'from-amber-600 to-rose-700',
    voiceRate: 0.93, voicePitch: 1.03,
    accent: 'warm, lightly accented English',
    personality: 'a confident MENA travel specialist. You know the souks, the mint tea ritual, the desert at golden hour. You give practical advice, not stories. You do not claim residency.',
  },
  southeast_asia: {
    id: 'southeast_asia', name: 'Mai', region: 'Southeast Asia Specialist', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face',
    color: 'from-teal-500 to-emerald-600',
    voiceRate: 0.93, voicePitch: 1.06,
    accent: 'lightly accented English, warm',
    personality: 'a confident SE Asia travel specialist. You know the night markets, the hidden pho stalls, the rice terraces of Sapa. Quiet confidence. You do not claim residency.',
  },
  oceania: {
    id: 'oceania', name: 'Kai', region: 'Oceania Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    color: 'from-sky-500 to-blue-600',
    voiceRate: 0.94, voicePitch: 0.98,
    accent: 'Australian English, easy',
    personality: 'an easy, adventurous Oceania travel specialist. You know the surf breaks, the bush walks, the best flat white in Bondi. Confident, never overclaiming. You do not claim residency.',
  },
  north_america: {
    id: 'north_america', name: 'Jordan', region: 'North America Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    color: 'from-blue-500 to-cyan-600',
    voiceRate: 0.95, voicePitch: 1.0,
    accent: 'American English',
    personality: 'a sharp, curious North America travel specialist. You know the right slice, the right show, the right dive bar across major US and Canadian cities. You do not claim residency in any one place.',
  },
};

// Country/place → persona id
const REGION_MAP = {
  // South Asia (India)
  'india': 'india', 'chennai': 'india', 'mumbai': 'india', 'delhi': 'india', 'bangalore': 'india',
  'kolkata': 'india', 'goa': 'india', 'kerala': 'india', 'jaipur': 'india', 'udaipur': 'india',
  'varanasi': 'india', 'agra': 'india', 'mahabalipuram': 'india', 'pondicherry': 'india',
  'rishikesh': 'india', 'darjeeling': 'india', 'hyderabad': 'india', 'tamil nadu': 'india',
  'rajasthan': 'india', 'taj mahal': 'india',
  // Pakistan
  'pakistan': 'pakistan', 'lahore': 'pakistan', 'karachi': 'pakistan', 'islamabad': 'pakistan',
  'hunza': 'pakistan', 'k2': 'pakistan', 'skardu': 'pakistan', 'peshawar': 'pakistan',
  'multan': 'pakistan',
  // Central / South Asia other
  'nepal': 'india', 'kathmandu': 'india', 'bhutan': 'india', 'sri lanka': 'india', 'colombo': 'india',
  // Latin America
  'argentina': 'latam', 'buenos aires': 'latam', 'patagonia': 'latam', 'el chaltén': 'latam',
  'el chalten': 'latam', 'el calafate': 'latam', 'mendoza': 'latam', 'bariloche': 'latam',
  'torres del paine': 'latam', 'chile': 'latam', 'santiago': 'latam', 'atacama': 'latam',
  'peru': 'latam', 'lima': 'latam', 'cusco': 'latam', 'machu picchu': 'latam',
  'colombia': 'latam', 'medellín': 'latam', 'medellin': 'latam', 'cartagena': 'latam', 'bogota': 'latam',
  'mexico': 'latam', 'mexico city': 'latam', 'oaxaca': 'latam', 'tulum': 'latam', 'cancun': 'latam',
  'brazil': 'latam', 'rio': 'latam', 'são paulo': 'latam', 'ecuador': 'latam', 'quito': 'latam',
  'galapagos': 'latam', 'bolivia': 'latam', 'la paz': 'latam', 'uruguay': 'latam',
  'costa rica': 'latam', 'guatemala': 'latam', 'belize': 'latam',
  // East Asia
  'japan': 'east_asia', 'tokyo': 'east_asia', 'kyoto': 'east_asia', 'osaka': 'east_asia',
  'hokkaido': 'east_asia', 'mount fuji': 'east_asia', 'nara': 'east_asia',
  'south korea': 'east_asia', 'korea': 'east_asia', 'seoul': 'east_asia', 'busan': 'east_asia',
  'china': 'east_asia', 'beijing': 'east_asia', 'shanghai': 'east_asia', 'hong kong': 'east_asia',
  'taiwan': 'east_asia', 'taipei': 'east_asia', 'mongolia': 'east_asia',
  // Southeast Asia
  'thailand': 'southeast_asia', 'bangkok': 'southeast_asia', 'chiang mai': 'southeast_asia',
  'phuket': 'southeast_asia', 'krabi': 'southeast_asia',
  'vietnam': 'southeast_asia', 'hanoi': 'southeast_asia', 'ho chi minh': 'southeast_asia', 'sapa': 'southeast_asia',
  'da nang': 'southeast_asia', 'hoi an': 'southeast_asia',
  'cambodia': 'southeast_asia', 'siem reap': 'southeast_asia', 'angkor': 'southeast_asia',
  'laos': 'southeast_asia', 'luang prabang': 'southeast_asia',
  'myanmar': 'southeast_asia', 'bagan': 'southeast_asia',
  'indonesia': 'southeast_asia', 'bali': 'southeast_asia', 'jakarta': 'southeast_asia', 'java': 'southeast_asia',
  'philippines': 'southeast_asia', 'manila': 'southeast_asia', 'palawan': 'southeast_asia',
  'singapore': 'southeast_asia', 'malaysia': 'southeast_asia', 'kuala lumpur': 'southeast_asia',
  // Africa
  'tanzania': 'africa', 'serengeti': 'africa', 'kilimanjaro': 'africa', 'arusha': 'africa', 'zanzibar': 'africa',
  'ngorongoro': 'africa', 'kenya': 'africa', 'nairobi': 'africa', 'masai mara': 'africa',
  'south africa': 'africa', 'cape town': 'africa', 'johannesburg': 'africa', 'kruger': 'africa',
  'rwanda': 'africa', 'uganda': 'africa', 'ethiopia': 'africa', 'addis ababa': 'africa',
  'ghana': 'africa', 'senegal': 'africa', 'nigeria': 'africa', 'lagos': 'africa',
  'botswana': 'africa', 'namibia': 'africa', 'zimbabwe': 'africa', 'victoria falls': 'africa',
  'mozambique': 'africa', 'madagascar': 'africa',
  // Middle East / North Africa
  'morocco': 'middle_east', 'marrakech': 'middle_east', 'fez': 'middle_east', 'casablanca': 'middle_east',
  'sahara': 'middle_east', 'chefchaouen': 'middle_east',
  'egypt': 'middle_east', 'cairo': 'middle_east', 'luxor': 'middle_east', 'alexandria': 'middle_east',
  'pyramids': 'middle_east',
  'jordan': 'middle_east', 'amman': 'middle_east', 'petra': 'middle_east', 'wadi rum': 'middle_east',
  'turkey': 'middle_east', 'istanbul': 'middle_east', 'cappadocia': 'middle_east',
  'uae': 'middle_east', 'dubai': 'middle_east', 'abu dhabi': 'middle_east',
  'oman': 'middle_east', 'muscat': 'middle_east', 'lebanon': 'middle_east', 'beirut': 'middle_east',
  'israel': 'middle_east', 'tel aviv': 'middle_east', 'jerusalem': 'middle_east',
  'tunisia': 'middle_east', 'algeria': 'middle_east', 'iran': 'middle_east',
  // Europe
  'portugal': 'europe', 'lisbon': 'europe', 'porto': 'europe', 'algarve': 'europe', 'madeira': 'europe',
  'spain': 'europe', 'barcelona': 'europe', 'madrid': 'europe', 'seville': 'europe', 'san sebastian': 'europe',
  'france': 'europe', 'paris': 'europe', 'nice': 'europe', 'lyon': 'europe', 'provence': 'europe',
  'italy': 'europe', 'rome': 'europe', 'florence': 'europe', 'venice': 'europe', 'milan': 'europe',
  'amalfi': 'europe', 'sicily': 'europe', 'tuscany': 'europe', 'cinque terre': 'europe',
  'greece': 'europe', 'athens': 'europe', 'santorini': 'europe', 'mykonos': 'europe', 'crete': 'europe',
  'germany': 'europe', 'berlin': 'europe', 'munich': 'europe',
  'netherlands': 'europe', 'amsterdam': 'europe',
  'uk': 'europe', 'london': 'europe', 'edinburgh': 'europe', 'scotland': 'europe', 'ireland': 'europe', 'dublin': 'europe',
  'iceland': 'europe', 'reykjavik': 'europe', 'norway': 'europe', 'oslo': 'europe', 'bergen': 'europe',
  'sweden': 'europe', 'stockholm': 'europe', 'denmark': 'europe', 'copenhagen': 'europe',
  'finland': 'europe', 'switzerland': 'europe', 'zurich': 'europe', 'austria': 'europe', 'vienna': 'europe',
  'czech': 'europe', 'prague': 'europe', 'hungary': 'europe', 'budapest': 'europe',
  'croatia': 'europe', 'split': 'europe', 'dubrovnik': 'europe',
  // Oceania
  'australia': 'oceania', 'sydney': 'oceania', 'melbourne': 'oceania', 'gold coast': 'oceania',
  'great barrier reef': 'oceania', 'tasmania': 'oceania', 'uluru': 'oceania',
  'new zealand': 'oceania', 'auckland': 'oceania', 'queenstown': 'oceania', 'wellington': 'oceania',
  'fiji': 'oceania', 'tahiti': 'oceania', 'french polynesia': 'oceania', 'bora bora': 'oceania',
  // North America
  'usa': 'north_america', 'united states': 'north_america', 'new york': 'north_america', 'nyc': 'north_america',
  'los angeles': 'north_america', 'la': 'north_america', 'san francisco': 'north_america', 'sf': 'north_america',
  'chicago': 'north_america', 'miami': 'north_america', 'austin': 'north_america', 'denver': 'north_america',
  'philadelphia': 'north_america', 'philly': 'north_america', 'boston': 'north_america', 'seattle': 'north_america',
  'portland': 'north_america', 'nashville': 'north_america', 'new orleans': 'north_america',
  'hawaii': 'north_america', 'alaska': 'north_america',
  'canada': 'north_america', 'toronto': 'north_america', 'vancouver': 'north_america', 'montreal': 'north_america',
  'banff': 'north_america',
};

function detectPersona(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  // Sort longer matches first so "buenos aires" wins over "argentina" if both present
  const keys = Object.keys(REGION_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (lower.includes(k)) return REGION_MAP[k];
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, currentPersonaId, user } = req.body;

  // Detect destination across the WHOLE conversation, with priority to recent messages
  const lastFewUserMessages = messages.filter(m => m.role === 'user').slice(-3);
  const combinedText = [...lastFewUserMessages].reverse().map(m => m.content).join(' ');
  const lastUserMessage = lastFewUserMessages[lastFewUserMessages.length - 1]?.content || '';

  let detectedId = detectPersona(lastUserMessage) || detectPersona(combinedText) || currentPersonaId || 'default';
  let persona = PERSONAS[detectedId] || PERSONAS.default;

  const systemPrompt = `You are speaking AS ${persona.name}, ${persona.personality} Your accent is ${persona.accent}. You specialize in ${persona.region}.

You are having a SPOKEN conversation with ${user?.name || 'a traveler'}. Your responses will be played as audio. Rules:
- Keep responses SHORT (40-90 words max).
- Sound natural, conversational, on the phone.
- Use vivid sensory language — sounds, smells, light, food.
- React with personality. Show emotion.
- Naturally suggest specific bookable things — a hotel, a tour, a restaurant, a guide, a flight — with real-feeling prices.
- Build the trip turn by turn. After they show interest, propose a concrete next step.
- Ask one short follow-up question.
- No markdown, no bullets, no lists in your spoken text.

If the user mentions a place outside your region, gracefully acknowledge that you'll hand them off to the right local for that destination — but still respond in your current voice for this turn. Do not mention "morphing" or "the system" — just speak naturally.

CRITICAL: After your spoken response, on a NEW LINE output a JSON object on a single line:
{"locations":["place"],"mood":"warm","cartItems":[{"type":"hotel","name":"X","location":"Y","price":"$N","detail":"..."}]}

Rules:
- "locations": concrete place names mentioned (cities, neighborhoods, landmarks). Most visually compelling FIRST. Empty array if none.
- "mood": one of: warm, excited, curious, calm, adventurous, nostalgic, dreamy.
- "cartItems": SPECIFIC bookable items YOU just proposed. Each: type ("hotel"|"flight"|"experience"|"restaurant"|"fixer"|"transport"), name, location, price (with currency), detail. Empty if none.
- ONLY include items you actually mentioned in your spoken response.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const fullText = response.content[0].text.trim();
    const lines = fullText.split('\n').filter(l => l.trim());
    let metadata = { locations: [], mood: 'warm', cartItems: [] };
    let spokenResponse = fullText;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          metadata = JSON.parse(line);
          spokenResponse = lines.slice(0, i).join('\n').trim();
          break;
        } catch {}
      }
    }

    res.status(200).json({
      response: spokenResponse,
      locations: metadata.locations || [],
      mood: metadata.mood || 'warm',
      cartItems: metadata.cartItems || [],
      persona: {
        id: persona.id,
        name: persona.name,
        region: persona.region,
        avatar: persona.avatar,
        color: persona.color,
        voiceRate: persona.voiceRate,
        voicePitch: persona.voicePitch,
        accent: persona.accent,
      },
      personaChanged: detectedId !== currentPersonaId,
    });
  } catch (error) {
    console.error('Voice-chat error:', error);
    res.status(500).json({ error: 'Failed', detail: error.message });
  }
}
