import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ============================================================
// Inline Graph RAG for Vercel Serverless
// (Can't import from src/lib in serverless, so we inline the
//  retrieval logic here with the same SPOC architecture)
// ============================================================

class QuadStore {
  constructor() {
    this.quads = [];
    this.stringToId = new Map();
    this.idToString = new Map();
    this.nextId = 0;
  }
  _id(s) {
    const k = s.toLowerCase().trim();
    if (this.stringToId.has(k)) return this.stringToId.get(k);
    const id = this.nextId++;
    this.stringToId.set(k, id);
    this.idToString.set(id, k);
    return id;
  }
  _str(id) { return this.idToString.get(id) || ''; }
  add(s, p, o, c = 'default') {
    this.quads.push([this._id(s), this._id(p), this._id(o), this._id(c)]);
  }
  queryEntity(entity) {
    const eid = this.stringToId.get(entity.toLowerCase().trim());
    if (eid === undefined) return [];
    return this.quads
      .filter(q => q[0] === eid || q[2] === eid)
      .map(q => `${this._str(q[0])} → ${this._str(q[1])} → ${this._str(q[2])}`);
  }
}

// Tier 1: Ground truths
const t1 = new QuadStore();
const facts = [
  ['el chaltén','located_in','argentina','geo'],['el chaltén','region','patagonia','geo'],
  ['el chaltén','best_season','november to march','logistics'],['el chaltén','has_trail','laguna de los tres','trails'],
  ['el chaltén','has_trail','laguna torre','trails'],['laguna de los tres','duration','10 hours round trip','trails'],
  ['laguna de los tres','best_time','4:30am start for sunrise','trails'],['laguna de los tres','difficulty','hard','trails'],
  ['laguna torre','duration','6 hours round trip','trails'],['laguna torre','difficulty','moderate','trails'],
  ['el chaltén','nearest_airport','el calafate (FTE), 3hr bus','logistics'],
  ['el chaltén','weather_risk','wind changes hourly, layers essential','logistics'],
  ['kilimanjaro','located_in','tanzania','geo'],['kilimanjaro','elevation','5,895m (19,341ft)','geo'],
  ['kilimanjaro','has_route','machame route','routes'],['machame route','duration','6-7 days','routes'],
  ['machame route','nickname','the whiskey route','routes'],['kilimanjaro','cost_range','$1,800-3,500','logistics'],
  ['kilimanjaro','gear_rental','available in moshi, $5-8/day','logistics'],
  ['tokyo','located_in','japan','geo'],['tokyo','has_area','tsukiji outer market','areas'],
  ['tokyo','has_area','golden gai','areas'],['tsukiji outer market','best_time','before 7am','logistics'],
  ['golden gai','budget','¥3,000 per night','logistics'],
  ['serengeti','located_in','tanzania','geo'],['serengeti','best_for','great migration','experience'],
  ['serengeti','migration_peak','june to october','logistics'],['serengeti','weight_limit','15kg bush flights','logistics'],
  ['buenos aires','located_in','argentina','geo'],['don julio','booking_tip','book 2 weeks ahead or go for lunch','logistics'],
  ['lisbon','located_in','portugal','geo'],['cervejaria ramiro','budget','€35-40pp','logistics'],
  ['medellín','located_in','colombia','geo'],['medellín','weather','spring-like year round','logistics'],
  ['new york city','located_in','usa','geo'],['the cloisters','best_time','wednesday mornings','logistics'],
  ['the cloisters','ticket','$30 includes the met','logistics'],
  ['torres del paine','located_in','chile','geo'],['torres del paine','region','patagonia','geo'],
  ['torres del paine','has_trek','w circuit','treks'],['w circuit','duration','4-5 days','treks'],
  ['patagonia','best_season','october to march','logistics'],['patagonia','region','southern argentina and chile','geo'],
];
facts.forEach(([s,p,o,c]) => t1.add(s,p,o,c));

// Tier 2: Community recommendations (condensed)
const t2 = new QuadStore();
const recs = [
  ['el chaltén','hidden_gem','Laguna de los Tres at sunrise — start 4:30am, bring headlamp and extra layers','member:marco v'],
  ['el chaltén','food','La Cervecería — best craft stout south of the equator, $8 for flight of 4','member:marco v'],
  ['el chaltén','stay','Senderos Hostería — $120/night, owner María gives trail beta, book 3mo ahead','member:aisha m'],
  ['tokyo','hidden_gem','Tsukiji tamagoyaki stall near Gate 4 — ¥300, best egg ever, go before 7am','member:sofia r'],
  ['tokyo','hidden_gem','Golden Gai — find bar with no English sign, fewer than 6 seats','member:sofia r'],
  ['tokyo','work','Fabricca coworking Shibuya — ¥1500/day, fast wifi, great coffee','member:james t'],
  ['medellín','hidden_gem','Arepa lady on Calle 10 near Parque Lleras — 5,000 COP, weekday mornings only','member:james t'],
  ['medellín','work','Selina rooftop — 70,000 COP day pass, pool + workspace, 50+ Mbps','member:james t'],
  ['lisbon','hidden_gem','Cervejaria Ramiro not Time Out Market — tiger prawns + bifana, go at 7pm','member:james t'],
  ['lisbon','culture','LX Factory on Tuesday morning — empty, best bookshop, €40 leather jackets','member:aisha m'],
  ['buenos aires','food','Don Julio lunch trick — same menu, half wait, entraña medium-rare, 25,000 ARS pp','member:marco v'],
  ['buenos aires','nightlife','La Catedral tango — raw warehouse, real porteños, 3,000 ARS entry','member:sofia r'],
  ['kilimanjaro','hidden_gem','Machame Route — hire local in Moshi ($1,800 vs $3,500), guide Honest is incredible','member:marco v'],
  ['kilimanjaro','gear','Rent in Moshi — sleeping bags, poles, gaiters, $5-8/day, only bring your own boots','member:marco v'],
  ['serengeti','hidden_gem','Mobile camp follows migration — Wayo Africa, same price as mid-range lodge','member:aisha m'],
  ['serengeti','photography','Mara River by 5:30am, 200-400mm lens, patience is the only gear that matters','member:aisha m'],
  ['new york city','food','Di Fara Pizza in Midwood — Q train to Ave J, $6 cash only, pizza as religion','member:sofia r'],
  ['new york city','culture','The Cloisters at 10am Wednesday — medieval art, Unicorn Tapestries, nearly empty','member:aisha m'],
];
recs.forEach(([s,p,o,c]) => t2.add(s,p,o,c));

// Known entities for extraction
const ENTITIES = new Set([
  'el chaltén','chaltén','patagonia','kilimanjaro','tokyo','serengeti',
  'buenos aires','lisbon','medellín','medellin','new york','nyc','new york city',
  'laguna de los tres','laguna torre','fitz roy','machame','marangu',
  'tsukiji','golden gai','don julio','cervejaria ramiro','lx factory',
  'the cloisters','torres del paine','w circuit','ngorongoro',
  'argentina','tanzania','japan','colombia','portugal','usa','chile',
  'peru','nepal','iceland','india','morocco','jordan','kenya','sri lanka',
]);

function extractEntities(text) {
  const lower = text.toLowerCase();
  return [...ENTITIES].filter(e => lower.includes(e));
}

function retrieveContext(query) {
  const entities = extractEntities(query);
  if (!entities.length) return '';

  const sections = [];

  // Priority 1
  const p1 = [];
  entities.forEach(e => t1.queryEntity(e).forEach(f => p1.push(f)));
  if (p1.length) sections.push(`[PRIORITY 1 — Verified Facts]\n${[...new Set(p1)].join('\n')}`);

  // Priority 2
  const p2 = [];
  entities.forEach(e => t2.queryEntity(e).forEach(f => p2.push(f)));
  if (p2.length) sections.push(`[PRIORITY 2 — Community Intel from Jetzy Members]\n${[...new Set(p2)].slice(0, 20).join('\n')}`);

  return sections.join('\n\n');
}

// ============================================================
// API Handler
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, userProfile } = req.body;

  // Extract context from knowledge graph based on the latest user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const graphContext = retrieveContext(lastUserMessage);

  const memoriesSection = userProfile.memories?.length
    ? `\n\nThings Jetzy remembers about this traveler:\n${userProfile.memories.join('. ')}.`
    : '';

  const graphSection = graphContext
    ? `\n\n--- KNOWLEDGE GRAPH CONTEXT ---\nThe following is retrieved from Jetzy's verified knowledge graph and member community intelligence. Use this as your primary source of truth.\n\n${graphContext}\n\nIMPORTANT: If Priority 1 contains a direct answer, use that answer. Priority 2 community intel adds color and specifics from real members. Reference member names when citing recommendations. Never make up facts that contradict the graph.`
    : '';

  const systemPrompt = `You are the Jetzy Travel Companion. You are a brilliant, well-traveled friend who knows the world intimately. You speak warmly and confidently. You give specific, opinionated recommendations — not generic lists. You know that ${userProfile.name} is a ${userProfile.travelStyles?.join(', ')} traveler who has been to ${userProfile.countriesVisited?.join(', ')} and is planning a trip to ${userProfile.upcomingTrip || 'somewhere new'}. Their interests are ${userProfile.interests?.join(', ')}. You always recommend like a local insider, never like a tourist guide. You reference Jetzy Select perks when relevant. You are concise, never verbose. You feel like a text from a friend who just got back from exactly where they are going. Keep responses under 200 words unless building an itinerary.${memoriesSection}${graphSection}`;

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

    res.status(200).json({
      response: response.content[0].text,
      graphContext: graphContext ? true : false,
      entitiesFound: extractEntities(lastUserMessage),
    });
  } catch (error) {
    console.error('Companion error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
}
