import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingDown, TrendingUp, Coffee, Utensils, Bed, Bus, Sparkles } from 'lucide-react';

const DESTINATIONS_COSTS = [
  { name: 'El Chaltén', currency: 'ARS', rate: '1 USD = 950 ARS', daily: { budget: 45, mid: 95, luxury: 180 },
    items: [
      { name: 'Coffee', price: '1,500 ARS', usd: '$1.60', icon: '☕' },
      { name: 'Meal at restaurant', price: '8,000 ARS', usd: '$8.40', icon: '🍽️' },
      { name: 'Craft beer', price: '3,000 ARS', usd: '$3.15', icon: '🍺' },
      { name: 'Hostel bed', price: '12,000 ARS', usd: '$12.60', icon: '🛏️' },
      { name: 'Lodge (Senderos)', price: '114,000 ARS', usd: '$120', icon: '🏨' },
      { name: 'Bus to El Calafate', price: '15,000 ARS', usd: '$15.80', icon: '🚌' },
    ],
    memberAvg: 87, blogAvg: 120, savings: '28%' },
  { name: 'Tokyo', currency: 'JPY', rate: '1 USD = 155 JPY', daily: { budget: 60, mid: 140, luxury: 350 },
    items: [
      { name: 'Tamagoyaki at Tsukiji', price: '¥300', usd: '$1.94', icon: '🥚' },
      { name: 'Ramen', price: '¥1,200', usd: '$7.74', icon: '🍜' },
      { name: 'Train day pass', price: '¥1,590', usd: '$10.26', icon: '🚃' },
      { name: 'Capsule hotel', price: '¥4,000', usd: '$25.80', icon: '🛏️' },
      { name: 'Golden Gai night', price: '¥3,000', usd: '$19.35', icon: '🍶' },
      { name: 'Coworking day pass', price: '¥1,500', usd: '$9.68', icon: '💻' },
    ],
    memberAvg: 142, blogAvg: 200, savings: '29%' },
  { name: 'Medellín', currency: 'COP', rate: '1 USD = 4,200 COP', daily: { budget: 30, mid: 55, luxury: 120 },
    items: [
      { name: 'Tinto (coffee)', price: '2,000 COP', usd: '$0.48', icon: '☕' },
      { name: 'Arepa de choclo', price: '5,000 COP', usd: '$1.19', icon: '🫓' },
      { name: 'Coworking + pool', price: '70,000 COP', usd: '$16.67', icon: '💻' },
      { name: 'Uber across city', price: '12,000 COP', usd: '$2.86', icon: '🚗' },
      { name: 'Nice dinner', price: '65,000 COP', usd: '$15.48', icon: '🍽️' },
      { name: 'Apartment/month', price: '3.5M COP', usd: '$833', icon: '🏠' },
    ],
    memberAvg: 48, blogAvg: 75, savings: '36%' },
];

export default function Costs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Cost Intelligence</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Real Prices</h1>
          <p className="text-white/50 text-sm mt-1">From members who were just there — not travel blogs</p>
        </div>
      </div>

      <div className="content-px mt-5 space-y-5">
        {DESTINATIONS_COSTS.map((dest, idx) => (
          <div key={dest.name} className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-navy">{dest.name}</h3>
                  <p className="text-xs text-charcoal-light">{dest.currency} · {dest.rate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-500 font-bold flex items-center gap-1"><TrendingDown size={12} /> {dest.savings} cheaper</p>
                  <p className="text-[10px] text-charcoal-light">vs travel blogs</p>
                </div>
              </div>

              {/* Daily budget tiers */}
              <div className="flex gap-2 mb-4">
                {[
                  { label: 'Budget', val: dest.daily.budget, color: 'bg-green-50 text-green-700' },
                  { label: 'Mid-Range', val: dest.daily.mid, color: 'bg-gold/10 text-gold-dark' },
                  { label: 'Luxury', val: dest.daily.luxury, color: 'bg-navy/5 text-navy' },
                ].map(tier => (
                  <div key={tier.label} className={`flex-1 p-3 rounded-xl text-center ${tier.color}`}>
                    <p className="text-lg font-bold">${tier.val}</p>
                    <p className="text-[10px] font-medium">{tier.label}/day</p>
                  </div>
                ))}
              </div>

              {/* Price list */}
              <div className="space-y-2">
                {dest.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-charcoal flex-1">{item.name}</span>
                    <span className="text-xs font-medium text-charcoal-light">{item.price}</span>
                    <span className="text-xs font-bold text-navy">{item.usd}</span>
                  </div>
                ))}
              </div>

              {/* Member vs blog comparison */}
              <div className="mt-4 p-3 bg-cream rounded-xl">
                <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider mb-2">Real daily spend</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gold">Jetzy members</span>
                      <span className="text-xs font-bold text-gold">${dest.memberAvg}/day</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="gradient-gold rounded-full h-2" style={{ width: `${(dest.memberAvg / dest.blogAvg) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-charcoal-light">Travel blogs</span>
                      <span className="text-xs font-bold text-charcoal-light">${dest.blogAvg}/day</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 rounded-full h-2 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
