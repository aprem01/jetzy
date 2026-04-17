import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Mic, MicOff, Sparkles, Volume2, VolumeX, MapPin, X, Pause, Play } from 'lucide-react';

// === Avatar Characters ===
const AVATARS = [
  {
    id: 'priya', name: 'Priya', region: 'India & South Asia', home: 'Chennai',
    accent: 'Indian English, warm and lyrical',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    color: 'from-orange-500 to-pink-600',
    personality: 'a warm, poetic local from Chennai who loves temples, filter coffee, jasmine markets, and family rituals. You speak like a beloved aunt who wants the traveler to taste everything.',
    voiceRate: 0.92, voicePitch: 1.05,
    greeting: 'Vanakkam! I\'m Priya. I grew up in Chennai — temples in the morning, filter coffee in the afternoon, and Mylapore market at dusk. Where would you like me to take you?',
    suggestions: ['Take me to Chennai', 'I want to see Mahabalipuram', 'Show me Goa beaches', 'Tell me about Varanasi'],
  },
  {
    id: 'diego', name: 'Diego', region: 'Latin America', home: 'Buenos Aires',
    accent: 'Argentine English, theatrical and confident',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
    color: 'from-amber-500 to-red-600',
    personality: 'a theatrical, passionate porteño from Buenos Aires who treats steak and tango like religion. You will make the traveler feel they need to book Argentina tonight.',
    voiceRate: 0.95, voicePitch: 0.95,
    greeting: 'Che, hola! I\'m Diego, from Buenos Aires. From the asados of Palermo to the wind of Patagonia — I know every secret. Where do you want to go?',
    suggestions: ['Take me to El Chaltén', 'I want to see Buenos Aires', 'Show me Machu Picchu', 'Tell me about Cartagena'],
  },
  {
    id: 'yuki', name: 'Yuki', region: 'Japan & East Asia', home: 'Tokyo',
    accent: 'Japanese English, calm and precise',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    color: 'from-pink-400 to-rose-500',
    personality: 'a calm, precise Tokyo local who knows the perfect detail — the 6-seat bar, the 5am tamagoyaki stall, the temple at dawn. You speak quietly with great care.',
    voiceRate: 0.88, voicePitch: 1.1,
    greeting: 'Konnichiwa. I\'m Yuki. I will show you the Tokyo most travelers never see. Where shall we begin?',
    suggestions: ['Take me to Tokyo', 'I want to see Kyoto', 'Show me Mount Fuji', 'Tell me about Osaka'],
  },
  {
    id: 'amara', name: 'Amara', region: 'Africa', home: 'Arusha, Tanzania',
    accent: 'East African English, adventurous and grounded',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    color: 'from-emerald-500 to-amber-600',
    personality: 'an adventurous, grounded local from Arusha — gateway to the Serengeti. You\'ve watched the migration cross the Mara River 47 times.',
    voiceRate: 0.92, voicePitch: 0.98,
    greeting: 'Karibu! I\'m Amara, from Arusha. I\'ve watched the great migration cross the Mara River 47 times. Where shall I take you?',
    suggestions: ['Take me to Serengeti', 'I want to climb Kilimanjaro', 'Show me Zanzibar', 'Tell me about Marrakech'],
  },
  {
    id: 'sophie', name: 'Sophie', region: 'Europe', home: 'Lisbon',
    accent: 'Portuguese English, sophisticated and warm',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    color: 'from-indigo-500 to-purple-600',
    personality: 'a sophisticated, warm Lisboeta who knows the right wine, the right bookshop, the right bench at sunset. You introduce travelers to cities like old friends.',
    voiceRate: 0.94, voicePitch: 1.02,
    greeting: 'Olá! I\'m Sophie, from Lisbon. Europe is full of cities pretending to be old — I\'ll show you the ones that actually are. Where shall we begin?',
    suggestions: ['Take me to Lisbon', 'I want to see Paris', 'Show me Santorini', 'Tell me about Rome'],
  },
];

const HOME_BG = 'https://images.unsplash.com/photo-1556377483-9aacf8a08adf?w=1600&h=1000&fit=crop';

export default function VirtualTravel() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [muted, setMuted] = useState(false);
  const [bgImage, setBgImage] = useState(HOME_BG);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [transporting, setTransporting] = useState(false);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const autoListenRef = useRef(true);
  const finalBufferRef = useRef('');
  const messagesRef = useRef([]);
  const selectedAvatarRef = useRef(null);

  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { autoListenRef.current = autoListen; }, [autoListen]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { selectedAvatarRef.current = selectedAvatar; }, [selectedAvatar]);

  // === Image fetching ===
  const fetchLocationImage = useCallback(async (location) => {
    if (!location) return;
    try {
      setTransporting(true);
      const res = await fetch(`/api/location-image?location=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (data.image) {
        setBgImage(data.image);
        setCurrentLocation(data.title || location);
      }
    } catch (e) {
      console.error('Image fetch failed:', e);
    } finally {
      setTimeout(() => setTransporting(false), 800);
    }
  }, []);

  // === Voice synthesis ===
  const speak = useCallback((text, onComplete) => {
    if (!window.speechSynthesis || muted) {
      onComplete?.();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const a = selectedAvatarRef.current;
    u.rate = a?.voiceRate || 0.95;
    u.pitch = a?.voicePitch || 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) u.voice = preferred;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => {
      setIsSpeaking(false);
      onComplete?.();
    };
    u.onerror = () => {
      setIsSpeaking(false);
      onComplete?.();
    };
    window.speechSynthesis.speak(u);
  }, [muted]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // === Speech recognition setup ===
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';

    r.onstart = () => {
      setIsListening(true);
      finalBufferRef.current = '';
      setInterimText('');
    };

    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalBufferRef.current += t;
        } else {
          interim += t;
        }
      }
      setInterimText(interim);
    };

    r.onend = () => {
      setIsListening(false);
      setInterimText('');
      const finalText = finalBufferRef.current.trim();
      if (finalText) {
        sendMessage(finalText);
      } else if (autoListenRef.current && !isSpeakingRef.current) {
        // No speech detected, but auto-listen is on — try again after brief pause
        setTimeout(() => {
          if (autoListenRef.current && !isSpeakingRef.current && selectedAvatarRef.current) {
            try { r.start(); } catch {}
          }
        }, 1500);
      }
    };

    r.onerror = (e) => {
      setIsListening(false);
      if (e.error === 'no-speech' && autoListenRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (autoListenRef.current && !isSpeakingRef.current && selectedAvatarRef.current) {
            try { r.start(); } catch {}
          }
        }, 1500);
      }
    };

    recognitionRef.current = r;

    return () => {
      try { r.abort(); } catch {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || isSpeakingRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {}
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  const toggleAutoListen = () => {
    setAutoListen(prev => {
      if (prev) {
        stopListening();
        stopSpeaking();
      }
      return !prev;
    });
  };

  // === Send message to AI ===
  const sendMessage = useCallback(async (text) => {
    const a = selectedAvatarRef.current;
    if (!a || !text.trim()) return;

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...messagesRef.current, userMsg];
    setMessages(newMsgs);
    setIsThinking(true);

    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          avatar: { name: a.name, personality: a.personality, accent: a.accent, home: a.home, region: a.region },
          user: { name: user.name, travelStyles: user.travelStyles },
        })
      });
      const data = await res.json();
      const reply = data.response || `Tell me more about that.`;

      // Update background if location detected
      if (data.locations?.length > 0) {
        fetchLocationImage(data.locations[0]);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply, mood: data.mood }]);
      setIsThinking(false);

      // Speak the reply, then re-enable listening
      speak(reply, () => {
        if (autoListenRef.current) {
          setTimeout(() => startListening(), 600);
        }
      });
    } catch (e) {
      console.error(e);
      setIsThinking(false);
      const fallback = `I lost you for a second. Tell me again — where shall we go?`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speak(fallback, () => {
        if (autoListenRef.current) setTimeout(() => startListening(), 600);
      });
    }
  }, [user, fetchLocationImage, speak, startListening]);

  // === Pick avatar — start conversation ===
  const pickAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    selectedAvatarRef.current = avatar;
    setMessages([{ role: 'assistant', content: avatar.greeting }]);
    setBgImage(HOME_BG);
    setCurrentLocation(null);

    // Speak greeting, then start listening
    setTimeout(() => {
      speak(avatar.greeting, () => {
        if (autoListenRef.current) {
          setTimeout(() => startListening(), 400);
        }
      });
    }, 500);
  };

  const reset = () => {
    stopSpeaking();
    stopListening();
    setSelectedAvatar(null);
    selectedAvatarRef.current = null;
    setMessages([]);
    setBgImage(HOME_BG);
    setCurrentLocation(null);
  };

  const sendSuggestion = (text) => {
    stopSpeaking();
    stopListening();
    setTimeout(() => sendMessage(text), 200);
  };

  // === AVATAR SELECTION ===
  if (!selectedAvatar) {
    return (
      <div className="min-h-screen bg-cream pb-8">
        <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="relative">
            <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-wider">Virtual Travel · Voice Mode</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Talk to a Local</h1>
            <p className="text-white/50 text-sm mt-2 max-w-md">Pick a guide. Speak naturally. They'll transport you to any place you mention — voice in, scenes appear, real conversation.</p>
          </div>
        </div>

        <div className="content-px mt-6">
          <p className="text-sm font-bold text-navy mb-3">Meet your local guides</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVATARS.map((a, i) => (
              <button key={a.id} onClick={() => pickAvatar(a)}
                className={`relative rounded-3xl overflow-hidden text-left bg-gradient-to-br ${a.color} p-6 group active:scale-[0.98] transition-all shadow-xl animate-fade-up`}
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-3">
                    <img src={a.avatar} alt="" className="w-16 h-16 rounded-2xl border-2 border-white/30 object-cover shadow-lg" />
                    <div>
                      <p className="font-display text-2xl font-bold text-white">{a.name}</p>
                      <p className="text-white/80 text-xs flex items-center gap-1"><MapPin size={10} /> {a.region}</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{a.personality.split('.')[0]}.</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-5 bg-white rounded-3xl border border-gold/20 shadow-sm">
            <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Mic size={12} /> Voice-First Experience
            </p>
            <ul className="space-y-2 text-sm text-charcoal">
              <li>🎙️ Speak naturally — no buttons, just talk</li>
              <li>🌍 Mention any place ("Mahabalipuram", "Kilimanjaro") — the background changes instantly</li>
              <li>🗣️ Avatar speaks back with their accent and personality</li>
              <li>🔄 Continuous conversation — they listen as soon as they finish speaking</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // === LIVE CONVERSATION VIEW ===
  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-charcoal">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img
          key={bgImage}
          src={bgImage}
          alt=""
          className={`w-full h-full object-cover transition-all duration-[1500ms] ${transporting ? 'scale-110 blur-md opacity-60' : 'scale-100 blur-0 opacity-100 animate-fade-in'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
      </div>

      {/* Transport overlay */}
      {transporting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
          <div className="text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-gold/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin size={28} className="text-gold" />
              </div>
            </div>
            <p className="text-white font-display text-lg font-bold animate-pulse">Taking you there...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 content-px pt-12 pb-3 flex items-center gap-3">
        <button onClick={reset} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="relative">
          <img src={selectedAvatar.avatar} alt="" className={`w-12 h-12 rounded-xl border-2 border-gold object-cover transition-transform ${isSpeaking ? 'scale-110' : ''}`} />
          {isSpeaking && <div className="absolute inset-0 rounded-xl border-2 border-gold animate-ping" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm flex items-center gap-1.5 truncate">
            {selectedAvatar.name}
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSpeaking ? 'bg-gold animate-pulse' : isListening ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
          </p>
          <p className="text-white/60 text-[11px] truncate">
            {currentLocation ? (
              <span className="flex items-center gap-1"><MapPin size={9} className="text-gold" /> {currentLocation}</span>
            ) : (
              <span>{selectedAvatar.region}</span>
            )}
          </p>
        </div>

        {/* Mute toggle */}
        <button onClick={() => { setMuted(m => !m); stopSpeaking(); }}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          {muted ? <VolumeX size={14} className="text-white/60" /> : <Volume2 size={14} className="text-gold" />}
        </button>

        {/* Auto-listen toggle */}
        <button onClick={toggleAutoListen}
          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center ${autoListen ? 'bg-gold' : 'bg-black/40'}`}>
          {autoListen ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1 relative z-10 flex flex-col justify-end content-px pb-3 overflow-hidden">

        {/* Latest avatar message — large and centered */}
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !transporting && (
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-5 border border-white/10 animate-fade-up mb-3 max-h-[40vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <img src={selectedAvatar.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
              <span className="text-gold text-[10px] font-bold uppercase tracking-wider">{selectedAvatar.name}</span>
              {messages[messages.length - 1].mood && (
                <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{messages[messages.length - 1].mood}</span>
              )}
            </div>
            <p className="text-white text-base leading-relaxed">{messages[messages.length - 1].content}</p>
          </div>
        )}

        {/* User's last spoken message */}
        {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-end mb-3 animate-fade-up">
            <div className="bg-gold/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl max-w-[80%]">
              <p className="text-sm">{messages[messages.length - 1].content}</p>
            </div>
          </div>
        )}

        {/* Live transcript while listening */}
        {(isListening || interimText) && (
          <div className="flex justify-end mb-3">
            <div className="bg-white/15 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl max-w-[85%] border border-gold/30">
              <p className="text-sm">
                {interimText || <span className="text-white/40">Listening...</span>}
                <span className="inline-block ml-1 w-1.5 h-3 bg-gold animate-pulse rounded-sm align-middle" />
              </p>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 mb-3 animate-fade-up">
            <img src={selectedAvatar.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-full">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion chips (only when no user messages yet) */}
        {messages.filter(m => m.role === 'user').length === 0 && !isListening && !isSpeaking && !isThinking && (
          <div className="mb-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Try saying...</p>
            <div className="flex flex-wrap gap-2">
              {selectedAvatar.suggestions.map(s => (
                <button key={s} onClick={() => sendSuggestion(s)}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/15 active:scale-95 transition-transform">
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voice control bar */}
      <div className="relative z-10 pb-8 pt-3 px-5 bg-black/50 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => isListening ? stopListening() : startListening()}
            disabled={isSpeaking || isThinking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 ${
              isListening ? 'bg-red-500 shadow-2xl animate-pulse-gold' : 'gradient-gold shadow-2xl'
            }`}>
            {isListening ? <MicOff size={26} className="text-white" /> : <Mic size={26} className="text-white" />}
          </button>

          <div className="flex-1">
            <p className="text-white text-sm font-semibold">
              {isSpeaking ? `${selectedAvatar.name} is speaking...` :
               isThinking ? 'Thinking...' :
               isListening ? 'I\'m listening — speak naturally' :
               autoListen ? 'Tap mic or wait — I\'ll listen automatically' :
               'Tap mic to talk'}
            </p>
            <p className="text-white/50 text-[11px] mt-0.5">
              {autoListen ? '🟢 Continuous conversation on' : '⚪ Tap-to-talk mode'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
