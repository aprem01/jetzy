import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS, RECOMMENDATIONS, getUserById } from '../data/seed';
import { ArrowLeft, Heart, MapPin, Sparkles, X, Plus, Star } from 'lucide-react';

const INITIAL_WISHES = [
  { type: 'destination', id: 'd1', note: 'Return trip — better weather window' },
  { type: 'destination', id: 'd4', note: 'Sofia\'s Tokyo food recs sound incredible' },
  { type: 'recommendation', recId: 'r15', note: 'Mobile camp safari — bucket list' },
  { type: 'destination', id: 'd6', note: 'LX Factory and Ramiro seafood' },
];

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishes, setWishes] = useState(INITIAL_WISHES);

  const removeWish = (idx) => setWishes(prev => prev.filter((_, i) => i !== idx));

  const destWishes = wishes.filter(w => w.type === 'destination').map(w => ({ ...w, dest: DESTINATIONS.find(d => d.id === w.id) })).filter(w => w.dest);
  const recWishes = wishes.filter(w => w.type === 'recommendation').map(w => ({ ...w, rec: RECOMMENDATIONS.find(r => r.id === w.recId) })).filter(w => w.rec);

  // Pattern detection
  const mountainCount = destWishes.filter(w => ['d1', 'd2'].includes(w.id)).length;
  const pattern = mountainCount >= 1 ? 'You\'ve saved mountain destinations — have you considered the Dolomites or Mont Blanc?' : destWishes.length >= 3 ? 'You\'re drawn to cities with food culture — have you looked at Oaxaca or Chiang Mai?' : null;

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Wishlist</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Dream Trips</h1>
          <p className="text-white/50 text-sm mt-1">{wishes.length} places and experiences saved</p>
        </div>
      </div>

      <div className="content-px mt-5 space-y-5">
        {/* AI Pattern Detection */}
        {pattern && (
          <div className="p-4 bg-gradient-to-r from-gold/10 to-gold/5 rounded-2xl border border-gold/20 animate-fade-up">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-gold" />
              <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Jetzy Noticed</span>
            </div>
            <p className="text-sm text-charcoal font-medium">{pattern}</p>
          </div>
        )}

        {/* Destination Wishes */}
        <div>
          <h3 className="text-sm font-bold text-navy mb-3">Destinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {destWishes.map((wish, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up group" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="relative h-36">
                  <img src={wish.dest.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <button onClick={() => removeWish(wishes.indexOf(wish))} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} className="text-white" />
                  </button>
                  <div className="absolute top-3 left-3">
                    <Heart size={16} className="text-gold" fill="#C9A84C" />
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-sm">{wish.dest.name}</p>
                    <p className="text-white/70 text-xs">{wish.dest.country}</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-charcoal-light italic">"{wish.note}"</p>
                  <button onClick={() => navigate(`/discover/${wish.id}`)} className="text-[10px] text-gold font-semibold mt-2">View destination →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Wishes */}
        {recWishes.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-navy mb-3">Saved Experiences</h3>
            <div className="space-y-2">
              {recWishes.map((wish, idx) => {
                const author = getUserById(wish.rec.userId);
                return (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3 animate-fade-up">
                    <Star size={14} className={wish.rec.isHiddenGem ? 'text-gold mt-0.5' : 'text-gray-300 mt-0.5'} fill={wish.rec.isHiddenGem ? '#C9A84C' : 'none'} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{wish.rec.title}</p>
                      <p className="text-[10px] text-charcoal-light mt-0.5">by {author?.name} · {wish.rec.upvotes} upvotes</p>
                      <p className="text-xs text-charcoal-light mt-1 italic">"{wish.note}"</p>
                    </div>
                    <button onClick={() => removeWish(wishes.indexOf(wish))} className="text-charcoal-light/30 hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
