import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Bell, Plane, DollarSign, Users, MapPin, Sparkles, Check, X, TrendingDown, Star } from 'lucide-react';

const ALERTS = [
  { id: 'a1', type: 'price', icon: <TrendingDown size={16} className="text-green-500" />, title: 'Flights to Patagonia dropped 40%', desc: 'Buenos Aires → El Calafate from $289 round trip (was $480). Dates: Oct 12-19. This is the lowest fare in 6 months.', time: '2 hours ago', urgent: true },
  { id: 'a2', type: 'member', icon: <Users size={16} className="text-gold" />, title: 'Aisha M just posted from Torres del Paine', desc: 'She\'s on the W Circuit right now and shared 3 new recommendations. You\'re heading there in June.', time: '4 hours ago' },
  { id: 'a3', type: 'deal', icon: <Star size={16} className="text-gold" />, title: 'Senderos Hostería — cancellation available', desc: 'Your dream lodge in El Chaltén has an opening Feb 15-20. $120/night. Last time this happened was 3 months ago.', time: '6 hours ago', urgent: true },
  { id: 'a4', type: 'intel', icon: <Sparkles size={16} className="text-gold" />, title: 'New hidden gem in Medellín', desc: 'James T discovered a rooftop with 360° views in Laureles — 8 members upvoted in the last 24 hours.', time: '8 hours ago' },
  { id: 'a5', type: 'price', icon: <TrendingDown size={16} className="text-green-500" />, title: 'Tokyo hotel flash sale', desc: 'Park Hyatt Shinjuku dropped to $195/night for March dates. Select members get an extra 15% off.', time: '1 day ago' },
  { id: 'a6', type: 'member', icon: <Users size={16} className="text-gold" />, title: 'Sofia R wants to connect', desc: 'She saw your Kilimanjaro trip replay and has questions about the Machame Route. She\'s planning her own summit.', time: '1 day ago' },
  { id: 'a7', type: 'intel', icon: <MapPin size={16} className="text-gold" />, title: 'Trail condition update: Laguna de los Tres', desc: 'Member report: trail is muddy after recent rain. Gaiters recommended. Wind conditions moderate this week.', time: '2 days ago' },
];

export default function Alerts() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState([]);
  const [acted, setActed] = useState([]);

  const active = ALERTS.filter(a => !dismissed.includes(a.id));

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Jetzy Alerts</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Travel Intelligence</h1>
          <p className="text-white/50 text-sm mt-1">{active.length} active alerts for you</p>
        </div>
      </div>

      <div className="content-px mt-5 space-y-3">
        {active.map((alert, idx) => (
          <div key={alert.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden animate-fade-up ${alert.urgent ? 'border-gold/30' : 'border-gray-100'}`} style={{ animationDelay: `${idx * 0.05}s` }}>
            {alert.urgent && (
              <div className="bg-gold/10 px-4 py-1.5">
                <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Time Sensitive</p>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center flex-shrink-0 mt-0.5">
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-charcoal">{alert.title}</p>
                  <p className="text-xs text-charcoal-light mt-1 leading-relaxed">{alert.desc}</p>
                  <p className="text-[10px] text-charcoal-light/50 mt-2">{alert.time}</p>
                </div>
                <button onClick={() => setDismissed(prev => [...prev, alert.id])} className="text-charcoal-light/30 hover:text-charcoal-light transition-colors">
                  <X size={16} />
                </button>
              </div>

              {acted.includes(alert.id) ? (
                <div className="mt-3 py-2 bg-green-50 rounded-xl text-green-600 text-xs font-semibold flex items-center justify-center gap-2 animate-scale-in">
                  <Check size={14} strokeWidth={3} /> Saved!
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setActed(prev => [...prev, alert.id])} className="flex-1 py-2.5 gradient-gold rounded-xl text-white text-xs font-semibold active:scale-[0.97] transition-transform">
                    {alert.type === 'price' ? 'View Deal' : alert.type === 'member' ? 'Connect' : 'View Intel'}
                  </button>
                  <button onClick={() => setDismissed(prev => [...prev, alert.id])} className="px-4 py-2.5 bg-cream rounded-xl text-charcoal-light text-xs font-medium active:scale-[0.97] transition-transform">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {active.length === 0 && (
          <div className="text-center py-16">
            <Bell size={32} className="text-charcoal-light/20 mx-auto mb-3" />
            <p className="text-charcoal-light text-sm">All caught up! We'll notify you when something matters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
