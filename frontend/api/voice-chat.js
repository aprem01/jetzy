/**
 * Voice-first conversational endpoint for the Virtual Travel avatar.
 * Returns: { response, locations, mood }
 *  - response: short conversational reply suitable for TTS (under 80 words)
 *  - locations: any place names mentioned by user OR worth showing the user
 *  - mood: tone hint for the avatar
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
- Keep responses SHORT (40-80 words max).
- Sound natural, conversational, like talking on the phone.
- Use vivid sensory language — sounds, smells, light, food.
- React with personality. Show emotion in your words.
- When the user mentions a place, paint it with one or two strong details before asking what they want to see.
- Ask one short follow-up question to keep the conversation going.
- Do NOT use markdown, bullet points, or lists in your response.
- If they ask to "go to" a place, narrate the arrival as if you've just landed there together.

CRITICAL: After your response, on a new line, output a JSON object on a single line with this exact format:
{"locations":["place1","place2"],"mood":"warm"}

- "locations" should include any place names mentioned in YOUR response or theirs that we could show as a background image. Include cities, neighborhoods, landmarks, parks, monuments, beaches. Use proper names (e.g., "Mahabalipuram" not "the temples"). If multiple, put the most visually relevant FIRST.
- "mood" should be one of: warm, excited, curious, calm, adventurous, nostalgic, dreamy.
- If no location is mentioned, return {"locations":[],"mood":"warm"}.

Example output:
Mahabalipuram! Oh, you must go. The Shore Temple sitting right at the edge of the Bay of Bengal — 1300 years old, still standing, still watching the ocean. We can be there in two hours from Chennai. Sunrise or sunset?
{"locations":["Mahabalipuram Shore Temple","Mahabalipuram"],"mood":"excited"}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const fullText = response.content[0].text.trim();

    // Split response from metadata JSON (last line)
    const lines = fullText.split('\n').filter(l => l.trim());
    let metadata = { locations: [], mood: 'warm' };
    let spokenResponse = fullText;

    // Find the JSON line (starts with {)
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
    });
  } catch (error) {
    console.error('Voice-chat error:', error);
    res.status(500).json({ error: 'Failed', detail: error.message });
  }
}
