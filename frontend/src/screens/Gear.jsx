import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Backpack, Star, ThumbsUp, Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const GEAR_DATA = [
  {
    destination: 'Patagonia',
    category: 'Hiking',
    items: [
      { name: 'Arc\'teryx Beta LT Jacket', type: 'Shell', rating: 4.9, reviews: 23, price: '$350', verdict: 'The only hardshell that survived Patagonia wind. Worth every dollar.', topReview: 'Wore it every day on the W Circuit. Rain, wind, sleet — it handled everything. Light enough for the pack, tough enough for the trail.' },
      { name: 'Salomon X Ultra 4 Mid GTX', type: 'Boots', rating: 4.8, reviews: 18, price: '$175', verdict: 'Best grip on wet Patagonia rock. Break them in for 2 weeks minimum.', topReview: 'These saved me on the Laguna de los Tres descent. The scree section would have wrecked any other boot.' },
      { name: 'Osprey Atmos AG 50', type: 'Pack', rating: 4.7, reviews: 15, price: '$280', verdict: 'The hip belt ventilation is clutch on long Patagonia days.', topReview: 'Carried 12kg for 5 days. No hot spots, no pressure points. The mesh back panel makes a huge difference.' },
      { name: 'Black Diamond Distance Carbon Z', type: 'Poles', rating: 4.6, reviews: 12, price: '$170', verdict: 'Lightweight and foldable. Essential for knee protection on descents.', topReview: 'My knees would not have survived Laguna Torre without these. They fold small enough for the carry-on.' },
    ],
  },
  {
    destination: 'Kilimanjaro',
    category: 'Mountaineering',
    items: [
      { name: 'Western Mountaineering Alpinlite', type: 'Sleeping Bag', rating: 5.0, reviews: 8, price: '$500 (or rent in Moshi $8/day)', verdict: 'Summit night drops to -20°C. Don\'t cheap out on this.', topReview: 'Rented one in Moshi that was rated to -20°C. Slept warm at Barafu Camp. The rental route saves you $490.' },
      { name: 'Diamox (Acetazolamide)', type: 'Altitude Med', rating: 4.8, reviews: 14, price: '$15', verdict: 'Not gear but the most important thing you\'ll pack. Start 24hrs before ascent.', topReview: 'Everyone on our team who took it summited. The two who didn\'t had to turn back at Stella Point.' },
    ],
  },
  {
    destination: 'Tokyo',
    category: 'Urban Travel',
    items: [
      { name: 'Peak Design Everyday Sling 6L', type: 'Day Bag', rating: 4.7, reviews: 11, price: '$100', verdict: 'Perfect Tokyo bag — fits camera, wallet, Suica card, phone. Anti-theft zipper.', topReview: 'Used it for 10 days straight. The quick-access side pocket is perfect for your IC card on the trains.' },
      { name: 'Suica IC Card', type: 'Transit', rating: 5.0, reviews: 22, price: '¥2,000 ($13)', verdict: 'Not gear but essential. Works on every train, bus, and convenience store.', topReview: 'Get this at the airport vending machine. Load ¥5,000 and you\'re set for a week of trains.' },
    ],
  },
];

export default function Gear() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Backpack size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Gear Reviews</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">What Actually Works</h1>
          <p className="text-white/50 text-sm mt-1">Tested by members on the actual trail, not in a showroom</p>
        </div>
      </div>

      <div className="content-px mt-5 space-y-5">
        {GEAR_DATA.map((section, sIdx) => (
          <div key={section.destination} className="animate-fade-up" style={{ animationDelay: `${sIdx * 0.1}s` }}>
            <h3 className="text-base font-bold text-navy mb-3">{section.destination} · {section.category}</h3>
            <div className="space-y-3">
              {section.items.map((item, iIdx) => {
                const key = `${sIdx}-${iIdx}`;
                const isExpanded = expanded[key];
                return (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button onClick={() => toggle(key)} className="w-full p-4 flex items-start gap-3 text-left active:bg-cream/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0">
                        <Backpack size={16} className="text-navy" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-charcoal">{item.name}</p>
                          <span className="text-[9px] bg-cream text-charcoal-light px-2 py-0.5 rounded-full">{item.type}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-0.5 text-xs"><Star size={10} className="text-gold" fill="#C9A84C" /> {item.rating}</span>
                          <span className="text-[10px] text-charcoal-light">{item.reviews} reviews</span>
                          <span className="text-xs font-semibold text-navy">{item.price}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-charcoal-light mt-1" /> : <ChevronDown size={16} className="text-charcoal-light mt-1" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-fade-up">
                        <div className="p-3 bg-gold/5 rounded-xl mb-3 border border-gold/10">
                          <p className="text-xs font-bold text-gold mb-1 flex items-center gap-1"><Sparkles size={10} /> Member Verdict</p>
                          <p className="text-sm text-charcoal">{item.verdict}</p>
                        </div>
                        <div className="p-3 bg-cream rounded-xl">
                          <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider mb-1 flex items-center gap-1"><ThumbsUp size={8} /> Top Review</p>
                          <p className="text-xs text-charcoal leading-relaxed italic">"{item.topReview}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
