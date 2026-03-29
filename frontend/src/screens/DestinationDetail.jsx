import { useParams, useNavigate } from 'react-router-dom';
import { DESTINATIONS, RECOMMENDATIONS, getUserById } from '../data/seed';
import { ArrowLeft, MapPin, ThumbsUp, Star, Sparkles, Users, MessageCircle } from 'lucide-react';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dest = DESTINATIONS.find(d => d.id === id);
  const recs = RECOMMENDATIONS.filter(r => r.destId === id);

  if (!dest) return null;

  const categories = [...new Set(recs.map(r => r.category))];

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Hero */}
      <div className="relative h-64">
        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-white font-display text-3xl font-semibold">{dest.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={14} className="text-gold" />
            <span className="text-white/70 text-sm">{dest.country} · {dest.region}</span>
          </div>
        </div>
      </div>

      {/* Vibe */}
      <div className="content-px mt-5">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-gold" />
            <span className="text-xs font-semibold text-gold uppercase tracking-wider">Vibe Check</span>
          </div>
          <p className="text-charcoal text-sm italic leading-relaxed">"{dest.vibe}"</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 content-px mt-4">
        <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 text-center">
          <p className="text-2xl font-bold text-navy">{dest.memberCheckIns}</p>
          <p className="text-[11px] text-charcoal-light mt-0.5">Check-ins</p>
        </div>
        <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 text-center">
          <p className="text-2xl font-bold text-navy">{recs.length}</p>
          <p className="text-[11px] text-charcoal-light mt-0.5">Recommendations</p>
        </div>
        <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100 text-center">
          <p className="text-2xl font-bold text-navy">{recs.filter(r => r.isHiddenGem).length}</p>
          <p className="text-[11px] text-charcoal-light mt-0.5">Hidden Gems</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="content-px mt-4 space-y-3">
        <button
          onClick={() => navigate('/companion')}
          className="w-full p-4 gradient-navy rounded-2xl flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white text-sm font-medium">Ask Companion about {dest.name}</p>
            <p className="text-white/50 text-xs">Personalized intel based on your profile</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/add-rec')}
          className="w-full p-3.5 bg-white rounded-2xl border border-gold/20 flex items-center gap-3 hover:bg-gold/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <Star size={18} className="text-gold" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-charcoal">Been to {dest.name}?</p>
            <p className="text-xs text-charcoal-light">Share a recommendation · Earn 50 JetPoints</p>
          </div>
        </button>
      </div>

      {/* Categories */}
      <div className="content-px mt-6">
        <h2 className="text-base font-semibold text-navy mb-3">Member Recommendations</h2>

        {categories.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {categories.map(cat => (
              <span key={cat} className="px-3 py-1.5 bg-navy/5 text-navy text-xs font-medium rounded-full whitespace-nowrap">
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {recs.map(rec => {
            const user = getUserById(rec.userId);
            return (
              <div key={rec.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                {rec.isHiddenGem && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star size={12} className="text-gold" fill="#C9A84C" />
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Hidden Gem</span>
                  </div>
                )}
                <p className="font-semibold text-sm text-charcoal">{rec.title}</p>
                <p className="text-xs text-charcoal-light mt-2 leading-relaxed">{rec.text}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-medium text-charcoal">{user.name}</span>
                      <span className="text-[10px] text-charcoal-light ml-1.5">
                        {user.badges?.[0]} · {user.countryCount} countries
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={12} className="text-gold" />
                    <span className="text-xs text-charcoal-light">{rec.upvotes}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
