import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PERKS, POINTS_ACTIONS, POINTS_REWARDS, SAMPLE_USERS } from '../data/seed';
import { Star, Lock, Zap, Gift, ChevronRight, Sparkles, Crown } from 'lucide-react';

export default function Perks() {
  const { currentUser } = useApp();
  const user = currentUser || SAMPLE_USERS[0];
  const [activeTab, setActiveTab] = useState('perks');

  const tierAccess = user.tier === 'black' ? ['explorer', 'select', 'black'] : user.tier === 'select' ? ['explorer', 'select'] : ['explorer'];

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Header */}
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">
              {user.tier === 'black' ? 'Select Black' : user.tier === 'select' ? 'Select' : 'Explorer'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Perks & Rewards</h1>
          <p className="text-white/50 text-sm mt-1">Exclusive access for Jetzy members</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 content-px mt-5">
        <button
          onClick={() => setActiveTab('perks')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'perks' ? 'gradient-gold text-white shadow-md' : 'bg-white text-charcoal-light border border-gray-100'
          }`}
        >
          Perks
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'points' ? 'gradient-gold text-white shadow-md' : 'bg-white text-charcoal-light border border-gray-100'
          }`}
        >
          JetPoints
        </button>
      </div>

      {activeTab === 'perks' ? (
        <div className="content-px mt-5">
          {/* Jetzy Moment */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-charcoal to-navy-light relative overflow-hidden mb-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-gold" />
                <span className="text-gold text-[10px] font-bold uppercase tracking-wider">Jetzy Moment — Live Now</span>
              </div>
              <p className="text-white text-sm font-medium">Aman Tokyo — 72% off for Select Black</p>
              <p className="text-white/50 text-xs mt-1">3 nights from $672 (was $2,400)</p>
              <button className="mt-3 px-4 py-2 gradient-gold rounded-lg text-white text-xs font-semibold">
                Claim This Perk
              </button>
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERKS.map(perk => {
              const isLocked = !tierAccess.includes(perk.tier);
              return (
                <div
                  key={perk.id}
                  className={`rounded-2xl overflow-hidden border shadow-sm transition-all ${
                    isLocked ? 'opacity-60 border-gray-200' : 'border-gray-100'
                  } ${perk.tier === 'black' ? 'bg-charcoal' : 'bg-white'}`}
                >
                  <div className="flex">
                    <img src={perk.image} alt="" className="w-28 h-28 object-cover" />
                    <div className="flex-1 p-3.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        {perk.tier === 'black' ? (
                          <span className="text-[9px] font-bold bg-gold text-charcoal px-1.5 py-0.5 rounded-full uppercase">Black</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-gold/20 text-gold px-1.5 py-0.5 rounded-full uppercase">Select</span>
                        )}
                        <span className={`text-[10px] ${perk.tier === 'black' ? 'text-white/50' : 'text-charcoal-light'}`}>
                          {perk.category}
                        </span>
                      </div>
                      <p className={`text-sm font-semibold ${perk.tier === 'black' ? 'text-white' : 'text-charcoal'}`}>
                        {perk.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${perk.tier === 'black' ? 'text-white/60' : 'text-charcoal-light'}`}>
                        {perk.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold ${perk.tier === 'black' ? 'text-gold' : 'text-navy'}`}>
                          {perk.price}
                        </span>
                        <span className={`text-[10px] line-through ${perk.tier === 'black' ? 'text-white/30' : 'text-charcoal-light/50'}`}>
                          {perk.originalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isLocked && (
                    <div className="px-3.5 pb-3 flex items-center gap-2">
                      <Lock size={12} className="text-gold" />
                      <span className="text-[10px] text-gold font-medium">
                        Upgrade to {perk.tier === 'black' ? 'Select Black' : 'Select'} to unlock
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="content-px mt-5">
          {/* Points Balance */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center mb-5">
            <div className="w-14 h-14 rounded-full gradient-gold mx-auto flex items-center justify-center mb-3">
              <Zap size={24} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-navy">{(user.jetPoints || 0).toLocaleString()}</p>
            <p className="text-sm text-charcoal-light mt-0.5">JetPoints Balance</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="gradient-gold rounded-full h-2"
                style={{ width: `${Math.min(((user.jetPoints || 0) / 5000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-charcoal-light mt-1.5">{5000 - (user.jetPoints || 0)} points until Select upgrade</p>
          </div>

          {/* Earn Points */}
          <h3 className="text-sm font-semibold text-navy mb-3">Earn Points</h3>
          <div className="space-y-2 mb-6">
            {POINTS_ACTIONS.map((action, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-lg">{action.icon}</span>
                <p className="text-sm text-charcoal flex-1">{action.action}</p>
                <span className="text-sm font-bold text-gold">+{action.points}</span>
              </div>
            ))}
          </div>

          {/* Redeem */}
          <h3 className="text-sm font-semibold text-navy mb-3">Redeem</h3>
          <div className="space-y-2">
            {POINTS_REWARDS.map((reward, i) => {
              const canRedeem = (user.jetPoints || 0) >= reward.points;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <span className="text-lg">{reward.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-charcoal">{reward.title}</p>
                    <p className="text-[10px] text-charcoal-light">{reward.points.toLocaleString()} points</p>
                  </div>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      canRedeem ? 'gradient-gold text-white' : 'bg-gray-100 text-charcoal-light'
                    }`}
                    disabled={!canRedeem}
                  >
                    {canRedeem ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
