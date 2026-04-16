import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Star, MapPin, MessageCircle, Phone, Check, Sparkles, Users } from 'lucide-react';

const FIXERS = [
  { id: 'f1', name: 'Honest', role: 'Mountain Guide', location: 'Moshi, Tanzania', specialty: 'Kilimanjaro — Machame & Lemosho routes', rating: 4.9, trips: 48, memberRecs: 12, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', quote: '100% summit rate with Jetzy members. Knows every shortcut and every sunset viewpoint.', price: '$1,800 for 7-day Machame', trustScore: 98 },
  { id: 'f2', name: 'María', role: 'Lodge Owner & Trail Guide', location: 'El Chaltén, Argentina', specialty: 'Patagonia trekking — local routes & hidden trails', rating: 5.0, trips: 35, memberRecs: 8, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', quote: 'Owns Senderos Hostería. Her trail beta isn\'t on AllTrails. Book 3 months ahead.', price: '$120/night includes breakfast + trail intel', trustScore: 96 },
  { id: 'f3', name: 'Carlos', role: 'Food Tour Guide', location: 'Buenos Aires, Argentina', specialty: 'Parrilla culture, hidden restaurants, market tours', rating: 4.8, trips: 62, memberRecs: 15, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', quote: 'Knows every steak joint in Palermo and San Telmo. His market tour ends at a secret speakeasy.', price: '$75 per person for 4-hour food walk', trustScore: 94 },
  { id: 'f4', name: 'Yuki', role: 'Cultural Navigator', location: 'Tokyo, Japan', specialty: 'Hidden Tokyo — Golden Gai, Tsukiji, backstreet ramen', rating: 4.9, trips: 41, memberRecs: 10, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', quote: 'She\'ll take you to the 6-seat bars in Golden Gai where tourists never go. ¥15,000 for a full evening.', price: '¥15,000 per evening', trustScore: 92 },
  { id: 'f5', name: 'Hassan', role: 'Safari Operator', location: 'Arusha, Tanzania', specialty: 'Serengeti & Ngorongoro — mobile camps, migration tracking', rating: 5.0, trips: 28, memberRecs: 6, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', quote: 'His mobile camps follow the migration. You wake up with wildebeest outside your tent. Unmatched.', price: '$450/day all-inclusive mobile camp', trustScore: 97 },
];

export default function Fixers() {
  const navigate = useNavigate();
  const [contacted, setContacted] = useState([]);

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Local Fixers</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Trusted on the Ground</h1>
          <p className="text-white/50 text-sm mt-1">Verified by Jetzy members — not a marketplace</p>
        </div>
      </div>

      <div className="content-px mt-5 space-y-4">
        {FIXERS.map((fixer, idx) => (
          <div key={fixer.id} className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden animate-fade-up" style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <img src={fixer.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-charcoal">{fixer.name}</p>
                    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-gold/10 rounded-full">
                      <Shield size={8} className="text-gold" />
                      <span className="text-[9px] font-bold text-gold">{fixer.trustScore}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gold font-medium">{fixer.role}</p>
                  <p className="text-xs text-charcoal-light flex items-center gap-1 mt-0.5"><MapPin size={10} /> {fixer.location}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-gold" fill="#C9A84C" />
                    <span className="text-sm font-bold text-navy">{fixer.rating}</span>
                  </div>
                  <p className="text-[10px] text-charcoal-light">{fixer.trips} trips</p>
                </div>
              </div>

              <p className="text-xs text-charcoal-light mt-3"><span className="font-semibold text-charcoal">Specialty:</span> {fixer.specialty}</p>

              <div className="mt-3 p-3 bg-cream rounded-xl">
                <p className="text-sm text-charcoal italic leading-relaxed">"{fixer.quote}"</p>
                <p className="text-[10px] text-charcoal-light mt-1 flex items-center gap-1">
                  <Users size={8} /> Recommended by {fixer.memberRecs} Jetzy members
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-bold text-navy">{fixer.price}</p>
              </div>
            </div>

            <div className="flex border-t border-gray-100">
              {contacted.includes(fixer.id) ? (
                <div className="flex-1 py-3.5 flex items-center justify-center gap-2 text-green-600 text-sm font-semibold bg-green-50 animate-scale-in">
                  <Check size={16} strokeWidth={3} /> Contact sent!
                </div>
              ) : (
                <>
                  <button onClick={() => setContacted(prev => [...prev, fixer.id])}
                    className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-gold hover:bg-gold/5 transition-colors active:scale-[0.98]">
                    <MessageCircle size={14} /> Contact {fixer.name}
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-medium text-charcoal-light hover:bg-gray-50 transition-colors active:scale-[0.98]">
                    <Phone size={14} /> Call
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
