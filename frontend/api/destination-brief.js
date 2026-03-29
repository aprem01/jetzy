import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destination, userProfile } = req.body;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are the Jetzy Travel Companion. Generate a brief destination overview for ${destination} tailored to a ${userProfile.travelStyles?.join(', ')} traveler. Include: a one-line vibe check, best time to visit, 3 insider tips, and one "only locals know" recommendation. Be warm, specific, opinionated. Under 200 words.`,
      messages: [{ role: 'user', content: `Give me the Jetzy brief on ${destination}` }]
    });

    res.status(200).json({ brief: response.content[0].text });
  } catch (error) {
    console.error('Brief error:', error);
    res.status(500).json({ error: 'Failed to generate brief' });
  }
}
