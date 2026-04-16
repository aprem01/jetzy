import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { COMPANION_PROMPTS, SAMPLE_USERS } from '../data/seed';
import { Send, Sparkles, ArrowLeft, Mic, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Companion() {
  const { currentUser, chatMessages, setChatMessages, memories, extractMemories } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const user = currentUser || SAMPLE_USERS[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userProfile: {
            name: user.name,
            travelStyles: user.travelStyles,
            countriesVisited: user.countries,
            upcomingTrip: user.upcomingTrip?.destination,
            interests: user.interests,
            memories: memories?.slice(0, 10),
          }
        })
      });

      const data = await res.json();
      const meta = data.graphContext ? { graphRAG: true, entities: data.entitiesFound } : {};
      setChatMessages([...newMessages, { role: 'assistant', content: data.response, ...meta }]);
      extractMemories(text, data.response);
    } catch {
      const fallback = generateFallback(text, user);
      setChatMessages([...newMessages, { role: 'assistant', content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Header */}
      <div className="gradient-navy px-5 md:px-10 pt-12 pb-5 flex items-center gap-4">
        <button onClick={() => navigate('/home')} className="text-white/60">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Jetzy Companion</p>
          <p className="text-white/50 text-xs">Your travel intelligence</p>
        </div>
        <button onClick={() => navigate('/voice')} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors active:scale-90">
          <Mic size={16} className="text-gold" />
        </button>
        <button onClick={() => navigate('/concierge')} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors active:scale-90">
          <Wand2 size={16} className="text-gold" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 md:px-10 lg:px-16 py-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="animate-fade-up">
            <div className="text-center mt-8 mb-8">
              <div className="w-16 h-16 rounded-full gradient-gold mx-auto flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="font-display text-xl font-semibold text-navy">Hey {user.name?.split(' ')[0]}</h2>
              <p className="text-charcoal-light text-sm mt-1">
                I know you're a {user.travelStyles?.[0] || 'adventure'} traveler. Ask me anything.
              </p>
            </div>

            <div className="space-y-2">
              {COMPANION_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="w-full p-3.5 bg-white rounded-xl border border-gray-100 text-left text-sm text-charcoal hover:border-gold/30 hover:bg-gold/5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <Sparkles size={12} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] md:max-w-[65%] px-4 py-3 ${
              msg.role === 'user' ? 'bubble-user' : 'bubble-ai'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.graphRAG && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-green-400 flex items-center justify-center">
                    <span className="text-[6px] text-white font-bold">G</span>
                  </div>
                  <span className="text-[10px] text-charcoal-light">Grounded by Knowledge Graph · {msg.entities?.length || 0} entities matched</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-up">
            <div className="w-7 h-7 rounded-full gradient-gold flex items-center justify-center mr-2 mt-1">
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="bubble-ai px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-5 md:px-10 lg:px-16 pb-8 pt-3 glass border-t border-gray-200/50">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your next adventure..."
            className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-sm text-charcoal placeholder:text-gray-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center disabled:opacity-30 transition-opacity shadow-md"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}

function generateFallback(text, user) {
  const lower = text.toLowerCase();
  if (lower.includes('chaltén') || lower.includes('patagonia')) {
    return `El Chaltén is one of my favorite places on earth, ${user.name?.split(' ')[0]}. Since you're a hiker, here's what you need to know:\n\nThe Laguna de los Tres trail is the must-do — start at 4:30am to catch Fitz Roy at sunrise. It's 10 hours round trip but every step is worth it.\n\nStay at Senderos Hostería ($120/night) — the owner María gives trail intel you won't find on AllTrails. For post-hike, La Cervecería has the best craft stout south of the equator.\n\nFebruary is peak season — book accommodation 3 months ahead. Layers are everything, the weather changes hourly.\n\nAs a Select Black member, you've got 65% off Patagonia Camp near Torres del Paine if you're extending south. Want me to build you a day-by-day itinerary?`;
  }
  if (lower.includes('tokyo') || lower.includes('japan')) {
    return `Tokyo is a different universe, ${user.name?.split(' ')[0]}. For someone who loves food and adventure:\n\nSkip the famous sushi spots. Hit Tsukiji outer market at 5am — find the tamagoyaki stall near Gate 4. ¥300 for the best egg you'll ever eat.\n\nGolden Gai for nightlife: pick the bar with no English sign and fewer than 6 seats. Budget ¥3000 for the night.\n\nFor hiking: take the Chuo Line to Mount Takao. 90 minutes from Shinjuku, stunning views, and an onsen at the base for recovery.\n\nJetzy member Sofia R just got back from Tokyo — she has incredible local intel. Want me to connect you?`;
  }
  if (lower.includes('pack') || lower.includes('gear')) {
    return `Here's my field-tested packing list for Patagonia in February:\n\n**Essentials:** Waterproof hardshell (rain is horizontal there), 3 merino base layers, hiking boots (broken in!), headlamp for early starts, 30L daypack, trekking poles.\n\n**Don't bother bringing:** Down jacket (too wet for down — go synthetic), formal clothes (nobody dresses up in Chaltén), heavy camping gear (rent in town).\n\n**Pro tip:** Pack a lightweight dry bag for electronics. The weather goes from sunshine to sideways rain in 20 minutes.\n\nAs a Select Black member, Away Luggage is 40% off right now — their carry-on is perfect for this kind of trip.`;
  }
  return `Great question, ${user.name?.split(' ')[0]}. Based on your profile as a ${user.travelStyles?.[0] || 'adventure'} traveler who's explored ${user.countries?.length || 6} countries, I'd say you're ready for something extraordinary.\n\nLet me give you some specific intel. What destination are you thinking about? I can pull insights from Jetzy members who've been there recently — real traveler knowledge, not tourist guide stuff.\n\nOr if you're open to suggestions, I have a few ideas based on your travel style that I think would blow your mind.`;
}
