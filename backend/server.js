import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/companion', async (req, res) => {
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

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Companion error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

app.post('/api/destination-brief', async (req, res) => {
  const { destination, userProfile } = req.body;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are the Jetzy Travel Companion. Generate a brief destination overview for ${destination} tailored to a ${userProfile.travelStyles?.join(', ')} traveler. Include: a one-line vibe check, best time to visit, 3 insider tips, and one "only locals know" recommendation. Be warm, specific, opinionated. Under 200 words.`,
      messages: [{ role: 'user', content: `Give me the Jetzy brief on ${destination}` }]
    });

    res.json({ brief: response.content[0].text });
  } catch (error) {
    console.error('Brief error:', error);
    res.status(500).json({ error: 'Failed to generate brief' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Jetzy API running on port ${PORT}`));
