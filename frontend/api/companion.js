import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userProfile } = req.body;

  const systemPrompt = `You are the Jetzy Travel Companion. You are a brilliant, well-traveled friend who knows the world intimately. You speak warmly and confidently. You give specific, opinionated recommendations — not generic lists. You know that ${userProfile.name} is a ${userProfile.travelStyles?.join(', ')} traveler who has been to ${userProfile.countriesVisited?.join(', ')} and is planning a trip to ${userProfile.upcomingTrip || 'somewhere new'}. Their interests are ${userProfile.interests?.join(', ')}. You always recommend like a local insider, never like a tourist guide. You reference Jetzy Select perks when relevant. You are concise, never verbose. You feel like a text from a friend who just got back from exactly where they are going. Keep responses under 200 words unless building an itinerary.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    res.status(200).json({ response: response.content[0].text });
  } catch (error) {
    console.error('Companion error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
}
