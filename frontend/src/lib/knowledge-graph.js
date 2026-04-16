/**
 * Jetzy Knowledge Graph — 3-Tiered Graph RAG System
 *
 * Tier 1 (Priority 1): Verified ground truths — destination facts, trail data,
 *   prices, logistics. Immutable. Overrides everything.
 *
 * Tier 2 (Priority 2): Community intelligence — member recommendations,
 *   trip reports, aggregated sentiment. Updated with every trip.
 *
 * Tier 3 (Priority 3): Unstructured text — full recommendation bodies,
 *   conversation history. Semantic fallback when graph lacks answers.
 *
 * Entity extraction uses keyword matching against known entities
 * for constant-time lookups (no NLP dependency needed for prototype).
 */

import { QuadStore } from './quadstore.js';
import { DESTINATIONS, RECOMMENDATIONS, SAMPLE_USERS, getUserById } from '../data/seed.js';

// ============================================================
// TIER 1: Ground Truth Facts (verified, immutable)
// ============================================================
const tier1 = new QuadStore();

// Destination facts
const GROUND_TRUTHS = [
  // El Chaltén
  ['el chaltén', 'located_in', 'argentina', 'geography'],
  ['el chaltén', 'region', 'patagonia', 'geography'],
  ['el chaltén', 'best_season', 'november to march', 'logistics'],
  ['el chaltén', 'elevation', '405m base, 1,200m+ trails', 'geography'],
  ['el chaltén', 'has_trail', 'laguna de los tres', 'trails'],
  ['el chaltén', 'has_trail', 'laguna torre', 'trails'],
  ['el chaltén', 'has_trail', 'loma del pliegue tumbado', 'trails'],
  ['laguna de los tres', 'duration', '10 hours round trip', 'trails'],
  ['laguna de los tres', 'difficulty', 'hard', 'trails'],
  ['laguna de los tres', 'best_time', '4:30am start for sunrise', 'trails'],
  ['laguna torre', 'duration', '6 hours round trip', 'trails'],
  ['laguna torre', 'difficulty', 'moderate', 'trails'],
  ['el chaltén', 'currency', 'argentine peso (ARS)', 'logistics'],
  ['el chaltén', 'nearest_airport', 'el calafate (FTE), 3hr bus', 'logistics'],
  ['el chaltén', 'weather_risk', 'wind changes hourly, layers essential', 'logistics'],

  // Kilimanjaro
  ['kilimanjaro', 'located_in', 'tanzania', 'geography'],
  ['kilimanjaro', 'elevation', '5,895m (19,341ft)', 'geography'],
  ['kilimanjaro', 'has_route', 'machame route', 'routes'],
  ['kilimanjaro', 'has_route', 'marangu route', 'routes'],
  ['kilimanjaro', 'has_route', 'lemosho route', 'routes'],
  ['machame route', 'duration', '6-7 days', 'routes'],
  ['machame route', 'difficulty', 'challenging', 'routes'],
  ['machame route', 'nickname', 'the whiskey route', 'routes'],
  ['marangu route', 'nickname', 'the tourist route', 'routes'],
  ['kilimanjaro', 'best_season', 'january-march and june-october', 'logistics'],
  ['kilimanjaro', 'cost_range', '$1,800-3,500 with operator', 'logistics'],
  ['kilimanjaro', 'gear_rental', 'available in moshi, $5-8/day per item', 'logistics'],

  // Tokyo
  ['tokyo', 'located_in', 'japan', 'geography'],
  ['tokyo', 'has_area', 'tsukiji outer market', 'areas'],
  ['tokyo', 'has_area', 'golden gai', 'areas'],
  ['tokyo', 'has_area', 'shibuya', 'areas'],
  ['tokyo', 'currency', 'japanese yen (JPY)', 'logistics'],
  ['tsukiji outer market', 'best_time', 'before 7am', 'logistics'],
  ['golden gai', 'cover_charge', '¥500-1000', 'logistics'],
  ['golden gai', 'budget_per_night', '¥3,000', 'logistics'],

  // Serengeti
  ['serengeti', 'located_in', 'tanzania', 'geography'],
  ['serengeti', 'best_for', 'great migration viewing', 'experience'],
  ['serengeti', 'migration_peak', 'june to october at mara river', 'logistics'],
  ['serengeti', 'photography_tip', '200-400mm lens minimum for crossings', 'logistics'],
  ['serengeti', 'weight_limit', '15kg for bush flights', 'logistics'],

  // Buenos Aires
  ['buenos aires', 'located_in', 'argentina', 'geography'],
  ['buenos aires', 'has_area', 'san telmo', 'areas'],
  ['buenos aires', 'has_area', 'palermo', 'areas'],
  ['buenos aires', 'best_steak', 'don julio in palermo', 'food'],
  ['don julio', 'booking_tip', 'book 2 weeks ahead or go for lunch', 'logistics'],

  // Lisbon
  ['lisbon', 'located_in', 'portugal', 'geography'],
  ['lisbon', 'has_area', 'alfama', 'areas'],
  ['lisbon', 'has_area', 'lx factory', 'areas'],
  ['lisbon', 'best_seafood', 'cervejaria ramiro', 'food'],
  ['cervejaria ramiro', 'budget', '€35-40 per person', 'logistics'],

  // Medellín
  ['medellín', 'located_in', 'colombia', 'geography'],
  ['medellín', 'has_area', 'el poblado', 'areas'],
  ['medellín', 'has_area', 'laureles', 'areas'],
  ['medellín', 'weather', 'spring-like year round, 18-28°C', 'logistics'],
  ['medellín', 'currency', 'colombian peso (COP)', 'logistics'],

  // NYC
  ['new york city', 'located_in', 'usa', 'geography'],
  ['new york city', 'has_area', 'williamsburg', 'areas'],
  ['new york city', 'has_area', 'fort tryon park', 'areas'],
  ['the cloisters', 'location', 'fort tryon park, manhattan', 'logistics'],
  ['the cloisters', 'ticket', '$30 (includes the met)', 'logistics'],
  ['the cloisters', 'best_time', 'wednesday mornings', 'logistics'],
];

GROUND_TRUTHS.forEach(([s, p, o, c]) => tier1.add(s, p, o, c));

// ============================================================
// TIER 2: Community Intelligence (member-sourced, aggregated)
// ============================================================
const tier2 = new QuadStore();

// Load from seed recommendations
RECOMMENDATIONS.forEach(rec => {
  const user = getUserById(rec.userId);
  const dest = DESTINATIONS.find(d => d.id === rec.destId);
  if (!dest || !user) return;

  const ctx = `member:${user.name}:${user.countryCount}countries`;

  tier2.add(dest.name.toLowerCase(), `recommended:${rec.category.toLowerCase()}`, rec.title, ctx);
  tier2.add(dest.name.toLowerCase(), 'has_recommendation', rec.title, ctx);
  tier2.add(rec.title, 'full_text', rec.text, ctx);
  tier2.add(rec.title, 'upvotes', String(rec.upvotes), ctx);
  tier2.add(rec.title, 'category', rec.category, ctx);

  if (rec.isHiddenGem) {
    tier2.add(rec.title, 'is_hidden_gem', 'true', ctx);
    tier2.add(dest.name.toLowerCase(), 'has_hidden_gem', rec.title, ctx);
  }
});

// Member trip intelligence
SAMPLE_USERS.forEach(user => {
  const ctx = `profile:${user.name}`;
  if (user.recentTrip) {
    tier2.add(user.name.toLowerCase(), 'recently_visited', user.recentTrip.destination.toLowerCase(), ctx);
    tier2.add(user.recentTrip.destination.toLowerCase(), 'visited_by', user.name, ctx);
  }
  (user.countries || []).forEach(country => {
    tier2.add(user.name.toLowerCase(), 'has_visited', country.toLowerCase(), ctx);
  });
  (user.badges || []).forEach(badge => {
    tier2.add(user.name.toLowerCase(), 'earned_badge', badge.toLowerCase(), ctx);
  });
});

// Destination check-in counts
DESTINATIONS.forEach(dest => {
  tier2.add(dest.name.toLowerCase(), 'member_checkins', String(dest.memberCheckIns), 'community_stats');
  tier2.add(dest.name.toLowerCase(), 'vibe', dest.vibe, 'community_sentiment');
});

// ============================================================
// TIER 3: Unstructured Text (full recommendation bodies)
// ============================================================
const tier3Docs = [];

RECOMMENDATIONS.forEach(rec => {
  const user = getUserById(rec.userId);
  const dest = DESTINATIONS.find(d => d.id === rec.destId);
  if (!dest || !user) return;

  tier3Docs.push({
    id: rec.id,
    destination: dest.name,
    title: rec.title,
    text: rec.text,
    category: rec.category,
    author: user.name,
    authorBadges: user.badges,
    upvotes: rec.upvotes,
    isHiddenGem: rec.isHiddenGem,
    // Keywords for simple text matching (no vector DB needed for prototype)
    keywords: `${dest.name} ${dest.country} ${rec.title} ${rec.text} ${rec.category} ${user.name}`.toLowerCase(),
  });
});

// ============================================================
// ENTITY EXTRACTION (constant-time keyword matching)
// ============================================================

// Build entity dictionary from all known entities
const KNOWN_ENTITIES = new Set();

// Destinations
DESTINATIONS.forEach(d => {
  KNOWN_ENTITIES.add(d.name.toLowerCase());
  KNOWN_ENTITIES.add(d.country.toLowerCase());
});

// Key places from ground truths
['laguna de los tres', 'laguna torre', 'machame route', 'marangu route',
  'tsukiji outer market', 'golden gai', 'don julio', 'cervejaria ramiro',
  'lx factory', 'the cloisters', 'fitz roy', 'cerro torre',
  'perito moreno', 'ngorongoro crater', 'mara river'].forEach(e => KNOWN_ENTITIES.add(e));

// Members
SAMPLE_USERS.forEach(u => KNOWN_ENTITIES.add(u.name.toLowerCase()));

/**
 * Extract known entities from a text query
 * @param {string} text - User query
 * @returns {string[]} - Matched entities
 */
export function extractEntities(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const entity of KNOWN_ENTITIES) {
    if (lower.includes(entity)) {
      found.push(entity);
    }
  }
  return found;
}

// ============================================================
// GRAPH RAG RETRIEVAL — 3-Tiered Priority System
// ============================================================

/**
 * Query the knowledge graph with a user's question.
 * Returns structured context with priority labels for the LLM.
 *
 * @param {string} query - User's natural language question
 * @returns {string} - Formatted context string with [PRIORITY 1/2/3] labels
 */
export function retrieveContext(query) {
  const entities = extractEntities(query);
  if (entities.length === 0) return '';

  const sections = [];

  // ---- PRIORITY 1: Ground Truth Facts ----
  const p1Facts = [];
  for (const entity of entities) {
    const facts = tier1.getEntityFacts(entity);
    facts.forEach(f => {
      p1Facts.push(`${f.subject} → ${f.predicate} → ${f.object} [${f.context}]`);
    });
  }
  if (p1Facts.length > 0) {
    sections.push(`[PRIORITY 1 — Verified Facts]\n${[...new Set(p1Facts)].join('\n')}`);
  }

  // ---- PRIORITY 2: Community Intelligence ----
  const p2Facts = [];
  for (const entity of entities) {
    const facts = tier2.getEntityFacts(entity);
    facts.forEach(f => {
      if (f.predicate === 'full_text') {
        p2Facts.push(`"${f.subject}": ${f.object} [source: ${f.context}]`);
      } else if (f.predicate === 'has_recommendation' || f.predicate === 'has_hidden_gem') {
        p2Facts.push(`${f.subject} — ${f.predicate}: ${f.object} [${f.context}]`);
      } else if (f.predicate.startsWith('recommended:')) {
        p2Facts.push(`${f.subject} ${f.predicate}: ${f.object} [${f.context}]`);
      } else {
        p2Facts.push(`${f.subject} → ${f.predicate} → ${f.object}`);
      }
    });
  }
  if (p2Facts.length > 0) {
    sections.push(`[PRIORITY 2 — Community Intelligence]\n${[...new Set(p2Facts)].slice(0, 30).join('\n')}`);
  }

  // ---- PRIORITY 3: Full-Text Search ----
  const lower = query.toLowerCase();
  const matchedDocs = tier3Docs
    .filter(doc => entities.some(e => doc.keywords.includes(e)))
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5);

  if (matchedDocs.length > 0) {
    const p3 = matchedDocs.map(doc =>
      `[${doc.destination} · ${doc.category}] "${doc.title}" by ${doc.author} (${doc.upvotes} upvotes${doc.isHiddenGem ? ', HIDDEN GEM' : ''}):\n${doc.text}`
    );
    sections.push(`[PRIORITY 3 — Member Recommendations]\n${p3.join('\n\n')}`);
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Get graph stats for the Intel dashboard
 */
export function getGraphStats() {
  return {
    tier1Facts: tier1.size,
    tier2Facts: tier2.size,
    tier3Docs: tier3Docs.length,
    totalEntities: KNOWN_ENTITIES.size,
    destinations: DESTINATIONS.length,
    recommendations: RECOMMENDATIONS.length,
  };
}

/**
 * Get all facts about a specific destination
 */
export function getDestinationKnowledge(destinationName) {
  const lower = destinationName.toLowerCase();
  return {
    groundTruths: tier1.getEntityFacts(lower),
    communityIntel: tier2.getEntityFacts(lower),
    fullRecommendations: tier3Docs.filter(d => d.destination.toLowerCase() === lower),
  };
}
