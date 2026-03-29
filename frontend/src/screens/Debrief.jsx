import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, DESTINATIONS } from '../data/seed';
import { ArrowLeft, Sparkles, MapPin, Camera, Star, Send, Check, Users, ChevronRight } from 'lucide-react';

const DEBRIEF_QUESTIONS = [
  { id: 'highlight', question: 'What was the single best moment of this trip?', placeholder: 'Watching Fitz Roy catch first light from Laguna de los Tres...' },
  { id: 'surprise', question: 'What surprised you that you wish you had known before?', placeholder: 'The wind at the top of the trail is no joke — bring an extra layer...' },
  { id: 'food', question: 'Best meal or food experience?', placeholder: 'The stout at La Cervecería after 8 hours on the trail...' },
  { id: 'avoid', question: 'What would you skip or do differently?', placeholder: 'Skip the hostel near the bus station — Senderos Hostería is worth every penny...' },
  { id: 'tip', question: 'One thing the next traveler absolutely needs to know?', placeholder: 'Book accommodation 3 months ahead for February. Weather changes hourly — layers are everything.' },
];

const MATCHING_TRAVELERS = [
  { user: SAMPLE_USERS[3], reason: 'Aisha is planning a Patagonia trip for November 2026' },
  { user: SAMPLE_USERS[1], reason: 'Sofia wants to do the W Circuit next summer' },
];

export default function Debrief() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [step, setStep] = useState(0); // 0 = intro, 1 = questions, 2 = share, 3 = connect, 4 = done
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [rating, setRating] = useState(0);
  const [shareAsRec, setShareAsRec] = useState([]);

  const trip = user.recentTrip || { destination: 'El Chaltén, Patagonia', date: 'February 2026' };

  const handleAnswer = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const toggleShareRec = (id) => {
    setShareAsRec(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Post-Trip Debrief</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Welcome back from {trip.destination}</h1>
          <p className="text-white/50 text-sm mt-1">{trip.date} · Your knowledge makes the community smarter</p>
        </div>
      </div>

      <div className="content-px mt-6">
        {/* Step 0: Intro */}
        {step === 0 && (
          <div className="animate-fade-up">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full gradient-gold mx-auto flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="font-display text-xl font-semibold text-navy">
                You just got back from somewhere extraordinary
              </h2>
              <p className="text-charcoal-light text-sm mt-3 leading-relaxed">
                The next Summit Seeker heading to {trip.destination} needs exactly what you know right now.
                Five quick questions. Your answers become the intelligence that makes someone else's trip unforgettable.
              </p>

              {/* Trip Rating */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">Rate this trip</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRating(n)}>
                      <Star
                        size={28}
                        className={`transition-all ${n <= rating ? 'text-gold' : 'text-gray-200'}`}
                        fill={n <= rating ? '#C9A84C' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-6 py-3.5 gradient-gold rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                Share What I Learned <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Questions */}
        {step === 1 && (
          <div className="animate-fade-up">
            {/* Progress */}
            <div className="flex gap-1.5 mb-6">
              {DEBRIEF_QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                  i <= currentQ ? 'bg-gold' : 'bg-gray-200'
                }`} />
              ))}
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">
                Question {currentQ + 1} of {DEBRIEF_QUESTIONS.length}
              </p>
              <h3 className="font-display text-lg font-semibold text-navy mb-4">
                {DEBRIEF_QUESTIONS[currentQ].question}
              </h3>
              <textarea
                value={answers[DEBRIEF_QUESTIONS[currentQ].id] || ''}
                onChange={(e) => handleAnswer(DEBRIEF_QUESTIONS[currentQ].id, e.target.value)}
                placeholder={DEBRIEF_QUESTIONS[currentQ].placeholder}
                className="w-full p-4 bg-cream rounded-xl border-none outline-none text-sm text-charcoal placeholder:text-gray-300 resize-none h-32 leading-relaxed"
              />

              <div className="flex gap-3 mt-4">
                {currentQ > 0 && (
                  <button
                    onClick={() => setCurrentQ(currentQ - 1)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-charcoal-light text-sm font-medium"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentQ < DEBRIEF_QUESTIONS.length - 1) {
                      setCurrentQ(currentQ + 1);
                    } else {
                      setStep(2);
                    }
                  }}
                  className="flex-1 py-2.5 gradient-gold rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1"
                >
                  {currentQ < DEBRIEF_QUESTIONS.length - 1 ? 'Next' : 'Review & Share'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Skip option */}
            <button
              onClick={() => setStep(2)}
              className="w-full mt-3 text-center text-xs text-charcoal-light"
            >
              Skip remaining questions
            </button>
          </div>
        )}

        {/* Step 2: Review & Share as recommendations */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="font-display text-lg font-semibold text-navy mb-1">Your Trip Intel</h2>
            <p className="text-charcoal-light text-sm mb-4">Select which insights to share with the community</p>

            <div className="space-y-3">
              {DEBRIEF_QUESTIONS.filter(q => answers[q.id]).map(q => (
                <button
                  key={q.id}
                  onClick={() => toggleShareRec(q.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    shareAsRec.includes(q.id)
                      ? 'border-gold bg-gold/5 shadow-md'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      shareAsRec.includes(q.id) ? 'bg-gold' : 'border-2 border-gray-200'
                    }`}>
                      {shareAsRec.includes(q.id) && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-light mb-1">{q.question}</p>
                      <p className="text-sm text-charcoal leading-relaxed">{answers[q.id]}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {Object.keys(answers).length === 0 && (
              <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center">
                <p className="text-charcoal-light text-sm">No answers yet — go back and share your knowledge!</p>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full mt-5 py-3.5 gradient-gold rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Send size={16} /> Publish to Community
            </button>
          </div>
        )}

        {/* Step 3: Connect with planners */}
        {step === 3 && (
          <div className="animate-fade-up">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-3">
                <Check size={24} className="text-green-500" />
              </div>
              <h2 className="font-display text-lg font-semibold text-navy">Trip Intel Published</h2>
              <p className="text-charcoal-light text-sm mt-1">
                {shareAsRec.length || Object.keys(answers).length} insights added to {trip.destination}
              </p>
              <div className="flex justify-center gap-4 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-gold">+{(shareAsRec.length || 1) * 50}</p>
                  <p className="text-[10px] text-charcoal-light">JetPoints earned</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-navy">{rating || 5}</p>
                  <p className="text-[10px] text-charcoal-light">Trip rating</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">Members planning this trip</span>
            </div>
            <p className="text-charcoal-light text-sm mb-4">
              These travelers are heading to {trip.destination}. Your experience is exactly what they need.
            </p>

            <div className="space-y-3">
              {MATCHING_TRAVELERS.map((match, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-gold/20 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={match.user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-gold object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{match.user.name}</p>
                      <p className="text-xs text-charcoal-light">{match.user.badges?.[0]} · {match.user.countryCount} countries</p>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-light mb-3">{match.reason}</p>
                  <button className="w-full py-2.5 rounded-xl bg-navy text-white text-xs font-semibold">
                    Share Your {trip.destination.split(',')[0]} Experience
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full mt-5 py-3.5 gradient-gold rounded-xl text-white font-semibold text-sm shadow-lg"
            >
              Done
            </button>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="animate-fade-up text-center mt-8">
            <div className="w-20 h-20 rounded-full gradient-gold mx-auto flex items-center justify-center mb-5">
              <Sparkles size={32} className="text-white" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              The community just got smarter
            </h2>
            <p className="text-charcoal-light text-sm mt-3 leading-relaxed max-w-sm mx-auto">
              Your trip to {trip.destination} now helps every traveler who follows.
              That's the Jetzy difference — every journey enriches the next one.
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => navigate('/passport')}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-charcoal text-sm font-medium"
              >
                View Passport
              </button>
              <button
                onClick={() => navigate('/home')}
                className="flex-1 py-3 gradient-gold rounded-xl text-white text-sm font-semibold shadow-lg"
              >
                Back Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
