/**
 * Lists the ElevenLabs voices available in this account
 * and categorizes by inferred gender. Used so the frontend
 * can auto-pick a male voice for Marco and female for Aria
 * regardless of which voices the user has added.
 */

export default async function handler(req, res) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });
  }

  try {
    const r = await fetch('https://api.elevenlabs.io/v2/voices?page_size=100', {
      headers: { 'xi-api-key': apiKey }
    });
    if (!r.ok) {
      const text = await r.text();
      // v2 may not be available — fall back to v1
      const r1 = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey }
      });
      if (!r1.ok) {
        return res.status(r1.status).json({ error: 'Failed to list voices', detail: text });
      }
      const data = await r1.json();
      return res.status(200).json(categorize(data.voices || []));
    }
    const data = await r.json();
    return res.status(200).json(categorize(data.voices || []));
  } catch (e) {
    return res.status(500).json({ error: 'voices proxy error', detail: e.message });
  }
}

const MALE_KEYWORDS = ['adam', 'antoni', 'arnold', 'brian', 'callum', 'charlie', 'clyde', 'daniel', 'dave', 'david', 'drew', 'ethan', 'fin', 'george', 'glinda', 'harry', 'james', 'jeremy', 'joseph', 'josh', 'liam', 'mark', 'matthew', 'michael', 'patrick', 'paul', 'ryan', 'sam', 'thomas', 'will'];
const FEMALE_KEYWORDS = ['alice', 'allison', 'aria', 'bella', 'charlotte', 'chloe', 'daisy', 'dorothy', 'emily', 'emma', 'freya', 'gigi', 'grace', 'jenny', 'jessie', 'karen', 'lily', 'lottie', 'maya', 'mia', 'mimi', 'nicole', 'olivia', 'rachel', 'rebecca', 'sarah', 'serena', 'sophia', 'victoria', 'zara'];

function categorize(voices) {
  const list = voices.map(v => {
    const labels = v.labels || {};
    const name = (v.name || '').toLowerCase();
    let gender = (labels.gender || '').toLowerCase();
    if (!gender) {
      if (MALE_KEYWORDS.some(k => name.includes(k))) gender = 'male';
      else if (FEMALE_KEYWORDS.some(k => name.includes(k))) gender = 'female';
    }
    return {
      id: v.voice_id,
      name: v.name,
      gender,
      accent: labels.accent || '',
      description: labels.description || '',
      preview_url: v.preview_url || '',
    };
  });

  // Pick best male and female
  const males = list.filter(v => v.gender === 'male');
  const females = list.filter(v => v.gender === 'female');

  // Prefer common "premium" voices
  const preferredMale = ['Adam', 'Brian', 'Daniel', 'Charlie', 'Liam', 'Antoni', 'Josh', 'Sam'];
  const preferredFemale = ['Rachel', 'Aria', 'Sarah', 'Bella', 'Charlotte', 'Domi', 'Nicole'];

  const pick = (arr, prefs) => {
    for (const p of prefs) {
      const found = arr.find(v => v.name === p);
      if (found) return found;
    }
    return arr[0] || null;
  };

  return {
    voices: list,
    male: pick(males, preferredMale),
    female: pick(females, preferredFemale),
    counts: { total: list.length, male: males.length, female: females.length },
  };
}
