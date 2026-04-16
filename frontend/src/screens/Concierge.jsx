import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, PERKS, RECOMMENDATIONS, getUserById } from '../data/seed';
import { ArrowLeft, Sparkles, Check, MapPin, Calendar, DollarSign, Cloud, Backpack, Users, ChevronRight, Send, Star } from 'lucide-react';

const AGENT_STEPS = [
  { text: 'Checking member intel from recent trips...', icon: '🔍' },
  { text: 'Finding your best weather window...', icon: '🌤️' },
  { text: 'Locating Select deals along your route...', icon: '💎' },
  { text: 'Reviewing your past packing lists...', icon: '🎒' },
  { text: 'Building your complete plan...', icon: '✨' },
];

export default function Concierge() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [phase, setPhase] = useState('input'); // input, thinking, result
  const [request, setRequest] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [plan, setPlan] = useState(null);
  const [saved, setSaved] = useState(false);

  const buildTrip = async () => {
    if (!request.trim()) return;
    setPhase('thinking');
    setCompletedSteps([]);

    // Animate agent steps
    for (let i = 0; i < AGENT_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 1500));
      setCompletedSteps(prev => [...prev, i]);
    }

    // Call AI
    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: request }],
          userProfile: {
            name: user.name,
            travelStyles: user.travelStyles,
            countriesVisited: user.countries,
            upcomingTrip: user.upcomingTrip?.destination,
            interests: user.interests,
          }
        })
      });
      const data = await res.json();
      setPlan({ aiResponse: data.response, request });
    } catch {
      setPlan({ aiResponse: generateFallbackPlan(request, user), request });
    }

    await new Promise(r => setTimeout(r, 800));
    setPhase('result');
  };

  const relevantPerks = PERKS.slice(0, 2);
  const matchMembers = SAMPLE_USERS.filter(u => u.id !== user.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Concierge Agent</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Plan a complete trip</h1>
          <p className="text-white/50 text-sm mt-1">Tell me where and how — I'll build everything</p>
        </div>
      </div>

      <div className="content-px mt-6">
        {/* Phase 1: Input */}
        {phase === 'input' && (
          <div className="animate-fade-up">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="I want to do a trek in Patagonia in October, around $4000 budget, at least one proper lodge, best weather window..."
                className="w-full p-0 bg-transparent outline-none text-charcoal text-base placeholder:text-gray-300 resize-none h-32 leading-relaxed"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-charcoal-light">Be specific — budget, dates, style, must-haves</p>
                <button
                  onClick={buildTrip}
                  disabled={!request.trim()}
                  className="px-6 py-3 gradient-gold rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg disabled:opacity-30 active:scale-[0.97] transition-all"
                >
                  <Sparkles size={14} /> Build My Trip
                </button>
              </div>
            </div>

            {/* Quick prompts */}
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Or try one of these</p>
              {[
                "Trek in Patagonia, October, $4000 budget, mix of camping and lodges",
                "5 days in Tokyo, food-focused, must visit Tsukiji and Golden Gai",
                "Safari in Serengeti during the Great Migration, luxury mobile camp",
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setRequest(prompt); }}
                  className="w-full p-4 bg-white rounded-2xl border border-gray-100 text-left text-sm text-charcoal hover:border-gold/30 transition-all active:scale-[0.99]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 2: Thinking */}
        {phase === 'thinking' && (
          <div className="animate-fade-up">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-gold mx-auto flex items-center justify-center mb-4 animate-pulse shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-navy">Building your trip</h3>
                <p className="text-charcoal-light text-xs mt-1">"{request.slice(0, 60)}..."</p>
              </div>

              <div className="space-y-3">
                {AGENT_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                      completedSteps.includes(i) ? 'bg-green-50' : i === completedSteps.length ? 'bg-gold/5' : 'bg-gray-50 opacity-40'
                    }`}
                  >
                    {completedSteps.includes(i) ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    ) : i === completedSteps.length ? (
                      <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center animate-pulse">
                        <span className="text-sm">{step.icon}</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm opacity-50">{step.icon}</span>
                      </div>
                    )}
                    <span className={`text-sm ${completedSteps.includes(i) ? 'text-charcoal font-medium' : 'text-charcoal-light'}`}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Result */}
        {phase === 'result' && plan && (
          <div className="space-y-4 animate-fade-up">
            {/* AI Plan */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl gradient-gold flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Your Trip Plan</p>
                  <p className="text-[10px] text-charcoal-light">Built by Jetzy Concierge</p>
                </div>
              </div>
              <div className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
                {plan.aiResponse}
              </div>
            </div>

            {/* Select Deals */}
            <div>
              <h3 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
                <Star size={14} className="text-gold" /> Select Deals for This Trip
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relevantPerks.map(perk => (
                  <div key={perk.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <img src={perk.image} alt="" className="w-full h-28 object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-charcoal">{perk.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-gold">{perk.price}</span>
                        <span className="text-xs line-through text-charcoal-light/40">{perk.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Members to Meet */}
            <div>
              <h3 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
                <Users size={14} className="text-gold" /> Members Who Know This Route
              </h3>
              <div className="space-y-2">
                {matchMembers.map(member => (
                  <div key={member.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <img src={member.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{member.name}</p>
                      <p className="text-xs text-charcoal-light">{member.badges?.[0]} · {member.recentTrip?.destination}</p>
                    </div>
                    <button onClick={() => navigate('/match')} className="px-3 py-1.5 bg-navy/5 text-navy text-xs font-semibold rounded-lg active:scale-95 transition-transform">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {saved ? (
                <div className="flex-1 py-3.5 bg-green-50 rounded-2xl text-green-600 text-sm font-semibold flex items-center justify-center gap-2 animate-scale-in">
                  <Check size={16} strokeWidth={3} /> Saved to Passport!
                </div>
              ) : (
                <button onClick={() => setSaved(true)} className="flex-1 py-3.5 gradient-gold rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform">
                  Save to Passport
                </button>
              )}
              <button onClick={() => navigate('/companion')} className="flex-1 py-3.5 bg-white border border-gray-200 rounded-2xl text-charcoal font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
                Ask Follow-up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function generateFallbackPlan(request, user) {
  return `Here's your personalized trip plan, ${user.name?.split(' ')[0]}:

📍 OVERVIEW
Destination: Patagonia, Argentina
Duration: 5 days
Best window: Late October (spring, fewer crowds, 8-15°C)
Estimated cost: $3,800

📅 DAY BY DAY

Day 1 — Arrive El Chaltén
Fly into El Calafate, 3hr bus to Chaltén. Check into Senderos Hostería ($120/night — the owner María gives trail beta that isn't on AllTrails). Easy sunset hike to Mirador de los Cóndores.

Day 2 — Laguna de los Tres
The big one. Start at 4:30am with headlamp. 10 hours round trip. Fitz Roy at sunrise is why you came. Pack layers — weather changes every 20 minutes. La Cervecería for post-hike craft beer and lamb empanadas.

Day 3 — Laguna Torre
Shorter day. Cerro Torre's impossible spire reflected in the glacier lake. Afternoon at the refugio with mate and facturas.

Day 4 — Rest + Town
Recovery day. Explore Chaltén's three good restaurants. Rent bikes for the river trail. Repack for tomorrow.

Day 5 — Transfer to El Calafate
Morning at Perito Moreno glacier ($35 entry). Afternoon flight home.

🎒 PACKING (based on your Kilimanjaro kit)
Keep: hiking boots, merino layers, trekking poles
Add: waterproof hardshell (rain is horizontal here), lightweight dry bag for electronics
Remove: down jacket (too wet — go synthetic), heavy sleeping bag (lodges have bedding)

💡 LOCAL TIP
The refugio at Laguna Torre sells the best hot chocolate in Patagonia. It costs 2,000 ARS and it's made with real chocolate from Bariloche. Don't skip it.`;
}
