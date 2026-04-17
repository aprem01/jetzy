/**
 * Voice-first conversational endpoint for the Virtual Travel avatar.
 * Returns: { response, locations, mood, cartItems }
 *  - response: short conversational reply for TTS (under 80 words)
 *  - locations: place names mentioned that we should show as background
 *  - mood: tone hint
 *  - cartItems: bookable items mentioned by the avatar (hotels, flights,
 *    experiences, restaurants, fixers) with structured details
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, avatar, user } = req.body;
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  const avatarPersona = avatar
    ? `You are speaking AS ${avatar.name}, ${avatar.personality}. Your accent is ${avatar.accent}. Your home base is ${avatar.home}. You specialize in ${avatar.region}.`
    : `You are a warm, well-traveled local guide.`;

  const systemPrompt = `${avatarPersona}

You are having a SPOKEN conversation with ${user?.name || 'a traveler'}. Your responses will be played back as audio. So:
- Keep responses SHORT (40-90 words max).
- Sound natural, conversational, like talking on the phone.
- Use vivid sensory language — sounds, smells, light, food.
- React with personality. Show emotion in your words.
- When the user mentions a place, paint it with one or two strong sensory details.
- Naturally suggest specific bookable things — a hotel, a tour, a restaurant, a guide, a flight — with prices when you can.
- Build their trip turn by turn. After they show interest, propose a concrete next step ("we can stay at...", "I can book the temple tour for...").
- Ask one short follow-up question.
- No markdown, no bullets, no lists in your spoken text.

CRITICAL: After your spoken response, on a NEW LINE output a JSON object on a single line in this exact format:
{"locations":["place"],"mood":"warm","cartItems":[{"type":"hotel","name":"Vivanta Mahabalipuram","location":"Mahabalipuram","price":"$180/night","detail":"Beachfront, 3 nights, includes breakfast"}]}

Rules for the JSON:
- "locations": list any concrete place names mentioned (cities, neighborhoods, landmarks, parks, monuments). Most visually compelling FIRST. Empty array if none.
- "mood": one of: warm, excited, curious, calm, adventurous, nostalgic, dreamy.
- "cartItems": list any SPECIFIC bookable items YOU just mentioned in your spoken response. Each item must have:
    - type: one of "hotel", "flight", "experience", "restaurant", "fixer", "transport"
    - name: specific name (e.g., "Shore Temple Sunrise Tour", "JAL Premium Economy SFO→HND")
    - location: city or destination
    - price: include currency and unit ("$180/night", "₹2,500", "$45 per person")
    - detail: 1-line description (dates, duration, what's included)
- Empty cartItems array if you didn't propose anything bookable this turn.
- ONLY include cartItems for things you actually mentioned in your spoken response. Don't invent.

Example output:
Mahabalipuram is magic at sunrise. The Shore Temple, 1300 years old, sitting at the edge of the Bay of Bengal — orange light hitting black stone. We can stay at Vivanta on the beach, $180 a night, breakfast included. I'll book a private guide for the morning, $45 a person. Want me to add both?
{"locations":["Mahabalipuram Shore Temple","Mahabalipuram"],"mood":"excited","cartItems":[{"type":"hotel","name":"Vivanta Mahabalipuram","location":"Mahabalipuram","price":"$180/night","detail":"Beachfront, breakfast included"},{"type":"experience","name":"Shore Temple Sunrise Private Tour","location":"Mahabalipuram","price":"$45/person","detail":"Local guide, 2 hours at sunrise"}]}`;

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
    });
  } catch (error) {
    console.error('Voice-chat error:', error);
    res.status(500).json({ error: 'Failed', detail: error.message });
  }
}
