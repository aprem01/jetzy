import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, DESTINATIONS, RECOMMENDATIONS, getUserById } from '../data/seed';
import { ArrowLeft, Play, Share2, MapPin, Star, ThumbsUp, Mountain, Calendar, Camera, Sparkles } from 'lucide-react';

const TRIP_DAYS = [
  { day: 1, title: 'Arrived in El Chaltén', desc: 'Bus from El Calafate through endless steppe. First glimpse of Fitz Roy from the bus window. Checked into Senderos Hostería. Evening walk to Mirador de los Cóndores.', mood: 'Awe', image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=600&h=400&fit=crop' },
  { day: 2, title: 'Laguna de los Tres', desc: 'Started at 4:30am. 10 hours on the trail. The moment Fitz Roy caught first light — indescribable. Wind at the top nearly knocked me over. Post-hike beer at La Cervecería.', mood: 'Euphoria', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop' },
  { day: 3, title: 'Laguna Torre', desc: 'Gentler day. Cerro Torre reflected in the glacier lake. Found the refugio with the best hot chocolate in Patagonia — made with real Bariloche chocolate.', mood: 'Peace', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop' },
  { day: 4, title: 'Rest & Explore Town', desc: 'Recovery day. Rented bikes for the river trail. Three good restaurants in this tiny town and we hit all of them. Repacked for tomorrow.', mood: 'Gratitude', image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&h=400&fit=crop' },
  { day: 5, title: 'Perito Moreno & Home', desc: 'Morning at the glacier. Ice calving right in front of us — thunderous. Afternoon flight from El Calafate. Already planning the return trip.', mood: 'Bittersweet', image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=600&h=400&fit=crop' },
];

export default function Replay() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [activeDay, setActiveDay] = useState(0);
  const [shared, setShared] = useState(false);

  const trip = user.recentTrip || { destination: 'El Chaltén, Patagonia', date: 'February 2026' };
  const recs = RECOMMENDATIONS.filter(r => r.destId === 'd1').slice(0, 3);

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Hero */}
      <div className="relative h-72">
        <img src={TRIP_DAYS[activeDay].image} alt="" className="w-full h-full object-cover transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <span className="text-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Play size={10} /> Trip Replay</span>
          <button onClick={() => setShared(true)} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            {shared ? <Sparkles size={16} className="text-gold" /> : <Share2 size={16} className="text-white" />}
          </button>
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-white/50 text-sm">{trip.date}</p>
          <h1 className="text-white font-display text-3xl font-bold">{trip.destination}</h1>
        </div>
      </div>

      <div className="content-px mt-5">
        {/* Stats bar */}
        <div className="flex justify-around p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
          <div className="text-center">
            <p className="text-xl font-bold text-navy">5</p>
            <p className="text-[10px] text-charcoal-light">Days</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-xl font-bold text-navy">3</p>
            <p className="text-[10px] text-charcoal-light">Trails</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-xl font-bold text-navy">2</p>
            <p className="text-[10px] text-charcoal-light">Hidden Gems</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-xl font-bold text-navy">1</p>
            <p className="text-[10px] text-charcoal-light">Sunrise</p>
          </div>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {TRIP_DAYS.map((day, i) => (
            <button key={i} onClick={() => setActiveDay(i)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeDay === i ? 'gradient-gold text-white shadow-md' : 'bg-white text-charcoal-light border border-gray-100'
              }`}>
              Day {day.day}
            </button>
          ))}
        </div>

        {/* Active day card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden mb-5 animate-fade-up" key={activeDay}>
          <img src={TRIP_DAYS[activeDay].image} alt="" className="w-full h-48 object-cover" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gold uppercase tracking-wider">Day {TRIP_DAYS[activeDay].day}</p>
              <span className="text-[10px] bg-navy/5 text-navy px-2.5 py-1 rounded-full font-medium">{TRIP_DAYS[activeDay].mood}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-navy">{TRIP_DAYS[activeDay].title}</h3>
            <p className="text-sm text-charcoal-light mt-2 leading-relaxed">{TRIP_DAYS[activeDay].desc}</p>
          </div>
        </div>

        {/* Recommendations shared */}
        <h3 className="text-sm font-bold text-navy mb-3">Gems You Found</h3>
        <div className="space-y-2 mb-5">
          {recs.map(rec => (
            <div key={rec.id} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
              <Star size={14} className={rec.isHiddenGem ? 'text-gold' : 'text-gray-300'} fill={rec.isHiddenGem ? '#C9A84C' : 'none'} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-charcoal">{rec.title}</p>
                <p className="text-[10px] text-charcoal-light">{rec.upvotes} upvotes</p>
              </div>
            </div>
          ))}
        </div>

        {/* Share */}
        {shared ? (
          <div className="py-4 bg-green-50 rounded-2xl text-green-600 text-sm font-semibold flex items-center justify-center gap-2 animate-scale-in">
            <Sparkles size={16} /> Replay shared! Your link is ready.
          </div>
        ) : (
          <button onClick={() => setShared(true)} className="w-full py-4 gradient-gold rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.97] transition-transform">
            <Share2 size={16} /> Share This Replay
          </button>
        )}
      </div>
    </div>
  );
}
