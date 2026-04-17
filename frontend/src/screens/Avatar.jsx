import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Mic, MicOff, Send, Sparkles, Volume2, Ship, Plane, Hotel, Mountain, Utensils, Compass, Check, Star, MapPin, Calendar, DollarSign } from 'lucide-react';

const AVATAR_IMG = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face';

const CATEGORIES = [
  { id: 'cruise', label: 'Cruise', icon: <Ship size={18} />, color: 'bg-blue-500', greeting: 'I love planning cruises. Caribbean, Mediterranean, Alaska — what calls to you?' },
  { id: 'flight', label: 'Flights', icon: <Plane size={18} />, color: 'bg-sky-500', greeting: 'Let\'s find your flight. Where are you headed and when?' },
  { id: 'hotel', label: 'Hotels', icon: <Hotel size={18} />, color: 'bg-purple-500', greeting: 'Boutique, luxury, off-grid? Tell me what kind of stay you\'re after.' },
  { id: 'experience', label: 'Experiences', icon: <Mountain size={18} />, color: 'bg-emerald-500', greeting: 'A trek? A safari? A cooking class in Tuscany? What\'s the dream?' },
  { id: 'restaurant', label: 'Restaurants', icon: <Utensils size={18} />, color: 'bg-orange-500', greeting: 'I know the best tables in every city. Where are you eating tonight?' },
  { id: 'trip', label: 'Full Trip', icon: <Compass size={18} />, color: 'bg-gold', greeting: 'A complete trip — flights, hotels, experiences, the works. Where to?' },
];

// Sample booking options for each category
const SAMPLE_OPTIONS = {
  cruise: [
    { title: 'Celebrity Reflection — Caribbean', detail: '7 nights · Mar 15-22 · Departs Miami', price: '$1,899', oldPrice: '$2,650', image: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=600&h=400&fit=crop', tag: 'Best Value', stars: 5 },
    { title: 'Viking Star — Mediterranean', detail: '10 nights · Apr 8-18 · Barcelona to Rome', price: '$3,850', oldPrice: '$4,500', image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&h=400&fit=crop', tag: 'Members Love', stars: 5 },
    { title: 'Princess Cruises — Alaska Glacier', detail: '7 nights · Jun 12-19 · Seattle round trip', price: '$2,199', oldPrice: '$2,800', image: 'https://images.unsplash.com/photo-1531176175280-33e81d2bcb1b?w=600&h=400&fit=crop', stars: 4 },
  ],
  flight: [
    { title: 'LATAM — DEN → EZE (Buenos Aires)', detail: 'Oct 12-19 · 1 stop · 14h total', price: '$687', oldPrice: '$1,142', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop', tag: '40% off — Live Now', stars: 4 },
    { title: 'JAL — SFO → HND (Tokyo)', detail: 'Apr 5-12 · Direct · Premium Economy', price: '$2,150', image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&h=400&fit=crop', stars: 5 },
  ],
  hotel: [
    { title: 'Aman Tokyo — Deluxe Room', detail: 'Apr 5-8 · 3 nights · Includes breakfast', price: '$672', oldPrice: '$2,400', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop', tag: 'Black Perk · 72% off', stars: 5 },
    { title: 'Senderos Hostería — El Chaltén', detail: 'Feb 14-19 · 5 nights · Mountain view', price: '$600', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', tag: 'Member Favorite', stars: 5 },
    { title: 'Park Hyatt Lisbon — Suite', detail: 'Sep 10-13 · 3 nights · 65% off', price: '$560', oldPrice: '$1,600', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop', tag: 'Black Perk', stars: 5 },
  ],
  experience: [
    { title: 'Machame Route — 7-Day Kilimanjaro Summit', detail: 'Local operator · Guide Honest · Group of 6', price: '$1,800', oldPrice: '$3,500', image: 'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600&h=400&fit=crop', tag: '100% summit rate', stars: 5 },
    { title: 'Wayo Africa — Mobile Camp Safari', detail: '5 nights · Follows the Great Migration', price: '$2,250', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop', tag: 'Members Love', stars: 5 },
    { title: 'Patagonia W Circuit — Guided', detail: '5 days · Refugio to refugio · Includes meals', price: '$1,400', image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=600&h=400&fit=crop', stars: 5 },
  ],
  restaurant: [
    { title: 'Don Julio — VIP Table', detail: 'Buenos Aires · Tonight 8pm · Skip the wait', price: '$95', oldPrice: '$180', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', tag: 'Select Perk', stars: 5 },
    { title: 'Cervejaria Ramiro', detail: 'Lisbon · Friday 7pm · Tiger prawns + bifana', price: '€38', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop', tag: 'Member Favorite', stars: 5 },
  ],
  trip: [
    { title: 'Patagonia Trek + Lodge', detail: '7 days · Flights + Senderos + W Circuit', price: '$3,950', oldPrice: '$5,400', image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=600&h=400&fit=crop', tag: 'Concierge Built', stars: 5 },
    { title: 'Tokyo Food Week', detail: '6 days · Park Hyatt + 4 omakase + private guide', price: '$5,800', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop', tag: 'Curated', stars: 5 },
  ],
};

export default function Avatar() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [category, setCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookedItems, setBookedItems] = useState([]);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setInput(prev => prev + final);
    };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) u.voice = preferred;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setInput('');
    setIsListening(true);
    try { recognitionRef.current.start(); } catch {}
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const pickCategory = (cat) => {
    setCategory(cat);
    setMessages([{ role: 'assistant', content: cat.greeting }]);
    setTimeout(() => speak(cat.greeting), 300);
  };

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: t }];
    setMessages(newMsgs);
    setIsThinking(true);

    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          userProfile: {
            name: user.name,
            travelStyles: user.travelStyles,
            countriesVisited: user.countries,
            upcomingTrip: user.upcomingTrip?.destination,
            interests: user.interests,
          }
        })
      });
      const data = await res.json();
      const reply = data.response;

      // Show options after a couple of exchanges
      const showOptions = newMsgs.length >= 1;
      const finalMsgs = [...newMsgs, { role: 'assistant', content: reply, options: showOptions ? SAMPLE_OPTIONS[category.id] : null }];
      setMessages(finalMsgs);
      speak(reply);
    } catch {
      const fallback = `I've got some great ${category.id} options for you. Take a look below — these are personalized for the way you travel.`;
      setMessages([...newMsgs, { role: 'assistant', content: fallback, options: SAMPLE_OPTIONS[category.id] }]);
      speak(fallback);
    }
    setIsThinking(false);
  };

  const book = (option) => {
    setBookedItems(prev => [...prev, option.title]);
  };

  const reset = () => {
    stopSpeaking();
    setCategory(null);
    setMessages([]);
    setInput('');
    setBookedItems([]);
  };

  // Category picker view
  if (!category) {
    return (
      <div className="min-h-screen bg-cream pb-8">
        <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="relative">
            <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>

            {/* Avatar hero */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img src={AVATAR_IMG} alt="" className="w-20 h-20 rounded-2xl border-2 border-gold object-cover shadow-xl" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-navy" />
              </div>
              <div>
                <p className="text-gold text-[10px] font-bold uppercase tracking-wider">AI Concierge</p>
                <h1 className="font-display text-2xl font-bold text-white">Hi {user.name?.split(' ')[0]}, I'm Avery</h1>
                <p className="text-white/50 text-xs mt-0.5">Your personal travel agent — book anything in minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="content-px mt-6">
          <p className="text-sm font-bold text-navy mb-3">What can I help you book today?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button key={cat.id} onClick={() => pickCategory(cat)}
                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center active:scale-[0.97] animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center text-white mx-auto mb-3 shadow-md`}>
                  {cat.icon}
                </div>
                <p className="text-sm font-bold text-charcoal">{cat.label}</p>
                <p className="text-[10px] text-charcoal-light mt-0.5">Tap to start</p>
              </button>
            ))}
          </div>

          {/* Why it's different */}
          <div className="mt-6 p-5 bg-white rounded-3xl border border-gold/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-gold" />
              <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Why Avery is different</span>
            </div>
            <ul className="space-y-2 text-sm text-charcoal">
              <li className="flex items-start gap-2"><Check size={14} className="text-gold mt-0.5 flex-shrink-0" /> Voice or text — talk like you would to a real travel agent</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-gold mt-0.5 flex-shrink-0" /> Knows your style, past trips, and budget</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-gold mt-0.5 flex-shrink-0" /> Surfaces Select & Black member perks automatically</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-gold mt-0.5 flex-shrink-0" /> One-tap booking — discovery to checkout in one conversation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Conversation view
  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Avatar header */}
      <div className="gradient-navy content-px pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={reset} className="text-white/60"><ArrowLeft size={20} /></button>
          <div className="relative">
            <img src={AVATAR_IMG} alt="" className={`w-12 h-12 rounded-xl border-2 border-gold object-cover transition-transform ${isSpeaking ? 'animate-pulse-gold scale-105' : ''}`} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-navy" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm flex items-center gap-1.5">
              Avery
              <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-gold animate-pulse' : 'bg-green-400'}`} />
            </p>
            <p className="text-white/50 text-[11px]">{isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : isListening ? 'Listening...' : 'Online'}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${category.color} text-white`}>
            {category.label}
          </span>
          {isSpeaking && (
            <button onClick={stopSpeaking} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Volume2 size={14} className="text-gold" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto content-px py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-up">
            {msg.role === 'assistant' ? (
              <div className="flex gap-3">
                <img src={AVATAR_IMG} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="bubble-ai px-4 py-3 inline-block max-w-[85%]">
                    <p className="text-sm text-charcoal leading-relaxed">{msg.content}</p>
                  </div>

                  {/* Booking option cards */}
                  {msg.options && (
                    <div className="mt-3 space-y-3">
                      {msg.options.map((opt, j) => {
                        const booked = bookedItems.includes(opt.title);
                        return (
                          <div key={j} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden animate-fade-up" style={{ animationDelay: `${j * 0.1}s` }}>
                            <div className="relative h-32">
                              <img src={opt.image} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              {opt.tag && (
                                <div className="absolute top-2 left-2 bg-gold text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase shadow">
                                  {opt.tag}
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2 flex">
                                {[...Array(opt.stars)].map((_, s) => <Star key={s} size={10} className="text-gold" fill="#C9A84C" />)}
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-bold text-charcoal">{opt.title}</p>
                              <p className="text-[11px] text-charcoal-light mt-0.5">{opt.detail}</p>
                              <div className="flex items-center justify-between mt-2.5">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-lg font-bold text-navy">{opt.price}</span>
                                  {opt.oldPrice && <span className="text-xs line-through text-charcoal-light/40">{opt.oldPrice}</span>}
                                </div>
                                {booked ? (
                                  <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-lg flex items-center gap-1 animate-scale-in">
                                    <Check size={12} strokeWidth={3} /> Booked
                                  </span>
                                ) : (
                                  <button onClick={() => book(opt)} className="px-4 py-2 gradient-gold rounded-lg text-white text-xs font-bold shadow-md active:scale-95 transition-transform">
                                    Book Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="bubble-user px-4 py-3 max-w-[80%]">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-3 animate-fade-up">
            <img src={AVATAR_IMG} alt="" className="w-8 h-8 rounded-lg object-cover" />
            <div className="bubble-ai px-4 py-3 inline-block">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="content-px pb-8 pt-3 glass border-t border-gray-200/50">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              isListening ? 'bg-red-50 text-red-500' : 'bg-cream text-charcoal-light'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={isListening ? 'Listening...' : 'Tell Avery what you want...'}
            className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-sm"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isThinking}
            className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform shadow-md"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
        {bookedItems.length > 0 && (
          <p className="text-[11px] text-center text-green-600 mt-2 font-medium">
            ✓ {bookedItems.length} booking{bookedItems.length > 1 ? 's' : ''} confirmed
          </p>
        )}
      </div>
    </div>
  );
}
