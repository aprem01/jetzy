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
  Play, SkipForward, Eye, Compass, Check, Plane, Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { VOICES, playEleven, stopEleven, unlockAudio } from '../lib/elevenlabs';
import { TOURS } from '../data/tours';
import { playWhoosh, playChime, startBackgroundMusic, stopBackgroundMusic } from '../lib/sounds';

// Cesium Ion not required — we use Google Photorealistic 3D Tiles when a
// GOOGLE_MAPS_API_KEY is present and fall back to OSM tiles otherwise.
Cesium.Ion.defaultAccessToken = undefined;

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ARIA_AVATAR = '/aria-character.png';

// Initial hero view — pulled back over South America so the user sees the
// continent the demo is about to traverse. Tilted slightly so the horizon
// curves nicely, giving an Earth-from-orbit feel.
const HOME_LAT = -25;
const HOME_LNG = -65;
const HOME_HEIGHT = 9_500_000;
const HOME_PITCH = -1.0; // ~57° down — sees curvature, sees the continent

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
  const [currentSpeaker, setCurrentSpeaker] = useState('aria'); // 'aria' | 'marco'
  const [hasStarted, setHasStarted] = useState(false);

  // Tour mode
  const [tour, setTour] = useState(null); // active tour object or null
  const [tourStepIndex, setTourStepIndex] = useState(-1);
  const [activeSubSpotlight, setActiveSubSpotlight] = useState(0); // for steps with spotlights[]
  const tourAudioRef = useRef(null);
  const tourAbortRef = useRef(false);
  const subSpotlightTimersRef = useRef([]);

  // Street View modal — opens a Google Street View pano at the current location
  // so the user can step out of the globe and "stand" at the venue / hotel.
  const [streetView, setStreetView] = useState(null); // { lat, lng, name } | null

  // Hedra-rendered Aria-talking video URL for the current step (null = use the
  // static portrait image). Audio is baked into the video so we don't play
  // the separate MP3 when a video is set.
  const [ariaVideo, setAriaVideo] = useState(null);
  const ariaVideoRef = useRef(null);

  // Demo end card — "Booked" overlay with confirmation + press logos.
  const [showBooked, setShowBooked] = useState(false);

  // Animated total cost — tweens up smoothly when cart items add.
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const cartTotal = cart.reduce((s, i) => s + (Number(i.price) || 0), 0);
  useEffect(() => {
    if (displayedTotal === cartTotal) return;
    const start = displayedTotal;
    const delta = cartTotal - start;
    const duration = 600;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayedTotal(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cartTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  // === DEBUG HUD ===
  // On-screen log so we can debug rendering issues without DevTools.
  // Captures console.log/warn/error and any uncaught errors, pushes to a
  // visible panel toggleable in the corner of the screen.
  const [debugLogs, setDebugLogs] = useState([]);
  const [debugOpen, setDebugOpen] = useState(true);
  const debugRef = useRef([]);
  useEffect(() => {
    const push = (level, args) => {
      const text = args
        .map((a) => {
          try {
            if (a instanceof Error) return `${a.name}: ${a.message}`;
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
          } catch {
            return '[unserializable]';
          }
        })
        .join(' ');
      const entry = { level, text, t: Date.now() };
      debugRef.current = [...debugRef.current.slice(-40), entry];
      setDebugLogs(debugRef.current);
    };
    const origLog = console.log.bind(console);
    const origWarn = console.warn.bind(console);
    const origErr = console.error.bind(console);
    const origInfo = console.info.bind(console);
    console.log = (...a) => { push('log', a); origLog(...a); };
    console.warn = (...a) => { push('warn', a); origWarn(...a); };
    console.error = (...a) => { push('error', a); origErr(...a); };
    console.info = (...a) => { push('info', a); origInfo(...a); };
    const onErr = (e) => push('error', [`window.onerror: ${e.message} @ ${e.filename}:${e.lineno}`]);
    const onRej = (e) => push('error', [`unhandledrejection: ${e.reason?.message || e.reason}`]);
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    push('info', [`Travel Earth boot · ua=${navigator.userAgent.slice(0, 60)}`]);
    push('info', [`GOOGLE_MAPS_KEY=${GOOGLE_MAPS_KEY ? 'set' : 'MISSING'}`]);
    push('info', [`Cesium=${typeof Cesium} · createGooglePhoto=${typeof Cesium?.createGooglePhotorealistic3DTileset}`]);
    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origErr;
      console.info = origInfo;
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // Configure the Cesium scene once the viewer mounts. Resium populates the
  // ref's `cesiumElement` asynchronously, so we poll briefly until it appears
  // before kicking off the rest of setup. When a Google Maps API key is
  // configured we additionally load the Photorealistic 3D Tiles dataset.
  useEffect(() => {
    console.info('[init] useEffect fired');
    let cancelled = false;
    let tileset;

    const waitForViewer = async () => {
      const start = Date.now();
      while (!cancelled && Date.now() - start < 8000) {
        if (viewerRef.current?.cesiumElement) return viewerRef.current.cesiumElement;
        await new Promise((r) => setTimeout(r, 50));
      }
      return null;
    };

    (async () => {
      const v = await waitForViewer();
      if (cancelled) return;
      if (!v) {
        console.error('[init] cesiumElement never appeared (8s timeout)');
        return;
      }
      console.info('[init] cesiumElement ready');

      try {
        const credits = v.creditDisplay?.container;
        if (credits) credits.style.display = 'none';

        v.scene.globe.enableLighting = true;
        v.scene.globe.showGroundAtmosphere = true;
        v.scene.skyAtmosphere.show = true;
        v.scene.fog.enabled = true;
        v.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b0f1a');

        v.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(HOME_LNG, HOME_LAT, HOME_HEIGHT),
          orientation: { heading: 0, pitch: HOME_PITCH, roll: 0 },
        });
        console.info('[init] scene configured + hero view over South America');

        const c = v.canvas;
        console.info('[init] canvas =', c?.width, 'x', c?.height);
        const gl = c?.getContext('webgl2') || c?.getContext('webgl');
        console.info('[init] webgl ctx =', !!gl, 'vendor =', gl?.getParameter?.(gl.VENDOR));
      } catch (e) {
        console.error('[init] scene setup threw:', e?.message || e);
      }

      if (!GOOGLE_MAPS_KEY) {
        console.warn('[tiles] no GOOGLE_MAPS_KEY — skipping Photorealistic 3D Tiles');
        return;
      }

      console.info('[tiles] starting Google Photorealistic 3D Tiles load…');
      try {
        if (Cesium.GoogleMaps && 'defaultApiKey' in Cesium.GoogleMaps) {
          Cesium.GoogleMaps.defaultApiKey = GOOGLE_MAPS_KEY;
          console.info('[tiles] set Cesium.GoogleMaps.defaultApiKey');
        }

        if (typeof Cesium.createGooglePhotorealistic3DTileset === 'function') {
          console.info('[tiles] using createGooglePhotorealistic3DTileset helper');
          tileset = await Cesium.createGooglePhotorealistic3DTileset({
            key: GOOGLE_MAPS_KEY,
          });
        } else {
          console.info('[tiles] falling back to Cesium3DTileset.fromUrl');
          tileset = await Cesium.Cesium3DTileset.fromUrl(
            `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_KEY}`,
          );
        }
        console.info('[tiles] tileset loaded');
        if (cancelled) { console.info('[tiles] cancelled before add'); return; }
        v.scene.primitives.add(tileset);
        console.info('[tiles] tileset added to scene primitives');
      } catch (e) {
        console.error('[tiles] load failed:', e?.message || e, e?.stack?.slice?.(0, 200));
      }
    })();

    return () => {
      cancelled = true;
      try {
        const v = viewerRef.current?.cesiumElement;
        if (tileset && v?.scene?.primitives) v.scene.primitives.remove(tileset);
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
  const flyTo = useCallback((lng, lat, opts = {}) => {
    const v = viewerRef.current?.cesiumElement;
    if (!v) return;
    const { height = 5000, pitch = -0.5, duration = 4, heading = 0, silent = false } = opts;
    try {
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
        duration,
        orientation: { heading, pitch, roll: 0 },
      });
      if (!silent) playWhoosh();
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

  // === TOUR MODE ===
  // Plays through a sequence of pre-baked Aria audio clips. For each step we
  // fly the camera, show the caption, optionally drop a marker + cart item,
  // play the audio, and advance when it ends. Designed to look like a real
  // narrated story while showcasing the Google Photorealistic 3D Tiles.
  const stopTour = useCallback(() => {
    tourAbortRef.current = true;
    try {
      const a = tourAudioRef.current;
      if (a) { a.pause(); a.currentTime = 0; }
    } catch {}
    try {
      const v = ariaVideoRef.current;
      if (v) { v.pause(); v.currentTime = 0; }
    } catch {}
    tourAudioRef.current = null;
    setTour(null);
    setTourStepIndex(-1);
    setIsSpeaking(false);
    setAriaLine(null);
    setCurrentSpeaker('aria');
    setAriaVideo(null);
    setShowBooked(false);
    setStreetView(null);
    stopBackgroundMusic();
  }, []);

  const playStep = useCallback((step, { isFirst = false } = {}) => {
    return new Promise((resolve) => {
      if (tourAbortRef.current) return resolve();

      // Camera fly. Each step can declare its own fly duration so we land
      // before Aria finishes the line; the first step gets a longer settle
      // so the destination has time to register before narration begins.
      if (step.camera) {
        const dur = step.camera.duration ?? (isFirst ? 4.5 : 2.6);
        flyTo(step.camera.lng, step.camera.lat, {
          height: step.camera.height,
          pitch: step.camera.pitch,
          heading: step.camera.heading ?? 0,
          duration: dur,
        });
      }

      // Marker + cart mutations on step start (so user sees them appear live).
      if (step.marker) {
        const m = step.marker;
        setMarkers((prev) =>
          prev.some((p) => p.name === m.name) ? prev : [...prev, m],
        );
        setCurrentLocation({ name: m.name, lat: m.lat, lng: m.lng });
      }
      if (Array.isArray(step.cart) && step.cart.length > 0) {
        setCart((prev) => {
          const have = new Set(prev.map((i) => i.name?.toLowerCase()));
          const fresh = step.cart.filter(
            (i) => i?.name && !have.has(i.name.toLowerCase()),
          );
          if (fresh.length > 0) {
            // Slight delay so the chime lands after the camera whoosh.
            setTimeout(() => playChime(), 350);
          }
          return [...prev, ...fresh];
        });
      }

      setCurrentSpeaker(step.speaker || 'aria');
      setAriaLine(step.text);
      setIsSpeaking(true);

      // Reset rotating sub-spotlights to index 0 and schedule transitions for
      // each one based on its startMs so the right venue card is on screen at
      // the moment Aria names it in the audio.
      setActiveSubSpotlight(0);
      subSpotlightTimersRef.current.forEach((t) => clearTimeout(t));
      subSpotlightTimersRef.current = [];
      if (Array.isArray(step.spotlights) && step.spotlights.length > 1) {
        step.spotlights.forEach((sp, i) => {
          if (i === 0) return;
          const t = setTimeout(() => {
            if (tourAbortRef.current) return;
            setActiveSubSpotlight(i);
          }, sp.startMs ?? 0);
          subSpotlightTimersRef.current.push(t);
        });
      }

      // Auto-open Street View at venue stops so the viewer is taken inside
      // the actual restaurant / hotel during the narration. Closes when the
      // step finishes so we transition cleanly back to the globe view.
      let streetViewTimer = null;
      if (step.autoStreetView && step.marker?.lat && step.marker?.lng) {
        const delay = step.autoStreetView.delayMs ?? 1500;
        streetViewTimer = setTimeout(() => {
          if (tourAbortRef.current) return;
          setStreetView({
            lat: step.marker.lat,
            lng: step.marker.lng,
            name: step.marker.name,
          });
        }, delay);
      }

      // Prefer the Hedra-rendered talking video (audio baked in). For Marco
      // lines or any step missing a video, fall back to the audio-only path.
      const useVideo = !!step.video;
      setAriaVideo(useVideo ? step.video : null);

      const finish = () => {
        if (streetViewTimer) clearTimeout(streetViewTimer);
        subSpotlightTimersRef.current.forEach((t) => clearTimeout(t));
        subSpotlightTimersRef.current = [];
        // Close any auto-opened Street View as we move to the next step.
        if (step.autoStreetView) setStreetView(null);
        if (tourAudioRef.current) tourAudioRef.current = null;
        setIsSpeaking(false);
        setTimeout(resolve, 250);
      };

      if (useVideo) {
        // Wait one tick for React to mount the <video> element with the new src,
        // then trigger play. The element's onEnded handler resolves the step.
        setTimeout(() => {
          if (tourAbortRef.current) return resolve();
          const v = ariaVideoRef.current;
          if (!v) {
            // Element didn't render in time — fall back to audio.
            const audio = new Audio(step.audio);
            tourAudioRef.current = audio;
            audio.onended = finish;
            audio.onerror = finish;
            audio.play().catch(finish);
            return;
          }
          v.currentTime = 0;
          v.muted = false;
          v.onended = finish;
          v.onerror = finish;
          v.play().catch((e) => {
            console.warn('aria video play failed, falling back to audio:', e?.message);
            const audio = new Audio(step.audio);
            tourAudioRef.current = audio;
            audio.onended = finish;
            audio.onerror = finish;
            audio.play().catch(finish);
          });
        }, 80);
      } else {
        const audio = new Audio(step.audio);
        audio.preload = 'auto';
        tourAudioRef.current = audio;
        audio.onended = finish;
        audio.onerror = finish;
        setTimeout(() => {
          if (tourAbortRef.current) return resolve();
          audio.play().catch((e) => {
            console.warn('tour audio play failed:', e);
            finish();
          });
        }, 200);
      }
    });
  }, [flyTo]);

  const startTour = useCallback(async (tourId) => {
    const t = TOURS.find((x) => x.id === tourId);
    if (!t) return;

    if (!audioUnlockedRef.current) {
      try { unlockAudio(); } catch {}
      audioUnlockedRef.current = true;
    }

    tourAbortRef.current = false;
    setHasStarted(true);
    setTour(t);
    setTourStepIndex(0);

    // Kick off the cinematic ambient track. Silently skips if no asset.
    startBackgroundMusic();

    // Pre-flight: fly camera to the FIRST step's location and let it settle
    // before we start playing audio. Without this beat the camera and Aria
    // both arrive at once and the opener feels rushed / misaligned.
    const first = t.steps[0];
    if (first?.camera) {
      flyTo(first.camera.lng, first.camera.lat, {
        height: first.camera.height,
        pitch: first.camera.pitch,
        duration: 4.5,
      });
      // Wait the bulk of the fly so the user sees the destination land.
      await new Promise((r) => setTimeout(r, 1500));
    }

    for (let i = 0; i < t.steps.length; i++) {
      if (tourAbortRef.current) break;
      setTourStepIndex(i);
      await playStep(t.steps[i], { isFirst: i === 0 });
    }

    if (!tourAbortRef.current) {
      // Tour completed — show the "Booked." overlay over the final scene.
      setIsSpeaking(false);
      setAriaVideo(null);
      setAriaLine(null);
      setCurrentSpeaker('aria');
      setShowBooked(true);
      // Final celebratory chime, then fade out the music.
      setTimeout(() => playChime({ volume: 0.25 }), 400);
      stopBackgroundMusic({ fadeMs: 1500 });
    }
    setTour(null);
    setTourStepIndex(-1);
  }, [playStep]);

  const skipStep = useCallback(() => {
    try {
      const a = tourAudioRef.current;
      if (a) { a.pause(); a.currentTime = a.duration || 0; a.dispatchEvent(new Event('ended')); }
    } catch {}
  }, []);

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
    try { stopTour(); } catch {}
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
          {currentLocation?.lat && currentLocation?.lng && (
            <button
              onClick={() => setStreetView({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                name: currentLocation.name,
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-[#C9A84C]/15 border border-[#C9A84C]/50 hover:bg-[#C9A84C]/30 hover:border-[#C9A84C] text-[#C9A84C] text-xs font-medium transition-all"
              aria-label="Look around in Street View"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Look around</span>
            </button>
          )}
        </div>

        {/* Top-right HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md bg-black/55 border border-[#C9A84C]/40 shadow-lg">
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-[#C9A84C]" />
              <span className="text-sm font-semibold text-[#C9A84C] tabular-nums">
                {cart.length}
              </span>
            </div>
            {displayedTotal > 0 && (
              <>
                <div className="w-px h-4 bg-[#C9A84C]/40" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#C9A84C]/80">
                    USD
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {displayedTotal.toLocaleString()}
                  </span>
                </div>
              </>
            )}
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

      {/* === AVATAR (bottom-left) — Aria normally; faded when Marco speaks === */}
      <div className="absolute bottom-8 left-6 z-30 flex items-end gap-4 max-w-[min(560px,55vw)]">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Pulse ring while speaking */}
            {isSpeaking && currentSpeaker === 'aria' && (
              <>
                <span className="absolute inset-0 rounded-full ring-2 ring-[#C9A84C]/60 animate-ping" />
                <span className="absolute -inset-2 rounded-full ring-1 ring-[#C9A84C]/30 animate-pulse" />
              </>
            )}
            <div
              className={`w-28 h-28 rounded-full overflow-hidden border-2 ${
                isSpeaking && currentSpeaker === 'aria'
                  ? 'border-[#C9A84C] shadow-[0_0_30px_rgba(201,168,76,0.55)]'
                  : 'border-[#C9A84C]/70 shadow-[0_0_20px_rgba(201,168,76,0.25)]'
              } ${currentSpeaker === 'marco' ? 'opacity-50' : 'opacity-100'} transition-all`}
            >
              {ariaVideo ? (
                <video
                  ref={ariaVideoRef}
                  src={ariaVideo}
                  className="w-full h-full object-cover"
                  playsInline
                  preload="auto"
                />
              ) : (
                <img
                  src={ARIA_AVATAR}
                  alt="Aria"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div className="mt-2 text-center">
            <div className="font-display text-sm text-white tracking-wide">
              {currentSpeaker === 'marco' ? 'Marco' : 'Aria'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C9A84C]/90">
              {status}
            </div>
          </div>
        </div>

      </div>

      {/* === CAPTION (single, centered, subtitle-style) ===
           Only renders the bottom-center caption — the duplicate bubble next
           to the avatar was removed. The avatar still shows speaker name and
           status below the portrait, so identification is preserved. */}
      {ariaLine && isSpeaking && (
        <div className="pointer-events-none absolute bottom-40 left-1/2 -translate-x-1/2 z-20 max-w-[min(720px,80vw)]">
          <div className="px-6 py-4 rounded-2xl backdrop-blur-xl bg-black/65 border border-white/10 shadow-2xl">
            <div className="text-[10px] font-bold tracking-[0.25em] text-[#C9A84C] mb-1.5">
              {currentSpeaker === 'marco' ? 'MARCO' : 'ARIA'}
            </div>
            <p className="text-xl text-white text-center leading-snug font-light">
              {ariaLine}
            </p>
          </div>
        </div>
      )}

      {/* === SUGGESTIONS + TOUR LAUNCHER (above mic, only on first load) === */}
      {!hasStarted && (
        <div className="absolute bottom-44 right-6 z-30 flex flex-col items-end gap-3 max-w-[min(420px,85vw)]">
          {/* Featured Tour card */}
          {TOURS.map((t) => (
            <button
              key={t.id}
              onClick={() => startTour(t.id)}
              className="group w-full text-left px-5 py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[#1B2B4B]/85 to-black/85 border border-[#C9A84C]/40 hover:border-[#C9A84C] hover:from-[#1B2B4B]/95 hover:to-black/95 shadow-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-black flex items-center justify-center shadow-lg shrink-0">
                  <Play size={16} className="ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.22em] text-[#C9A84C] mb-0.5">
                    FEATURED TOUR · {t.estSeconds}s
                  </div>
                  <div className="font-display text-base text-white leading-tight">
                    {t.title}
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {t.subtitle}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Quick suggestions */}
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

      {/* === TOUR VENUE SPOTLIGHT ===
           Steps can carry either a single `spotlight` object or a `spotlights`
           array that rotates as the audio plays (Aria names → card swaps). */}
      {tour && (tour.steps[tourStepIndex]?.spotlight || tour.steps[tourStepIndex]?.spotlights) && (() => {
        const step = tour.steps[tourStepIndex];
        const rotating = Array.isArray(step.spotlights) && step.spotlights.length > 0;
        const s = rotating
          ? step.spotlights[Math.min(activeSubSpotlight, step.spotlights.length - 1)]
          : step.spotlight;
        const m = step.marker;
        // Carry the parent step's `picks` through if the rotating spotlight
        // doesn't define its own — keeps the curated-picks list visible
        // even as the hero card rotates.
        const picks = s.picks || step.picks;
        const kindStyle = (k) => {
          switch (k) {
            case 'EAT':   return { dot: 'bg-orange-400',  label: 'text-orange-300' };
            case 'DRINK': return { dot: 'bg-rose-400',    label: 'text-rose-300' };
            case 'DO':    return { dot: 'bg-emerald-400', label: 'text-emerald-300' };
            case 'STAY':  return { dot: 'bg-sky-400',     label: 'text-sky-300' };
            default:      return { dot: 'bg-white/70',    label: 'text-white/70' };
          }
        };
        return (
          <div
            key={rotating ? `${tourStepIndex}-${activeSubSpotlight}` : tourStepIndex}
            className="absolute top-32 right-6 z-30 w-[min(420px,92vw)] max-h-[calc(100vh-12rem)] overflow-y-auto animate-fade-up"
          >
            <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-black/80 border border-[#C9A84C]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {/* Sub-spotlight progress dots when rotating */}
              {rotating && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15">
                  {step.spotlights.map((_, i) => (
                    <span
                      key={i}
                      className={
                        i === activeSubSpotlight
                          ? 'w-2 h-2 rounded-full bg-[#C9A84C]'
                          : 'w-1.5 h-1.5 rounded-full bg-white/30'
                      }
                    />
                  ))}
                </div>
              )}
              {/* hero image */}
              <div className="relative h-44 bg-gradient-to-br from-[#1B2B4B] via-[#0b0f1a] to-[#1B2B4B]">
                {s.image && (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                {s.tag && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C9A84C] text-black text-[10px] font-bold tracking-[0.18em]">
                    {s.tag}
                  </div>
                )}
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="font-display text-2xl text-white leading-tight drop-shadow-lg">
                    {s.name}
                  </div>
                  {s.subtitle && (
                    <div className="text-xs text-white/85 mt-1 drop-shadow">
                      {s.subtitle}
                    </div>
                  )}
                </div>
              </div>
              {/* details grid */}
              {Array.isArray(s.details) && s.details.length > 0 && (
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {s.details.map((d) => (
                    <div key={d.label}>
                      <div className="text-[9px] font-bold tracking-[0.16em] text-[#C9A84C] uppercase mb-0.5">
                        {d.label}
                      </div>
                      <div className="text-xs text-white/90 leading-snug">
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Famous adjacent picks — eat / drink / do */}
              {Array.isArray(picks) && picks.length > 0 && (
                <div className="px-4 pt-1 pb-3 border-t border-white/10">
                  <div className="text-[9px] font-bold tracking-[0.18em] text-[#C9A84C]/85 uppercase mb-2 mt-2">
                    Curated picks here
                  </div>
                  <ul className="space-y-2">
                    {picks.map((p) => {
                      const k = kindStyle(p.kind);
                      return (
                        <li key={p.name} className="flex items-start gap-2.5">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${k.dot} shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-[9px] font-bold tracking-[0.18em] ${k.label}`}>
                                {p.kind}
                              </span>
                              <span className="text-sm text-white font-medium truncate">
                                {p.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-white/55 leading-snug">
                              {p.note}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {/* CTA */}
              {m?.lat && m?.lng && (
                <button
                  onClick={() => setStreetView({ lat: m.lat, lng: m.lng, name: s.name })}
                  className="w-full py-3 bg-[#C9A84C]/15 hover:bg-[#C9A84C]/30 border-t border-[#C9A84C]/30 flex items-center justify-center gap-2 text-[#C9A84C] text-sm font-medium transition-colors"
                >
                  <Eye size={14} />
                  Step inside · Street View
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* === TOUR HUD (when a tour is playing) === */}
      {tour && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-xl bg-black/70 border border-[#C9A84C]/40 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.22em] text-[#C9A84C]">
              TOUR
            </span>
            <span className="text-sm text-white/90 font-light">{tour.title}</span>
            <span className="text-xs text-white/50 ml-1">
              {Math.min(tourStepIndex + 1, tour.steps.length)}/{tour.steps.length}
            </span>
          </div>
          <div className="w-px h-5 bg-white/15" />
          <button
            onClick={skipStep}
            className="text-white/70 hover:text-white flex items-center gap-1 text-xs"
            aria-label="Skip step"
          >
            <SkipForward size={14} />
            Skip
          </button>
          <button
            onClick={stopTour}
            className="text-white/70 hover:text-red-300 flex items-center gap-1 text-xs"
            aria-label="Exit tour"
          >
            <X size={14} />
            Exit
          </button>
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

      {/* === END CARD — "Booked." overlay shown when the tour completes === */}
      {showBooked && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0b0f1a]/95 via-[#1B2B4B]/95 to-black/95 backdrop-blur-xl flex flex-col items-center justify-center px-6 animate-fade-up">
          {/* Close button */}
          <button
            onClick={() => setShowBooked(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 border border-white/15 hover:bg-white/10 text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Hero: BOOKED stamp */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.4)]">
                <Check size={42} strokeWidth={3} className="text-emerald-300" />
              </div>
            </div>
            <div className="text-[11px] font-bold tracking-[0.32em] text-emerald-300/90 mb-2">
              CONFIRMED
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-2 tracking-tight">
              Booked.
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-md">
              Your 8-day Patagonia itinerary is locked.
              Confirmation in your inbox in 30 seconds.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
              <Mail size={12} />
              <span>{user?.email || 'you@jetzylife.com'}</span>
            </div>
          </div>

          {/* Itinerary checklist */}
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-5 mb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plane size={14} className="text-[#C9A84C]" />
                <span className="font-display text-sm tracking-wide text-white">
                  Your itinerary
                </span>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#C9A84C]/80">
                  TOTAL
                </div>
                <div className="text-xl font-bold text-white tabular-nums">
                  USD {cartTotal.toLocaleString()}
                </div>
              </div>
            </div>
            <ul className="space-y-2">
              {cart.map((item, i) => (
                <li
                  key={item.name}
                  className="flex items-center gap-3 text-sm animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} className="text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{item.name}</div>
                    {item.day && (
                      <div className="text-[10px] uppercase tracking-wider text-white/40">
                        Day {item.day} · {item.kind}
                      </div>
                    )}
                  </div>
                  <div className="text-white/80 font-semibold tabular-nums">
                    ${item.price?.toLocaleString?.() || item.price}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Press logos / social proof */}
          <div className="flex flex-col items-center gap-3 max-w-xl">
            <div className="text-[10px] font-bold tracking-[0.32em] text-white/40">
              AS FEATURED IN
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/60 font-display text-sm tracking-wider">
              <span>FORBES</span>
              <span className="italic">Harper's Bazaar</span>
              <span>REFINERY29</span>
              <span>Red Bull</span>
              <span>Swiss</span>
              <span>HuffPost</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowBooked(false)}
            className="mt-8 px-8 py-3 rounded-full bg-[#C9A84C] hover:bg-[#d8b85c] text-black font-semibold text-sm tracking-wide shadow-2xl transition-all"
          >
            Plan another trip
          </button>
        </div>
      )}

      {/* === STREET VIEW MODAL ===
           In tour mode: centered window (75% screen), HUD stays visible, lower z.
           Manual: full-screen takeover. */}
      {streetView && (() => {
        const inTour = !!tour;
        return (
          <div
            className={
              inTour
                ? 'absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none'
                : 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col'
            }
          >
            <div
              className={
                inTour
                  ? 'pointer-events-auto w-[min(900px,80vw)] h-[min(560px,68vh)] rounded-2xl overflow-hidden border border-[#C9A84C]/40 shadow-[0_30px_80px_rgba(0,0,0,0.7)] flex flex-col bg-black'
                  : 'flex flex-col w-full h-full'
              }
            >
              {/* header */}
              <div className="flex items-center justify-between px-5 py-3 bg-black/85 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 flex items-center justify-center">
                    <Compass size={14} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.22em] text-[#C9A84C] mb-0.5">
                      STREET VIEW
                    </div>
                    <div className="font-display text-sm text-white leading-tight">
                      {streetView.name || 'You are here'}
                    </div>
                  </div>
                </div>
                {!inTour && (
                  <button
                    onClick={() => setStreetView(null)}
                    className="w-9 h-9 rounded-full bg-black/60 border border-white/10 hover:bg-red-500/30 hover:border-red-400/60 text-white flex items-center justify-center transition-colors"
                    aria-label="Close Street View"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {/* iframe */}
              <div className="flex-1 relative">
                <iframe
                  key={`${streetView.lat}-${streetView.lng}`}
                  title="Street View"
                  src={`https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_KEY}&location=${streetView.lat},${streetView.lng}&heading=210&pitch=0&fov=80`}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; fullscreen"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* footer hint */}
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/60 border border-white/10 text-[11px] text-white/70">
                  {inTour ? 'You are inside · Aria continues' : 'Drag to look around · arrows to walk'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* === DEBUG HUD (always-on screen log so we can debug without DevTools) === */}
      <div className="absolute top-20 right-4 z-40 max-w-[min(440px,90vw)]">
        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="px-3 py-1.5 rounded-t-lg bg-black/85 border border-white/15 text-[10px] font-mono text-white/80 hover:text-white"
        >
          {debugOpen ? 'hide' : 'show'} debug ({debugLogs.length})
        </button>
        {debugOpen && (
          <div className="rounded-l-lg rounded-br-lg bg-black/85 border border-white/15 p-2 max-h-[60vh] overflow-y-auto font-mono text-[10px] leading-tight">
            {debugLogs.length === 0 && (
              <div className="text-white/40">no logs yet…</div>
            )}
            {debugLogs.map((l, i) => (
              <div
                key={i}
                className={
                  l.level === 'error'
                    ? 'text-red-300'
                    : l.level === 'warn'
                      ? 'text-yellow-300'
                      : l.level === 'info'
                        ? 'text-cyan-300'
                        : 'text-white/70'
                }
              >
                <span className="opacity-50">[{l.level}]</span> {l.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
