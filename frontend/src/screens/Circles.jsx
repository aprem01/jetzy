import { useState } from 'react';
import { CIRCLES, SAMPLE_USERS, getUserById } from '../data/seed';
import { Users, MapPin, ArrowRight, Sparkles, Globe } from 'lucide-react';

export default function Circles() {
  const [activeCircle, setActiveCircle] = useState(null);

  const introductions = [
    { from: 'u1', to: 'u4', reason: 'Marco just got back from Patagonia and Aisha is heading there next month.' },
    { from: 'u2', to: 'u3', reason: 'Sofia and James are both in South America right now — they should meet.' },
  ];

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Header */}
      <div className="content-px pt-12 pb-2">
        <h1 className="font-display text-2xl font-semibold text-navy">Circles</h1>
        <p className="text-charcoal-light text-sm mt-0.5">Find your tribe</p>
      </div>

      {/* Smart Introductions */}
      <div className="content-px mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs font-semibold text-gold uppercase tracking-wider">Smart Introductions</span>
        </div>

        <div className="space-y-3">
          {introductions.map((intro, i) => {
            const fromUser = getUserById(intro.from);
            const toUser = getUserById(intro.to);
            return (
              <div key={i} className="p-4 bg-white rounded-2xl border border-gold/20 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex -space-x-2">
                    <img src={fromUser.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src={toUser.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  </div>
                  <p className="text-sm font-medium text-charcoal flex-1">{intro.reason}</p>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-navy/5 text-navy text-xs font-semibold hover:bg-navy/10 transition-colors">
                  Request Introduction
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Circles Grid */}
      <div className="content-px mt-6">
        <h2 className="text-base font-semibold text-navy mb-3">Your Circles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CIRCLES.map(circle => (
            <button
              key={circle.id}
              onClick={() => setActiveCircle(activeCircle === circle.id ? null : circle.id)}
              className="w-full text-left"
            >
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                activeCircle === circle.id
                  ? 'bg-white border-gold/30 shadow-md'
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: circle.color + '15' }}
                  >
                    {circle.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-charcoal">{circle.name}</p>
                    <p className="text-charcoal-light text-xs mt-0.5">{circle.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-navy">{circle.members.toLocaleString()}</p>
                    <p className="text-[10px] text-charcoal-light">members</p>
                  </div>
                </div>

                {activeCircle === circle.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-up">
                    {/* Active members */}
                    <div className="flex items-center gap-2 mb-3">
                      <Globe size={12} className="text-gold" />
                      <span className="text-xs font-medium text-charcoal-light">Active members near you</span>
                    </div>
                    <div className="flex -space-x-2 mb-3">
                      {SAMPLE_USERS.slice(0, 4).map(u => (
                        <img key={u.id} src={u.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                      ))}
                      <div className="w-8 h-8 rounded-full bg-gold/10 border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gold">+{circle.members - 4}</span>
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="p-3 bg-cream rounded-xl">
                      <p className="text-xs text-charcoal">
                        <span className="font-medium">Latest:</span> {SAMPLE_USERS[Math.floor(Math.random() * 4)].name} shared a recommendation from {SAMPLE_USERS[Math.floor(Math.random() * 4)].recentTrip?.destination || 'Tokyo'}
                      </p>
                    </div>

                    <button className="w-full mt-3 py-2.5 rounded-xl gradient-gold text-white text-xs font-semibold flex items-center justify-center gap-1">
                      Join Circle <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
