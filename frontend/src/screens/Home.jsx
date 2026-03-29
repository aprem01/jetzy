import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LIVE_BROADCASTS, DESTINATIONS, RECOMMENDATIONS, SAMPLE_USERS, getUserById } from '../data/seed';
import { Sparkles, MapPin, ArrowRight, Radio, ThumbsUp } from 'lucide-react';

export default function Home() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const firstName = currentUser?.name?.split(' ')[0] || 'Traveler';
  const featuredDests = DESTINATIONS.slice(0, 4);
  const topRecs = RECOMMENDATIONS.filter(r => r.isHiddenGem).slice(0, 3);

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Header */}
      <div className="gradient-navy px-6 md:px-10 lg:px-16 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6 ">
          <div>
            <p className="text-white/60 text-sm">Welcome back</p>
            <h1 className="text-white text-2xl md:text-3xl font-display font-semibold">{firstName}</h1>
          </div>
          <button onClick={() => navigate('/passport')} className="relative">
            <img
              src={currentUser?.avatar || SAMPLE_USERS[0].avatar}
              alt=""
              className="w-11 h-11 rounded-full border-2 border-gold object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gold rounded-full border-2 border-navy" />
          </button>
        </div>

        {/* AI Prompt Card */}
        <button
            onClick={() => navigate('/companion')}
            className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-left hover:bg-white/15 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Ask your Companion</p>
                <p className="text-white/50 text-xs mt-0.5">Planning {currentUser?.upcomingTrip?.destination || 'Torres del Paine'}?</p>
              </div>
              <ArrowRight size={18} className="text-white/30 group-hover:text-gold transition-colors" />
            </div>
          </button>
      </div>

      <div className="content-px">
          {/* Context-Aware Intelligence */}
          <div className="mt-5 space-y-3">
            {/* Jetzy Moment — contextual rec */}
            <div className="p-4 rounded-2xl gradient-navy relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-gold" />
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">For You Right Now</span>
                </div>
                <p className="text-white text-sm font-medium">
                  You just finished a week of hiking — Senderos Hostería has one room left tonight with mountain views from bed. $120/night.
                </p>
                <p className="text-white/40 text-[10px] mt-1.5 flex items-center gap-1">
                  <MapPin size={10} /> Based on your trip to {currentUser?.recentTrip?.destination || 'El Chaltén'} · Recommended by 28 members
                </p>
              </div>
            </div>

            {/* Post-trip debrief nudge */}
            <button
              onClick={() => navigate('/debrief')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-gold" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Welcome Back</span>
              </div>
              <p className="text-sm text-charcoal font-medium">
                Share what you learned in {currentUser?.recentTrip?.destination || 'Patagonia'} — 2 members are planning the same trip
              </p>
              <span className="text-xs text-gold font-semibold mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Debrief <ArrowRight size={12} />
              </span>
            </button>

            {/* Perk moment */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold bg-charcoal text-white px-2 py-0.5 rounded-full">BLACK</span>
                <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">Select Perk</span>
              </div>
              <p className="text-sm text-charcoal font-medium">Aman Tokyo — 72% off this week only</p>
              <button
                onClick={() => navigate('/perks')}
                className="text-xs text-gold font-semibold mt-2 flex items-center gap-1"
              >
                Claim Perk <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Live Now */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-red-500" />
                <h2 className="text-base font-semibold text-navy">Live Now</h2>
              </div>
              <button onClick={() => navigate('/live')} className="text-xs text-gold font-semibold">View All</button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {LIVE_BROADCASTS.slice(0, 3).map(broadcast => {
                const user = getUserById(broadcast.userId);
                return (
                  <div key={broadcast.id} className="min-w-[260px] md:min-w-[300px] md:flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-charcoal">{user.name}</span>
                      <span className="text-[10px] text-charcoal-light ml-auto">{broadcast.time}</span>
                    </div>
                    <p className="text-sm text-charcoal leading-relaxed">{broadcast.text}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <MapPin size={12} className="text-gold" />
                      <span className="text-[11px] text-charcoal-light">{broadcast.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Destinations */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-navy">Trending Destinations</h2>
              <button onClick={() => navigate('/discover')} className="text-xs text-gold font-semibold">See All</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {featuredDests.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => navigate(`/discover/${dest.id}`)}
                  className="relative rounded-2xl overflow-hidden h-36 md:h-44 group"
                >
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-semibold text-sm">{dest.name}</p>
                    <p className="text-white/70 text-[11px]">{dest.country}</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="text-white text-[10px] font-medium">{dest.memberCheckIns} check-ins</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hidden Gems */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-navy">Hidden Gems</h2>
              <span className="text-[10px] bg-gold/10 text-gold font-semibold px-2 py-0.5 rounded-full">Member Only</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topRecs.map(rec => {
                const user = getUserById(rec.userId);
                return (
                  <div key={rec.id} className="p-4 bg-white rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-medium text-charcoal">{user.name}</span>
                      <span className="text-[10px] bg-navy/5 text-navy px-1.5 py-0.5 rounded-full">{rec.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-charcoal">{rec.title}</p>
                    <p className="text-xs text-charcoal-light mt-1 line-clamp-2">{rec.text}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ThumbsUp size={12} className="text-gold" />
                      <span className="text-[11px] text-charcoal-light">{rec.upvotes} travelers agree</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </div>
  );
}
