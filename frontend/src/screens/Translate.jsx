import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Camera, Languages, Send, Sparkles, Copy, Check, Volume2 } from 'lucide-react';

const SAMPLE_TRANSLATIONS = [
  { input: 'Entraña con ensalada mixta', from: 'Spanish', to: 'English', translation: 'Skirt steak with mixed salad', context: 'Entraña is THE cut to order at any Argentine parrilla. Ask for it "a punto" (medium) — they cook it closer to medium-rare than you\'d expect. The mixed salad is usually just lettuce, tomato, and onion. Budget: 8,000-12,000 ARS.' },
  { input: '出口はどこですか', from: 'Japanese', to: 'English', translation: 'Where is the exit?', context: 'Useful in Tokyo\'s massive train stations. If lost, look for 出口 (deguchi) signs in green. Station staff speak limited English — point to your destination on a map instead.' },
  { input: 'Tinto por favor', from: 'Spanish (Colombian)', to: 'English', translation: 'Small black coffee please', context: 'In Colombia, "tinto" means a small sweet black coffee — NOT red wine like in Spain. Costs about 1,500-2,000 COP ($0.35). They serve it everywhere, even on buses.' },
  { input: 'Conta, por favor', from: 'Portuguese', to: 'English', translation: 'Check, please', context: 'In Lisbon, the waiter won\'t bring the check until you ask. This is normal — they\'re being polite, not slow. Tipping is not expected but rounding up is appreciated.' },
];

export default function Translate() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const translate = async (text) => {
    const query = text || input;
    if (!query.trim()) return;
    setIsTranslating(true);

    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Translate this text and give cultural travel context. Text: "${query}". Return format: Translation: [translation]. Language: [detected language]. Cultural context: [1-2 sentences of travel-relevant context a Jetzy member would want to know — prices, customs, tips]. Be specific and practical.` }],
          userProfile: { name: 'traveler', travelStyles: ['adventure'] }
        })
      });
      const data = await res.json();
      setResult({ input: query, response: data.response });
    } catch {
      // Use sample
      const sample = SAMPLE_TRANSLATIONS.find(s => query.toLowerCase().includes(s.input.toLowerCase().slice(0, 5))) || SAMPLE_TRANSLATIONS[0];
      setResult({ input: query, response: `Translation: ${sample.translation}\nLanguage: ${sample.from}\nCultural context: ${sample.context}` });
    }
    setIsTranslating(false);
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard?.writeText(result.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-cream pb-8">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Languages size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Jetzy Translate</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Translate + Context</h1>
          <p className="text-white/50 text-sm mt-1">Not just words — cultural intelligence</p>
        </div>
      </div>

      <div className="content-px mt-6">
        {/* Input */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5 mb-5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text in any language..."
            className="w-full p-0 bg-transparent outline-none text-charcoal text-base placeholder:text-gray-300 resize-none h-24 leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button className="flex items-center gap-2 px-4 py-2 bg-cream rounded-xl text-charcoal-light text-xs font-medium">
              <Camera size={14} /> Scan Menu
            </button>
            <button
              onClick={() => translate()}
              disabled={!input.trim() || isTranslating}
              className="px-6 py-2.5 gradient-gold rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-30 active:scale-[0.97] transition-all"
            >
              {isTranslating ? 'Translating...' : <><Languages size={14} /> Translate</>}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5 mb-5 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                <span className="text-xs font-bold text-gold uppercase tracking-wider">Translation + Context</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => speak(result.response)} className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center active:scale-90">
                  <Volume2 size={14} className="text-charcoal-light" />
                </button>
                <button onClick={copyResult} className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center active:scale-90">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-charcoal-light" />}
                </button>
              </div>
            </div>
            <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{result.response}</p>
          </div>
        )}

        {/* Quick Examples */}
        <div>
          <p className="text-xs font-bold text-charcoal-light uppercase tracking-wider mb-3">Try these</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SAMPLE_TRANSLATIONS.map((sample, i) => (
              <button key={i} onClick={() => { setInput(sample.input); translate(sample.input); }}
                className="p-4 bg-white rounded-2xl border border-gray-100 text-left hover:border-gold/30 transition-all active:scale-[0.99]">
                <p className="text-sm font-semibold text-charcoal">{sample.input}</p>
                <p className="text-[10px] text-charcoal-light mt-1">{sample.from} → {sample.to}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
