import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, TRAVEL_STYLES } from '../data/seed';
import { ArrowLeft, Sparkles, Users, Check, ChevronRight, Heart, MapPin, Calendar, DollarSign } from 'lucide-react';

const PARTNER_STYLES = ['Adventure Hiker', 'Beach Lover', 'Culinary Explorer', 'Urban Explorer', 'Cultural Nomad', 'Luxury Traveler'];

export default function ForTwo() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [phase, setPhase] = useState('setup'); // setup, prefs, result
  const [partnerMode, setPartnerMode] = useState(null); // 'member' | 'custom'
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerStyle, setPartnerStyle] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('5');
  const [plan, setPlan] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const partnerLabel = selectedPartner?.name || partnerName || 'Partner';
  const userStyleLabel = TRAVEL_STYLES.find(s => user.travelStyles?.includes(s.id))?.label || 'Adventure Hiker';

  const buildPlan = async () => {
    setIsBuilding(true);
    setPhase('result');

    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Build a ${duration}-day trip to ${destination || 'Patagonia'} for two people. Traveler 1 (${user.name}) loves ${userStyleLabel}. Traveler 2 (${partnerLabel}) loves ${partnerStyle || 'beach and food'}. Find the overlap and build a day-by-day itinerary that satisfies both. Mark each day with who it favors.` }],
          userProfile: { name: user.name, travelStyles: user.travelStyles, countriesVisited: user.countries, interests: user.interests }
        })
      });
      const data = await res.json();
      setPlan(data.response);
    } catch {
      setPlan(generateFallback(user.name, partnerLabel, destination || 'Patagonia', duration));
    }
    setIsBuilding(false);
  };

  return (
    <div className="min-h-screen bg-cream pb-8">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">For Two</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Plan a trip together</h1>
          <p className="text-white/50 text-sm mt-1">Two styles, one perfect itinerary</p>
        </div>
      </div>

      <div className="content-px mt-6">
        {phase === 'setup' && (
          <div className="animate-fade-up space-y-5">
            {/* Your card */}
            <div className="p-4 bg-white rounded-2xl border border-gold/20 shadow-sm">
              <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-2">Traveler 1 — You</p>
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">{user.name}</p>
                  <p className="text-xs text-charcoal-light">{userStyleLabel} · {user.interests?.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Partner selection */}
            <div>
              <p className="text-[10px] font-bold text-navy uppercase tracking-wider mb-3">Traveler 2 — Your Partner</p>

              {!partnerMode ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPartnerMode('member')} className="p-5 bg-white rounded-2xl border border-gray-100 text-center hover:border-gold/30 transition-all active:scale-[0.98]">
                    <Users size={24} className="text-gold mx-auto mb-2" />
                    <p className="text-sm font-semibold text-charcoal">Jetzy Member</p>
                    <p className="text-[10px] text-charcoal-light mt-0.5">Pick from matches</p>
                  </button>
                  <button onClick={() => setPartnerMode('custom')} className="p-5 bg-white rounded-2xl border border-gray-100 text-center hover:border-gold/30 transition-all active:scale-[0.98]">
                    <Heart size={24} className="text-gold mx-auto mb-2" />
                    <p className="text-sm font-semibold text-charcoal">Someone Else</p>
                    <p className="text-[10px] text-charcoal-light mt-0.5">Enter their style</p>
                  </button>
                </div>
              ) : partnerMode === 'member' ? (
                <div className="space-y-2">
                  {SAMPLE_USERS.filter(u => u.id !== user.id).map(member => (
                    <button key={member.id} onClick={() => { setSelectedPartner(member); setPartnerStyle(TRAVEL_STYLES.find(s => member.travelStyles?.includes(s.id))?.label || ''); }}
                      className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] ${
                        selectedPartner?.id === member.id ? 'border-gold bg-gold/5 shadow-md' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <img src={member.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-charcoal">{member.name}</p>
                        <p className="text-xs text-charcoal-light">{member.badges?.[0]}</p>
                      </div>
                      {selectedPartner?.id === member.id && <Check size={18} className="text-gold" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 bg-white rounded-2xl border border-gray-100 p-4">
                  <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Partner's name" className="w-full px-4 py-3 bg-cream rounded-xl outline-none text-sm" />
                  <p className="text-xs font-semibold text-charcoal-light">Their travel style:</p>
                  <div className="flex flex-wrap gap-2">
                    {PARTNER_STYLES.map(s => (
                      <button key={s} onClick={() => setPartnerStyle(s)} className={`px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${partnerStyle === s ? 'bg-navy text-white' : 'bg-cream text-charcoal-light'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trip details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider flex items-center gap-1"><MapPin size={10} /> Destination</label>
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Patagonia, Chile" className="mt-1 w-full px-4 py-3 bg-cream rounded-xl outline-none text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider flex items-center gap-1"><Calendar size={10} /> Duration</label>
                <div className="flex gap-2 mt-1">
                  {['3', '5', '7', '10'].map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${duration === d ? 'gradient-gold text-white shadow-md' : 'bg-cream text-charcoal-light'}`}>
                      {d} days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={buildPlan} disabled={!partnerStyle && !selectedPartner}
              className="w-full py-4 gradient-gold rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 shadow-xl disabled:opacity-30 active:scale-[0.97] transition-all">
              <Sparkles size={16} /> Build Our Trip
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="animate-fade-up">
            {/* Who's traveling */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex -space-x-3">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl border-2 border-cream object-cover" />
                <img src={selectedPartner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face'} alt="" className="w-10 h-10 rounded-xl border-2 border-cream object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">{user.name?.split(' ')[0]} & {partnerLabel.split(' ')[0]}</p>
                <p className="text-xs text-charcoal-light">{destination || 'Patagonia'} · {duration} days</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold"><span className="w-3 h-3 rounded-full bg-gold" /> {user.name?.split(' ')[0]}'s picks</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold"><span className="w-3 h-3 rounded-full bg-navy" /> {partnerLabel.split(' ')[0]}'s picks</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold"><span className="w-3 h-3 rounded bg-gradient-to-r from-gold to-navy" /> Both love</span>
            </div>

            {isBuilding ? (
              <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-md text-center">
                <div className="w-16 h-16 rounded-2xl gradient-gold mx-auto flex items-center justify-center mb-4 animate-pulse"><Sparkles size={28} className="text-white" /></div>
                <p className="text-charcoal font-semibold">Finding the perfect overlap...</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
                <div className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{plan}</div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => navigate('/companion')} className="flex-1 py-3.5 gradient-gold rounded-2xl text-white font-semibold text-sm shadow-lg active:scale-[0.97] transition-transform">
                Refine in Chat
              </button>
              <button onClick={() => { setPhase('setup'); setPlan(null); }} className="flex-1 py-3.5 bg-white border border-gray-200 rounded-2xl text-charcoal font-medium text-sm active:scale-[0.97] transition-transform">
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function generateFallback(userName, partnerName, dest, days) {
  return `🗺️ ${days}-DAY ${dest.toUpperCase()} FOR TWO

Finding the perfect balance between ${userName}'s adventure style and ${partnerName}'s preferences:

📅 Day 1 — Arrival & Settle In
🟡 Both: Arrive, check into Senderos Hostería. Easy sunset walk to Mirador de los Cóndores. Welcome dinner at the best restaurant in town.

📅 Day 2 — The Big Hike
🟡 ${userName}'s pick: Full-day Laguna de los Tres trail. Start early, bring layers. This is the signature Patagonia moment.
🔵 ${partnerName}: Can opt for the shorter Laguna Capri trail (3 hours) with stunning views and a lakeside lunch.

📅 Day 3 — Culture & Food Day
🔵 ${partnerName}'s pick: Explore Chaltén's craft beer scene and local restaurants. Bike the river trail.
🟡 ${userName}: Afternoon hike to the Piedras Blancas glacier viewpoint.

📅 Day 4 — Laguna Torre Together
🟡🔵 OVERLAP DAY: Both will love this. Moderate hike, Cerro Torre views, glacier lake. Hot chocolate at the refugio ($2,000 ARS, made with Bariloche chocolate). Post-hike wine at the lodge.

📅 Day 5 — Departure
🟡🔵 Both: Morning at Perito Moreno glacier on the way to El Calafate airport.

💡 The key: Day 2 gives ${userName} the big adventure while ${partnerName} has an easier option. Day 3 flips it. Days 1, 4, and 5 are pure overlap.`;
}
