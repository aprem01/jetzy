import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DESTINATIONS, RECOMMENDATIONS, SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, TrendingUp, TrendingDown, Globe, Sparkles, Users, BarChart3 } from 'lucide-react';

const TRENDING = [
  { name: 'Tokyo', visits: 342, change: 23, up: true },
  { name: 'El Chaltén', visits: 218, change: 41, up: true },
  { name: 'Lisbon', visits: 195, change: -5, up: false },
  { name: 'Medellín', visits: 187, change: 18, up: true },
  { name: 'Serengeti', visits: 156, change: 32, up: true },
];

const SENTIMENT = [
  { label: 'Adventure', value: 78, change: '+23%' },
  { label: 'Culinary', value: 65, change: '+31%' },
  { label: 'Solo Travel', value: 58, change: '+18%' },
  { label: 'Digital Nomad', value: 52, change: '+12%' },
  { label: 'Luxury', value: 44, change: '+8%' },
];

const HOTSPOTS = [
  { city: 'Tokyo', members: 42, lat: '35%', left: '78%' },
  { city: 'Medellín', members: 28, lat: '52%', left: '25%' },
  { city: 'Lisbon', members: 35, lat: '38%', left: '43%' },
  { city: 'El Chaltén', members: 18, lat: '82%', left: '28%' },
  { city: 'NYC', members: 51, lat: '36%', left: '27%' },
  { city: 'Serengeti', members: 12, lat: '55%', left: '52%' },
];

export default function Intel() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const topRecs = RECOMMENDATIONS.sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);

  // User DNA comparison
  const userDNA = [
    { label: 'Adventure', user: 92, community: 45 },
    { label: 'Culinary', user: 60, community: 65 },
    { label: 'Culture', user: 40, community: 55 },
    { label: 'Wellness', user: 25, community: 48 },
    { label: 'Nightlife', user: 35, community: 62 },
    { label: 'Nature', user: 88, community: 40 },
  ];

  const standout = userDNA.reduce((max, d) => {
    const ratio = d.user / d.community;
    return ratio > max.ratio ? { ...d, ratio } : max;
  }, { ratio: 0 });

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Jetzy Intelligence</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">The Pulse of Travel</h1>
          <p className="text-white/50 text-sm mt-1">Real-time intelligence from 12,400 members worldwide</p>

          <div className="flex gap-3 mt-5">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1">
              <p className="text-2xl font-bold text-gold">12.4K</p>
              <p className="text-white/40 text-[11px]">Active members</p>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1">
              <p className="text-2xl font-bold text-gold">847</p>
              <p className="text-white/40 text-[11px]">Recs this month</p>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1">
              <p className="text-2xl font-bold text-gold">62</p>
              <p className="text-white/40 text-[11px]">Countries active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-px mt-6 space-y-6">
        {/* Trending Destinations */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gold" /> Trending This Month
          </h2>
          <div className="space-y-3">
            {TRENDING.map((dest, i) => (
              <div key={dest.name} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="w-6 text-sm font-bold text-charcoal-light">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-charcoal">{dest.name}</span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${dest.up ? 'text-green-500' : 'text-red-400'}`}>
                      {dest.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {dest.change}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="gradient-gold rounded-full h-2 transition-all duration-1000" style={{ width: `${(dest.visits / 400) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-charcoal-light mt-0.5">{dest.visits} member visits</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Heat Map */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 mb-4">
            <Globe size={16} className="text-gold" /> Live Heat Map
          </h2>
          <div className="relative h-48 rounded-2xl gradient-navy overflow-hidden">
            {/* Simplified world map dots */}
            {HOTSPOTS.map(spot => (
              <div key={spot.city} className="absolute group" style={{ top: spot.lat, left: spot.left }}>
                <div className="w-3 h-3 rounded-full bg-gold animate-pulse-gold cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-charcoal text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  <p className="font-semibold">{spot.city}</p>
                  <p className="text-white/60">{spot.members} members active</p>
                </div>
              </div>
            ))}
            <div className="absolute bottom-3 left-3">
              <p className="text-white/40 text-[10px]">Hover dots for details</p>
            </div>
          </div>
        </div>

        {/* What Members Love */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-gold" /> What Members Are Loving
          </h2>
          <div className="space-y-3">
            {topRecs.slice(0, 4).map((rec, i) => {
              const recUser = SAMPLE_USERS.find(u => u.id === rec.userId) || SAMPLE_USERS[0];
              const dest = DESTINATIONS.find(d => d.id === rec.destId);
              return (
                <div key={rec.id} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  {dest && <img src={dest.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">{rec.title}</p>
                    <p className="text-[11px] text-charcoal-light mt-0.5">{dest?.name} · {rec.upvotes} upvotes</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Travel Sentiment */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gold" /> Travel Sentiment
          </h2>
          <div className="space-y-3">
            {SENTIMENT.map((s, i) => (
              <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-charcoal">{s.label}</span>
                  <span className="text-xs font-bold text-green-500">{s.change}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="gradient-gold rounded-full h-2.5 transition-all duration-1000" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Travel DNA */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 mb-2">
            <Users size={16} className="text-gold" /> Your Travel DNA vs Community
          </h2>
          <p className="text-xs text-gold font-semibold mb-4">
            You are {Math.round(standout.ratio)}x more {standout.label?.toLowerCase()} than the average Jetzy member
          </p>

          <div className="space-y-3">
            {userDNA.map((d, i) => (
              <div key={d.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-charcoal">{d.label}</span>
                  <span className="text-[10px] text-charcoal-light">You: {d.user}% · Avg: {d.community}%</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-navy/20 rounded-full" style={{ width: `${d.community}%` }} />
                  <div className="absolute inset-y-0 left-0 gradient-gold rounded-full" style={{ width: `${d.user}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-charcoal-light"><span className="w-3 h-2 rounded gradient-gold inline-block" /> You</span>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-charcoal-light"><span className="w-3 h-2 rounded bg-navy/20 inline-block" /> Community avg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
