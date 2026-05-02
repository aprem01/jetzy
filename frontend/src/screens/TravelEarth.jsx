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
import { playWhoosh, playChime } from '../lib/sounds';

// Cesium Ion not required — we use Google Photorealistic 3D Tiles when a
// GOOGLE_MAPS_API_KEY is present and fall back to OSM tiles otherwise.
Cesium.Ion.defaultAccessToken = undefined;

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ARIA_AVATAR = '/aria-character.png';
// Per-character avatars so the face matches the voice. Stock portraits chosen
// to match the warm, premium "Soho-House-meets-travel" Jetzy aesthetic.
const MARCO_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face';
const SOFIA_AVATAR = 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face';
function avatarFor(speaker) {
  if (speaker === 'marco') return MARCO_AVATAR;
  if (speaker === 'sofia') return SOFIA_AVATAR;
  return ARIA_AVATAR;
}

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
  const tourSharedAudioRef = useRef(null); // single Audio element reused across all tour steps (iOS limit workaround)
  const tourAbortRef = useRef(false);
  const subSpotlightTimersRef = useRef([]);

  // Street View modal — opens a Google Street View pano at the current location
  // so the user can step out of the globe and "stand" at the venue / hotel.
  const [streetView, setStreetView] = useState(null); // { lat, lng, name } | null

  // === LIVE CONCIERGE SCENES ===
  // When the user types/speaks to Aria, voice-chat returns one or more
  // `scenes` describing where to fly + what spotlight to show. These run
  // outside tour mode and reuse the same spotlight render path so the live
  // experience looks identical to the pre-baked tours.
  const [liveScenes, setLiveScenes] = useState([]); // array from voice-chat
  const [liveSceneIndex, setLiveSceneIndex] = useState(0);
  const liveSceneTimersRef = useRef([]);
  const [livePhotoMap, setLivePhotoMap] = useState({}); // venue → photo URL (Wikipedia lookup)

  // === VIRTUAL INSIDE EXPERIENCE ===
  // Fullscreen "step inside" modal — auto-fading carousel of interior /
  // close-up photos for a venue, with optional Street View toggle.
  const [insideExperience, setInsideExperience] = useState(null);
  // shape: { name, photos: [url, ...], streetView: { lat, lng, heading } | null, autoAdvance: boolean }
  const [insidePhotoIndex, setInsidePhotoIndex] = useState(0);
  const [insideMode, setInsideMode] = useState('photos'); // 'photos' | 'streetview'
  const insideAdvanceTimerRef = useRef(null);

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

  // Dramatic 1.8s climb-from-zero on the Booked end card total.
  useEffect(() => {
    if (!showBooked) return;
    setDisplayedTotal(0);
    const target = cartTotal;
    const duration = 1800;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayedTotal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    // small delay so the user sees the "Booked." headline land first
    const startDelay = setTimeout(() => { raf = requestAnimationFrame(tick); }, 600);
    return () => { clearTimeout(startDelay); cancelAnimationFrame(raf); };
  }, [showBooked]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // Auto-advance the inside-experience photo carousel when in photos mode.
  useEffect(() => {
    if (!insideExperience || insideMode !== 'photos') return;
    const photos = insideExperience.photos || [];
    if (photos.length <= 1) return;
    if (insideAdvanceTimerRef.current) clearTimeout(insideAdvanceTimerRef.current);
    insideAdvanceTimerRef.current = setTimeout(() => {
      setInsidePhotoIndex((i) => (i + 1) % photos.length);
    }, 3500);
    return () => {
      if (insideAdvanceTimerRef.current) clearTimeout(insideAdvanceTimerRef.current);
    };
  }, [insideExperience, insidePhotoIndex, insideMode]);

  const openInside = useCallback((opts) => {
    setInsidePhotoIndex(0);
    setInsideMode(Array.isArray(opts.photos) && opts.photos.length > 0 ? 'photos' : 'streetview');
    setInsideExperience(opts);
  }, []);

  const closeInside = useCallback(() => {
    setInsideExperience(null);
    setInsidePhotoIndex(0);
    setInsideMode('photos');
    if (insideAdvanceTimerRef.current) clearTimeout(insideAdvanceTimerRef.current);
  }, []);

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

  // Fly the camera with cinematic easing (slow start, slow end). Cesium's
  // default linear easing makes camera moves feel mechanical; QUARTIC_IN_OUT
  // gives a more deliberate, "movie cinematographer" feel.
  const flyTo = useCallback((lng, lat, opts = {}) => {
    const v = viewerRef.current?.cesiumElement;
    if (!v) return;
    const { height = 5000, pitch = -0.5, duration = 4, heading = 0, silent = false } = opts;
    try {
      v.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
        duration,
        orientation: { heading, pitch, roll: 0 },
        easingFunction: Cesium.EasingFunction?.QUARTIC_IN_OUT,
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

  // Apply a single live scene: fly camera, drop marker, add cart, fetch photo
  // for the spotlight. Used by both the initial scene and any rotation.
  const applyScene = useCallback(async (scene) => {
    if (!scene) return;

    // Camera fly with the model's framing hints (or sensible defaults).
    if (typeof scene.lat === 'number' && typeof scene.lng === 'number') {
      flyTo(scene.lng, scene.lat, {
        height: scene.height ?? 5_000,
        pitch: scene.pitch ?? -0.35,
        heading: scene.heading ?? 0,
        duration: scene.duration ?? 4,
      });

      const m = {
        name: scene.venue || scene.spotlight?.name || 'Here',
        lat: scene.lat,
        lng: scene.lng,
      };
      setCurrentLocation(m);
      setMarkers((prev) =>
        prev.some((p) => p.name === m.name) ? prev : [...prev, m],
      );
    }

    // Cart items for this scene.
    if (Array.isArray(scene.cart) && scene.cart.length > 0) {
      setCart((prev) => {
        const have = new Set(prev.map((i) => i.name?.toLowerCase()));
        const fresh = scene.cart.filter(
          (i) => i?.name && !have.has(i.name.toLowerCase()),
        );
        if (fresh.length > 0) setTimeout(() => playChime(), 350);
        return [...prev, ...fresh];
      });
    }

    // Look up a Wikipedia photo for the spotlight hero. Cached client-side.
    const venueKey = scene.venue || scene.spotlight?.name;
    if (venueKey && !livePhotoMap[venueKey]) {
      try {
        const r = await fetch(`/api/venue-photo?q=${encodeURIComponent(venueKey)}`);
        if (r.ok) {
          const j = await r.json();
          if (j?.url) {
            setLivePhotoMap((prev) => ({ ...prev, [venueKey]: j.url }));
          }
        }
      } catch {}
    }
  }, [flyTo, livePhotoMap]);

  // Core pipeline: send a user message, get reply with cinematic scenes.
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', content: trimmed };
    const newMsgs = [...messagesRef.current, userMsg];
    setMessages(newMsgs);
    setIsThinking(true);
    setHasStarted(true);

    // Clear any in-flight scene rotation from a previous turn AND stop any
    // ElevenLabs / tour audio that's still playing — prevents voice overlap.
    try { stopEleven(); } catch {}
    try {
      const a = tourAudioRef.current;
      if (a) { a.pause(); a.currentTime = 0; }
    } catch {}
    try {
      const v = ariaVideoRef.current;
      if (v) { v.pause(); v.currentTime = 0; }
    } catch {}
    liveSceneTimersRef.current.forEach((t) => clearTimeout(t));
    liveSceneTimersRef.current = [];

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
      const scenes = Array.isArray(data?.scenes) ? data.scenes : [];
      const locations = Array.isArray(data?.locations) ? data.locations : [];
      const cartItems = Array.isArray(data?.cartItems) ? data.cartItems : [];

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, mood: data?.mood },
      ]);

      if (scenes.length > 0) {
        // Cinematic path: render scene-by-scene with full spotlight cards.
        setLiveScenes(scenes);
        setLiveSceneIndex(0);
        applyScene(scenes[0]);

        // Auto-advance through additional scenes evenly across the spoken
        // response (so the cards line up with what Aria is actually saying).
        if (scenes.length > 1) {
          const totalMs = Math.max(4000, (reply.split(/\s+/).length / 2.6) * 1000);
          const stepMs = totalMs / scenes.length;
          scenes.slice(1).forEach((s, i) => {
            const t = setTimeout(() => {
              setLiveSceneIndex(i + 1);
              applyScene(s);
            }, stepMs * (i + 1));
            liveSceneTimersRef.current.push(t);
          });
        }
      } else {
        // No scenes — clear any previous live spotlight so it doesn't linger.
        setLiveScenes([]);
        setLiveSceneIndex(0);
        // Legacy fallback: no scenes returned. Try the location/geocode path.
        if (locations.length > 0) {
          const first = locations[0];
          const placeName =
            typeof first === 'string' ? first : first?.name || first?.label || '';
          if (placeName) {
            const geo = await geocode(placeName);
            if (geo) {
              setCurrentLocation(geo);
              setMarkers((prev) =>
                prev.some((m) => m.name === geo.name) ? prev : [...prev, geo],
              );
              flyTo(geo.lng, geo.lat);
            }
          }
        }
        if (cartItems.length > 0) {
          setCart((prev) => {
            const have = new Set(prev.map((i) => i.name?.toLowerCase()));
            const fresh = cartItems.filter(
              (i) => i?.name && !have.has(i.name.toLowerCase()),
            );
            return [...prev, ...fresh];
          });
        }
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
  }, [user, geocode, flyTo, speak, applyScene]);

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
  }, []);

  const playStep = useCallback((step, { isFirst = false } = {}) => {
    return new Promise((resolve) => {
      if (tourAbortRef.current) return resolve();

      // Cinematic pacing — slowed for the polished demo. Bumped from 2.6s
      // base / 4.5s first-step to 4s base / 6s first-step. Investor needs a
      // beat to feel the destination before anything appears on screen.
      const flyDur = step.camera?.duration ?? (isFirst ? 6.0 : 4.0);
      if (step.camera) {
        flyTo(step.camera.lng, step.camera.lat, {
          height: step.camera.height,
          pitch: step.camera.pitch,
          heading: step.camera.heading ?? 0,
          duration: flyDur,
        });
      }

      // Marker drops immediately (subtle), but cart + spotlight + audio all
      // wait for a "settle" beat after the camera lands so the photo + place
      // can breathe for ~1.2s before the UI starts assembling.
      if (step.marker) {
        const m = step.marker;
        setMarkers((prev) =>
          prev.some((p) => p.name === m.name) ? prev : [...prev, m],
        );
        setCurrentLocation({ name: m.name, lat: m.lat, lng: m.lng });
      }

      // Reset rotating sub-spotlights to index 0
      setActiveSubSpotlight(0);
      subSpotlightTimersRef.current.forEach((t) => clearTimeout(t));
      subSpotlightTimersRef.current = [];

      const useVideo = !!step.video;

      // Settle hold: camera flies for `flyDur` seconds, then we wait ~65% of
      // that for the destination to land before the spotlight + cart + audio
      // all fire together. First step gets +1s extra for hero impact.
      const settleMs = Math.round(flyDur * 1000 * 0.65) + (isFirst ? 1000 : 0);

      const finish = () => {
        subSpotlightTimersRef.current.forEach((t) => clearTimeout(t));
        subSpotlightTimersRef.current = [];
        if (step.autoStreetView) setStreetView(null);
        setInsideExperience((curr) => (curr?.auto ? null : curr));
        if (tourAudioRef.current) tourAudioRef.current = null;
        setIsSpeaking(false);
        // Breath between steps.
        setTimeout(resolve, 600);
      };

      // Schedule everything at the settle point: cart, spotlight, video/audio,
      // and the auto Step Inside modal.
      const settleTimer = setTimeout(() => {
        if (tourAbortRef.current) return;

        // Cart items + chime
        if (Array.isArray(step.cart) && step.cart.length > 0) {
          setCart((prev) => {
            const have = new Set(prev.map((i) => i.name?.toLowerCase()));
            const fresh = step.cart.filter(
              (i) => i?.name && !have.has(i.name.toLowerCase()),
            );
            if (fresh.length > 0) setTimeout(() => playChime(), 250);
            return [...prev, ...fresh];
          });
        }

        // Spotlight reveal
        setCurrentSpeaker(step.speaker || 'aria');
        setAriaLine(step.text);
        setIsSpeaking(true);
        setAriaVideo(useVideo ? step.video : null);

        // Rotating sub-spotlights (Mendoza step) — schedule relative to NOW
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

        // Auto-open the Step Inside fullscreen carousel 1.8s after spotlight
        const sp0 = Array.isArray(step.spotlights) && step.spotlights.length > 0
          ? step.spotlights[0]
          : step.spotlight;
        if (sp0 && step.duration > 3) {
          const insidePhotos = [
            ...(sp0.image ? [sp0.image] : []),
            ...(Array.isArray(sp0.interior) ? sp0.interior : []),
          ];
          if (insidePhotos.length > 0) {
            const insideTimer = setTimeout(() => {
              if (tourAbortRef.current) return;
              openInside({
                name: sp0.name,
                photos: insidePhotos,
                streetView: step.marker?.lat && step.marker?.lng
                  ? { lat: step.marker.lat, lng: step.marker.lng, heading: 210 }
                  : null,
                placeQuery: step.placeQuery || sp0.placeQuery || sp0.name,
                auto: true,
              });
            }, 1800);
            subSpotlightTimersRef.current.push(insideTimer);
          }
        }

        // Audio/video playback — uses the SHARED Audio element (primed in
        // startTour) for all audio fallbacks, never creates new ones, so we
        // don't trip iOS Safari's ~6-Audio-element limit.
        const playSharedAudio = (src) => {
          const a = tourSharedAudioRef.current;
          if (!a) return;
          tourAudioRef.current = a;
          a.onended = finish;
          a.onerror = finish;
          a.src = src;
          a.currentTime = 0;
          a.muted = false;
          a.play().catch(() => finish());
        };

        if (useVideo) {
          setTimeout(() => {
            if (tourAbortRef.current) return resolve();
            const v = ariaVideoRef.current;
            if (!v) { playSharedAudio(step.audio); return; }
            v.currentTime = 0;
            v.muted = false;
            v.onended = finish;
            v.onerror = finish;
            v.play().catch(() => playSharedAudio(step.audio));
          }, 80);
        } else {
          setTimeout(() => {
            if (tourAbortRef.current) return resolve();
            playSharedAudio(step.audio);
          }, 200);
        }
      }, settleMs);
      subSpotlightTimersRef.current.push(settleTimer);
    });
  }, [flyTo, openInside]);

  const startTour = useCallback(async (tourId) => {
    const t = TOURS.find((x) => x.id === tourId);
    if (!t) return;

    if (!audioUnlockedRef.current) {
      try { unlockAudio(); } catch {}
      audioUnlockedRef.current = true;
    }

    // === iOS AUTOPLAY UNLOCK ===
    // iOS Safari has TWO problems for our use case:
    //   1. play() must originate from a user gesture, not setTimeout
    //   2. Hard limit of ~6 Audio elements per page (creating more silently
    //      fails after the limit), and gesture-priming is element-specific
    //      so a primed element can't authorize a different one later
    //
    // Fix: the SAME single Audio element gets reused across all tour steps
    // by mutating its `src`. We prime it once here (inside the gesture) by
    // setting src to the first step and calling play()+pause(). Any future
    // play() on this element from any context is then allowed.
    if (!tourSharedAudioRef.current) {
      tourSharedAudioRef.current = new Audio();
      tourSharedAudioRef.current.preload = 'auto';
    }
    try {
      const sharedAudio = tourSharedAudioRef.current;
      const firstStepAudio = t.steps.find((s) => s.audio)?.audio;
      if (firstStepAudio) {
        sharedAudio.src = firstStepAudio;
        sharedAudio.muted = true;
        sharedAudio.play().then(() => {
          sharedAudio.pause();
          sharedAudio.muted = false;
          sharedAudio.currentTime = 0;
        }).catch(() => {});
      }
      // Prime the in-DOM <video> element too — it's the same element each
      // step (we just change its src), so a single gesture-prime unlocks it.
      const v = ariaVideoRef.current;
      if (v) {
        v.muted = true;
        v.play().then(() => {
          v.pause();
          v.muted = false;
        }).catch(() => {});
      }
    } catch {}

    // Stop ANY in-flight audio first — live-concierge ElevenLabs, prior tour
    // audio/video, leftover live-scene timers — so we don't get voice overlap.
    try { stopEleven(); } catch {}
    try {
      const a = tourAudioRef.current;
      if (a) { a.pause(); a.currentTime = 0; }
    } catch {}
    try {
      const v = ariaVideoRef.current;
      if (v) { v.pause(); v.currentTime = 0; }
    } catch {}
    tourAudioRef.current = null;
    liveSceneTimersRef.current.forEach((t) => clearTimeout(t));
    liveSceneTimersRef.current = [];
    setLiveScenes([]);
    setLiveSceneIndex(0);

    tourAbortRef.current = false;
    setHasStarted(true);
    setTour(t);
    setTourStepIndex(0);

    // (background music disabled per investor-demo preference — Aria's
    // voice carries the emotion; cleaner mix when recording the screen)

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
      // Final celebratory chime to mark the booking.
      setTimeout(() => playChime({ volume: 0.25 }), 400);
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
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ height: '100dvh' }}>
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
                placeQuery: currentLocation.name,
              })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-[#C9A84C]/15 border border-[#C9A84C]/50 hover:bg-[#C9A84C]/30 hover:border-[#C9A84C] text-[#C9A84C] text-xs font-medium transition-all"
              aria-label="View location details"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">View details</span>
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

      {/* === AVATAR (bottom-left) — Aria normally; faded when Marco speaks ===
           z-40 keeps it above the inset Inside Modal (z-30) during tour mode. */}
      <div className="absolute bottom-8 left-6 z-40 flex items-end gap-4 max-w-[min(560px,55vw)]">
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
              } transition-all`}
            >
              {/* Avatar backdrop matches the speaker (Aria / Marco / Sofia)
                  so the face matches the voice. Hedra video overlays when
                  available — if it 404s (still rendering), the photo
                  underneath stays visible. */}
              <img
                src={avatarFor(currentSpeaker)}
                alt={currentSpeaker === 'marco' ? 'Marco' : currentSpeaker === 'sofia' ? 'Sofia' : 'Aria'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {ariaVideo && currentSpeaker === 'aria' && (
                <video
                  ref={ariaVideoRef}
                  src={ariaVideo}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  preload="auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
          <div className="mt-2 text-center">
            <div className="font-display text-sm text-white tracking-wide">
              {currentSpeaker === 'marco' ? 'Marco' : currentSpeaker === 'sofia' ? 'Sofia' : 'Aria'}
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
              {currentSpeaker === 'marco' ? 'MARCO' : currentSpeaker === 'sofia' ? 'SOFIA' : 'ARIA'}
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
          {/* Featured Tour cards — color accent per destination */}
          {TOURS.filter((t) => t.featured).map((t) => {
            const accentMap = {
              gold:  { ring: '#C9A84C', text: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]', border: 'border-[#C9A84C]/40 hover:border-[#C9A84C]' },
              pink:  { ring: '#F08DA5', text: 'text-pink-300',  bg: 'bg-pink-300',  border: 'border-pink-400/40 hover:border-pink-300' },
              rose:  { ring: '#E2746B', text: 'text-rose-300',  bg: 'bg-rose-300',  border: 'border-rose-400/40 hover:border-rose-300' },
              amber: { ring: '#E89940', text: 'text-amber-300', bg: 'bg-amber-300', border: 'border-amber-400/40 hover:border-amber-300' },
            };
            const a = accentMap[t.accent] || accentMap.gold;
            return (
            <button
              key={t.id}
              onClick={() => startTour(t.id)}
              className={`group w-full text-left px-5 py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[#1B2B4B]/85 to-black/85 border ${a.border} hover:from-[#1B2B4B]/95 hover:to-black/95 shadow-2xl transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${a.bg} text-black flex items-center justify-center shadow-lg shrink-0`}>
                  <Play size={16} className="ml-0.5" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold tracking-[0.22em] ${a.text} mb-0.5`}>
                    FEATURED · {t.estSeconds}s
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
            );
          })}

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

      {/* === VENUE SPOTLIGHT ===
           Used by BOTH tour mode and live concierge. Tour mode reads from
           tour.steps[tourStepIndex]; live mode reads from liveScenes[liveSceneIndex]. */}
      {(() => {
        const inTour = !!tour;
        const liveScene = !inTour && liveScenes.length > 0 ? liveScenes[Math.min(liveSceneIndex, liveScenes.length - 1)] : null;
        const step = inTour ? tour.steps[tourStepIndex] : liveScene
          ? {
              spotlight: liveScene.spotlight ? {
                ...liveScene.spotlight,
                // Inject the looked-up Wikipedia photo if model didn't supply one.
                image: liveScene.spotlight.image || livePhotoMap[liveScene.venue || liveScene.spotlight.name],
              } : null,
              marker: liveScene.lat && liveScene.lng
                ? { name: liveScene.venue || liveScene.spotlight?.name, lat: liveScene.lat, lng: liveScene.lng }
                : null,
              placeQuery: liveScene.placeQuery,
              picks: liveScene.spotlight?.picks,
            }
          : null;
        if (!step || (!step.spotlight && !step.spotlights)) return null;
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
            className="absolute top-20 right-3 sm:right-6 z-30 w-[min(420px,calc(100vw-1.5rem))] animate-fade-up rounded-2xl overflow-y-auto overscroll-contain backdrop-blur-xl bg-black/85 border border-[#C9A84C]/40 shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
            style={{
              maxHeight: 'calc(100dvh - 8rem)',
              overflowY: 'scroll',
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch',
              isolation: 'isolate',
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              const v = viewerRef.current?.cesiumElement;
              if (v?.scene?.screenSpaceCameraController) {
                v.scene.screenSpaceCameraController.enableInputs = false;
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              const v = viewerRef.current?.cesiumElement;
              if (v?.scene?.screenSpaceCameraController) {
                v.scene.screenSpaceCameraController.enableInputs = true;
              }
            }}
            onTouchCancel={() => {
              const v = viewerRef.current?.cesiumElement;
              if (v?.scene?.screenSpaceCameraController) {
                v.scene.screenSpaceCameraController.enableInputs = true;
              }
            }}
            onWheel={(e) => e.stopPropagation()}
            onMouseEnter={() => {
              const v = viewerRef.current?.cesiumElement;
              if (v?.scene?.screenSpaceCameraController) {
                v.scene.screenSpaceCameraController.enableZoom = false;
              }
            }}
            onMouseLeave={() => {
              const v = viewerRef.current?.cesiumElement;
              if (v?.scene?.screenSpaceCameraController) {
                v.scene.screenSpaceCameraController.enableZoom = true;
              }
            }}
          >
            <div className="relative">
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
              {/* Cinematic hero image with Ken Burns slow zoom + default fallback */}
              <div className="relative h-44 sm:h-56 overflow-hidden bg-gradient-to-br from-[#1B2B4B] via-[#0b0f1a] to-[#1B2B4B]">
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
                    loading="eager"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <Sparkles size={32} className="mx-auto text-[#C9A84C]/40 mb-2" />
                      <div className="text-[10px] font-bold tracking-[0.22em] text-white/40">
                        DETAIL VIEW
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                {s.tag && (
                  <div className="absolute top-3.5 left-3.5 px-3 py-1.5 rounded-full bg-[#C9A84C] text-black text-[10px] font-bold tracking-[0.28em] shadow-xl uppercase">
                    {s.tag}
                  </div>
                )}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="font-display text-3xl sm:text-4xl text-white leading-[1.05] drop-shadow-2xl tracking-tight">
                    {s.name}
                  </div>
                  {s.subtitle && (
                    <div className="text-sm sm:text-base text-white/95 mt-2 drop-shadow-lg leading-snug font-light">
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
              {/* Social: Jetzy travelers who recently went here */}
              {Array.isArray(s.travelers) && s.travelers.length > 0 && (
                <div className="px-4 pt-2 pb-2 border-t border-white/10 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {s.travelers.map((t) => (
                      <img
                        key={t.name}
                        src={t.avatar}
                        alt={t.name}
                        className="w-7 h-7 rounded-full border-2 border-black object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-white/70 leading-tight">
                    <span className="text-white font-semibold">
                      {s.travelers.length}+ Jetzy travelers
                    </span>{' '}
                    here recently
                    <div className="text-[9px] text-white/40 truncate">
                      {s.travelers.slice(0, 2).map((t) => t.name).join(' · ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Per-stay itinerary timeline — capped to 3 items so the
                  card always fits without needing to scroll. */}
              {Array.isArray(s.itinerary) && s.itinerary.length > 0 && (
                <div className="px-4 pt-1 pb-3 border-t border-white/10">
                  <div className="text-[9px] font-bold tracking-[0.18em] text-[#C9A84C]/85 uppercase mb-2 mt-2">
                    While you're here
                  </div>
                  <ol className="space-y-1.5">
                    {s.itinerary.slice(0, 3).map((it, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs">
                        <span className="text-[10px] font-bold tracking-wide text-[#C9A84C]/90 whitespace-nowrap min-w-[88px]">
                          {it.time}
                        </span>
                        <span className="text-white/85 leading-snug flex-1">
                          {it.what}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Famous adjacent picks — capped to 2 so card stays compact. */}
              {Array.isArray(picks) && picks.length > 0 && (
                <div className="px-4 pt-1 pb-3 border-t border-white/10">
                  <div className="text-[9px] font-bold tracking-[0.18em] text-[#C9A84C]/85 uppercase mb-2 mt-2">
                    Curated picks here
                  </div>
                  <ul className="space-y-2">
                    {picks.slice(0, 2).map((p) => {
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
              {/* CTAs — Step Inside (interior gallery) + See on Maps */}
              {(s.interior?.length > 0 || s.image || (m?.lat && m?.lng)) && (
                <div className="grid grid-cols-2 border-t border-[#C9A84C]/30">
                  <button
                    onClick={() => {
                      const photos = [
                        ...(s.image ? [s.image] : []),
                        ...(s.interior || []),
                      ];
                      const sv = (m?.lat && m?.lng)
                        ? { lat: m.lat, lng: m.lng, heading: 210 }
                        : null;
                      openInside({ name: s.name, photos, streetView: sv });
                    }}
                    className="py-3 bg-[#C9A84C]/15 hover:bg-[#C9A84C]/30 flex items-center justify-center gap-2 text-[#C9A84C] text-sm font-medium transition-colors"
                  >
                    <Eye size={14} />
                    Step Inside
                  </button>
                  {m?.lat && m?.lng && (
                    <button
                      onClick={() => setStreetView({
                        lat: m.lat, lng: m.lng,
                        name: s.name,
                        placeQuery: s.placeQuery || step.placeQuery || s.name,
                      })}
                      className="py-3 bg-black/40 hover:bg-[#C9A84C]/15 border-l border-[#C9A84C]/30 flex items-center justify-center gap-2 text-white/85 text-sm font-medium transition-colors"
                    >
                      <MapPin size={14} />
                      Maps
                    </button>
                  )}
                </div>
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
                  style={{ animationDelay: `${300 + i * 320}ms`, animationFillMode: 'both' }}
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

          {/* CTA */}
          <button
            onClick={() => setShowBooked(false)}
            className="mt-8 px-8 py-3 rounded-full bg-[#C9A84C] hover:bg-[#d8b85c] text-black font-semibold text-sm tracking-wide shadow-2xl transition-all"
          >
            Plan another trip
          </button>
        </div>
      )}

      {/* === VIRTUAL INSIDE EXPERIENCE MODAL ===
           Fullscreen takeover: auto-cross-fading carousel of interior photos
           OR Google Street View if the venue has a panorama. Designed to
           feel like stepping into a luxury travel-magazine spread. */}
      {insideExperience && (() => {
        const exp = insideExperience;
        const photos = exp.photos || [];
        const photo = photos[insidePhotoIndex] || photos[0];
        const hasPhotos = photos.length > 0;
        const hasSV = !!exp.streetView;
        const hasMap = !!(exp.placeQuery || exp.streetView);
        // Auto-trigger from a tour step: render as a centered inset window
        // so the avatar, caption, and HUD stay visible during the demo.
        // Manual click: full-screen takeover.
        const auto = !!exp.auto;
        // Auto (during a tour): centered inset on desktop, centered + nearly
        // full-width on phone so we don't crowd the frame. Manual click:
        // full-screen takeover.
        const wrapperClass = auto
          ? 'absolute inset-0 z-30 flex items-center sm:items-start justify-center pt-2 sm:pt-20 px-2 sm:px-4 pointer-events-none'
          : 'fixed inset-0 z-50 bg-black flex flex-col animate-fade-in';
        const innerClass = auto
          ? 'relative w-[min(900px,96vw)] h-[min(560px,50vh)] sm:h-[min(560px,62vh)] rounded-2xl overflow-hidden bg-black border border-[#C9A84C]/40 shadow-[0_30px_80px_rgba(0,0,0,0.7)] pointer-events-auto'
          : 'relative w-full h-full bg-black flex flex-col';
        return (
          <div className={wrapperClass}>
            <div className={innerClass}>
            {/* header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-4 pb-10 bg-gradient-to-b from-black/85 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 flex items-center justify-center">
                  <Eye size={16} className="text-[#C9A84C]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-[#C9A84C] mb-0.5">
                    {insideMode === 'streetview' ? 'STREET VIEW' : 'STEP INSIDE'}
                  </div>
                  <div className="font-display text-base text-white leading-tight">
                    {exp.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mode toggle: PHOTOS | MAP | STREET — only show modes that
                    have data so we never expose a broken tab. */}
                <div className="flex rounded-full bg-black/60 border border-white/15 p-0.5 mr-2">
                  {hasPhotos && (
                    <button
                      onClick={() => setInsideMode('photos')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] transition-all ${
                        insideMode === 'photos' ? 'bg-[#C9A84C] text-black' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      PHOTOS
                    </button>
                  )}
                  {hasMap && (
                    <button
                      onClick={() => setInsideMode('map')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] transition-all ${
                        insideMode === 'map' ? 'bg-[#C9A84C] text-black' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      MAP
                    </button>
                  )}
                  {hasSV && (
                    <button
                      onClick={() => setInsideMode('streetview')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] transition-all ${
                        insideMode === 'streetview' ? 'bg-[#C9A84C] text-black' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      STREET
                    </button>
                  )}
                </div>
                <button
                  onClick={closeInside}
                  className="w-10 h-10 rounded-full bg-black/60 border border-white/15 hover:bg-red-500/30 hover:border-red-400/60 text-white flex items-center justify-center transition-colors"
                  aria-label="Close inside experience"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Hero stage */}
            <div className="absolute inset-0 flex items-center justify-center">
              {insideMode === 'photos' && hasPhotos && (
                <>
                  {/* Photos render stacked so we get a smooth crossfade */}
                  {photos.map((src, i) => (
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={exp.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        i === insidePhotoIndex ? 'opacity-100 animate-ken-burns' : 'opacity-0'
                      }`}
                      style={{ zIndex: i === insidePhotoIndex ? 1 : 0 }}
                    />
                  ))}
                  {/* Subtle vignette so caption stays legible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 z-10 pointer-events-none" />
                </>
              )}
              {insideMode === 'streetview' && hasSV && (
                <iframe
                  key={`sv-${exp.streetView.lat}-${exp.streetView.lng}`}
                  title="Street View"
                  src={`https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_KEY}&location=${exp.streetView.lat},${exp.streetView.lng}&heading=${exp.streetView.heading || 210}&pitch=0&fov=80`}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; fullscreen"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>

            {/* Bottom bar — photo counter + nav */}
            {insideMode === 'photos' && photos.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 pb-6 pt-12 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInsidePhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                    className="w-10 h-10 rounded-full bg-black/60 border border-white/15 hover:bg-white/10 text-white flex items-center justify-center"
                    aria-label="Previous photo"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => setInsidePhotoIndex((i) => (i + 1) % photos.length)}
                    className="w-10 h-10 rounded-full bg-black/60 border border-white/15 hover:bg-white/10 text-white flex items-center justify-center"
                    aria-label="Next photo"
                  >
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/15">
                  <div className="flex gap-1">
                    {photos.map((_, i) => (
                      <span
                        key={i}
                        className={
                          i === insidePhotoIndex
                            ? 'w-6 h-1.5 rounded-full bg-[#C9A84C] transition-all'
                            : 'w-1.5 h-1.5 rounded-full bg-white/30 transition-all'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.18em] text-white/70 ml-2 tabular-nums">
                    {insidePhotoIndex + 1} / {photos.length}
                  </span>
                </div>
                <div className="w-[88px]" /> {/* spacer for symmetric layout */}
              </div>
            )}
            </div>
          </div>
        );
      })()}

      {/* === PLACE DETAIL MODAL ===
           Uses Google Maps Embed "place" mode — shows the actual venue card
           with name, photos, reviews, hours, and a real satellite + Street
           View toggle inside the embed. Works for every location regardless
           of Street View coverage (Eolo's middle-of-steppe, etc).
           In tour mode: centered window, HUD stays visible.
           Manual: full-screen takeover. */}
      {streetView && (() => {
        const inTour = !!tour;
        // Prefer a textual query so Google's embed shows the rich place card
        // with photos + reviews. Falls back to lat/lng with a satellite view.
        const q = streetView.placeQuery
          ? encodeURIComponent(streetView.placeQuery)
          : `${streetView.lat},${streetView.lng}`;
        const mode = streetView.placeQuery ? 'place' : 'view';
        const src = mode === 'place'
          ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${q}&zoom=17`
          : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_KEY}&center=${q}&zoom=17&maptype=satellite`;
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
                    <MapPin size={14} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.22em] text-[#C9A84C] mb-0.5">
                      {mode === 'place' ? 'PLACE DETAIL' : 'LOCATION'}
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
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {/* iframe */}
              <div className="flex-1 relative">
                <iframe
                  key={src}
                  title="Place Detail"
                  src={src}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; fullscreen"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* footer hint */}
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/60 border border-white/10 text-[11px] text-white/70">
                  {inTour ? 'On Google Maps · Aria continues' : 'Tap pin → photos · reviews · hours'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* (debug HUD removed for investor demo) */}
    </div>
  );
}
