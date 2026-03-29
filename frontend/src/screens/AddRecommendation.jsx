import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS, DESTINATIONS } from '../data/seed';
import { ArrowLeft, MapPin, Search, Star, Send, Camera, Check } from 'lucide-react';

const CATEGORIES = ['Food', 'Hiking', 'Stay', 'Nightlife', 'Culture', 'Work', 'Experience', 'Gear', 'Photography', 'Running'];

export default function AddRecommendation() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];

  const [destination, setDestination] = useState('');
  const [selectedDest, setSelectedDest] = useState(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isHiddenGem, setIsHiddenGem] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredDests = destination.length > 0
    ? DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(destination.toLowerCase()) ||
        d.country.toLowerCase().includes(destination.toLowerCase())
      )
    : [];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center content-px">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full gradient-gold mx-auto flex items-center justify-center mb-5">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-navy">Recommendation Published</h2>
          <p className="text-charcoal-light text-sm mt-2 leading-relaxed">
            Your local intel for {selectedDest?.name || destination} is now live.
            <br />The next traveler there will thank you.
          </p>
          <div className="mt-3">
            <span className="text-gold font-bold text-lg">+50 JetPoints</span>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/discover')} className="flex-1 py-3 rounded-xl border border-gray-200 text-charcoal text-sm font-medium">
              Explore Destinations
            </button>
            <button onClick={() => navigate('/home')} className="flex-1 py-3 gradient-gold rounded-xl text-white text-sm font-semibold shadow-lg">
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl">
        <button onClick={() => navigate(-1)} className="text-white/60 mb-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-semibold text-white">Share a Recommendation</h1>
        <p className="text-white/50 text-sm mt-1">Your knowledge helps the community travel better</p>
      </div>

      <div className="content-px mt-6">
        {/* Destination */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Destination</label>
          {selectedDest ? (
            <div className="mt-2 flex items-center gap-3 p-3 bg-white rounded-xl border border-gold/30">
              <img src={selectedDest.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">{selectedDest.name}</p>
                <p className="text-xs text-charcoal-light">{selectedDest.country}</p>
              </div>
              <button onClick={() => { setSelectedDest(null); setDestination(''); }} className="text-xs text-gold font-medium">
                Change
              </button>
            </div>
          ) : (
            <div className="relative mt-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Search destination..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-sm"
              />
              {filteredDests.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
                  {filteredDests.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { setSelectedDest(d); setDestination(d.name); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-cream transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <img src={d.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-charcoal">{d.name}</p>
                        <p className="text-xs text-charcoal-light">{d.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                  category === cat
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-charcoal-light border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Laguna de los Tres at sunrise"
            className="mt-2 w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-sm"
          />
        </div>

        {/* Body */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Your recommendation</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Be specific — include times, prices, local names. Write it like you're texting a friend who just asked you..."
            className="mt-2 w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gold outline-none text-sm resize-none h-36 leading-relaxed"
          />
          <p className="text-[10px] text-charcoal-light mt-1 text-right">{body.length}/500</p>
        </div>

        {/* Hidden Gem toggle */}
        <button
          onClick={() => setIsHiddenGem(!isHiddenGem)}
          className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all mb-6 ${
            isHiddenGem ? 'border-gold bg-gold/5' : 'border-gray-100 bg-white'
          }`}
        >
          <Star size={20} className={isHiddenGem ? 'text-gold' : 'text-gray-300'} fill={isHiddenGem ? '#C9A84C' : 'none'} />
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-charcoal">Mark as Hidden Gem</p>
            <p className="text-xs text-charcoal-light">This spot isn't on Google — only locals and insiders know it</p>
          </div>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isHiddenGem ? 'bg-gold' : 'border-2 border-gray-200'}`}>
            {isHiddenGem && <Check size={10} className="text-white" />}
          </div>
        </button>

        {/* Preview */}
        {title && body && (
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
            <p className="text-[10px] font-semibold text-charcoal-light uppercase tracking-wider mb-2">Preview</p>
            {isHiddenGem && (
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={12} className="text-gold" fill="#C9A84C" />
                <span className="text-[10px] font-bold text-gold uppercase">Hidden Gem</span>
              </div>
            )}
            <p className="text-sm font-semibold text-charcoal">{title}</p>
            <p className="text-xs text-charcoal-light mt-1 leading-relaxed">{body}</p>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
              <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-[10px] text-charcoal">{user.name}</span>
              <span className="text-[10px] text-charcoal-light">· {user.badges?.[0]} · {user.countryCount} countries</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title || !body || !category}
          className="w-full py-3.5 gradient-gold rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 transition-opacity"
        >
          <Send size={16} /> Publish Recommendation
        </button>
      </div>
    </div>
  );
}
