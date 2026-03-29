import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PERKS, POINTS_ACTIONS, POINTS_REWARDS, SAMPLE_USERS } from '../data/seed';
import { Lock, Zap, Sparkles, Crown, Check, ArrowRight, Gift, Star, Timer } from 'lucide-react';

export default function Perks() {
  const { currentUser } = useApp();
  const user = currentUser || SAMPLE_USERS[0];
  const [activeTab, setActiveTab] = useState('perks');
  const [claimedPerks, setClaimedPerks] = useState([]);
  const [claimedMoment, setClaimedMoment] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState([]);

  const tierAccess = user.tier === 'black' ? ['explorer', 'select', 'black'] : user.tier === 'select' ? ['explorer', 'select'] : ['explorer'];
  const tierLabel = user.tier === 'black' ? 'Select Black' : user.tier === 'select' ? 'Select' : 'Explorer';

  const claimPerk = (id) => setClaimedPerks(prev => [...prev, id]);
  const redeemReward = (idx) => setRedeemedRewards(prev => [...prev, idx]);

  const savings = PERKS.reduce((sum, p) => {
    const orig = parseInt(p.originalPrice.replace(/[$,]/g, ''));
    const price = parseInt(p.price.replace(/[$,]/g, ''));
    return sum + (orig - price);
  }, 0);

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Hero Header */}
      <div className="relative">
        <div className="gradient-navy content-px pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full translate-y-16 -translate-x-12" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.tier === 'black' ? 'bg-gold text-charcoal' : 'bg-white/15 text-white'
              }`}>
                <span className="flex items-center gap-1"><Crown size={10} /> {tierLabel}</span>
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Perks & Rewards</h1>
            <p className="text-white/50 text-sm mt-1">Your exclusive member benefits</p>

            {/* Savings highlight */}
            <div className="flex gap-4 mt-5">
              <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1">
                <p className="text-2xl font-bold text-gold">${savings.toLocaleString()}</p>
                <p className="text-white/40 text-[11px] mt-0.5">Total savings available</p>
              </div>
              <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1">
                <p className="text-2xl font-bold text-gold">{PERKS.length}</p>
                <p className="text-white/40 text-[11px] mt-0.5">Active perks for you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 content-px mt-5">
        <button
          onClick={() => setActiveTab('perks')}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
            activeTab === 'perks' ? 'gradient-gold text-white shadow-lg' : 'bg-white text-charcoal-light border border-gray-100'
          }`}
        >
          Perks
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
            activeTab === 'points' ? 'gradient-gold text-white shadow-lg' : 'bg-white text-charcoal-light border border-gray-100'
          }`}
        >
          JetPoints
        </button>
      </div>

      {activeTab === 'perks' ? (
        <div className="content-px mt-5">
          {/* Jetzy Moment — big visual card */}
          <div className="rounded-3xl overflow-hidden mb-6 shadow-xl relative">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=400&fit=crop"
              alt=""
              className="w-full h-52 md:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-gold/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Timer size={10} /> LIVE — Expires in 6 hours
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-gold" />
                <span className="text-gold text-[10px] font-bold uppercase tracking-wider">Jetzy Moment</span>
              </div>
              <p className="text-white text-xl font-bold">Aman Tokyo — 72% Off</p>
              <p className="text-white/60 text-sm mt-1">3 nights from $672 <span className="line-through text-white/30">$2,400</span></p>

              {claimedMoment ? (
                <div className="mt-3 py-3 bg-green-500/20 backdrop-blur-sm rounded-xl text-green-300 text-sm font-semibold flex items-center justify-center gap-2 animate-scale-in">
                  <Check size={16} strokeWidth={3} /> Claimed! Check your email for details
                </div>
              ) : (
                <button
                  onClick={() => setClaimedMoment(true)}
                  className="mt-3 w-full py-3.5 gradient-gold rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-[0.97]"
                >
                  <Sparkles size={14} /> Claim This Perk
                </button>
              )}
            </div>
          </div>

          {/* Perks Grid — photo-forward cards */}
          <h2 className="text-lg font-bold text-navy mb-3 flex items-center gap-2">
            <Gift size={16} className="text-gold" />
            All Perks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERKS.map((perk, idx) => {
              const isLocked = !tierAccess.includes(perk.tier);
              const isClaimed = claimedPerks.includes(perk.id);
              const discount = Math.round((1 - parseInt(perk.price.replace(/[$,]/g, '')) / parseInt(perk.originalPrice.replace(/[$,]/g, ''))) * 100);

              return (
                <div
                  key={perk.id}
                  className={`rounded-2xl overflow-hidden transition-all animate-fade-up active:scale-[0.99] ${
                    isLocked ? 'opacity-50' : 'shadow-md hover:shadow-lg'
                  }`}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Image */}
                  <div className="relative h-40 md:h-48">
                    <img src={perk.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {perk.tier === 'black' ? (
                        <span className="text-[9px] font-bold bg-charcoal text-white px-2.5 py-1 rounded-full uppercase shadow-md">Black</span>
                      ) : (
                        <span className="text-[9px] font-bold bg-gold text-white px-2.5 py-1 rounded-full uppercase shadow-md">Select</span>
                      )}
                      <span className="text-[9px] font-bold bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
                        {perk.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      -{discount}%
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-base drop-shadow-lg">{perk.title}</p>
                      <p className="text-white/70 text-xs mt-0.5">{perk.subtitle}</p>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className={`p-4 ${perk.tier === 'black' ? 'bg-charcoal' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-bold ${perk.tier === 'black' ? 'text-gold' : 'text-navy'}`}>
                          {perk.price}
                        </span>
                        <span className={`text-sm line-through ${perk.tier === 'black' ? 'text-white/25' : 'text-charcoal-light/40'}`}>
                          {perk.originalPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-gold" fill="#C9A84C" />
                        <span className={`text-[11px] font-medium ${perk.tier === 'black' ? 'text-white/50' : 'text-charcoal-light'}`}>
                          Save {perk.originalPrice.replace('$', '$').split('$')[1] ? `$${parseInt(perk.originalPrice.replace(/[$,]/g, '')) - parseInt(perk.price.replace(/[$,]/g, ''))}` : ''}
                        </span>
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="py-2.5 rounded-xl bg-gray-100 text-charcoal-light text-xs font-medium flex items-center justify-center gap-2">
                        <Lock size={12} /> Upgrade to {perk.tier === 'black' ? 'Select Black' : 'Select'}
                      </div>
                    ) : isClaimed ? (
                      <div className="py-2.5 rounded-xl bg-green-50 text-green-600 text-xs font-semibold flex items-center justify-center gap-2 animate-scale-in">
                        <Check size={14} strokeWidth={3} /> Claimed!
                      </div>
                    ) : (
                      <button
                        onClick={() => claimPerk(perk.id)}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                          perk.tier === 'black'
                            ? 'gradient-gold text-white shadow-md'
                            : 'bg-navy text-white shadow-md'
                        }`}
                      >
                        Claim Perk <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="content-px mt-5">
          {/* Points Balance — big visual */}
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-md text-center mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl gradient-gold mx-auto flex items-center justify-center mb-4 shadow-lg">
                <Zap size={28} className="text-white" />
              </div>
              <p className="text-4xl font-bold text-navy">{(user.jetPoints || 0).toLocaleString()}</p>
              <p className="text-sm text-charcoal-light mt-1">JetPoints Balance</p>
              <div className="w-full bg-gray-100 rounded-full h-3 mt-4">
                <div
                  className="gradient-gold rounded-full h-3 transition-all duration-1000"
                  style={{ width: `${Math.min(((user.jetPoints || 0) / 5000) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-charcoal-light">0</span>
                <span className="text-[11px] text-gold font-semibold">{5000 - (user.jetPoints || 0)} pts to next reward</span>
                <span className="text-[11px] text-charcoal-light">5,000</span>
              </div>
            </div>
          </div>

          {/* Earn Points */}
          <h3 className="text-lg font-bold text-navy mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-gold" /> Earn Points
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {POINTS_ACTIONS.map((action, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-11 h-11 rounded-2xl bg-gold/10 flex items-center justify-center text-xl flex-shrink-0">
                  {action.icon}
                </div>
                <p className="text-sm font-medium text-charcoal flex-1">{action.action}</p>
                <span className="text-base font-bold text-gold bg-gold/10 px-3 py-1 rounded-full">+{action.points}</span>
              </div>
            ))}
          </div>

          {/* Redeem */}
          <h3 className="text-lg font-bold text-navy mb-3 flex items-center gap-2">
            <Gift size={16} className="text-gold" /> Redeem Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {POINTS_REWARDS.map((reward, i) => {
              const canRedeem = (user.jetPoints || 0) >= reward.points;
              const isRedeemed = redeemedRewards.includes(i);
              return (
                <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-2xl">
                      {reward.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{reward.title}</p>
                      <p className="text-xs text-charcoal-light">{reward.points.toLocaleString()} points</p>
                    </div>
                  </div>
                  {isRedeemed ? (
                    <div className="py-2.5 rounded-xl bg-green-50 text-green-600 text-xs font-semibold flex items-center justify-center gap-2 animate-scale-in">
                      <Check size={14} strokeWidth={3} /> Redeemed! Check your email
                    </div>
                  ) : (
                    <button
                      onClick={() => canRedeem && redeemReward(i)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                        canRedeem
                          ? 'gradient-gold text-white shadow-md'
                          : 'bg-gray-100 text-charcoal-light cursor-not-allowed'
                      }`}
                      disabled={!canRedeem}
                    >
                      {canRedeem ? <><Gift size={14} /> Redeem Now</> : <><Lock size={12} /> Need {(reward.points - (user.jetPoints || 0)).toLocaleString()} more pts</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
