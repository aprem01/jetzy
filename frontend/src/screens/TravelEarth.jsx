// IMPORTANT: Set Cesium base URL BEFORE the cesium import so the engine
// knows where to load workers, assets and CZML data.
if (typeof window !== 'undefined') {
  window.CESIUM_BASE_URL = '/cesium/';
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Cesium from 'cesium';
import { Viewer, Entity } from 'resium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import {
  Mic, MicOff, X, Send, ShoppingBag, Sparkles, MapPin, ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { VOICES, playEleven, stopEleven, unlockAudio } from '../lib/elevenlabs';

// Cesium Ion not required — we use Google Photorealistic 3D Tiles when a
// GOOGLE_MAPS_API_KEY is present and fall back to OSM tiles otherwise.
Cesium.Ion.defaultAccessToken = undefined;

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ARIA_AVATAR = '/aria-character.png';

const HOME_LAT = 39.95;
const HOME_LNG = -75.16;
const HOME_HEIGHT = 2_000_000;

const PERSONA = {
  id: 'default',
  name: 'Aria',
  region: 'Your Companion',
};

const SUGGESTIONS = [
  'Take me to Mahabalipuram',
  'Show me Fitz Roy',
  'I want to see Bali',
];

// Build the OSM imagery provider once per module (used as fallback when
// Google Photorealistic 3D Tiles are unavailable).
const osmImageryProvider = new Cesium.UrlTemplateImageryProvider({
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  credit: 'OpenStreetMap',
});

export default function TravelEarth() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const viewerRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const audioUnlockedRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null); // { name, lat, lng }
  const [markers, setMarkers] = useState([]); // [{ name, lat, lng }]
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [cart, setCart] = useState([]);
  const [ariaLine, setAriaLine] = useState(null); // current dialogue bubble text
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // Configure the Cesium scene once the viewer mounts. When a Google Maps
  // API key is configured we additionally load the Photorealistic 3D Tiles
  // dataset on top of the globe — this gives real satellite imagery and 3D
  // buildings everywhere on Earth.
  useEffect(() => {
    const v = viewerRef.current?.cesiumElement;
    if (!v) return;

    let tileset;
    let cancelled = false;

    try {
      // Hide the default Cesium credit container (we render our own footer).
      const credits = v.creditDisplay?.container;
      if (credits) credits.style.display = 'none';

      v.scene.globe.enableLighting = true;
      v.scene.globe.showGroundAtmosphere = true;
      v.scene.skyAtmosphere.show = true;
      v.scene.fog.enabled = true;
      v.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b0f1a');

      // Initial camera over Philadelphia.
      v.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(HOME_LNG, HOME_LAT, HOME_HEIGHT),
        orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO + 0.2, roll: 0 },
      });
    } catch (e) {
      console.warn('Cesium init warning:', e);
    }

    // Load Google Photorealistic 3D Tiles (async). This is the "Google Earth"
    // look — real satellite imagery + 3D buildings worldwide.
    if (GOOGLE_MAPS_KEY) {
      (async () => {
        try {
          tileset = await Cesium.Cesium3DTileset.fromUrl(
            `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_KEY}`,
            { showCreditsOnScreen: false },
          );
          if (cancelled) return;
          v.scene.primitives.add(tileset);
          // Hide default globe so we see Google's photoreal terrain instead.
          v.scene.globe.show = false;
          // Slightly tighter atmosphere for the photoreal look.
          v.scene.skyAtmosphere.show = true;
        } catch (e) {
          console.warn('Google Photorealistic 3D Tiles failed to load:', e);
          // OSM imagery layer remains as fallback (configured on the Viewer).
        }
      })();
    }

    return () => {
      cancelled = true;
      try {
        if (tileset && v.scene?.primitives) {
          v.scene.primitives.remove(tileset);
        }
      } catch {}
    };
  }, []);

  // Speech recognition setup (Web Speech API).
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';

    r.onstart = () => setIsListening(true);
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.onresult = (e) => {
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
      finalText = finalText.trim();
      if (finalText) {
        sendMessage(finalText);
      }
    };

    recognitionRef.current = r;
    return () => { try { r.abort(); } catch {} };
    // sendMessage is stable via closure — recognition only created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Geocode helper.
  const geocode = useCallback(async (q) => {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (typeof data?.lat !== 'number' || typeof data?.lng !== 'number') return null;
      return { name: data.displayName || q, lat: data.lat, lng: data.lng };
    } catch {
      return null;
    }
  }, []);

  // Fly the camera to a coordinate.
  const flyTo = useCallback((lng, lat) => {
    const v = viewerRef.current?.cesiumElement;
    if (!v) return;
    try {
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 5000),
        duration: 4,
        orientation: { heading: 0, pitch: -0.5, roll: 0 },
      });
    } catch (e) {
      console.warn('flyTo failed:', e);
    }
  }, []);

  // Speak via ElevenLabs.
  const speak = useCallback(async (text) => {
    if (!text) return;
    setAriaLine(text);
    try {
      stopEleven();
      await playEleven({
        text,
        voiceId: VOICES.default.id,
        settings: VOICES.default.settings,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } catch (e) {
      console.warn('Eleven failed:', e);
      setIsSpeaking(false);
    }
  }, []);

  // Core pipeline: send a user message, get reply, fly to location, speak.
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', content: trimmed };
    const newMsgs = [...messagesRef.current, userMsg];
    setMessages(newMsgs);
    setIsThinking(true);
    setHasStarted(true);

    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
          persona: PERSONA,
          user: { name: user?.name, travelStyles: user?.travelStyles },
        }),
      });
      const data = await res.json();
      const reply = data?.response || `Tell me more — where shall we go?`;
      const locations = Array.isArray(data?.locations) ? data.locations : [];
      const cartItems = Array.isArray(data?.cartItems) ? data.cartItems : [];

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, mood: data?.mood },
      ]);

      // Fly to the first location (if any) and drop a marker.
      if (locations.length > 0) {
        const first = locations[0];
        const placeName =
          typeof first === 'string' ? first : first?.name || first?.label || '';
        if (placeName) {
          const geo = await geocode(placeName);
          if (geo) {
            setCurrentLocation(geo);
            setMarkers((prev) => {
              // de-dupe by name
              if (prev.some((m) => m.name === geo.name)) return prev;
              return [...prev, geo];
            });
            flyTo(geo.lng, geo.lat);
          }
        }
      }

      if (cartItems.length > 0) {
        setCart((prev) => {
          const existing = new Set(prev.map((i) => i.name?.toLowerCase()));
          const fresh = cartItems.filter(
            (i) => i?.name && !existing.has(i.name.toLowerCase()),
          );
          return [...prev, ...fresh];
        });
      }

      setIsThinking(false);
      speak(reply);
    } catch (e) {
      console.error(e);
      setIsThinking(false);
      const fallback = `I lost the signal for a moment. Try me again?`;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fallback },
      ]);
      speak(fallback);
    }
  }, [user, geocode, flyTo, speak]);

  // Mic button handler — also unlocks audio on first user gesture.
  const onMicPress = () => {
    if (!audioUnlockedRef.current) {
      try { unlockAudio(); } catch {}
      audioUnlockedRef.current = true;
    }
    if (isSpeaking || isThinking) return;
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      return;
    }
    if (!recognitionRef.current) {
      // no SR available; nothing to do
      return;
    }
    try { recognitionRef.current.start(); } catch {}
  };

  const onSuggestion = (text) => {
    if (!audioUnlockedRef.current) {
      try { unlockAudio(); } catch {}
      audioUnlockedRef.current = true;
    }
    sendMessage(text);
  };

  const onSubmitText = (e) => {
    e.preventDefault();
    if (!audioUnlockedRef.current) {
      try { unlockAudio(); } catch {}
      audioUnlockedRef.current = true;
    }
    const t = inputText.trim();
    if (!t) return;
    setInputText('');
    sendMessage(t);
  };

  const onExit = () => {
    try { stopEleven(); } catch {}
    try { recognitionRef.current?.abort(); } catch {}
    navigate(-1);
  };

  const status = isListening
    ? 'Listening'
    : isThinking
      ? 'Thinking'
      : isSpeaking
        ? 'Speaking'
        : 'Ready';

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Cesium globe — full screen behind everything */}
      <div className="absolute inset-0">
        <Viewer
          ref={viewerRef}
          full
          timeline={false}
          animation={false}
          baseLayerPicker={false}
          navigationHelpButton={false}
          geocoder={false}
          homeButton={false}
          sceneModePicker={false}
          fullscreenButton={false}
          infoBox={false}
          selectionIndicator={false}
          imageryProvider={osmImageryProvider}
        >
          {markers.map((m, i) => (
            <Entity
              key={`${m.name}-${i}`}
              position={Cesium.Cartesian3.fromDegrees(m.lng, m.lat)}
              point={{
                pixelSize: 14,
                color: Cesium.Color.fromCssColorString('#C9A84C'),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
              }}
              label={{
                text: m.name,
                font: '16px sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -25),
              }}
            />
          ))}
        </Viewer>
      </div>

      {/* Subtle vignette + gold edges for cinematic feel */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />

      {/* === HEADER === */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full backdrop-blur-md bg-black/40 border border-white/10 hover:border-[#C9A84C]/60 text-white flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border border-white/10">
            <Sparkles size={14} className="text-[#C9A84C]" />
            <span className="font-display text-sm tracking-wide text-white">
              Travel Earth
            </span>
            <span className="text-[10px] font-bold text-[#C9A84C] tracking-[0.2em]">
              · BETA
            </span>
          </div>
          {currentLocation?.name && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10">
              <MapPin size={12} className="text-[#C9A84C]" />
              <span className="text-xs text-white/80 max-w-[260px] truncate">
                {currentLocation.name}
              </span>
            </div>
          )}
        </div>

        {/* Top-right HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border border-[#C9A84C]/40">
            <ShoppingBag size={14} className="text-[#C9A84C]" />
            <span className="text-sm font-semibold text-[#C9A84C]">
              {cart.length}
            </span>
          </div>
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full backdrop-blur-md bg-black/50 border border-white/10 hover:bg-red-500/30 hover:border-red-400/60 text-white flex items-center justify-center transition-colors"
            aria-label="Exit"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* === ARIA AVATAR (bottom-left) === */}
      <div className="absolute bottom-8 left-6 z-30 flex items-end gap-4 max-w-[min(560px,55vw)]">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Pulse ring while speaking */}
            {isSpeaking && (
              <>
                <span className="absolute inset-0 rounded-full ring-2 ring-[#C9A84C]/60 animate-ping" />
                <span className="absolute -inset-2 rounded-full ring-1 ring-[#C9A84C]/30 animate-pulse" />
              </>
            )}
            <div
              className={`w-24 h-24 rounded-full overflow-hidden border-2 ${
                isSpeaking
                  ? 'border-[#C9A84C] shadow-[0_0_30px_rgba(201,168,76,0.55)]'
                  : 'border-[#C9A84C]/70 shadow-[0_0_20px_rgba(201,168,76,0.25)]'
              } transition-all`}
            >
              <img
                src={ARIA_AVATAR}
                alt="Aria"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="mt-2 text-center">
            <div className="font-display text-sm text-white tracking-wide">
              Aria
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C9A84C]/90">
              {status}
            </div>
          </div>
        </div>

        {/* Dialogue bubble */}
        {ariaLine && (
          <div className="relative mb-8 px-5 py-4 rounded-2xl rounded-bl-sm backdrop-blur-xl bg-black/60 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-md">
            <div className="text-[10px] font-bold tracking-[0.22em] text-[#C9A84C] mb-1.5">
              ARIA
            </div>
            <p className="text-lg leading-snug text-white font-light">
              {ariaLine}
            </p>
          </div>
        )}
      </div>

      {/* === CAPTION OVERLAY (near bottom-center) === */}
      {ariaLine && isSpeaking && (
        <div className="pointer-events-none absolute bottom-40 left-1/2 -translate-x-1/2 z-20 max-w-[min(720px,80vw)]">
          <div className="px-6 py-4 rounded-2xl backdrop-blur-xl bg-black/65 border border-white/10 shadow-2xl">
            <div className="text-[10px] font-bold tracking-[0.25em] text-[#C9A84C] mb-1.5">
              ARIA
            </div>
            <p className="text-xl text-white text-center leading-snug font-light">
              {ariaLine}
            </p>
          </div>
        </div>
      )}

      {/* === SUGGESTIONS (above mic, only on first load) === */}
      {!hasStarted && (
        <div className="absolute bottom-44 right-6 z-30 flex flex-col items-end gap-2 max-w-[min(420px,80vw)]">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="px-4 py-2 rounded-full backdrop-blur-md bg-black/45 border border-[#C9A84C]/30 hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 text-sm text-white/90 transition-all shadow-lg"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* === BOTTOM RIGHT: VOICE + INPUT === */}
      <div className="absolute bottom-8 right-6 z-30 flex flex-col items-end gap-3">
        {/* Text input fallback */}
        <form
          onSubmit={onSubmitText}
          className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl bg-black/55 border border-white/10 focus-within:border-[#C9A84C]/60 transition-colors w-[min(420px,75vw)]"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Take me to Hampi..."
            className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none px-2"
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={isThinking || !inputText.trim()}
            className="w-9 h-9 rounded-full bg-[#C9A84C] text-black flex items-center justify-center disabled:opacity-30 hover:bg-[#d8b85c] transition-colors"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </form>

        {/* Big mic button */}
        <button
          onClick={onMicPress}
          disabled={isSpeaking || isThinking}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-red-500 text-white'
              : 'bg-[#C9A84C] text-black hover:bg-[#d8b85c] hover:scale-105'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full ring-2 ring-red-400/70 animate-ping" />
              <span className="absolute -inset-1 rounded-full ring-1 ring-red-400/40 animate-pulse" />
            </>
          )}
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
      </div>

      {/* === THINKING INDICATOR === */}
      {isThinking && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border border-white/10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: '120ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: '240ms' }} />
          <span className="text-xs text-white/80 ml-1 tracking-wide">
            Aria is thinking
          </span>
        </div>
      )}
    </div>
  );
}
