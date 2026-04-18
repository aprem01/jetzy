import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import {
  ArrowLeft, Hotel, Plane, Mountain, Utensils, Users as UsersIcon, Bus,
  Trash2, Check, Save, Send, Sparkles, MapPin, Calendar, DollarSign,
  Plus, ChevronDown, ChevronUp, CreditCard, Mail, Share2
} from 'lucide-react';

const TYPE_META = {
  hotel: { icon: Hotel, label: 'Stay', color: 'bg-purple-500' },
  flight: { icon: Plane, label: 'Flight', color: 'bg-sky-500' },
  experience: { icon: Mountain, label: 'Experience', color: 'bg-emerald-500' },
  restaurant: { icon: Utensils, label: 'Dining', color: 'bg-orange-500' },
  fixer: { icon: UsersIcon, label: 'Local Guide', color: 'bg-amber-500' },
  transport: { icon: Bus, label: 'Transport', color: 'bg-blue-500' },
};

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const m = String(priceStr).replace(/,/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export default function Itinerary() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'auto';
  const user = currentUser || SAMPLE_USERS[0];

  const [items, setItems] = useState([]);
  const [tripName, setTripName] = useState('');
  const [tripDates, setTripDates] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [savedAt, setSavedAt] = useState(null);
  const [stage, setStage] = useState('review'); // review, payment, confirmed
  const [collapsed, setCollapsed] = useState({});
  const [demoStep, setDemoStep] = useState('');

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jetzy_cart');
      if (saved) {
        const data = JSON.parse(saved);
        setItems(data.items || []);
        setTripName(data.tripName || '');
        setTripDates(data.tripDates || '');
        setTravelers(data.travelers || '1');
      }
    } catch {}
  }, []);

  // Auto-save (always — including empty state, so removed items stick)
  useEffect(() => {
    const data = { items, tripName, tripDates, travelers, savedAt: Date.now() };
    localStorage.setItem('jetzy_cart', JSON.stringify(data));
    setSavedAt(Date.now());
  }, [items, tripName, tripDates, travelers]);

  // === Auto-demo: walk through review → payment → confirmed ===
  useEffect(() => {
    if (!isDemo) return;
    if (items.length === 0) return; // wait for cart to load

    const timeouts = [];
    const schedule = (delay, fn) => {
      const t = setTimeout(fn, delay);
      timeouts.push(t);
    };

    // 1. Type trip name
    schedule(800, () => {
      setDemoStep('Naming your trip...');
      setTripName('Patagonia — Hiking Trip');
    });
    // 2. Type dates
    schedule(1800, () => {
      setDemoStep('Adding dates...');
      setTripDates('Oct 12 – 19, 2026');
    });
    // 3. Set travelers
    schedule(2600, () => {
      setDemoStep('Setting travelers...');
      setTravelers('2');
    });
    // 4. Highlight total
    schedule(3500, () => {
      setDemoStep('Reviewing total...');
    });
    // 5. Go to payment
    schedule(5000, () => {
      setDemoStep('Going to checkout...');
      setStage('payment');
    });
    // 6. Confirm
    schedule(8500, () => {
      setDemoStep('Processing payment...');
    });
    schedule(10500, () => {
      setDemoStep('');
      setStage('confirmed');
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [isDemo, items.length]);

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const total = items.reduce((sum, it) => sum + parsePrice(it.price), 0);

  // Group by destination
  const byDestination = items.reduce((acc, item, idx) => {
    const dest = item.location || 'Other';
    if (!acc[dest]) acc[dest] = [];
    acc[dest].push({ ...item, _idx: idx });
    return acc;
  }, {});

  if (stage === 'confirmed') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center content-px">
        <div className="text-center animate-fade-up max-w-md">
          <div className="w-24 h-24 rounded-full gradient-gold mx-auto flex items-center justify-center mb-6 shadow-2xl">
            <Check size={44} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy">Trip Booked!</h1>
          <p className="text-charcoal-light text-base mt-3 leading-relaxed">
            Your {tripName || 'trip'} is confirmed. We just sent the full itinerary, vouchers, and emergency contacts to {user.email || 'your email'}.
          </p>
          <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal-light uppercase tracking-wider">Booking Summary</span>
              <span className="text-xs font-bold text-gold">CONFIRMED</span>
            </div>
            <p className="text-sm font-semibold text-charcoal">{items.length} items · {Object.keys(byDestination).length} destinations</p>
            <p className="text-2xl font-bold text-navy mt-1">${total.toLocaleString()}</p>
            <p className="text-[11px] text-charcoal-light mt-1">+250 JetPoints earned</p>
          </div>
          {isDemo && (
            <div className="mt-6 p-4 bg-charcoal text-white rounded-2xl">
              <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1">Demo Complete</p>
              <p className="text-sm">You just watched a full Patagonia trip planned, built, and booked end-to-end — all by voice.</p>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            {isDemo ? (
              <button onClick={() => { localStorage.removeItem('jetzy_cart'); navigate('/virtual-travel'); }}
                className="flex-1 py-3.5 gradient-gold rounded-2xl text-white font-semibold text-sm shadow-lg active:scale-[0.97]">
                Replay Demo
              </button>
            ) : (
              <>
                <button onClick={() => { localStorage.removeItem('jetzy_cart'); navigate('/passport'); }}
                  className="flex-1 py-3.5 bg-white border border-gray-200 rounded-2xl text-charcoal font-medium text-sm active:scale-[0.97]">
                  View Passport
                </button>
                <button onClick={() => { localStorage.removeItem('jetzy_cart'); navigate('/home'); }}
                  className="flex-1 py-3.5 gradient-gold rounded-2xl text-white font-semibold text-sm shadow-lg active:scale-[0.97]">
                  Back Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'payment') {
    return (
      <div className="min-h-screen bg-cream pb-8">
        {isDemo && demoStep && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-charcoal text-white py-2 text-center text-xs font-semibold animate-fade-up flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Auto Demo · {demoStep}
          </div>
        )}
        <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl">
          <button onClick={() => setStage('review')} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Checkout</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Complete Your Trip</h1>
          <p className="text-white/50 text-sm mt-1">${total.toLocaleString()} · {items.length} items</p>
        </div>

        <div className="content-px mt-6 space-y-4">
          {/* Summary */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-charcoal-light uppercase tracking-wider mb-3">Order Summary</p>
            {items.map((it, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-charcoal flex-1 mr-3">{it.name}</span>
                <span className="text-sm font-semibold text-navy">{it.price}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-navy">Total</span>
              <span className="text-lg font-bold text-gold">${total.toLocaleString()}</span>
            </div>
          </div>

          {/* Card */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <p className="text-xs font-bold text-charcoal-light uppercase tracking-wider">Payment Method</p>
            <div className="p-4 rounded-xl bg-charcoal text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Jetzy Black Card</span>
                <span className="text-xs">VISA</span>
              </div>
              <p className="text-lg font-mono mt-3">•••• •••• •••• 4242</p>
              <div className="flex justify-between mt-2 text-xs text-white/60">
                <span>{user.name?.toUpperCase() || 'MARCO V'}</span>
                <span>12/29</span>
              </div>
            </div>
            <p className="text-[11px] text-charcoal-light flex items-center gap-1">
              <Sparkles size={10} className="text-gold" /> Black members get 0% booking fee + 5x JetPoints on this trip
            </p>
          </div>

          <button onClick={() => setStage('confirmed')}
            className="w-full py-4 gradient-gold rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl active:scale-[0.97] transition-transform">
            <CreditCard size={18} /> Pay ${total.toLocaleString()} & Book
          </button>
          <p className="text-[10px] text-center text-charcoal-light">Free cancellation on most items up to 48 hours before</p>
        </div>
      </div>
    );
  }

  // === REVIEW STAGE ===
  return (
    <div className="min-h-screen bg-cream pb-32">
      {isDemo && demoStep && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-charcoal text-white py-2 text-center text-xs font-semibold animate-fade-up flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Auto Demo · {demoStep}
        </div>
      )}
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Your Itinerary</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">{tripName || 'Untitled Trip'}</h1>
          <p className="text-white/50 text-sm mt-1">{items.length} items · {Object.keys(byDestination).length} destinations</p>

          <div className="flex gap-3 mt-5">
            <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <p className="text-2xl font-bold text-gold">${total.toLocaleString()}</p>
              <p className="text-white/40 text-[10px]">Estimated total</p>
            </div>
            <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-center">
              <p className="text-2xl font-bold text-gold">{items.length}</p>
              <p className="text-white/40 text-[10px]">Bookable items</p>
            </div>
            {savedAt && (
              <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-center">
                <Save size={14} className="text-green-400 mx-auto mb-0.5" />
                <p className="text-[9px] text-white/60">Auto-saved</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-px mt-6 space-y-5">
        {/* Trip details */}
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div>
            <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">Trip Name</label>
            <input type="text" value={tripName} onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. Chennai & Mahabalipuram, January"
              className="mt-1 w-full px-3 py-2.5 bg-cream rounded-xl outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider flex items-center gap-1"><Calendar size={9} /> Dates</label>
              <input type="text" value={tripDates} onChange={(e) => setTripDates(e.target.value)}
                placeholder="Jan 15 - 22, 2026"
                className="mt-1 w-full px-3 py-2.5 bg-cream rounded-xl outline-none text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider flex items-center gap-1"><UsersIcon size={9} /> Travelers</label>
              <input type="number" min="1" value={travelers} onChange={(e) => setTravelers(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-cream rounded-xl outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* Items by destination */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles size={32} className="text-charcoal-light/20 mx-auto mb-3" />
            <p className="text-charcoal-light text-sm mb-3">Your itinerary is empty.</p>
            <button onClick={() => navigate('/virtual-travel')}
              className="px-5 py-3 gradient-gold rounded-xl text-white text-sm font-semibold shadow-lg active:scale-[0.97]">
              Talk to a Guide
            </button>
          </div>
        ) : (
          Object.entries(byDestination).map(([dest, destItems]) => {
            const isCollapsed = collapsed[dest];
            const destTotal = destItems.reduce((s, it) => s + parsePrice(it.price), 0);
            return (
              <div key={dest} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setCollapsed(c => ({ ...c, [dest]: !isCollapsed }))}
                  className="w-full p-4 flex items-center gap-3 active:bg-cream/50 transition-colors">
                  <MapPin size={16} className="text-gold flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-charcoal">{dest}</p>
                    <p className="text-[10px] text-charcoal-light">{destItems.length} items · ${destTotal.toLocaleString()}</p>
                  </div>
                  {isCollapsed ? <ChevronDown size={16} className="text-charcoal-light" /> : <ChevronUp size={16} className="text-charcoal-light" />}
                </button>
                {!isCollapsed && (
                  <div className="border-t border-gray-100">
                    {destItems.map(item => {
                      const meta = TYPE_META[item.type] || TYPE_META.experience;
                      const Icon = meta.icon;
                      return (
                        <div key={item._idx} className="p-4 flex items-start gap-3 border-b border-gray-50 last:border-0 animate-fade-up">
                          <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-white flex-shrink-0`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold bg-gray-100 text-charcoal-light px-1.5 py-0.5 rounded uppercase">{meta.label}</span>
                              <span className="text-sm font-bold text-navy">{item.price}</span>
                            </div>
                            <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                            {item.detail && <p className="text-[11px] text-charcoal-light mt-0.5">{item.detail}</p>}
                          </div>
                          <button onClick={() => removeItem(item._idx)}
                            className="text-charcoal-light/30 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {items.length > 0 && (
          <button onClick={() => navigate('/virtual-travel')}
            className="w-full p-4 bg-white rounded-2xl border-2 border-dashed border-gold/30 text-gold font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.99]">
            <Plus size={16} /> Add More from Avatar Conversation
          </button>
        )}
      </div>

      {/* Sticky bottom checkout bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 glass border-t border-gray-200/50 z-40">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <p className="text-[10px] text-charcoal-light uppercase tracking-wider font-semibold">Estimated total</p>
              <p className="text-2xl font-bold text-navy">${total.toLocaleString()}</p>
            </div>
            <button onClick={() => navigate('/virtual-travel')} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal text-xs font-medium active:scale-[0.97]">
              <Save size={14} className="inline mr-1" /> Save
            </button>
            <button onClick={() => setStage('payment')}
              className="px-6 py-3 gradient-gold rounded-xl text-white font-bold text-sm shadow-lg active:scale-[0.97] transition-transform">
              Book Trip →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
