import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LIVE_BROADCASTS, SAMPLE_USERS, getUserById } from '../data/seed';
import { Radio, MapPin, Send, Clock, Globe, ArrowLeft, Plus, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Live() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [showCompose, setShowCompose] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Header */}
      <div className="content-px pt-12 pb-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-red-500 animate-pulse" />
            <h1 className="font-display text-2xl font-semibold text-navy">Jetzy Live</h1>
          </div>
          <p className="text-charcoal-light text-sm mt-0.5">Real-time from the community</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-md"
        >
          {showCompose ? <X size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="content-px mt-4 animate-fade-up">
          <div className="p-4 bg-white rounded-2xl border border-gold/20 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium text-charcoal">{user.name}</span>
            </div>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Share where you are and what's happening..."
              className="w-full p-3 bg-cream rounded-xl border-none outline-none text-sm text-charcoal placeholder:text-gray-300 resize-none h-20"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-charcoal-light">
                <MapPin size={14} className="text-gold" />
                <span className="text-xs">{user.currentLocation}</span>
              </div>
              <button
                className="px-4 py-2 gradient-gold rounded-lg text-white text-xs font-semibold flex items-center gap-1.5"
                onClick={() => { setBroadcastText(''); setShowCompose(false); }}
              >
                <Radio size={12} /> Go Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Preview */}
      <div className="content-px mt-5">
        <div className="relative h-44 rounded-2xl overflow-hidden gradient-navy">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Globe size={28} className="text-gold mx-auto mb-2" />
              <p className="text-white text-sm font-medium">{LIVE_BROADCASTS.length} members broadcasting now</p>
              <p className="text-white/40 text-xs mt-1">Across {new Set(LIVE_BROADCASTS.map(b => b.location.split(', ').pop())).size} countries</p>
            </div>
          </div>

          {/* Dot indicators on map */}
          {LIVE_BROADCASTS.map((b, i) => (
            <div
              key={b.id}
              className="absolute animate-pulse-gold"
              style={{
                left: `${20 + i * 18}%`,
                top: `${25 + (i % 2) * 30}%`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-gold shadow-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Relevant For You */}
      <div className="content-px mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs font-semibold text-gold uppercase tracking-wider">Relevant for you</span>
        </div>

        <div className="p-4 bg-gold/5 rounded-2xl border border-gold/15 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <img src={getUserById('u1').avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            <span className="text-xs font-semibold text-charcoal">Marco V</span>
            <span className="text-[10px] text-charcoal-light">was just in Patagonia</span>
          </div>
          <p className="text-sm text-charcoal">{LIVE_BROADCASTS[0].text}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-gold" />
              <span className="text-[11px] text-charcoal-light">{LIVE_BROADCASTS[0].location}</span>
            </div>
            <button className="px-3 py-1.5 bg-navy text-white text-[10px] font-semibold rounded-lg">
              Respond
            </button>
          </div>
        </div>
      </div>

      {/* All Broadcasts */}
      <div className="content-px">
        <h2 className="text-base font-semibold text-navy mb-3">All Broadcasts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LIVE_BROADCASTS.map(broadcast => {
            const broadcastUser = getUserById(broadcast.userId);
            const tierBadge = broadcastUser.tier === 'black'
              ? 'bg-charcoal text-white'
              : broadcastUser.tier === 'select'
              ? 'bg-gold/20 text-gold'
              : 'bg-gray-100 text-charcoal-light';

            return (
              <div key={broadcast.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="relative">
                    <img src={broadcastUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-charcoal">{broadcastUser.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${tierBadge}`}>
                        {broadcastUser.tier === 'black' ? 'BLACK' : broadcastUser.tier === 'select' ? 'SELECT' : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-charcoal-light">
                      {broadcastUser.badges?.[0]} · {broadcastUser.countryCount} countries
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-charcoal-light">
                    <Clock size={10} />
                    <span className="text-[10px]">{broadcast.time}</span>
                  </div>
                </div>

                <p className="text-sm text-charcoal leading-relaxed">{broadcast.text}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-gold" />
                    <span className="text-[11px] text-charcoal-light">{broadcast.location}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-cream text-charcoal text-[10px] font-medium rounded-lg hover:bg-gray-100 transition-colors">
                      Message
                    </button>
                    <button className="px-3 py-1.5 bg-navy text-white text-[10px] font-semibold rounded-lg">
                      I'm Here Too
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expiry notice */}
        <div className="text-center mt-4 mb-2">
          <p className="text-[10px] text-charcoal-light">Broadcasts expire after 24 hours</p>
        </div>
      </div>
    </div>
  );
}
