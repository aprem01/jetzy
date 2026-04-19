import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import {
  ArrowLeft, Mic, MicOff, Sparkles, Volume2, VolumeX, MapPin, X,
  Pause, Play, ShoppingBag, Plus, Hotel, Plane, Mountain, Utensils,
  Users as UsersIcon, Bus, Trash2, PlayCircle, Subtitles, Captions,
  MessageSquare, MessageSquareOff, Video, VideoOff
} from 'lucide-react';
import { PATAGONIA_DEMO } from '../data/demoScript';
import { VOICES, voiceForPersona, playEleven, stopEleven, unlockAudio } from '../lib/elevenlabs';

const TYPE_ICONS = {
  hotel: Hotel, flight: Plane, experience: Mountain,
  restaurant: Utensils, fixer: UsersIcon, transport: Bus,
};

const SESSION_KEY = 'jetzy_avatar_session';
const CART_KEY = 'jetzy_cart';

const HOME_BG = 'https://images.unsplash.com/photo-1556377483-9aacf8a08adf?w=1600&h=1000&fit=crop';

// Default starting persona (matches API default)
const DEFAULT_PERSONA = {
  id: 'default',
  name: 'Aria',
  region: 'World',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  color: 'from-indigo-500 to-purple-600',
  voiceRate: 0.95, voicePitch: 1.0,
  accent: 'warm, neutral English',
};

const SUGGESTIONS = [
  'Take me to Chennai',
  'I want to see Hunza Valley',
  'Show me the Serengeti',
  'Tell me about Tokyo',
  'Plan a trip to Patagonia',
  'I\'ve always wanted to see Marrakech',
];

function parsePrice(p) {
  if (!p) return 0;
  const m = String(p).replace(/,/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export default function VirtualTravel() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  // Single morphing persona
  const [persona, setPersona] = useState(DEFAULT_PERSONA);
  const [previousPersona, setPreviousPersona] = useState(null);
  const [morphing, setMorphing] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [muted, setMuted] = useState(false);
  const [bgImage, setBgImage] = useState(HOME_BG);
  const [bgVideo, setBgVideo] = useState(null);
  const [videoOn, setVideoOn] = useState(() => {
    try { return localStorage.getItem('jetzy_video_bg') !== 'off'; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem('jetzy_video_bg', videoOn ? 'on' : 'off'); } catch {}
  }, [videoOn]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [transporting, setTransporting] = useState(false);
  const [sceneLabel, setSceneLabel] = useState(null); // { dayLabel, dayNumber }
  const [missionOverlay, setMissionOverlay] = useState(null); // { title, subtitle }
  const [caption, setCaption] = useState(null); // { speaker, text, kind: 'user'|'avatar', revealed }
  const [captionsOn, setCaptionsOn] = useState(() => {
    try { return localStorage.getItem('jetzy_captions') !== 'off'; } catch { return true; }
  });
  const [messagesOn, setMessagesOn] = useState(() => {
    try { return localStorage.getItem('jetzy_messages') !== 'off'; } catch { return true; }
  });
  const captionTypewriterRef = useRef(null);
  useEffect(() => {
    try { localStorage.setItem('jetzy_captions', captionsOn ? 'on' : 'off'); } catch {}
  }, [captionsOn]);
  useEffect(() => {
    try { localStorage.setItem('jetzy_messages', messagesOn ? 'on' : 'off'); } catch {}
  }, [messagesOn]);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved).items || [] : [];
    } catch { return []; }
  });
  const [showCart, setShowCart] = useState(false);
  const [cartPing, setCartPing] = useState(false);
  const [hasResumeSession, setHasResumeSession] = useState(false);

  // Demo mode
  const [demoMode, setDemoMode] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const demoModeRef = useRef(false);
  useEffect(() => { demoModeRef.current = demoMode; }, [demoMode]);

  // Shotstack render
  const [renderState, setRenderState] = useState('idle'); // idle, rendering, done, error
  const [renderUrl, setRenderUrl] = useState(null);
  const [renderProgress, setRenderProgress] = useState('');
  const [renderId, setRenderId] = useState(null);

  const startRender = async () => {
    setRenderState('rendering');
    setRenderUrl(null);
    setRenderProgress('Starting render...');
    try {
      const r = await fetch('/api/render-demo', { method: 'POST' });
      const data = await r.json();
      if (!data?.id) {
        setRenderState('error');
        setRenderProgress(data?.error || 'Failed to start render');
        return;
      }
      setRenderId(data.id);
      pollRender(data.id);
    } catch (e) {
      setRenderState('error');
      setRenderProgress(e.message);
    }
  };

  const pollRender = async (id) => {
    let tries = 0;
    const maxTries = 120; // ~6 minutes
    const tick = async () => {
      tries++;
      try {
        const r = await fetch(`/api/render-status?id=${id}`);
        const data = await r.json();
        const status = data?.status || 'unknown';
        setRenderProgress(`Status: ${status}${tries > 1 ? ` (${tries * 3}s)` : ''}`);
        if (status === 'done' && data.url) {
          setRenderState('done');
          setRenderUrl(data.url);
          setRenderProgress('Done!');
          return;
        }
        if (status === 'failed') {
          setRenderState('error');
          setRenderProgress(data.error || 'Render failed');
          return;
        }
        if (tries < maxTries) setTimeout(tick, 3000);
        else { setRenderState('error'); setRenderProgress('Timeout — render still pending. Check Shotstack dashboard.'); }
      } catch (e) {
        if (tries < maxTries) setTimeout(tick, 3000);
        else { setRenderState('error'); setRenderProgress(e.message); }
      }
    };
    tick();
  };

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const autoListenRef = useRef(true);
  const finalBufferRef = useRef('');
  const messagesRef = useRef([]);
  const personaRef = useRef(DEFAULT_PERSONA);
  const elevenAudioRef = useRef(null);
  const videoCacheRef = useRef(new Map()); // query → resolved video URL
  const sceneRotationRef = useRef(null); // setInterval id for in-scene video rotation

  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { autoListenRef.current = autoListen; }, [autoListen]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { personaRef.current = persona; }, [persona]);

  // Persist cart
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
      localStorage.setItem(CART_KEY, JSON.stringify({ ...existing, items: cart, savedAt: Date.now() }));
    } catch {}
  }, [cart]);

  // Re-sync cart on focus
  useEffect(() => {
    const sync = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
        setCart(saved.items || []);
      } catch {}
    };
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  // Check for resumable session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.messages?.length > 1 && Date.now() - (data.savedAt || 0) < 7 * 24 * 60 * 60 * 1000) {
          setHasResumeSession(true);
        }
      }
    } catch {}
  }, []);

  // Auto-save session
  useEffect(() => {
    if (!hasStarted || messages.length === 0) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        persona, messages, bgImage, currentLocation, savedAt: Date.now(),
      }));
    } catch {}
  }, [messages, persona, bgImage, currentLocation, hasStarted]);

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

  // === Voice synthesis (ElevenLabs primary, browser fallback) ===
  const speak = useCallback(async (text, onComplete) => {
    if (muted) { onComplete?.(); return; }

    const voiceConfig = voiceForPersona(personaRef.current?.id);

    // Try ElevenLabs first
    try {
      stopEleven(elevenAudioRef);
      await playEleven({
        text,
        voiceId: voiceConfig.id,
        settings: voiceConfig.settings,
        audioRef: elevenAudioRef,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
      onComplete?.();
      return;
    } catch {}

    // Fallback to browser
    if (!window.speechSynthesis) { onComplete?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const p = personaRef.current;
    u.rate = p?.voiceRate || 0.95;
    u.pitch = p?.voicePitch || 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) u.voice = preferred;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => { setIsSpeaking(false); onComplete?.(); };
    u.onerror = () => { setIsSpeaking(false); onComplete?.(); };
    window.speechSynthesis.speak(u);
  }, [muted]);

  const stopSpeaking = useCallback(() => {
    stopEleven(elevenAudioRef);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setUserSpeaking(false);
  }, []);

  // === Speech recognition ===
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
        if (e.results[i].isFinal) finalBufferRef.current += t;
        else interim += t;
      }
      setInterimText(interim);
    };

    r.onend = () => {
      setIsListening(false);
      setInterimText('');
      const finalText = finalBufferRef.current.trim();
      if (finalText) {
        sendMessage(finalText);
      } else if (autoListenRef.current && !isSpeakingRef.current && hasStarted) {
        setTimeout(() => {
          if (autoListenRef.current && !isSpeakingRef.current) {
            try { r.start(); } catch {}
          }
        }, 1500);
      }
    };

    r.onerror = (e) => {
      setIsListening(false);
      if (e.error === 'no-speech' && autoListenRef.current && !isSpeakingRef.current && hasStarted) {
        setTimeout(() => {
          if (autoListenRef.current && !isSpeakingRef.current) {
            try { r.start(); } catch {}
          }
        }, 1500);
      }
    };

    recognitionRef.current = r;
    return () => { try { r.abort(); } catch {} };
  }, [hasStarted]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || isSpeakingRef.current) return;
    try { recognitionRef.current.start(); } catch {}
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  const toggleAutoListen = () => {
    setAutoListen(prev => {
      if (prev) { stopListening(); stopSpeaking(); }
      return !prev;
    });
  };

  // === Cart ===
  const addToCart = (items) => {
    if (!items?.length) return;
    setCart(prev => {
      const existing = new Set(prev.map(i => i.name?.toLowerCase()));
      const newItems = items.filter(i => i.name && !existing.has(i.name.toLowerCase()));
      if (newItems.length > 0) {
        setCartPing(true);
        setTimeout(() => setCartPing(false), 1500);
      }
      return [...prev, ...newItems];
    });
  };
  const removeFromCart = (idx) => setCart(prev => prev.filter((_, i) => i !== idx));
  const cartTotal = cart.reduce((s, it) => s + parsePrice(it.price), 0);

  // === Persona morph ===
  const morphPersona = (newPersona) => {
    if (!newPersona || newPersona.id === personaRef.current.id) return;
    setPreviousPersona(personaRef.current);
    setMorphing(true);
    setTimeout(() => {
      setPersona(newPersona);
      personaRef.current = newPersona;
    }, 300);
    setTimeout(() => {
      setMorphing(false);
      setPreviousPersona(null);
    }, 1100);
  };

  // === Demo runner — chained, both voices, real conversation feel ===
  const stopDemo = useCallback(() => {
    demoModeRef.current = false;
    setDemoMode(false);
    setUserSpeaking(false);
    setMissionOverlay(null);
    setCaption(null);
    if (captionTypewriterRef.current) {
      clearInterval(captionTypewriterRef.current);
      captionTypewriterRef.current = null;
    }
    if (sceneRotationRef.current) {
      clearInterval(sceneRotationRef.current);
      sceneRotationRef.current = null;
    }
    stopEleven(elevenAudioRef);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // Typewriter reveal — synced approximately to expected speech duration
  const showCaption = (speaker, text, kind, durationMs) => {
    // Clear any prior typewriter
    if (captionTypewriterRef.current) {
      clearInterval(captionTypewriterRef.current);
      captionTypewriterRef.current = null;
    }
    setCaption({ speaker, text, kind, revealed: '' });
    if (!text) return;

    // Estimate duration if not provided: ~110ms per char
    const total = Math.max(durationMs || text.length * 110, 1000);
    const stepMs = 35;
    const charsPerStep = Math.max(1, Math.ceil(text.length / (total / stepMs)));
    let i = 0;
    captionTypewriterRef.current = setInterval(() => {
      i = Math.min(i + charsPerStep, text.length);
      setCaption(c => c && c.text === text ? { ...c, revealed: text.slice(0, i) } : c);
      if (i >= text.length) {
        clearInterval(captionTypewriterRef.current);
        captionTypewriterRef.current = null;
      }
    }, stepMs);
  };

  const clearCaption = () => {
    if (captionTypewriterRef.current) {
      clearInterval(captionTypewriterRef.current);
      captionTypewriterRef.current = null;
    }
    setCaption(null);
  };

  // === Voice picker — strong gender contrast ===
  const [voicesReady, setVoicesReady] = useState(false);
  const [pickedVoices, setPickedVoices] = useState({ user: null, avatar: null });

  // Wait for voices to load (Chrome loads async)
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const refresh = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoicesReady(true);
        setPickedVoices({
          user: pickVoice('user'),
          avatar: pickVoice('avatar'),
        });
      }
    };
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
  }, []);

  const MALE_NAMES = ['daniel', 'alex', 'david', 'mark', 'james', 'matthew', 'fred', 'ralph', 'aaron', 'arthur', 'oliver', 'george', 'thomas', 'guy', 'ryan', 'gordon', 'rocko', 'reed', 'eddy', 'lee', 'rishi', 'edward', 'sean', 'jamie', 'tom', 'man'];
  const FEMALE_NAMES = ['samantha', 'karen', 'zira', 'susan', 'kate', 'serena', 'allison', 'ava', 'victoria', 'tessa', 'fiona', 'moira', 'olivia', 'jenny', 'catherine', 'kathy', 'helena', 'flo', 'rocko', 'ariana', 'emma', 'sandy', 'shelley', 'grandma', 'woman'];

  function pickVoice(kind) {
    const voices = window.speechSynthesis?.getVoices() || [];
    const en = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    const isMale = (n) => MALE_NAMES.some(p => n.toLowerCase().includes(p)) || n.toLowerCase().includes('male') && !n.toLowerCase().includes('female');
    const isFemale = (n) => FEMALE_NAMES.some(p => n.toLowerCase().includes(p)) || n.toLowerCase().includes('female');

    if (kind === 'user') {
      // Marco: explicit male voice. Prefer macOS/iOS Daniel, Alex, then Win/Chrome equivalents
      return en.find(v => v.name === 'Daniel') ||
             en.find(v => v.name === 'Alex') ||
             en.find(v => v.name === 'Fred') ||
             en.find(v => /Google UK English Male/i.test(v.name)) ||
             en.find(v => /Microsoft.+(David|Mark|Guy|James)/i.test(v.name)) ||
             en.find(v => isMale(v.name)) ||
             en.find(v => v.lang === 'en-GB' && !isFemale(v.name)) ||
             en[0] || voices[0];
    }
    // Avatar: explicit female voice. Prefer Samantha, Karen, Zira
    return en.find(v => v.name === 'Samantha') ||
           en.find(v => v.name === 'Karen') ||
           en.find(v => v.name === 'Tessa') ||
           en.find(v => v.name === 'Victoria') ||
           en.find(v => v.name === 'Allison') ||
           en.find(v => /Google US English/i.test(v.name)) ||
           en.find(v => /Microsoft.+(Zira|Aria|Jenny|Jessa)/i.test(v.name)) ||
           en.find(v => isFemale(v.name)) ||
           en.find(v => v.lang === 'en-US' && !isMale(v.name)) ||
           en[0] || voices[0];
  }

  // Speak and resolve when finished
  // Primary path: ElevenLabs (high quality voices)
  // Fallback: browser SpeechSynthesis if ElevenLabs fails or is muted
  const speakAndWait = async (text, kind = 'avatar') => {
    if (muted) return;

    const onStart = () => kind === 'user' ? setUserSpeaking(true) : setIsSpeaking(true);
    const onEnd = () => kind === 'user' ? setUserSpeaking(false) : setIsSpeaking(false);

    // Pick voice config
    let voiceConfig;
    if (kind === 'user') {
      voiceConfig = VOICES.marco;
    } else {
      voiceConfig = voiceForPersona(personaRef.current?.id);
    }

    // Try ElevenLabs first
    try {
      stopEleven(elevenAudioRef);
      await playEleven({
        text,
        voiceId: voiceConfig.id,
        settings: voiceConfig.settings,
        audioRef: elevenAudioRef,
        onStart,
        onEnd,
      });
      return;
    } catch (e) {
      console.warn('ElevenLabs unavailable, using browser TTS:', e.message);
    }

    // Fallback: browser SpeechSynthesis
    if (!window.speechSynthesis) {
      onEnd();
      return;
    }
    return new Promise(resolve => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);

      if (kind === 'user') {
        u.rate = 1.05;
        u.pitch = 0.7;
        u.voice = pickedVoices.user || pickVoice('user');
      } else {
        const p = personaRef.current;
        u.rate = (p?.voiceRate || 0.95) * 0.97;
        u.pitch = Math.max(1.15, (p?.voicePitch || 1.0) + 0.1);
        u.voice = pickedVoices.avatar || pickVoice('avatar');
      }

      u.onstart = onStart;
      u.onend = () => { onEnd(); resolve(); };
      u.onerror = () => { onEnd(); resolve(); };

      window.speechSynthesis.speak(u);
      setTimeout(() => resolve(), Math.max(text.length * 100, 5000));
    });
  };

  // Quick voice preview (used on entry screen) — ElevenLabs first, browser fallback
  const previewVoice = async (kind) => {
    const text = kind === 'user'
      ? "Hey, this is Marco. I'm planning a trip to Patagonia."
      : "Hi Marco, I'm your travel companion. I'll take you anywhere.";
    const voiceConfig = kind === 'user' ? VOICES.marco : VOICES.default;

    try {
      stopEleven(elevenAudioRef);
      await playEleven({
        text,
        voiceId: voiceConfig.id,
        settings: voiceConfig.settings,
        audioRef: elevenAudioRef,
      });
      return;
    } catch {}

    // Fallback to browser
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (kind === 'user') {
      u.rate = 1.05; u.pitch = 0.7;
      u.voice = pickedVoices.user || pickVoice('user');
    } else {
      u.rate = 0.92; u.pitch = 1.15;
      u.voice = pickedVoices.avatar || pickVoice('avatar');
    }
    window.speechSynthesis.speak(u);
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const runDemo = useCallback(async () => {
    // Reset state
    try { localStorage.removeItem(CART_KEY); } catch {}
    setCart([]);
    setMessages([]);
    setHasStarted(true);
    setAutoListen(false);
    setMuted(false);
    setBgImage(HOME_BG);
    setBgVideo(null);
    setCurrentLocation(null);
    setSceneLabel(null);
    setMissionOverlay(null);
    setPersona(DEFAULT_PERSONA);
    personaRef.current = DEFAULT_PERSONA;
    setDemoMode(true);
    demoModeRef.current = true;

    // Initial settle
    await sleep(800);

    for (const step of PATAGONIA_DEMO) {
      if (!demoModeRef.current) return;

      if (step.type === 'avatar') {
        if (step.persona) {
          setPersona(step.persona);
          personaRef.current = step.persona;
        }
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: step.text,
          mood: step.mood,
          addedItems: step.cartItems || [],
          persona: personaRef.current,
        }]);
        if (step.cartItems?.length) addToCart(step.cartItems);
        await sleep(150);
        showCaption(personaRef.current?.name || 'Aria', step.text, 'avatar');
        await speakAndWait(step.text, 'avatar');
        clearCaption();
      }

      else if (step.type === 'user') {
        setMessages(prev => [...prev, { role: 'user', content: step.text }]);
        await sleep(150);
        showCaption('Marco', step.text, 'user');
        await speakAndWait(step.text, 'user');
        clearCaption();
      }

      else if (step.type === 'morph') {
        morphPersona(step.persona);
        await sleep(1100); // morph animation duration
      }

      else if (step.type === 'background') {
        // Stop any prior in-scene rotation
        if (sceneRotationRef.current) {
          clearInterval(sceneRotationRef.current);
          sceneRotationRef.current = null;
        }

        setTransporting(true);
        setBgImage(step.image);
        setCurrentLocation(step.location);
        if (step.dayLabel) {
          setSceneLabel({ dayLabel: step.dayLabel, dayNumber: step.dayNumber, location: step.location });
        }

        // Resolve to a list of video URLs for this scene
        // Priority: explicit `videos` array > explicit `video` > queries[] > query
        let videoUrls = [];

        if (Array.isArray(step.videos) && step.videos.length) {
          videoUrls = step.videos;
        } else if (step.video) {
          videoUrls = [step.video];
        } else if (Array.isArray(step.queries) && step.queries.length) {
          // Fetch all queries in parallel — each becomes one video in the rotation
          const results = await Promise.all(
            step.queries.map(async (q) => {
              const cached = videoCacheRef.current.get(q);
              if (cached) return cached;
              try {
                const r = await fetch(`/api/find-video?q=${encodeURIComponent(q)}`);
                const data = await r.json();
                if (data?.url) {
                  videoCacheRef.current.set(q, data.url);
                  return data.url;
                }
              } catch {}
              return null;
            })
          );
          videoUrls = results.filter(Boolean);
        } else if (step.query) {
          const cached = videoCacheRef.current.get(step.query);
          if (cached) {
            videoUrls = [cached];
          } else {
            try {
              const r = await fetch(`/api/find-video?q=${encodeURIComponent(step.query)}&n=3`);
              const data = await r.json();
              if (data?.urls?.length) {
                videoUrls = data.urls;
                videoCacheRef.current.set(step.query, data.urls[0]);
              } else if (data?.url) {
                videoUrls = [data.url];
                videoCacheRef.current.set(step.query, data.url);
              }
            } catch {}
          }
        }

        // Set the first video immediately
        if (videoUrls.length > 0) {
          setBgVideo(videoUrls[0]);
        } else {
          setBgVideo(null);
        }

        // If multiple videos, rotate every 14s (slow + comfortable)
        if (videoUrls.length > 1) {
          let idx = 0;
          sceneRotationRef.current = setInterval(() => {
            idx = (idx + 1) % videoUrls.length;
            setBgVideo(videoUrls[idx]);
          }, 14000);
        }

        // Fire-and-forget pre-fetch of upcoming scenes' first queries
        try {
          const upcoming = PATAGONIA_DEMO
            .slice(PATAGONIA_DEMO.indexOf(step) + 1)
            .filter(s => s.type === 'background' && (s.query || (Array.isArray(s.queries) && s.queries.length)))
            .slice(0, 2);
          upcoming.forEach(s => {
            const q = s.query || s.queries[0];
            if (videoCacheRef.current.has(q)) return;
            fetch(`/api/find-video?q=${encodeURIComponent(q)}`)
              .then(r => r.json())
              .then(d => { if (d?.url) videoCacheRef.current.set(q, d.url); })
              .catch(() => {});
          });
        } catch {}

        await sleep(1200);
        setTransporting(false);
      }

      else if (step.type === 'mission') {
        setMissionOverlay({ title: step.title, subtitle: step.subtitle });
        await sleep(step.pause || 3000);
        setMissionOverlay(null);
        continue; // skip the post-step pause since we already waited
      }

      else if (step.type === 'goto') {
        setMissionOverlay(null);
        setDemoMode(false);
        demoModeRef.current = false;
        navigate(step.path);
        return;
      }

      if (step.pause && demoModeRef.current) {
        await sleep(step.pause);
      }
    }
  }, [muted, navigate]);

  // === Send message ===
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

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
          currentPersonaId: personaRef.current.id,
          user: { name: user.name, travelStyles: user.travelStyles },
        })
      });
      const data = await res.json();

      // Morph persona FIRST if changed
      if (data.persona && data.persona.id !== personaRef.current.id) {
        morphPersona(data.persona);
      }

      // Background image
      if (data.locations?.length > 0) {
        fetchLocationImage(data.locations[0]);
      }

      // Cart items
      if (data.cartItems?.length > 0) {
        addToCart(data.cartItems);
      }

      const reply = data.response || `Tell me more.`;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        mood: data.mood,
        addedItems: data.cartItems || [],
        persona: data.persona,
      }]);
      setIsThinking(false);

      // Wait briefly for persona to settle, then speak with new voice
      setTimeout(() => {
        speak(reply, () => {
          if (autoListenRef.current) setTimeout(() => startListening(), 600);
        });
      }, data.persona && data.persona.id !== personaRef.current.id ? 800 : 100);
    } catch (e) {
      console.error(e);
      setIsThinking(false);
      const fallback = `I lost you for a moment. Tell me again — where would you like to go?`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speak(fallback, () => {
        if (autoListenRef.current) setTimeout(() => startListening(), 600);
      });
    }
  }, [user, fetchLocationImage, speak, startListening]);

  // === Start conversation ===
  const startConversation = () => {
    setHasStarted(true);
    const greeting = `Hi ${user.name?.split(' ')[0] || 'there'} — I'm your travel companion. Tell me about a place you've been dreaming about, and I'll take you there. Anywhere in the world.`;
    setMessages([{ role: 'assistant', content: greeting, persona: DEFAULT_PERSONA }]);
    setTimeout(() => {
      speak(greeting, () => {
        if (autoListenRef.current) setTimeout(() => startListening(), 400);
      });
    }, 500);
  };

  const resumeSession = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
      const restoredPersona = saved.persona || DEFAULT_PERSONA;
      setPersona(restoredPersona);
      personaRef.current = restoredPersona;
      setMessages(saved.messages || []);
      messagesRef.current = saved.messages || [];
      setBgImage(saved.bgImage || HOME_BG);
      setCurrentLocation(saved.currentLocation || null);
      setHasResumeSession(false);
      setHasStarted(true);
      setTimeout(() => {
        if (autoListenRef.current) startListening();
      }, 800);
    } catch {}
  };

  const dismissResume = () => {
    setHasResumeSession(false);
    localStorage.removeItem(SESSION_KEY);
  };

  const reset = () => {
    stopSpeaking();
    stopListening();
    setHasStarted(false);
    setMessages([]);
    setPersona(DEFAULT_PERSONA);
    personaRef.current = DEFAULT_PERSONA;
    setBgImage(HOME_BG);
    setCurrentLocation(null);
  };

  const sendSuggestion = (text) => {
    stopSpeaking();
    stopListening();
    setTimeout(() => sendMessage(text), 200);
  };

  // === ENTRY VIEW (before starting) ===
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-cream pb-8">
        <div className="gradient-navy content-px pt-12 pb-10 rounded-b-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="relative">
            <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-wider">Virtual Travel</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Your Travel Companion</h1>
            <p className="text-white/60 text-sm mt-2 max-w-md leading-relaxed">
              One guide. Every destination. As you mention places, your companion becomes a local from there — name, voice, accent, personality, all morphing in real time.
            </p>

            {/* Animated avatar preview — shows the morph */}
            <div className="mt-8 flex items-center justify-center gap-3">
              {[
                'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-gold/40 object-cover animate-fade-up shadow-xl"
                  style={{ animationDelay: `${i * 0.12}s`, transform: `translateY(${i % 2 === 0 ? '-4px' : '4px'})` }}
                />
              ))}
            </div>
            <p className="text-white/40 text-[10px] text-center mt-2">One companion. Many faces.</p>
          </div>
        </div>

        <div className="content-px mt-6">
          {/* Resume session */}
          {hasResumeSession && (() => {
            try {
              const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
              const p = saved.persona || DEFAULT_PERSONA;
              const ago = Math.round((Date.now() - (saved.savedAt || 0)) / 60000);
              const agoLabel = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago/60)}h ago` : `${Math.round(ago/1440)}d ago`;
              return (
                <div className="mb-5 p-4 bg-white rounded-2xl border border-gold/30 shadow-md flex items-center gap-3 animate-fade-up">
                  <img src={p.avatar} alt="" className="w-12 h-12 rounded-xl border-2 border-gold object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Resume your conversation</p>
                    <p className="text-sm font-semibold text-charcoal truncate">{p.name} · {saved.currentLocation || p.region}</p>
                    <p className="text-[10px] text-charcoal-light">{saved.messages?.length || 0} messages · {agoLabel}</p>
                  </div>
                  <button onClick={resumeSession} className="px-4 py-2.5 gradient-gold rounded-xl text-white text-xs font-bold active:scale-95">Continue</button>
                  <button onClick={dismissResume} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center"><X size={14} className="text-charcoal-light" /></button>
                </div>
              );
            } catch { return null; }
          })()}

          {/* Saved cart */}
          {cart.length > 0 && (
            <div className="mb-5">
              <button onClick={() => navigate('/itinerary')}
                className="w-full p-4 bg-charcoal rounded-2xl shadow-md flex items-center gap-3 active:scale-[0.99] transition-transform">
                <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-gold font-bold uppercase tracking-wider">Your saved trip</p>
                  <p className="text-sm font-semibold text-white">{cart.length} items · ${cartTotal.toLocaleString()}</p>
                </div>
                <span className="text-gold text-sm font-bold">Review →</span>
              </button>
            </div>
          )}

          {/* Big start button */}
          <button onClick={() => { unlockAudio(); startConversation(); }}
            className="w-full p-6 gradient-gold rounded-3xl text-white shadow-2xl active:scale-[0.98] transition-transform mb-3">
            <Mic size={32} className="mx-auto mb-2" />
            <p className="font-display text-xl font-bold">Start the Conversation</p>
            <p className="text-white/80 text-sm mt-1">Just speak. Your companion will listen.</p>
          </button>

          {/* Auto-demo button */}
          <button onClick={() => { unlockAudio(); runDemo(); }}
            className="w-full p-4 bg-charcoal rounded-2xl text-white shadow-lg active:scale-[0.98] transition-transform mb-5 border border-gold/30">
            <div className="flex items-center justify-center gap-3">
              <PlayCircle size={22} className="text-gold" />
              <div className="text-left">
                <p className="font-bold text-sm">Watch the Auto Demo</p>
                <p className="text-white/50 text-[11px]">10-day Argentina journey — both voices · 2 min</p>
              </div>
            </div>
          </button>

          {/* Shotstack render — Generate shareable MP4 */}
          <div className="mb-3">
            {renderState === 'idle' && (
              <button onClick={startRender}
                className="w-full p-4 bg-white border-2 border-charcoal rounded-2xl shadow-md active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-charcoal flex items-center justify-center">
                    <PlayCircle size={18} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-charcoal">Generate Shareable Video</p>
                    <p className="text-charcoal-light text-[11px]">Render an MP4 to share — takes 1-3 min</p>
                  </div>
                </div>
              </button>
            )}
            {renderState === 'rendering' && (
              <div className="w-full p-4 bg-white border border-gold/30 rounded-2xl shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center animate-pulse">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm text-charcoal">Rendering your video...</p>
                    <p className="text-charcoal-light text-[11px]">{renderProgress}</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-cream rounded-full overflow-hidden">
                  <div className="h-full gradient-gold animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-[10px] text-charcoal-light mt-1.5 text-center">First render usually takes 90-180 seconds</p>
              </div>
            )}
            {renderState === 'done' && renderUrl && (
              <div className="w-full p-4 bg-white border-2 border-green-500 rounded-2xl shadow-md animate-fade-up">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2 text-center">✓ Video Ready</p>
                <video controls src={renderUrl} className="w-full rounded-xl mb-2" preload="metadata" />
                <div className="flex gap-2">
                  <a href={renderUrl} target="_blank" rel="noreferrer" download
                    className="flex-1 py-2.5 gradient-gold rounded-xl text-white text-xs font-bold text-center active:scale-95 transition-transform">
                    Download MP4
                  </a>
                  <button onClick={() => { navigator.clipboard?.writeText(renderUrl); }}
                    className="flex-1 py-2.5 bg-charcoal rounded-xl text-white text-xs font-bold active:scale-95 transition-transform">
                    Copy Link
                  </button>
                </div>
                <button onClick={() => { setRenderState('idle'); setRenderUrl(null); }}
                  className="w-full mt-2 py-1.5 text-[10px] text-charcoal-light">Render again</button>
              </div>
            )}
            {renderState === 'error' && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-xs font-bold text-red-700 mb-1">Render failed</p>
                <p className="text-[11px] text-red-600">{renderProgress}</p>
                <button onClick={() => setRenderState('idle')} className="mt-2 text-xs text-charcoal-light underline">Try again</button>
              </div>
            )}
          </div>

          {/* Voice preview — ElevenLabs */}
          <div className="p-4 bg-white rounded-2xl border border-gold/30 shadow-sm mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider flex items-center gap-1">
                <Volume2 size={11} className="text-gold" /> Demo Voices
              </p>
              <span className="text-[9px] font-bold bg-gold/15 text-gold px-2 py-0.5 rounded-full uppercase tracking-wider">ElevenLabs HD</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { unlockAudio(); previewVoice('user'); }}
                className="p-3 bg-cream rounded-xl text-left active:scale-95 transition-transform border border-gray-100">
                <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">Marco · You</p>
                <p className="text-xs font-semibold text-charcoal mt-0.5 truncate">Adam — deep male</p>
                <p className="text-[10px] text-gold mt-1 flex items-center gap-1"><Play size={9} /> Tap to hear</p>
              </button>
              <button onClick={() => { unlockAudio(); previewVoice('avatar'); }}
                className="p-3 bg-cream rounded-xl text-left active:scale-95 transition-transform border border-gray-100">
                <p className="text-[10px] font-bold text-charcoal-light uppercase tracking-wider">Aria · Avatar</p>
                <p className="text-xs font-semibold text-charcoal mt-0.5 truncate">Rachel — warm female</p>
                <p className="text-[10px] text-gold mt-1 flex items-center gap-1"><Play size={9} /> Tap to hear</p>
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="p-5 bg-white rounded-3xl border border-gold/20 shadow-sm">
            <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> How the morph works
            </p>
            <div className="space-y-2.5 text-sm text-charcoal">
              <div className="flex items-start gap-2"><span className="text-gold font-bold">1.</span> Say a destination — <em>"Take me to Chennai"</em></div>
              <div className="flex items-start gap-2"><span className="text-gold font-bold">2.</span> Your companion morphs into a local from that region — face, name, voice, accent</div>
              <div className="flex items-start gap-2"><span className="text-gold font-bold">3.</span> The screen transforms to that place. They speak about it from the inside</div>
              <div className="flex items-start gap-2"><span className="text-gold font-bold">4.</span> Mention another country — they morph again. Same continuous conversation.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === LIVE CONVERSATION VIEW ===
  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-charcoal">
      {/* Cinematic background — video preferred, image as poster/fallback
          Smooth 1.2s opacity crossfade between video swaps */}
      <div className="absolute inset-0">
        {videoOn && bgVideo ? (
          <video
            key={bgVideo}
            src={bgVideo}
            poster={bgImage}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ transition: 'opacity 1200ms ease-in-out' }}
            className={`w-full h-full object-cover ${transporting ? 'scale-110 blur-md opacity-60 transition-all duration-[1500ms]' : 'scale-100 blur-0 opacity-100 animate-fade-in'}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <img
            key={bgImage}
            src={bgImage}
            alt=""
            className={`w-full h-full object-cover transition-all duration-[1500ms] ${transporting ? 'scale-110 blur-md opacity-60' : 'scale-100 blur-0 opacity-100 animate-fade-in'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
      </div>

      {/* Transport overlay (with day label if available) */}
      {transporting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-gold/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin size={28} className="text-gold" />
              </div>
            </div>
            {sceneLabel ? (
              <>
                <p className="text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-1">
                  Day {sceneLabel.dayNumber}
                </p>
                <p className="text-white font-display text-2xl font-bold drop-shadow-2xl">
                  {sceneLabel.location}
                </p>
              </>
            ) : (
              <p className="text-white font-display text-lg font-bold animate-pulse">Taking you there...</p>
            )}
          </div>
        </div>
      )}

      {/* Persistent day chip (when in a destination) */}
      {!transporting && sceneLabel && demoMode && (
        <div className="absolute top-28 left-5 z-20 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-gold/30 animate-fade-up">
          <p className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            {sceneLabel.dayLabel}
          </p>
        </div>
      )}

      {/* Mission statement overlay (cinematic, full-screen) */}
      {missionOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-none animate-fade-in">
          <div className="text-center max-w-2xl content-px">
            <div className="w-12 h-12 rounded-full gradient-gold mx-auto flex items-center justify-center mb-6 shadow-2xl animate-pulse">
              <Sparkles size={20} className="text-white" />
            </div>
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">JETZY</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight animate-fade-up">
              {missionOverlay.title}
            </h2>
            {missionOverlay.subtitle && (
              <p className="text-white/70 text-base md:text-xl mt-5 leading-relaxed animate-fade-up" style={{ animationDelay: '0.4s' }}>
                {missionOverlay.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Persona morph overlay */}
      {morphing && previousPersona && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-none animate-fade-in">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Old face fading out */}
              <img src={previousPersona.avatar} alt=""
                className="absolute inset-0 w-32 h-32 rounded-3xl object-cover border-4 border-gold opacity-60 animate-fade-up"
                style={{ animationDuration: '600ms' }} />
              {/* New face fading in on top */}
              <img src={persona.avatar} alt=""
                className="absolute inset-0 w-32 h-32 rounded-3xl object-cover border-4 border-gold shadow-2xl animate-scale-in"
                style={{ animationDelay: '300ms' }} />
              <div className="absolute -inset-3 rounded-3xl border-2 border-gold/40 animate-ping" />
            </div>
            <p className="text-white font-display text-xl font-bold">{persona.name}</p>
            <p className="text-gold text-xs mt-1">your local in {persona.region}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 content-px pt-12 pb-3 flex items-center gap-3">
        <button onClick={reset} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="relative">
          <img
            key={persona.avatar}
            src={persona.avatar}
            alt=""
            className={`w-12 h-12 rounded-xl border-2 border-gold object-cover transition-all duration-500 ${isSpeaking ? 'scale-110' : ''}`}
          />
          {isSpeaking && <div className="absolute inset-0 rounded-xl border-2 border-gold animate-ping" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm flex items-center gap-1.5 truncate">
            {persona.name}
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSpeaking ? 'bg-gold animate-pulse' : isListening ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
          </p>
          <p className="text-white/60 text-[11px] truncate">
            {currentLocation ? (
              <span className="flex items-center gap-1"><MapPin size={9} className="text-gold" /> {currentLocation}</span>
            ) : (
              <span>{persona.region}</span>
            )}
          </p>
        </div>

        <button onClick={() => setShowCart(true)}
          className={`relative w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${cartPing ? 'bg-gold animate-pulse-gold scale-110' : 'bg-black/40'}`}>
          <ShoppingBag size={14} className="text-gold" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gold text-charcoal rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg">
              {cart.length}
            </span>
          )}
        </button>

        <button onClick={() => { setMuted(m => !m); stopSpeaking(); }}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          {muted ? <VolumeX size={14} className="text-white/60" /> : <Volume2 size={14} className="text-gold" />}
        </button>

        {/* Messages bubble toggle */}
        <button onClick={() => setMessagesOn(m => !m)}
          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${messagesOn ? 'bg-gold' : 'bg-black/40'}`}
          aria-label="Toggle message bubble">
          {messagesOn
            ? <MessageSquare size={14} className="text-white" />
            : <MessageSquareOff size={14} className="text-white/60" />}
        </button>

        {/* Video background toggle */}
        <button onClick={() => setVideoOn(v => !v)}
          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${videoOn ? 'bg-gold' : 'bg-black/40'}`}
          aria-label="Toggle video background">
          {videoOn
            ? <Video size={14} className="text-white" />
            : <VideoOff size={14} className="text-white/60" />}
        </button>

        {/* CC / Captions toggle */}
        <button onClick={() => setCaptionsOn(c => !c)}
          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${captionsOn ? 'bg-gold' : 'bg-black/40'}`}
          aria-label="Toggle captions">
          <Captions size={14} className={captionsOn ? 'text-white' : 'text-white/60'} />
        </button>

        <button onClick={toggleAutoListen}
          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center ${autoListen ? 'bg-gold' : 'bg-black/40'}`}>
          {autoListen ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
        </button>
      </div>

      <div className="flex-1 relative z-10 flex flex-col justify-end content-px pb-3 overflow-hidden">
        {/* Latest avatar message */}
        {messagesOn && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !transporting && (
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-5 border border-white/10 animate-fade-up mb-3 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <img src={persona.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
              <span className="text-gold text-[10px] font-bold uppercase tracking-wider">{persona.name}</span>
              {messages[messages.length - 1].mood && (
                <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{messages[messages.length - 1].mood}</span>
              )}
            </div>
            <p className="text-white text-base leading-relaxed">{messages[messages.length - 1].content}</p>

            {messages[messages.length - 1].addedItems?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 animate-fade-up">
                <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Plus size={10} /> Added to your trip
                </p>
                {messages[messages.length - 1].addedItems.map((it, i) => {
                  const Icon = TYPE_ICONS[it.type] || Mountain;
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gold/10 rounded-lg border border-gold/20">
                      <Icon size={12} className="text-gold flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{it.name}</p>
                        <p className="text-[10px] text-white/60 truncate">{it.detail}</p>
                      </div>
                      <span className="text-xs font-bold text-gold flex-shrink-0">{it.price}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* User's last message */}
        {messagesOn && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-end mb-3 animate-fade-up">
            <div className={`backdrop-blur-md text-white px-4 py-2.5 rounded-2xl max-w-[80%] transition-all ${
              userSpeaking ? 'bg-gold shadow-2xl scale-[1.02] ring-2 ring-gold/40' : 'bg-gold/90'
            }`}>
              {userSpeaking && (
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Marco · speaking
                </p>
              )}
              <p className="text-sm">{messages[messages.length - 1].content}</p>
            </div>
          </div>
        )}

        {/* Live transcript */}
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

        {/* Thinking */}
        {isThinking && (
          <div className="flex items-center gap-2 mb-3 animate-fade-up">
            <img src={persona.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-full">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggestions on first turn */}
        {messages.filter(m => m.role === 'user').length === 0 && !isListening && !isSpeaking && !isThinking && (
          <div className="mb-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">Try saying...</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendSuggestion(s)}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/15 active:scale-95 transition-transform">
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cinematic caption strip (CC) */}
      {captionsOn && caption && caption.text && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 max-w-3xl w-full px-5 pointer-events-none animate-fade-up">
          <div className={`mx-auto rounded-2xl backdrop-blur-md border shadow-2xl px-5 py-3 ${
            caption.kind === 'user'
              ? 'bg-gold/85 border-gold/30 text-white'
              : 'bg-black/80 border-white/15 text-white'
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${
              caption.kind === 'user' ? 'text-white/80' : 'text-gold'
            }`}>
              {caption.speaker}
            </p>
            <p className="text-base md:text-lg leading-snug font-medium">
              {caption.revealed}
              {caption.revealed.length < caption.text.length && (
                <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 align-middle opacity-70" />
              )}
            </p>
          </div>
        </div>
      )}

      {/* Voice control bar */}
      <div className="relative z-10 pb-8 pt-3 px-5 bg-black/50 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center gap-3">
          {demoMode ? (
            <button
              onClick={stopDemo}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 shadow-2xl active:scale-90 transition-all">
              <X size={26} className="text-white" />
            </button>
          ) : (
            <button
              onClick={() => isListening ? stopListening() : startListening()}
              disabled={isSpeaking || isThinking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 ${isListening ? 'bg-red-500 shadow-2xl animate-pulse-gold' : 'gradient-gold shadow-2xl'}`}>
              {isListening ? <MicOff size={26} className="text-white" /> : <Mic size={26} className="text-white" />}
            </button>
          )}
          <div className="flex-1">
            {demoMode ? (
              <>
                <p className="text-white text-sm font-semibold flex items-center gap-1.5">
                  <PlayCircle size={14} className="text-gold animate-pulse" />
                  {userSpeaking ? 'Marco is speaking...' :
                   isSpeaking ? `${persona.name} is speaking...` :
                   'Auto Demo Playing'}
                </p>
                <p className="text-white/50 text-[11px] mt-0.5">Tap × to stop · Trip auto-checkouts at the end</p>
              </>
            ) : (
              <>
                <p className="text-white text-sm font-semibold">
                  {isSpeaking ? `${persona.name} is speaking...` :
                   isThinking ? 'Thinking...' :
                   isListening ? 'Listening — speak naturally' :
                   autoListen ? 'I\'ll listen automatically' :
                   'Tap mic to talk'}
                </p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  {autoListen ? '🟢 Continuous conversation on' : '⚪ Tap-to-talk mode'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-h-[85vh] bg-cream rounded-t-3xl shadow-2xl flex flex-col animate-fade-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Your Trip So Far</p>
                <h3 className="font-display text-xl font-bold text-navy">{cart.length} {cart.length === 1 ? 'item' : 'items'} · ${cartTotal.toLocaleString()}</h3>
              </div>
              <button onClick={() => setShowCart(false)} className="w-9 h-9 rounded-full bg-cream border border-gray-200 flex items-center justify-center">
                <X size={16} className="text-charcoal-light" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={32} className="text-charcoal-light/20 mx-auto mb-3" />
                  <p className="text-charcoal-light text-sm">Nothing yet — keep talking and {persona.name} will add things as you discover them.</p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const Icon = TYPE_ICONS[item.type] || Mountain;
                  return (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-3 animate-fade-up">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-bold text-charcoal-light uppercase">{item.type}</span>
                          <span className="text-sm font-bold text-navy">{item.price}</span>
                        </div>
                        <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                        <p className="text-[10px] text-charcoal-light flex items-center gap-1 mt-0.5"><MapPin size={9} /> {item.location}</p>
                        {item.detail && <p className="text-[11px] text-charcoal-light mt-1">{item.detail}</p>}
                      </div>
                      <button onClick={() => removeFromCart(idx)} className="text-charcoal-light/30 hover:text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-5 border-t border-gray-100 space-y-2">
              {cart.length > 0 && (
                <button onClick={() => { setShowCart(false); navigate('/itinerary'); }}
                  className="w-full py-4 gradient-gold rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl active:scale-[0.97] transition-transform">
                  <Sparkles size={16} /> Build My Itinerary
                </button>
              )}
              <button onClick={() => setShowCart(false)}
                className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-charcoal-light font-medium text-sm active:scale-[0.97]">
                Keep Talking to {persona.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating "Review Trip" pill */}
      {cart.length >= 3 && !showCart && (
        <button onClick={() => navigate('/itinerary')}
          className="absolute top-28 right-5 z-20 px-3 py-2 gradient-gold rounded-full text-white text-[11px] font-bold shadow-2xl flex items-center gap-1.5 animate-fade-up active:scale-95">
          <Sparkles size={11} /> Review Trip ({cart.length})
        </button>
      )}
    </div>
  );
}
