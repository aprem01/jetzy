import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRAVEL_STYLES, INTERESTS, MEMBERSHIP_TIERS, COUNTRIES } from '../data/seed';
import { ChevronRight, ChevronLeft, Check, MapPin, Search, X, Plane, Sparkles } from 'lucide-react';

// Photo-forward travel style cards
const STYLE_IMAGES = {
  adventure: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=500&fit=crop',
  culinary: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop',
  luxury: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=500&fit=crop',
  solo: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=500&fit=crop',
  cultural: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=400&h=500&fit=crop',
  digital: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop',
  urban: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=500&fit=crop',
};

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [upcomingTrip, setUpcomingTrip] = useState('');
  const [selectedTier, setSelectedTier] = useState('black');

  const toggleStyle = (id) => setSelectedStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleInterest = (i) => setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const toggleCountry = (c) => setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  const finish = () => {
    completeOnboarding({
      name: name || 'Marco V',
      location: location || 'Denver, CO',
      travelStyles: selectedStyles.length ? selectedStyles : ['adventure'],
      interests: selectedInterests.length ? selectedInterests : ['Hiking', 'Photography', 'Food'],
      countriesVisited: selectedCountries.length ? selectedCountries : ['Argentina', 'Tanzania', 'Iceland', 'Peru', 'Nepal', 'India'],
      upcomingTrip: upcomingTrip || 'Torres del Paine, Chile',
      tier: selectedTier,
    });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Step 0: Splash — full-screen photo hero */}
      {step === 0 && (
        <div className="flex-1 relative animate-fade-up">
          <div className="absolute inset-0">
            <img src={HERO_IMAGES[0]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </div>
          <div className="relative flex flex-col justify-end min-h-screen px-6 pb-10 md:px-12">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                  <Plane size={18} className="text-white" />
                </div>
                <span className="text-white text-xl font-display font-semibold tracking-wide">Jetzy</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                Travel like<br />you mean it.
              </h1>
              <p className="text-white/70 text-base mt-4 max-w-md leading-relaxed">
                AI-powered travel companion backed by a community of extraordinary travelers. Not tourist traps. Real knowledge.
              </p>
            </div>

            <div className="space-y-3 max-w-md">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What's your name?"
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white placeholder:text-white/40 outline-none text-base focus:bg-white/15 transition-all"
              />
              <div className="relative">
                <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where do you call home?"
                  className="w-full pl-12 pr-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white placeholder:text-white/40 outline-none text-base focus:bg-white/15 transition-all"
                />
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 gradient-gold rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
              >
                Let's Go <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Travel Style Quiz — photo cards */}
      {step === 1 && (
        <div className="flex-1 pb-28 overflow-y-auto">
          <div className="content-px pt-12 max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {[1,2,3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= 1 ? 'bg-gold' : 'bg-gray-200'}`} />
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy leading-tight animate-fade-up">
              How do you<br />like to travel?
            </h1>
            <p className="text-charcoal-light mt-2 mb-6 text-base">Tap all that feel like you</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TRAVEL_STYLES.map((style, idx) => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className="animate-fade-up relative rounded-2xl overflow-hidden h-44 md:h-52 group active:scale-[0.97] transition-transform"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <img src={STYLE_IMAGES[style.id]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute inset-0 transition-all duration-300 ${
                    selectedStyles.includes(style.id)
                      ? 'bg-gold/40 ring-4 ring-gold ring-inset'
                      : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
                  }`} />
                  {selectedStyles.includes(style.id) && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gold flex items-center justify-center shadow-lg animate-fade-up">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-2xl">{style.icon}</span>
                    <p className="text-white font-semibold text-sm mt-1 drop-shadow-lg">{style.label}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Interests — pill bubbles */}
            <div className="mt-8">
              <p className="text-sm font-semibold text-navy mb-3">What gets you excited?</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                      selectedInterests.includes(interest)
                        ? 'bg-navy text-white shadow-md scale-105'
                        : 'bg-white text-charcoal-light border border-gray-200 hover:border-gold/30'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Where have you been — visual + search */}
      {step === 2 && (
        <div className="flex-1 pb-28 overflow-y-auto">
          <div className="content-px pt-12 max-w-2xl mx-auto">
            <div className="flex gap-2 mb-8">
              {[1,2,3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= 2 ? 'bg-gold' : 'bg-gray-200'}`} />
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy leading-tight animate-fade-up">
              Where have you<br />explored?
            </h1>
            <p className="text-charcoal-light mt-2 mb-4 text-base">This helps your Companion know you better</p>

            {/* Selected countries — animated chips */}
            {selectedCountries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCountries.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-4 py-2 gradient-gold text-white rounded-full text-sm font-medium shadow-md animate-fade-up">
                    {c}
                    <button onClick={() => toggleCountry(c)} className="hover:bg-white/20 rounded-full p-0.5"><X size={14} /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative mb-4">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-base shadow-sm"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 max-h-52 overflow-y-auto shadow-sm">
              {filteredCountries.slice(0, 40).map(country => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`w-full text-left px-5 py-3 text-sm border-b border-gray-50 last:border-0 transition-all active:bg-gold/10 ${
                    selectedCountries.includes(country) ? 'bg-gold/5 text-navy font-semibold' : 'text-charcoal hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {country}
                    {selectedCountries.includes(country) && <Check size={16} className="text-gold" />}
                  </span>
                </button>
              ))}
            </div>

            {/* Next adventure — big exciting input */}
            <div className="mt-8 p-5 bg-white rounded-2xl border border-gold/20 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-gold" />
                <p className="text-sm font-semibold text-navy">Where to next?</p>
              </div>
              <input
                type="text"
                value={upcomingTrip}
                onChange={(e) => setUpcomingTrip(e.target.value)}
                placeholder="Torres del Paine, Chile"
                className="w-full px-4 py-3.5 bg-cream rounded-xl outline-none text-charcoal placeholder:text-gray-300 text-base"
              />
              <p className="text-[11px] text-charcoal-light mt-2">Your Companion will start researching the moment you join</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Membership — premium cards */}
      {step === 3 && (
        <div className="flex-1 pb-28 overflow-y-auto">
          <div className="content-px pt-12 max-w-2xl mx-auto">
            <div className="flex gap-2 mb-8">
              {[1,2,3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 bg-gold`} />
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy leading-tight animate-fade-up">
              Pick your<br />travel level
            </h1>
            <p className="text-charcoal-light mt-2 mb-6 text-base">Upgrade or downgrade anytime</p>

            <div className="space-y-4">
              {MEMBERSHIP_TIERS.map((tier, idx) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full p-6 rounded-3xl border-2 text-left transition-all duration-300 animate-fade-up active:scale-[0.98] ${
                    selectedTier === tier.id
                      ? tier.id === 'black'
                        ? 'border-transparent bg-charcoal text-white shadow-2xl scale-[1.02]'
                        : tier.id === 'select'
                        ? 'border-gold bg-gold/5 shadow-xl scale-[1.02]'
                        : 'border-navy bg-navy/5 shadow-lg scale-[1.02]'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-bold text-xl ${selectedTier === tier.id && tier.id === 'black' ? 'text-white' : ''}`}>
                        {tier.name}
                      </p>
                      <p className={`text-lg mt-0.5 font-semibold ${selectedTier === tier.id && tier.id === 'black' ? 'text-gold' : 'text-gold-dark'}`}>
                        {tier.price}
                      </p>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      selectedTier === tier.id
                        ? tier.id === 'black' ? 'bg-gold' : 'bg-navy'
                        : 'border-2 border-gray-200'
                    }`}>
                      {selectedTier === tier.id && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {tier.features.map((f, i) => (
                      <li key={i} className={`text-sm flex items-center gap-2.5 ${
                        selectedTier === tier.id && tier.id === 'black' ? 'text-white/80' : 'text-charcoal-light'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedTier === tier.id ? 'bg-gold' : 'bg-gray-300'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions — only show on steps 1-3 */}
      {step > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 glass border-t border-gray-200/50 z-50">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => setStep(step - 1)}
              className="w-14 h-14 rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-white transition-colors active:scale-95"
            >
              <ChevronLeft size={22} className="text-charcoal-light" />
            </button>
            <button
              onClick={() => step < 3 ? setStep(step + 1) : finish()}
              className="flex-1 h-14 gradient-gold rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
            >
              {step === 3 ? (
                <><Sparkles size={18} /> Start the Jetzy Life</>
              ) : (
                <>Continue <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
