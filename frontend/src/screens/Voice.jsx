import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { X, Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';

export default function Voice() {
  const { currentUser, chatMessages, setChatMessages } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle, listening, thinking, responding
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setPhase('idle');
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
    setPhase('listening');
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch {}
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);

    const fullText = transcript + interimTranscript;
    if (fullText.trim()) {
      setTranscript(fullText);
      setInterimTranscript('');
      sendToCompanion(fullText.trim());
    } else {
      setPhase('idle');
    }
  };

  const sendToCompanion = async (text) => {
    setPhase('thinking');
    setIsThinking(true);

    const userMessage = { role: 'user', content: text };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);

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
          }
        })
      });
      const data = await res.json();
      const response = data.response;

      setChatMessages([...newMessages, { role: 'assistant', content: response }]);
      setAiResponse(response);
      setPhase('responding');
      setIsThinking(false);
      speakResponse(response);
    } catch {
      const fallback = `Great question! Based on your adventure travel style, I'd love to help you plan that. Head to the Companion chat for the full conversation — I've got specific recommendations ready for you.`;
      setAiResponse(fallback);
      setPhase('responding');
      setIsThinking(false);
      speakResponse(fallback);
    }
  };

  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const reset = () => {
    stopSpeaking();
    setPhase('idle');
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
  };

  const suggestedPrompts = [
    "Where should I go next?",
    "Build me a trip to Patagonia",
    "Who else is traveling to Tokyo?",
    "What did members love about Lisbon?",
  ];

  if (!supported) {
    return (
      <div className="min-h-screen gradient-navy flex flex-col items-center justify-center px-8 text-center">
        <MicOff size={48} className="text-white/30 mb-4" />
        <h2 className="text-white text-xl font-display font-semibold">Voice mode works best in Chrome</h2>
        <p className="text-white/50 text-sm mt-2">Tap below to type instead</p>
        <button onClick={() => navigate('/companion')} className="mt-6 px-6 py-3 gradient-gold rounded-2xl text-white font-semibold text-sm active:scale-95 transition-transform">
          Open Companion Chat
        </button>
        <button onClick={() => navigate(-1)} className="mt-3 text-white/40 text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-navy flex flex-col relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 animate-pulse" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gold/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gold/10 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Close button */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12">
        <button onClick={() => { stopSpeaking(); navigate(-1); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <X size={18} className="text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-gold" />
          <span className="text-gold text-xs font-bold uppercase tracking-wider">Voice Mode</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Idle state */}
        {phase === 'idle' && (
          <div className="text-center animate-fade-up">
            <h2 className="text-white font-display text-2xl font-semibold mb-2">Talk to Jetzy</h2>
            <p className="text-white/40 text-sm mb-10">Tap the mic and ask me anything about travel</p>

            <button
              onClick={startListening}
              className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center shadow-2xl animate-pulse-gold active:scale-90 transition-transform mx-auto mb-10"
            >
              <Mic size={36} className="text-white" />
            </button>

            <div className="space-y-2 max-w-sm">
              <p className="text-white/30 text-[11px] uppercase tracking-wider font-semibold mb-2">Try saying</p>
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setTranscript(p); sendToCompanion(p); }}
                  className="w-full p-3 bg-white/5 rounded-xl border border-white/10 text-white/60 text-sm text-left hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Listening state */}
        {phase === 'listening' && (
          <div className="text-center animate-fade-up">
            <p className="text-gold text-sm font-semibold uppercase tracking-wider mb-6">Listening...</p>

            {/* Waveform animation */}
            <div className="flex items-center justify-center gap-1 mb-8 h-16">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gold rounded-full animate-bounce"
                  style={{
                    height: `${20 + Math.random() * 40}px`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>

            {/* Live transcript */}
            <p className="text-white text-lg font-medium max-w-md min-h-[2em]">
              {transcript}<span className="text-white/40">{interimTranscript}</span>
              <span className="animate-pulse text-gold">|</span>
            </p>

            <button
              onClick={stopListening}
              className="mt-10 w-20 h-20 rounded-full bg-red-500/80 flex items-center justify-center shadow-xl active:scale-90 transition-transform mx-auto"
            >
              <MicOff size={28} className="text-white" />
            </button>
            <p className="text-white/30 text-xs mt-3">Tap to stop</p>
          </div>
        )}

        {/* Thinking state */}
        {phase === 'thinking' && (
          <div className="text-center animate-fade-up">
            <div className="w-16 h-16 rounded-full gradient-gold mx-auto flex items-center justify-center mb-6 animate-pulse">
              <Sparkles size={28} className="text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">"{transcript}"</p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-white/40 text-sm mt-3">Thinking...</p>
          </div>
        )}

        {/* Responding state */}
        {phase === 'responding' && (
          <div className="text-center animate-fade-up max-w-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
                  <Volume2 size={12} className="text-gold animate-pulse" />
                  <span className="text-white/50 text-[10px]">Speaking...</span>
                </button>
              )}
            </div>

            <p className="text-white/40 text-xs mb-3">You said: "{transcript}"</p>
            <p className="text-white text-base leading-relaxed text-left bg-white/5 p-5 rounded-2xl border border-white/10">
              {aiResponse}
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={reset}
                className="flex-1 py-3.5 gradient-gold rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.97] transition-transform"
              >
                <Mic size={16} /> Ask Again
              </button>
              <button
                onClick={() => { stopSpeaking(); navigate('/companion'); }}
                className="flex-1 py-3.5 bg-white/10 rounded-2xl text-white font-medium text-sm border border-white/10 active:scale-[0.97] transition-transform"
              >
                Continue in Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
