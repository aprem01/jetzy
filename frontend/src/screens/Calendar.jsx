import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalIcon, Sun, Cloud, Snowflake, Droplets, Users, TrendingUp, Sparkles } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SEASONAL_DATA = {
  Jan: [
    { dest: 'Kilimanjaro', why: 'Dry season begins, clear summit views', crowd: 'Low', weather: 'sun', temp: '25°C base / -15°C summit', memberRating: 4.9 },
    { dest: 'Buenos Aires', why: 'Summer, outdoor dining, 30°C evenings', crowd: 'Medium', weather: 'sun', temp: '30°C', memberRating: 4.5 },
  ],
  Feb: [
    { dest: 'El Chaltén', why: 'Peak Patagonia — long days, wildflowers, Fitz Roy at sunrise', crowd: 'High', weather: 'cloud', temp: '8-18°C', memberRating: 5.0 },
    { dest: 'Tokyo', why: 'Plum blossom season, fewer tourists than cherry blossom', crowd: 'Low', weather: 'cloud', temp: '5-10°C', memberRating: 4.7 },
  ],
  Mar: [
    { dest: 'Serengeti', why: 'Calving season — 8,000 baby wildebeest born daily', crowd: 'Medium', weather: 'sun', temp: '28°C', memberRating: 4.9 },
    { dest: 'Lisbon', why: 'Spring warmth, before summer crowds, perfect walking weather', crowd: 'Low', weather: 'sun', temp: '16-20°C', memberRating: 4.8 },
  ],
  Apr: [{ dest: 'Tokyo', why: 'Cherry blossom peak — Shinjuku Gyoen at 7am before crowds', crowd: 'High', weather: 'sun', temp: '15-20°C', memberRating: 4.6 }],
  May: [{ dest: 'Medellín', why: 'Flower Festival month, gardens exploding with color', crowd: 'Medium', weather: 'cloud', temp: '22-28°C', memberRating: 4.7 }],
  Jun: [
    { dest: 'Torres del Paine', why: 'Winter hiking — empty trails, snow-capped towers, aurora australis possible', crowd: 'Very Low', weather: 'snow', temp: '-2 to 8°C', memberRating: 4.8 },
    { dest: 'Serengeti', why: 'Great Migration begins moving north toward Mara River', crowd: 'Medium', weather: 'sun', temp: '26°C', memberRating: 5.0 },
  ],
  Jul: [{ dest: 'Kilimanjaro', why: 'Dry season peak — best weather window for summit', crowd: 'High', weather: 'sun', temp: '25°C base', memberRating: 4.9 }],
  Aug: [{ dest: 'Serengeti', why: 'Mara River crossings — the most dramatic wildlife event on earth', crowd: 'High', weather: 'sun', temp: '28°C', memberRating: 5.0 }],
  Sep: [{ dest: 'Lisbon', why: 'Summer crowds gone, still 25°C, wine harvest season', crowd: 'Low', weather: 'sun', temp: '22-27°C', memberRating: 4.9 }],
  Oct: [
    { dest: 'El Chaltén', why: 'Spring — fall colors, fewer crowds than Feb, 30% cheaper lodges', crowd: 'Low', weather: 'cloud', temp: '5-14°C', memberRating: 4.8 },
    { dest: 'New York City', why: 'Central Park fall foliage, marathon energy, perfect running weather', crowd: 'Medium', weather: 'sun', temp: '12-18°C', memberRating: 4.6 },
  ],
  Nov: [{ dest: 'Buenos Aires', why: 'Jacaranda trees bloom purple across the entire city', crowd: 'Low', weather: 'sun', temp: '25°C', memberRating: 4.7 }],
  Dec: [{ dest: 'Medellín', why: 'Alumbrados light festival — 30 million lights across the city', crowd: 'Medium', weather: 'cloud', temp: '24°C', memberRating: 4.8 }],
};

const weatherIcons = { sun: <Sun size={14} className="text-gold" />, cloud: <Cloud size={14} className="text-charcoal-light" />, snow: <Snowflake size={14} className="text-blue-400" />, rain: <Droplets size={14} className="text-blue-500" /> };

export default function SeasonalCalendar() {
  const navigate = useNavigate();
  const [activeMonth, setActiveMonth] = useState(MONTHS[new Date().getMonth()]);

  const destinations = SEASONAL_DATA[activeMonth] || [];

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <CalIcon size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Seasonal Calendar</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Where to Go When</h1>
          <p className="text-white/50 text-sm mt-1">The right place at the right time — from members who know</p>
        </div>
      </div>

      <div className="content-px mt-5">
        {/* Month selector */}
        <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-hide mb-5">
          {MONTHS.map(m => (
            <button key={m} onClick={() => setActiveMonth(m)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeMonth === m ? 'gradient-gold text-white shadow-md' : 'bg-white text-charcoal-light border border-gray-100'
              }`}>
              {m}
            </button>
          ))}
        </div>

        {/* Destinations for this month */}
        <div className="space-y-4">
          {destinations.length === 0 && (
            <div className="text-center py-12">
              <CalIcon size={32} className="text-charcoal-light/20 mx-auto mb-3" />
              <p className="text-charcoal-light text-sm">Select a month to see recommendations</p>
            </div>
          )}
          {destinations.map((dest, idx) => (
            <div key={dest.dest} className="bg-white rounded-3xl border border-gray-100 shadow-md p-5 animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-navy">{dest.dest}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-charcoal-light">{weatherIcons[dest.weather]} {dest.temp}</span>
                    <span className="text-xs text-charcoal-light">Crowds: {dest.crowd}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gold/10 px-2.5 py-1 rounded-full">
                  <Sparkles size={10} className="text-gold" />
                  <span className="text-xs font-bold text-gold">{dest.memberRating}</span>
                </div>
              </div>

              <div className="p-3 bg-cream rounded-xl mb-3">
                <p className="text-sm text-charcoal leading-relaxed">
                  <span className="font-semibold">Why {activeMonth}:</span> {dest.why}
                </p>
              </div>

              <button onClick={() => navigate('/discover')} className="text-xs text-gold font-semibold flex items-center gap-1 active:opacity-70">
                Explore {dest.dest} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
