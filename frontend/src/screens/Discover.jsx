import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS, RECOMMENDATIONS, getUserById } from '../data/seed';
import { Search, MapPin, ThumbsUp, Star, Sparkles, TrendingUp } from 'lucide-react';

export default function Discover() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Adventure', 'Culinary', 'Urban', 'Culture', 'Nightlife'];

  const destTags = {
    'd1': ['Adventure'],
    'd2': ['Adventure'],
    'd3': ['Adventure', 'Culture'],
    'd4': ['Culinary', 'Urban', 'Culture', 'Nightlife'],
    'd5': ['Culinary', 'Nightlife', 'Culture'],
    'd6': ['Urban', 'Culture', 'Culinary'],
    'd7': ['Urban', 'Nightlife', 'Culinary'],
    'd8': ['Urban', 'Nightlife', 'Culture', 'Culinary'],
  };

  const filtered = DESTINATIONS.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || (destTags[d.id] || []).includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Header */}
      <div className="content-px pt-12 pb-4">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-navy">Discover</h1>
        <p className="text-charcoal-light text-sm mt-0.5">Real intel from real travelers</p>
      </div>

      <div className="content-px">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
                className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-gray-100 focus:border-gold focus:ring-2 focus:ring-gold/10 outline-none text-sm shadow-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-charcoal-light border border-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Featured Destination */}
          {filtered.length > 0 && (
            <div className="mb-5">
              <button
                onClick={() => navigate(`/discover/${filtered[0].id}`)}
                className="relative w-full h-52 md:h-72 rounded-3xl overflow-hidden group"
              >
                <img
                  src={filtered[0].image}
                  alt={filtered[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-gold/90 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp size={10} /> TRENDING
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-white font-display text-2xl md:text-3xl font-semibold">{filtered[0].name}</p>
                  <p className="text-white/70 text-sm mt-0.5">{filtered[0].country}</p>
                  <p className="text-white/50 text-xs mt-2 italic">"{filtered[0].vibe}"</p>
                </div>
              </button>
            </div>
          )}

          {/* Destination Grid */}
          <div>
            <h2 className="text-base font-semibold text-navy mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-gold" />
              {activeFilter === 'All' ? 'All Destinations' : `${activeFilter} Destinations`}
              <span className="text-xs text-charcoal-light font-normal ml-auto">{filtered.length} found</span>
            </h2>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-charcoal-light text-sm">No destinations match your search</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.slice(1).map(dest => (
                <button
                  key={dest.id}
                  onClick={() => navigate(`/discover/${dest.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group text-left"
                >
                  <div className="relative h-28 md:h-36 overflow-hidden">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <span className="text-white text-[10px] font-medium flex items-center gap-1">
                        <MapPin size={8} /> {dest.memberCheckIns}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-charcoal">{dest.name}</p>
                    <p className="text-charcoal-light text-[11px] mt-0.5">{dest.country} · {dest.region}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hidden Gems Banner */}
          <div className="mt-6">
            <div className="p-5 rounded-2xl gradient-navy relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-gold" fill="#C9A84C" />
                  <span className="text-gold text-xs font-semibold uppercase tracking-wider">Hidden Gems</span>
                </div>
                <p className="text-white text-sm font-medium">
                  {RECOMMENDATIONS.filter(r => r.isHiddenGem).length} insider spots verified by Jetzy members
                </p>
                <p className="text-white/50 text-xs mt-1">
                  Real recommendations. No aggregated reviews. No sponsored content.
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
