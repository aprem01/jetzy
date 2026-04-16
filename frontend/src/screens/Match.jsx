import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, TRAVEL_STYLES } from '../data/seed';
import { ArrowLeft, Shield, MapPin, Check, MessageCircle, User, Sparkles, ChevronRight } from 'lucide-react';

function computeMatch(user, candidate) {
  let score = 0;
  let reasons = [];

  // Destination overlap
  const userDest = user.upcomingTrip?.destination?.toLowerCase() || '';
  const candCountries = (candidate.countries || []).map(c => c.toLowerCase());
  const candRecent = candidate.recentTrip?.destination?.toLowerCase() || '';
  if (candCountries.some(c => userDest.includes(c.split(',')[0])) || candRecent.includes(userDest.split(',')[0])) {
    score += 40;
    reasons.push(`Has been to ${candidate.recentTrip?.destination || candidate.countries?.[0]}`);
  }

  // Travel style match
  const userStyles = user.travelStyles || [];
  const candStyles = candidate.travelStyles || [];
  if (userStyles.some(s => candStyles.includes(s))) {
    score += 30;
    const shared = TRAVEL_STYLES.find(t => userStyles.includes(t.id) && candStyles.includes(t.id));
    if (shared) reasons.push(`Both ${shared.label}s`);
  }

  // Interest overlap
  const userInterests = user.interests || [];
  const candInterests = candidate.interests || [];
  const sharedInterests = userInterests.filter(i => candInterests.includes(i));
  if (sharedInterests.length > 0) {
    score += Math.min(sharedInterests.length * 7, 20);
    reasons.push(`Shared love of ${sharedInterests.slice(0, 2).join(' & ')}`);
  }

  // Timing (simulated)
  if (candidate.upcomingTrip) {
    score += 10;
    reasons.push(`Also planning a trip soon`);
  }

  return { score, reasons, percentage: Math.min(Math.round((score / 100) * 100), 98) };
}

export default function Match() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [requestedIntros, setRequestedIntros] = useState([]);

  const matches = SAMPLE_USERS
    .filter(u => u.id !== user.id)
    .map(candidate => ({
      ...candidate,
      match: computeMatch(user, candidate),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  const introLines = {
    'u2': `Sofia has eaten her way through 5 countries and just got back from Tokyo. She'd know exactly where to find the meal that changes your trip.`,
    'u3': `James has been working remotely from Medellín for weeks and knows every rooftop and coworking spot. He travels light and moves fast.`,
    'u4': `Aisha summited Kilimanjaro and explores solo across East Africa. She'd know exactly what to pack and who to trust on the ground.`,
  };

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-3xl font-bold text-white">Your Travel Matches</h1>
          <p className="text-white/50 text-sm mt-1">People worth meeting on your next trip</p>

          {/* User's trip card */}
          <div className="mt-5 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-gold" />
              <div>
                <p className="text-white text-sm font-semibold">{user.name}</p>
                <p className="text-gold text-xs font-medium">
                  <MapPin size={10} className="inline mr-1" />
                  {user.upcomingTrip?.destination || 'Torres del Paine, Chile'} · {user.upcomingTrip?.date || 'June 2026'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-px mt-6">
        <div className="space-y-4">
          {matches.map((match, idx) => {
            const isRequested = requestedIntros.includes(match.id);
            const tierLabel = match.tier === 'black' ? 'Select Black' : match.tier === 'select' ? 'Select' : 'Explorer';
            const tierColor = match.tier === 'black' ? 'bg-charcoal text-white' : match.tier === 'select' ? 'bg-gold/20 text-gold' : 'bg-gray-100 text-charcoal-light';

            return (
              <div key={match.id} className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* Match header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img src={match.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center shadow-md">
                        <Shield size={10} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-charcoal">{match.name}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tierColor}`}>{tierLabel}</span>
                      </div>
                      <p className="text-xs text-charcoal-light mt-0.5">{match.badges?.join(' · ')}</p>
                      <p className="text-xs text-charcoal-light">{match.countryCount} countries · {match.tripCount} trips</p>
                    </div>

                    {/* Match score */}
                    <div className="text-center">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#E8E4DC" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#C9A84C" strokeWidth="4"
                            strokeDasharray={`${match.match.percentage * 1.5} 150`}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy">
                          {match.match.percentage}%
                        </span>
                      </div>
                      <p className="text-[9px] text-charcoal-light mt-0.5 font-medium">match</p>
                    </div>
                  </div>

                  {/* Why they match */}
                  <div className="mt-4 space-y-1.5">
                    {match.match.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span className="text-xs text-charcoal-light">{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI introduction */}
                  <div className="mt-4 p-4 bg-cream rounded-2xl">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-gold" />
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider">AI Introduction</span>
                    </div>
                    <p className="text-sm text-charcoal italic leading-relaxed">
                      "{introLines[match.id] || `${match.name} would be a great connection for your upcoming trip.`}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-100">
                  {isRequested ? (
                    <div className="flex-1 py-3.5 flex items-center justify-center gap-2 text-green-600 text-sm font-semibold bg-green-50 animate-scale-in">
                      <Check size={16} strokeWidth={3} /> Introduction Requested!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRequestedIntros(prev => [...prev, match.id])}
                        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-gold hover:bg-gold/5 transition-colors active:scale-[0.98]"
                      >
                        <MessageCircle size={14} /> Request Intro
                      </button>
                      <div className="w-px bg-gray-100" />
                      <button
                        onClick={() => navigate('/passport')}
                        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-medium text-charcoal-light hover:bg-gray-50 transition-colors active:scale-[0.98]"
                      >
                        <User size={14} /> View Passport
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
