import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRAVEL_STYLES, INTERESTS, MEMBERSHIP_TIERS, COUNTRIES } from '../data/seed';
import { ChevronRight, ChevronLeft, Check, MapPin, Search, X } from 'lucide-react';

const steps = ['Welcome', 'Travel Style', 'Experience', 'Membership'];

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
  const [selectedTier, setSelectedTier] = useState('explorer');

  const toggleStyle = (id) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

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
    <div className="min-h-screen bg-cream flex flex-col items-center">
      {/* Progress */}
      <div className="content-px pt-12 pb-4 w-full max-w-2xl">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-gold' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 content-px pb-32 overflow-y-auto w-full max-w-2xl">
        {step === 0 && (
          <div className="animate-fade-up">
            <div className="mt-8 mb-10">
              <h1 className="font-display text-4xl font-semibold text-navy leading-tight">
                Welcome to<br />the Jetzy Life
              </h1>
              <p className="text-charcoal-light mt-3 text-base leading-relaxed">
                Your intelligent travel companion, powered by a community of extraordinary travelers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marco V"
                  className="mt-2 w-full px-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-charcoal placeholder:text-gray-300 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Home Base</label>
                <div className="relative mt-2">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Denver, CO"
                    className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-charcoal placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 rounded-2xl gradient-navy text-white">
              <p className="font-display text-lg font-medium">"Travel is the only thing you buy that makes you richer."</p>
              <p className="text-white/60 text-sm mt-2">— The Jetzy Manifesto</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl font-semibold text-navy mt-6">How do you travel?</h2>
            <p className="text-charcoal-light text-sm mt-1 mb-6">Select all that describe you</p>

            <div className="grid grid-cols-2 gap-3">
              {TRAVEL_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    selectedStyles.includes(style.id)
                      ? 'border-gold bg-gold/5 shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <p className={`text-sm font-semibold mt-2 ${selectedStyles.includes(style.id) ? 'text-navy' : 'text-charcoal'}`}>
                    {style.label}
                  </p>
                  {selectedStyles.includes(style.id) && (
                    <Check size={16} className="text-gold mt-1" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-charcoal-light uppercase tracking-wider mb-3">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-navy text-white'
                        : 'bg-white text-charcoal-light border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl font-semibold text-navy mt-6">Where have you been?</h2>
            <p className="text-charcoal-light text-sm mt-1 mb-4">Select countries you've visited</p>

            {selectedCountries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCountries.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-3 py-1.5 bg-navy text-white rounded-full text-xs font-medium">
                    {c}
                    <button onClick={() => toggleCountry(c)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-sm"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
              {filteredCountries.slice(0, 30).map(country => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-50 last:border-0 transition-colors ${
                    selectedCountries.includes(country) ? 'bg-gold/5 text-navy font-medium' : 'text-charcoal hover:bg-gray-50'
                  }`}
                >
                  {country} {selectedCountries.includes(country) && <Check size={14} className="inline text-gold" />}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Next Adventure</label>
              <input
                type="text"
                value={upcomingTrip}
                onChange={(e) => setUpcomingTrip(e.target.value)}
                placeholder="Torres del Paine, Chile"
                className="mt-2 w-full px-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-charcoal placeholder:text-gray-300"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up">
            <h2 className="font-display text-2xl font-semibold text-navy mt-6">Choose your level</h2>
            <p className="text-charcoal-light text-sm mt-1 mb-6">Upgrade anytime</p>

            <div className="space-y-4">
              {MEMBERSHIP_TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    selectedTier === tier.id
                      ? tier.id === 'black'
                        ? 'border-charcoal bg-charcoal text-white shadow-xl'
                        : tier.id === 'select'
                        ? 'border-gold bg-gold/5 shadow-lg'
                        : 'border-navy bg-navy/5 shadow-md'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-semibold text-lg ${
                        selectedTier === tier.id && tier.id === 'black' ? 'text-white' : ''
                      }`}>{tier.name}</p>
                      <p className={`text-sm mt-0.5 ${
                        selectedTier === tier.id && tier.id === 'black' ? 'text-gold' : 'text-gold-dark'
                      }`}>{tier.price}</p>
                    </div>
                    {selectedTier === tier.id && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        tier.id === 'black' ? 'bg-gold' : 'bg-navy'
                      }`}>
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {tier.features.map((f, i) => (
                      <li key={i} className={`text-sm flex items-center gap-2 ${
                        selectedTier === tier.id && tier.id === 'black' ? 'text-white/80' : 'text-charcoal-light'
                      }`}>
                        <span className="text-gold text-xs">+</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 glass border-t border-gray-200/50">
        <div className="flex gap-3 max-w-2xl mx-auto">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} className="text-charcoal-light" />
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : finish()}
            className="flex-1 h-12 gradient-gold rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
          >
            {step === 3 ? 'Start the Jetzy Life' : 'Continue'}
            {step < 3 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
