import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LIVE_BROADCASTS, DESTINATIONS, RECOMMENDATIONS, SAMPLE_USERS, getUserById } from '../data/seed';
import { Sparkles, MapPin, ArrowRight, Radio, ThumbsUp, Compass, Plus, MessageCircle, Mic, Wand2, Users, BarChart3, Languages, Play, Bell, BookOpen, Backpack, DollarSign, Shield, Heart, Calendar, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const firstName = currentUser?.name?.split(' ')[0] || 'Traveler';
  const featuredDests = DESTINATIONS.slice(0, 6);
  const topRecs = RECOMMENDATIONS.filter(r => r.isHiddenGem).slice(0, 3);

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Hero Header — big, visual, inviting */}
      <div className="relative">
        <div className="gradient-navy px-6 md:px-10 lg:px-16 pt-12 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white/50 text-sm font-medium">Good to see you</p>
              <h1 className="text-white text-3xl md:text-4xl font-display font-bold mt-0.5">{firstName}</h1>
            </div>
            <button onClick={() => navigate('/passport')} className="relative group">
              <img
                src={currentUser?.avatar || SAMPLE_USERS[0].avatar}
                alt=""
                className="w-12 h-12 rounded-2xl border-2 border-gold object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gold rounded-full border-2 border-navy" />
            </button>
          </div>

          {/* Quick Action Bubbles */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
            <button
              onClick={() => navigate('/companion')}
              className="flex items-center gap-2.5 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-xl gradient-gold flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Ask Companion</p>
                <p className="text-white/40 text-[11px]">AI travel intelligence</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="flex items-center gap-2.5 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <Compass size={14} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Explore</p>
                <p className="text-white/40 text-[11px]">Discover destinations</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/add-rec')}
              className="flex items-center gap-2.5 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Share Rec</p>
                <p className="text-white/40 text-[11px]">Help travelers</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="content-px">
        {/* Context-Aware Intelligence Cards */}
        <div className="mt-5 space-y-3">
          {/* For You Right Now */}
          <button
            onClick={() => navigate('/companion')}
            className="w-full p-5 rounded-3xl gradient-navy relative overflow-hidden text-left group active:scale-[0.99] transition-transform"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full gradient-gold flex items-center justify-center">
                  <Sparkles size={10} className="text-white" />
                </div>
                <span className="text-[11px] font-bold text-gold uppercase tracking-wider">For You Right Now</span>
              </div>
              <p className="text-white text-base font-medium leading-snug">
                You just finished a week of hiking — Senderos Hostería has one room left tonight. $120/night, mountain views from bed.
              </p>
              <p className="text-white/30 text-[11px] mt-2 flex items-center gap-1">
                <MapPin size={10} /> Based on your trip to {currentUser?.recentTrip?.destination || 'El Chaltén'} · 28 members recommend
              </p>
            </div>
          </button>

          {/* Debrief nudge */}
          <button
            onClick={() => navigate('/debrief')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 text-left group active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">Share your {currentUser?.recentTrip?.destination || 'Patagonia'} knowledge</p>
                <p className="text-xs text-charcoal-light mt-0.5">2 members are planning the same trip</p>
              </div>
              <ArrowRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Live Now — horizontal scroll */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-lg font-bold text-navy">Live Now</h2>
            </div>
            <button onClick={() => navigate('/live')} className="text-sm text-gold font-semibold active:opacity-70">View All</button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {LIVE_BROADCASTS.slice(0, 3).map((broadcast, idx) => {
              const user = getUserById(broadcast.userId);
              return (
                <div key={broadcast.id} className="min-w-[280px] md:flex-1 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="relative">
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-charcoal">{user.name}</span>
                      <span className="text-[10px] text-charcoal-light block">{user.badges?.[0]}</span>
                    </div>
                    <span className="text-[10px] text-charcoal-light bg-cream px-2 py-0.5 rounded-full">{broadcast.time}</span>
                  </div>
                  <p className="text-sm text-charcoal leading-relaxed">{broadcast.text}</p>
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-gray-50">
                    <MapPin size={11} className="text-gold" />
                    <span className="text-[11px] text-charcoal-light">{broadcast.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Destinations — big photo cards */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-navy">Trending Destinations</h2>
            <button onClick={() => navigate('/discover')} className="text-sm text-gold font-semibold active:opacity-70">See All</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featuredDests.map((dest, idx) => (
              <button
                key={dest.id}
                onClick={() => navigate(`/discover/${dest.id}`)}
                className={`relative rounded-3xl overflow-hidden group active:scale-[0.97] transition-transform animate-fade-up ${
                  idx === 0 ? 'col-span-2 h-48 md:h-56' : 'h-40 md:h-48'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-base drop-shadow-lg">{dest.name}</p>
                  <p className="text-white/70 text-xs mt-0.5">{dest.country}</p>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-white text-[10px] font-semibold">{dest.memberCheckIns} check-ins</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hidden Gems — editorial cards */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-navy">Hidden Gems</h2>
            <span className="text-[10px] bg-gold/10 text-gold font-bold px-3 py-1 rounded-full uppercase tracking-wider">Members Only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topRecs.map((rec, idx) => {
              const user = getUserById(rec.userId);
              const dest = DESTINATIONS.find(d => d.id === rec.destId);
              return (
                <button
                  key={rec.id}
                  onClick={() => navigate(`/discover/${rec.destId}`)}
                  className="p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all text-left group active:scale-[0.99] animate-fade-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {dest && (
                    <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                      <img src={dest.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 bg-gold/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Hidden Gem
                      </div>
                    </div>
                  )}
                  <p className="text-sm font-bold text-charcoal leading-snug">{rec.title}</p>
                  <p className="text-xs text-charcoal-light mt-1.5 line-clamp-2 leading-relaxed">{rec.text}</p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} alt="" className="w-5 h-5 rounded-lg object-cover" />
                      <span className="text-[11px] font-medium text-charcoal">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={11} className="text-gold" />
                      <span className="text-[11px] text-charcoal-light font-medium">{rec.upvotes}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Virtual Travel Hero Card */}
        <div className="mt-7">
          <button
            onClick={() => navigate('/virtual-travel')}
            className="w-full rounded-3xl shadow-2xl text-left relative overflow-hidden group active:scale-[0.99] transition-all h-44"
          >
            <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/20" />
            <div className="relative h-full flex items-center gap-4 p-5">
              <div className="flex -space-x-3">
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face" alt="" className="w-12 h-12 rounded-2xl border-2 border-white object-cover shadow-xl" />
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face" alt="" className="w-12 h-12 rounded-2xl border-2 border-white object-cover shadow-xl" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face" alt="" className="w-12 h-12 rounded-2xl border-2 border-white object-cover shadow-xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold bg-gold text-charcoal px-2 py-0.5 rounded-full uppercase">New</span>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Virtual Travel</span>
                </div>
                <p className="text-xl font-display font-bold text-white">Travel with a Local</p>
                <p className="text-white/80 text-xs mt-0.5">Pick a guide. Be transported. Then book.</p>
              </div>
              <ArrowRight size={20} className="text-gold flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Avatar Concierge Hero Card */}
        <div className="mt-3">
          <button
            onClick={() => navigate('/avatar')}
            className="w-full p-5 bg-white rounded-3xl border border-gold/30 shadow-xl text-left relative overflow-hidden group active:scale-[0.99] transition-all"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face" alt="" className="w-16 h-16 rounded-2xl border-2 border-gold object-cover shadow-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={12} className="text-gold" />
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">AI Concierge — New</span>
                </div>
                <p className="text-base font-bold text-navy">Talk to Avery</p>
                <p className="text-xs text-charcoal-light mt-0.5">Book cruises, flights, hotels, experiences — by voice or text</p>
              </div>
              <ArrowRight size={18} className="text-gold group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Phase 2 Quick Links */}
        <div className="mt-5">
          <h2 className="text-lg font-bold text-navy mb-3">More from Jetzy</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { icon: <Wand2 size={20} />, label: 'Concierge', sub: 'Plan a full trip', path: '/concierge' },
              { icon: <Users size={20} />, label: 'Match', sub: 'Find companions', path: '/match' },
              { icon: <MessageCircle size={20} />, label: 'For Two', sub: 'Plan together', path: '/for-two' },
              { icon: <BarChart3 size={20} />, label: 'Intel', sub: 'Travel trends', path: '/intel' },
              { icon: <Languages size={20} />, label: 'Translate', sub: 'Menu + context', path: '/translate' },
              { icon: <Play size={20} />, label: 'Trip Replay', sub: 'Your story', path: '/replay' },
              { icon: <Bell size={20} />, label: 'Alerts', sub: 'Live intel', path: '/alerts' },
              { icon: <Users size={20} />, label: 'Fixers', sub: 'Local guides', path: '/fixers' },
              { icon: <BookOpen size={20} />, label: 'Journal', sub: 'Travel diary', path: '/journal' },
              { icon: <Backpack size={20} />, label: 'Packing', sub: 'Smart lists', path: '/packing' },
              { icon: <DollarSign size={20} />, label: 'Costs', sub: 'Real prices', path: '/costs' },
              { icon: <Shield size={20} />, label: 'Safety', sub: 'Travel safe', path: '/safety' },
              { icon: <Heart size={20} />, label: 'Wishlist', sub: 'Dream trips', path: '/wishlist' },
              { icon: <Calendar size={20} />, label: 'Calendar', sub: 'Best time to go', path: '/calendar' },
              { icon: <ShoppingBag size={20} />, label: 'Gear', sub: 'What works', path: '/gear' },
              { icon: <DollarSign size={20} />, label: 'Expenses', sub: 'Track spend', path: '/expenses' },
            ].map((item, i) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-all active:scale-[0.97] animate-fade-up"
                style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="text-gold mx-auto mb-1.5">{item.icon}</div>
                <p className="text-[11px] font-bold text-charcoal">{item.label}</p>
                <p className="text-[9px] text-charcoal-light mt-0.5">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Perk card */}
        <div className="mt-7 mb-4">
          <button
            onClick={() => navigate('/perks')}
            className="w-full p-5 bg-charcoal rounded-3xl text-left relative overflow-hidden group active:scale-[0.99] transition-transform"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
                <Sparkles size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold bg-gold text-charcoal px-2 py-0.5 rounded-full uppercase">Black Perk</span>
                </div>
                <p className="text-white font-semibold text-sm">Aman Tokyo — 72% off this week</p>
                <p className="text-white/40 text-xs mt-0.5">3 nights from $672</p>
              </div>
              <ArrowRight size={18} className="text-white/30 group-hover:text-gold transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Floating Voice Button */}
      <button
        onClick={() => navigate('/voice')}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-2xl z-40 animate-pulse-gold active:scale-90 transition-transform"
      >
        <Mic size={22} className="text-white" />
      </button>
    </div>
  );
}
