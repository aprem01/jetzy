import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Mic, MicOff, Send, Sparkles, Volume2, Plane, MapPin, Sun, Moon, Cloud, Camera, Calendar, ChevronRight, X } from 'lucide-react';

// === Avatar Characters with personalities ===
const AVATARS = [
  {
    id: 'priya',
    name: 'Priya',
    region: 'India & South Asia',
    home: 'Chennai',
    accent: 'Indian English, warm and lyrical',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
    color: 'from-orange-500 to-pink-600',
    personality: 'Warm, poetic, deeply knowledgeable about temples, food, and family rituals. Speaks like a beloved aunt who wants you to taste everything.',
    voiceRate: 0.92,
    voicePitch: 1.05,
    greeting: 'Vanakkam! I\'m Priya. I grew up in Chennai — the city where filter coffee runs in our veins and the temples wake the city before the sun. Where shall I take you?',
    destinations: ['Chennai', 'Mumbai', 'Goa', 'Kerala', 'Delhi', 'Varanasi'],
  },
  {
    id: 'diego',
    name: 'Diego',
    region: 'Latin America',
    home: 'Buenos Aires',
    accent: 'Argentine Spanish-English, confident and theatrical',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
    color: 'from-amber-500 to-red-600',
    personality: 'Theatrical, passionate, talks about steak and tango like religion. Will make you book Patagonia tonight.',
    voiceRate: 0.95,
    voicePitch: 0.95,
    greeting: 'Che, hola! I\'m Diego, from Buenos Aires. From the asados of Palermo to the wind of Patagonia — I know every secret. Where do you want to go?',
    destinations: ['Buenos Aires', 'El Chaltén', 'Mexico City', 'Medellín', 'Cusco', 'Cartagena'],
  },
  {
    id: 'yuki',
    name: 'Yuki',
    region: 'Japan & East Asia',
    home: 'Tokyo',
    accent: 'Japanese English, calm and precise',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    color: 'from-pink-400 to-rose-500',
    personality: 'Calm, precise, finds the perfect detail. Will tell you which 6-seat bar in Golden Gai to walk into.',
    voiceRate: 0.88,
    voicePitch: 1.1,
    greeting: 'Konnichiwa. I\'m Yuki. I\'ll show you the Tokyo most travelers never see — the 5am tamagoyaki stall, the hidden ramen alley, the temple at dawn. Where shall we begin?',
    destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Hokkaido', 'Seoul', 'Bangkok'],
  },
  {
    id: 'amara',
    name: 'Amara',
    region: 'Africa',
    home: 'Arusha, Tanzania',
    accent: 'East African English, adventurous and grounded',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    color: 'from-emerald-500 to-amber-600',
    personality: 'Adventurous, grounded, has spent dawn at Ngorongoro Crater more times than she can count. Will get you there.',
    voiceRate: 0.92,
    voicePitch: 0.98,
    greeting: 'Karibu! I\'m Amara, from Arusha — the gateway to the Serengeti. I\'ve watched the migration cross the Mara River 47 times. Where shall I take you?',
    destinations: ['Serengeti', 'Kilimanjaro', 'Marrakech', 'Cape Town', 'Cairo', 'Zanzibar'],
  },
  {
    id: 'sophie',
    name: 'Sophie',
    region: 'Europe',
    home: 'Lisbon',
    accent: 'Portuguese-French English, sophisticated and warm',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    color: 'from-indigo-500 to-purple-600',
    personality: 'Sophisticated, warm, knows the wine and the bookshop and the right bench at sunset. Will introduce you to the city.',
    voiceRate: 0.94,
    voicePitch: 1.02,
    greeting: 'Olá! I\'m Sophie, from Lisbon. Europe is full of cities that pretend to be old — I\'ll show you the ones that actually are. Where shall we begin?',
    destinations: ['Lisbon', 'Paris', 'Rome', 'Barcelona', 'Istanbul', 'Athens'],
  },
];

// === Destination Scenes — full immersive experiences ===
const SCENES = {
  Chennai: {
    intro: { time: 'Golden hour', weather: 'warm, 32°C', sound: 'temple bells in the distance', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Marina Beach at sunrise', narration: 'We\'re at Marina Beach — second longest urban beach in the world. The fishermen are pulling in their nets. Vendors are roasting peanuts on charcoal. The sun is just lifting over the Bay of Bengal. Smell the salt, the spice, the morning.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&h=1000&fit=crop' },
      { name: 'Kapaleeshwarar Temple, Mylapore', narration: 'Now we\'re at the 7th-century Kapaleeshwarar Temple. The gopuram rises in carved color above us. Inside, the priests are doing morning puja. Camphor smoke. Marigolds. A thousand small bells. This is the heartbeat of old Chennai.', image: 'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?w=1600&h=1000&fit=crop' },
      { name: 'Filter coffee at Saravana Bhavan', narration: 'Sit. This is filter coffee — decoction at the bottom, frothed milk on top, served in a steel davara-tumbler. Sip from the tumbler, let it cool in the davara. Sweet, strong, unforgettable. ₹40. The way Tamil mornings should taste.', image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1600&h=1000&fit=crop' },
      { name: 'Mylapore market at dusk', narration: 'Walk with me through Mylapore market. Mounds of jasmine being strung into garlands. Brass lamps glowing in the shop windows. Women in silk saris haggling over mangoes. This is the Chennai I want you to fall in love with.', image: 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=1600&h=1000&fit=crop' },
    ],
  },
  Tokyo: {
    intro: { time: 'Pre-dawn', weather: 'crisp, 8°C', sound: 'distant trains', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Tsukiji outer market, 5am', narration: 'It\'s 5am at Tsukiji outer market. Skip the famous sushi line. Walk past Gate 4. Find the tamagoyaki stall — 30 years, no English sign. ¥300 for an egg that will rewire your brain. The lady remembers your face.', image: 'https://images.unsplash.com/photo-1551863863-e01bc16f4b50?w=1600&h=1000&fit=crop' },
      { name: 'Shibuya Crossing at twilight', narration: 'Shibuya Crossing at twilight. 3,000 people every two minutes. Look up — the buildings are screaming color in Japanese. Look down — perfect strangers weaving past each other in choreographed silence. This is Tokyo\'s heartbeat.', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1600&h=1000&fit=crop' },
      { name: 'Golden Gai, midnight', narration: 'Golden Gai. Six narrow alleys, two hundred bars, most with six seats. Pick the one with no English sign. Order what the bartender pours. ¥3,000 will buy you the night of your life. Dress simply. Talk to your neighbor. This is the real Tokyo.', image: 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&h=1000&fit=crop' },
    ],
  },
  'El Chaltén': {
    intro: { time: 'Pre-dawn', weather: 'cold, windy, 4°C', sound: 'wind across the steppe', image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Laguna de los Tres at sunrise', narration: 'It\'s 7am. We\'ve been hiking since 4:30 in the dark. Now Fitz Roy is in front of you, catching the first light. Pink, then orange, then gold. The wind is trying to push you over. You will stand here for twenty minutes and forget your name. This is why people fly to Patagonia.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop' },
      { name: 'La Cervecería after the trail', narration: 'You just hiked ten hours. This is La Cervecería. Order the stout — best craft beer south of the equator. Lamb empanadas to share. Sit outside if the wind allows. The other hikers are telling stories that will become yours.', image: 'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?w=1600&h=1000&fit=crop' },
      { name: 'Senderos Hostería, mountain view', narration: 'You\'re at Senderos Hostería. María at reception drew the trail map on a napkin. The bed faces a window that frames Cerro Solo. $120 a night. Best night\'s sleep you\'ll have all year.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=1000&fit=crop' },
    ],
  },
  Serengeti: {
    intro: { time: 'Dawn', weather: 'cool morning, 18°C', sound: 'lions calling far away', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Mara River crossing', narration: 'It\'s 5:30am. We\'re at the Mara River. The wildebeest have been gathering for hours, hesitating. One starts. Then a thousand. Crocodiles wait. Dust. Hooves. Survival in raw form. Cameras on burst mode — you\'ll only see this once.', image: 'https://images.unsplash.com/photo-1568434438755-8c52ab73bd55?w=1600&h=1000&fit=crop' },
      { name: 'Mobile camp at dusk', narration: 'Back at the mobile camp. Wayo Africa. Canvas tent, bucket shower, a fire under stars you\'ve never seen. Dinner is being cooked over coals. Lions calling somewhere in the dark. This is the Africa your grandfather read about.', image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&h=1000&fit=crop' },
      { name: 'Ngorongoro Crater rim', narration: 'Sunrise at the Ngorongoro Crater rim. 600m below, 25,000 animals are waking up in the world\'s largest intact caldera. You can see flamingos turning the lake pink from here. We descend at 6:30.', image: 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=1600&h=1000&fit=crop' },
    ],
  },
  Lisbon: {
    intro: { time: 'Late afternoon', weather: 'warm, 22°C', sound: 'tram bells, gulls', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Tram 28 through Alfama', narration: 'We\'re on Tram 28, climbing through Alfama. Yellow walls. Laundry on lines above. Kids playing soccer on a stair. Old men playing cards outside a bar. The city smells like grilled sardines. This is Lisbon\'s soul.', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1600&h=1000&fit=crop' },
      { name: 'Cervejaria Ramiro, 7pm', narration: 'Skip Time Out Market — that\'s for tourists. We\'re at Cervejaria Ramiro on Avenida Almirante Reis. Tiger prawns. Goose barnacles. Finish with a bifana — pork sandwich, the real way to end a seafood meal. €38 a person.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&h=1000&fit=crop' },
      { name: 'Miradouro at sunset', narration: 'Miradouro de Santa Catarina. Locals call it Adamastor. Bring a beer from the kiosk. Sit on the wall. The Tagus turns gold. A guitar starts somewhere. This is the Lisbon you\'ll dream about.', image: 'https://images.unsplash.com/photo-1558370781-d6196949e317?w=1600&h=1000&fit=crop' },
    ],
  },
  'Buenos Aires': {
    intro: { time: 'Late night', weather: 'mild, 24°C', sound: 'distant tango', image: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Don Julio, Palermo', narration: 'Don Julio in Palermo. Best parrilla in Buenos Aires, maybe the world. Order the entraña — skirt steak, medium-rare. Provoleta to start. A bottle of Malbec from Mendoza. 25,000 ARS for two. Book lunch instead of dinner — same menu, half the wait.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1600&h=1000&fit=crop' },
      { name: 'La Catedral, midnight tango', narration: 'La Catedral. Not the tourist tango show — this is the real thing. A dimly-lit warehouse where porteños actually dance. Tuesday and Thursday milongas. 3,000 ARS to enter. Dress down, not up. Watch first. Maybe dance later.', image: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=1600&h=1000&fit=crop' },
      { name: 'San Telmo at 4am', narration: 'It\'s 4am in San Telmo. The empanada place is still open. The streets smell like rain and yerba mate. A cat watches you from a doorway. This city does not sleep — it just changes shifts.', image: 'https://images.unsplash.com/photo-1574802820407-8f0a7a8d4a82?w=1600&h=1000&fit=crop' },
    ],
  },
  Marrakech: {
    intro: { time: 'Sunset', weather: 'hot, 36°C', sound: 'snake charmers, drums', image: 'https://images.unsplash.com/photo-1539020140153-e479b8c5b6c3?w=1600&h=1000&fit=crop' },
    moments: [
      { name: 'Jemaa el-Fnaa at dusk', narration: 'Jemaa el-Fnaa. The square wakes up at sunset. Snake charmers. Storytellers. Smoke from a hundred grills rising into the call to prayer. Order tagine from stall 14. Mint tea after. Watch the city become a dream.', image: 'https://images.unsplash.com/photo-1597212624181-f6c33b2f8a6e?w=1600&h=1000&fit=crop' },
      { name: 'Souk in the medina', narration: 'We\'re inside the medina now. Carpets stacked twenty high. The smell of leather and saffron. Tea offered everywhere — say yes. The shopkeeper will quote 800 dirham. You will pay 250. This is the dance.', image: 'https://images.unsplash.com/photo-1539020140153-e479b8c5b6c3?w=1600&h=1000&fit=crop' },
    ],
  },
};

const PHILLY_HOME = 'https://images.unsplash.com/photo-1556377483-9aacf8a08adf?w=1600&h=1000&fit=crop';

export default function VirtualTravel() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [destination, setDestination] = useState(null);
  const [currentScene, setCurrentScene] = useState(null); // index into scenes
  const [transporting, setTransporting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBookCTA, setShowBookCTA] = useState(false);
  const [booked, setBooked] = useState(false);
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

  const speak = (text, voiceConfig = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = voiceConfig.rate || selectedAvatar?.voiceRate || 0.95;
    u.pitch = voiceConfig.pitch || selectedAvatar?.voicePitch || 1.0;
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

  const pickAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setMessages([{ role: 'assistant', content: avatar.greeting }]);
    setTimeout(() => speak(avatar.greeting, { rate: avatar.voiceRate, pitch: avatar.voicePitch }), 400);
  };

  // Cinematic transport sequence
  const transportTo = async (dest) => {
    if (!SCENES[dest]) return;
    stopSpeaking();
    setTransporting(true);
    await new Promise(r => setTimeout(r, 2800)); // animation duration
    setDestination(dest);
    setCurrentScene(0);
    setTransporting(false);

    const intro = SCENES[dest].intro;
    const arrivalText = `We've arrived in ${dest}. ${intro.time}, the air is ${intro.weather}, you can hear ${intro.sound}. Where shall I take you first?`;
    setMessages(prev => [...prev, { role: 'assistant', content: arrivalText, isArrival: true }]);
    setTimeout(() => speak(arrivalText), 600);
  };

  const goToScene = (sceneIdx) => {
    setCurrentScene(sceneIdx);
    const scene = SCENES[destination].moments[sceneIdx];
    setMessages(prev => [...prev, { role: 'assistant', content: scene.narration }]);
    speak(scene.narration);
    if (sceneIdx === SCENES[destination].moments.length - 1) {
      setTimeout(() => setShowBookCTA(true), 2000);
    }
  };

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: t }]);

    // Detect destination intent
    const lowerT = t.toLowerCase();
    const destMatch = Object.keys(SCENES).find(d => lowerT.includes(d.toLowerCase()));
    if (destMatch && !destination) {
      setIsThinking(true);
      const ack = `${destMatch}? Beautiful choice. Hold on — I'm taking you there now.`;
      setMessages(prev => [...prev, { role: 'assistant', content: ack }]);
      speak(ack);
      await new Promise(r => setTimeout(r, 2200));
      setIsThinking(false);
      transportTo(destMatch);
      return;
    }

    setIsThinking(true);
    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: t }].map(m => ({ role: m.role, content: m.content })),
          userProfile: {
            name: user.name,
            travelStyles: user.travelStyles,
            countriesVisited: user.countries,
            interests: user.interests,
          }
        })
      });
      const data = await res.json();
      const reply = data.response;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch {
      const fallback = destination
        ? `Wonderful question. Tap any of the moments below and I'll take you there.`
        : `Tell me where you want to go and I'll take you there. Try saying "${selectedAvatar?.destinations[0]}".`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speak(fallback);
    }
    setIsThinking(false);
  };

  const reset = () => {
    stopSpeaking();
    setSelectedAvatar(null);
    setDestination(null);
    setCurrentScene(null);
    setMessages([]);
    setShowBookCTA(false);
    setBooked(false);
  };

  // === AVATAR SELECTION VIEW ===
  if (!selectedAvatar) {
    return (
      <div className="min-h-screen bg-cream pb-8">
        <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="relative">
            <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-wider">Virtual Travel</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Travel with a Local</h1>
            <p className="text-white/50 text-sm mt-2 max-w-md">Pick a guide. They'll take you there — voice, scenes, and stories before you even book the trip.</p>
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
                  <p className="text-white/90 text-sm leading-relaxed mb-3">{a.personality}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.destinations.slice(0, 4).map(d => (
                      <span key={d} className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-full font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-5 bg-white rounded-3xl border border-gold/20 shadow-sm">
            <p className="text-[10px] font-bold text-gold uppercase tracking-wider mb-2">How it works</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mx-auto mb-2"><span className="text-lg font-bold">1</span></div>
                <p className="text-xs font-semibold text-charcoal">Pick a guide</p>
                <p className="text-[10px] text-charcoal-light">Each has personality and region expertise</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mx-auto mb-2"><span className="text-lg font-bold">2</span></div>
                <p className="text-xs font-semibold text-charcoal">Pick a destination</p>
                <p className="text-[10px] text-charcoal-light">Voice or text — they'll transport you</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mx-auto mb-2"><span className="text-lg font-bold">3</span></div>
                <p className="text-xs font-semibold text-charcoal">Experience scenes</p>
                <p className="text-[10px] text-charcoal-light">Then book the real trip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === IMMERSIVE TRAVEL VIEW ===
  const bgImage = transporting
    ? PHILLY_HOME
    : destination && currentScene !== null
      ? SCENES[destination].moments[currentScene].image
      : destination
        ? SCENES[destination].intro.image
        : PHILLY_HOME;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-charcoal">
      {/* Cinematic background */}
      <div className="absolute inset-0 transition-all duration-[2000ms] ease-in-out">
        <img
          src={bgImage}
          alt=""
          className={`w-full h-full object-cover transition-all duration-[2000ms] ${
            transporting ? 'scale-150 blur-2xl opacity-40' : 'scale-100 blur-0 opacity-100'
          }`}
          key={bgImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40" />
      </div>

      {/* Transport overlay animation */}
      {transporting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center animate-fade-up">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-gold/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane size={48} className="text-gold animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
            </div>
            <p className="text-white font-display text-2xl font-bold animate-pulse">Transporting you to {destination}...</p>
            <p className="text-white/60 text-sm mt-2">Close your eyes for a second</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 content-px pt-12 pb-3 flex items-center gap-3">
        <button onClick={reset} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="relative">
          <img src={selectedAvatar.avatar} alt="" className={`w-11 h-11 rounded-xl border-2 border-gold object-cover transition-transform ${isSpeaking ? 'scale-110' : ''}`} />
          {isSpeaking && <div className="absolute inset-0 rounded-xl border-2 border-gold animate-ping" />}
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm flex items-center gap-1.5">
            {selectedAvatar.name}
            <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-gold animate-pulse' : 'bg-green-400'}`} />
          </p>
          <p className="text-white/60 text-[11px]">
            {destination ? (
              <span className="flex items-center gap-1"><MapPin size={9} /> Now in {destination}</span>
            ) : (
              <span>{selectedAvatar.region}</span>
            )}
          </p>
        </div>
        {isSpeaking && (
          <button onClick={stopSpeaking} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Volume2 size={14} className="text-gold" />
          </button>
        )}
      </div>

      {/* Scene info overlay (when in destination) */}
      {destination && currentScene !== null && !transporting && (
        <div className="relative z-10 content-px mt-1 mb-3">
          <div className="inline-block px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 animate-fade-up">
            <p className="text-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={10} /> Scene {currentScene + 1} of {SCENES[destination].moments.length}
            </p>
            <p className="text-white text-base font-display font-bold mt-0.5">{SCENES[destination].moments[currentScene].name}</p>
          </div>
        </div>
      )}

      {/* Spacer to push messages down (so they sit at bottom) */}
      <div className="flex-1" />

      {/* Latest narration over background */}
      {messages.length > 0 && !transporting && (
        <div className="relative z-10 content-px mb-2">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-fade-up max-h-44 overflow-y-auto">
            <p className="text-white text-sm leading-relaxed">{messages[messages.length - 1].content}</p>
          </div>
        </div>
      )}

      {/* Scene picker (horizontal scroll) */}
      {destination && !transporting && (
        <div className="relative z-10 mb-3">
          <div className="content-px">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">Where to next?</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-5 scrollbar-hide">
            {SCENES[destination].moments.map((scene, idx) => (
              <button key={idx} onClick={() => goToScene(idx)}
                className={`min-w-[160px] rounded-2xl overflow-hidden border-2 transition-all active:scale-95 ${
                  currentScene === idx ? 'border-gold shadow-xl scale-105' : 'border-white/20'
                }`}>
                <div className="relative h-24">
                  <img src={scene.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-[10px] font-bold leading-tight drop-shadow-lg">{scene.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Book CTA overlay */}
      {showBookCTA && !booked && (
        <div className="relative z-10 content-px mb-2 animate-fade-up">
          <div className="p-4 bg-gradient-to-r from-gold to-gold-light rounded-2xl shadow-2xl">
            <p className="text-white font-bold text-sm">Want to actually go to {destination}?</p>
            <p className="text-white/80 text-xs mt-0.5">I can book the entire trip — flights, hotels, experiences.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setBooked(true); setShowBookCTA(false); }}
                className="flex-1 py-2.5 bg-white text-gold-dark rounded-xl text-xs font-bold active:scale-95 transition-transform">
                Book This Trip
              </button>
              <button onClick={() => setShowBookCTA(false)} className="px-4 py-2.5 bg-white/20 text-white rounded-xl text-xs font-medium">
                Later
              </button>
            </div>
          </div>
        </div>
      )}
      {booked && (
        <div className="relative z-10 content-px mb-2">
          <div className="p-4 bg-green-500 rounded-2xl text-white text-sm font-bold text-center animate-scale-in">
            ✓ Trip request sent to {selectedAvatar.name}! She'll text you with options within an hour.
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="relative z-10 content-px pb-8 pt-3 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/15 text-gold'
            }`}>
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={
              isListening ? 'Listening...' :
              !destination ? `Try: "Take me to ${selectedAvatar.destinations[0]}"` :
              'Ask anything...'
            }
            className="flex-1 px-4 py-3 bg-white/15 text-white rounded-xl border border-white/10 outline-none text-sm placeholder:text-white/40 backdrop-blur-md"
          />
          <button onClick={() => send()} disabled={!input.trim() || isThinking}
            className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform shadow-md">
            <Send size={18} className="text-white" />
          </button>
        </div>

        {/* Quick destination chips */}
        {!destination && !isThinking && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {selectedAvatar.destinations.filter(d => SCENES[d]).map(d => (
              <button key={d} onClick={() => send(`Take me to ${d}`)}
                className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/10 whitespace-nowrap active:scale-95 transition-transform">
                Take me to {d}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
