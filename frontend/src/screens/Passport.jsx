import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, RECOMMENDATIONS, BADGES, getUserById } from '../data/seed';
import { MapPin, Award, Star, Share2, Settings, ChevronRight, Plane, Globe, Zap, Brain, X, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Passport() {
  const { currentUser, memories, removeMemory } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const userRecs = RECOMMENDATIONS.filter(r => r.userId === user.id);
  const userBadges = BADGES.filter(b => user.badges?.includes(b.name));

  const tierLabel = user.tier === 'black' ? 'Select Black' : user.tier === 'select' ? 'Select' : 'Explorer';
  const tierColor = user.tier === 'black' ? 'bg-charcoal text-white' : user.tier === 'select' ? 'gradient-gold text-white' : 'bg-gray-200 text-charcoal';

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Hero */}
      <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative">
          {/* Settings */}
          <div className="flex justify-end mb-4">
            <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Settings size={16} className="text-white/60" />
            </button>
          </div>

          {/* Profile */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={user.avatar}
                alt=""
                className="w-24 h-24 rounded-full border-4 border-gold object-cover shadow-xl"
              />
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold ${tierColor}`}>
                {tierLabel}
              </div>
            </div>

            <h1 className="text-white font-display text-2xl font-semibold mt-5">{user.name}</h1>
            <p className="text-white/50 text-sm mt-0.5 flex items-center gap-1">
              <MapPin size={12} /> {user.currentLocation || 'Denver, CO'}
            </p>
            {user.bio && (
              <p className="text-white/70 text-xs mt-3 max-w-[280px] text-center italic leading-relaxed">
                "{user.bio}"
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gold">{user.countryCount || 6}</p>
              <p className="text-white/40 text-[11px] mt-0.5">Countries</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-gold">{user.tripCount || 14}</p>
              <p className="text-white/40 text-[11px] mt-0.5">Trips</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-gold">{userRecs.length}</p>
              <p className="text-white/40 text-[11px] mt-0.5">Recs</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5 justify-center">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/60 text-xs font-medium hover:bg-white/15 transition-colors">
              <Share2 size={12} /> Share Passport
            </button>
            <button
              onClick={() => navigate('/debrief')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-gold text-xs font-medium hover:bg-gold/30 transition-colors"
            >
              <Star size={12} /> Trip Debrief
            </button>
          </div>
        </div>
      </div>

      {/* World Map Placeholder */}
      <div className="content-px mt-5">
        <div className="relative h-44 rounded-2xl overflow-hidden map-visited">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Globe size={32} className="text-gold mx-auto mb-2" />
              <p className="text-white font-display text-lg font-medium">{user.countryCount || 6} Countries</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3 max-w-[280px]">
                {(user.countries || []).map(c => (
                  <span key={c} className="px-2 py-0.5 bg-gold/20 text-gold text-[10px] font-medium rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JetPoints */}
      <div className="content-px mt-5">
        <button
          onClick={() => navigate('/perks')}
          className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-charcoal">{(user.jetPoints || 0).toLocaleString()} JetPoints</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
              <div
                className="gradient-gold rounded-full h-1.5 transition-all duration-1000"
                style={{ width: `${Math.min(((user.jetPoints || 0) / 5000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-charcoal-light mt-1">{5000 - (user.jetPoints || 0)} points to Select upgrade</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* Badges */}
      <div className="content-px mt-5">
        <h2 className="text-base font-semibold text-navy mb-3 flex items-center gap-2">
          <Award size={16} className="text-gold" />
          Badges Earned
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {userBadges.map(badge => (
            <div key={badge.id} className="min-w-[120px] p-4 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
              <span className="text-3xl">{badge.icon}</span>
              <p className="text-xs font-semibold text-charcoal mt-2">{badge.name}</p>
              <p className="text-[10px] text-charcoal-light mt-0.5">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Profile */}
      <div className="content-px mt-5">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-navy mb-3 flex items-center gap-2">
            <Shield size={16} className="text-gold" />
            Trust Score
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#E8E4DC" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#C9A84C" strokeWidth="5"
                  strokeDasharray={`${94 * 1.76} 176`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-navy">94</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield size={12} className="text-gold" />
                <span className="text-xs font-bold text-gold uppercase">Gold Trust</span>
              </div>
              <p className="text-[11px] text-charcoal-light">Verified profile, 6 countries, {userRecs.length} recommendations shared, Select Black member</p>
              <p className="text-[10px] text-gold mt-1 font-medium">Share 2 more recommendations to reach Black Trust</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Layer */}
      {memories && memories.length > 0 && (
        <div className="content-px mt-5">
          <h2 className="text-base font-semibold text-navy mb-3 flex items-center gap-2">
            <Brain size={16} className="text-gold" />
            What Jetzy Remembers
          </h2>
          <div className="flex flex-wrap gap-2">
            {memories.slice(0, 8).map((memory, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold/10 text-charcoal text-xs font-medium rounded-full border border-gold/20">
                {memory}
                <button onClick={() => removeMemory(memory)} className="text-charcoal-light hover:text-red-400 transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <p className="text-[10px] text-charcoal-light mt-2">Your Companion uses these to personalize every conversation</p>
        </div>
      )}

      {/* Match + Intel links */}
      <div className="content-px mt-5 flex gap-3">
        <button onClick={() => navigate('/match')} className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform">
          <Users size={18} className="text-gold" />
          <div className="text-left">
            <p className="text-sm font-semibold text-charcoal">Travel Matches</p>
            <p className="text-[10px] text-charcoal-light">Find companions</p>
          </div>
        </button>
        <button onClick={() => navigate('/intel')} className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform">
          <Globe size={18} className="text-gold" />
          <div className="text-left">
            <p className="text-sm font-semibold text-charcoal">Jetzy Intel</p>
            <p className="text-[10px] text-charcoal-light">Travel trends</p>
          </div>
        </button>
      </div>

      {/* Recent Trips */}
      <div className="content-px mt-5">
        <h2 className="text-base font-semibold text-navy mb-3 flex items-center gap-2">
          <Plane size={16} className="text-gold" />
          Trip Timeline
        </h2>

        <div className="space-y-3">
          {user.upcomingTrip && (
            <div className="p-4 bg-gold/5 rounded-2xl border border-gold/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Upcoming</span>
              </div>
              <p className="text-sm font-semibold text-charcoal">{user.upcomingTrip.destination}</p>
              <p className="text-xs text-charcoal-light">{user.upcomingTrip.date}</p>
            </div>
          )}

          {user.recentTrip && (
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-charcoal">{user.recentTrip.destination}</p>
              <p className="text-xs text-charcoal-light">{user.recentTrip.date}</p>
              {user.recentTrip.highlight && (
                <p className="text-xs text-gold mt-1 font-medium">{user.recentTrip.highlight}</p>
              )}
            </div>
          )}

          {user.previousTrip && (
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-charcoal">{user.previousTrip.destination}</p>
              <p className="text-xs text-charcoal-light">{user.previousTrip.date}</p>
              {user.previousTrip.highlight && (
                <p className="text-xs text-gold mt-1 font-medium">{user.previousTrip.highlight}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shared Recommendations */}
      {userRecs.length > 0 && (
        <div className="content-px mt-5">
          <h2 className="text-base font-semibold text-navy mb-3">Your Recommendations</h2>
          <div className="space-y-2">
            {userRecs.slice(0, 3).map(rec => (
              <div key={rec.id} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
                <Star size={14} className={rec.isHiddenGem ? 'text-gold' : 'text-gray-300'} fill={rec.isHiddenGem ? '#C9A84C' : 'none'} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-charcoal">{rec.title}</p>
                  <p className="text-[10px] text-charcoal-light">{rec.upvotes} upvotes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
