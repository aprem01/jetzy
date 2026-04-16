import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Mic, MicOff, BookOpen, Sparkles, MapPin, Cloud, Calendar, Check, Plus } from 'lucide-react';

const PAST_ENTRIES = [
  { id: 'j1', date: 'Feb 18, 2026', location: 'El Chaltén', weather: '12°C, Windy', mood: 'Euphoric', title: 'The sunrise that changed everything', body: 'Started hiking at 4:30am. Pitch black, headlamp on, wind trying to push me back. Three hours of switchbacks in the dark. Then the sky turned pink. Then orange. Then Fitz Roy caught the first light and I forgot my name. I stood there for twenty minutes. Nobody spoke. This is why I travel. Not for the Instagram photo — for the twenty minutes of silence when the world shows you something you can\'t put into words. Post-hike beer at La Cervecería was the best I\'ve ever had. Not because of the beer. Because of what came before it.' },
  { id: 'j2', date: 'Feb 16, 2026', location: 'El Chaltén', weather: '8°C, Clear', mood: 'Peaceful', body: 'Shorter day. Laguna Torre. The glacier lake was perfectly still — Cerro Torre reflected like a mirror. Found the refugio everyone talks about. The hot chocolate is made with real Bariloche chocolate. 2,000 ARS and worth every peso. Sat on a rock for an hour and just watched the clouds move across the spire.' },
  { id: 'j3', date: 'Feb 14, 2026', location: 'El Calafate → El Chaltén', weather: '15°C, Sunny', mood: 'Anticipation', body: 'Three-hour bus through the steppe. Nothing but wind and grassland for miles. Then — through the bus window — Fitz Roy appeared. The entire bus went quiet. Some things you see in photos a hundred times and they still stop you when they\'re real. Checked into Senderos. María at reception already knew I was hiking tomorrow. She drew a map on a napkin.' },
];

export default function Journal() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [isRecording, setIsRecording] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Travel Journal</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Your Story</h1>
          <p className="text-white/50 text-sm mt-1">Speak it. We'll write it beautifully.</p>
        </div>
      </div>

      <div className="content-px mt-5">
        {/* New Entry */}
        {!showCompose ? (
          <button onClick={() => setShowCompose(true)} className="w-full p-5 bg-white rounded-3xl border border-gold/20 shadow-md flex items-center gap-4 mb-5 active:scale-[0.99] transition-transform">
            <div className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-charcoal">Write Today's Entry</p>
              <p className="text-xs text-charcoal-light">Speak or type — AI polishes it</p>
            </div>
          </button>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5 mb-5 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-charcoal-light" />
                <span className="text-xs text-charcoal-light">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-gold" />
                <span className="text-xs text-gold font-medium">{user.currentLocation || 'Denver, CO'}</span>
              </div>
            </div>

            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="What happened today? What did you see, taste, feel?"
              className="w-full p-0 bg-transparent outline-none text-charcoal text-sm placeholder:text-gray-300 resize-none h-28 leading-relaxed"
            />

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  isRecording ? 'bg-red-50 text-red-500' : 'bg-cream text-charcoal-light'
                }`}
              >
                {isRecording ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}
              </button>

              {saved ? (
                <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold"><Check size={14} strokeWidth={3} /> Saved!</span>
              ) : (
                <button onClick={() => setSaved(true)} disabled={!newEntry.trim()}
                  className="px-5 py-2 gradient-gold rounded-xl text-white text-xs font-semibold disabled:opacity-30 active:scale-[0.97] transition-all">
                  <Sparkles size={12} className="inline mr-1" /> Save & Polish
                </button>
              )}
            </div>
          </div>
        )}

        {/* Past Entries */}
        <h2 className="text-sm font-bold text-navy mb-3">{user.recentTrip?.destination || 'Patagonia'} Journal</h2>
        <div className="space-y-4">
          {PAST_ENTRIES.map((entry, idx) => (
            <div key={entry.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 animate-fade-up" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal">{entry.date}</span>
                  {entry.title && <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold uppercase">Highlight</span>}
                </div>
                <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded-full">{entry.mood}</span>
              </div>
              <div className="flex items-center gap-3 mb-2 text-[10px] text-charcoal-light">
                <span className="flex items-center gap-1"><MapPin size={8} /> {entry.location}</span>
                <span className="flex items-center gap-1"><Cloud size={8} /> {entry.weather}</span>
              </div>
              {entry.title && <h3 className="font-display text-base font-semibold text-navy mb-2">{entry.title}</h3>}
              <p className="text-sm text-charcoal leading-relaxed">{entry.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
