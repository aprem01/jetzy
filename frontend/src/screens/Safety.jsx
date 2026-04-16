import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Shield, MapPin, AlertTriangle, Check, Phone, Users, Eye, Clock, Sparkles } from 'lucide-react';

const SAFETY_ALERTS = [
  { dest: 'El Chaltén', level: 'low', alerts: ['Trail conditions after rain — use gaiters', 'Wind gusts up to 80km/h at altitude'] },
  { dest: 'Medellín', level: 'medium', alerts: ['Avoid Calle 10 area after midnight — 3 members flagged', 'Use registered taxis or Uber only', 'Keep phone in front pocket in El Centro'] },
  { dest: 'Buenos Aires', level: 'medium', alerts: ['Tourist pickpocketing in San Telmo Sunday market', 'Use BlueDollar rate for cash exchange — ask your hotel'] },
];

export default function Safety() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [sharingLocation, setSharingLocation] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [saved, setSaved] = useState(false);

  const levelColors = { low: 'bg-green-50 text-green-700 border-green-200', medium: 'bg-yellow-50 text-yellow-700 border-yellow-200', high: 'bg-red-50 text-red-700 border-red-200' };

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Safety Layer</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Travel Safe</h1>
          <p className="text-white/50 text-sm mt-1">Solo traveler check-ins & community alerts</p>
        </div>
      </div>

      <div className="content-px mt-5 space-y-5">
        {/* Live Location Sharing */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-gold" /> Live Location Sharing
          </h3>
          <p className="text-xs text-charcoal-light mb-4">Share your real-time location with a trusted contact while traveling solo</p>

          <div className="mb-3">
            <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Emergency contact email or phone"
              className="w-full px-4 py-3 bg-cream rounded-xl outline-none text-sm" />
          </div>

          <button onClick={() => setSharingLocation(!sharingLocation)}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
              sharingLocation ? 'bg-green-50 text-green-600 border border-green-200' : 'gradient-gold text-white shadow-lg'
            }`}>
            {sharingLocation ? <><Check size={16} strokeWidth={3} /> Location Sharing Active</> : <><Eye size={16} /> Start Sharing Location</>}
          </button>
          {sharingLocation && <p className="text-[10px] text-green-600 mt-2 text-center">Your trusted contact can see your location in real time</p>}
        </div>

        {/* Check-in */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <Clock size={14} className="text-gold" /> Solo Check-In
          </h3>
          <p className="text-xs text-charcoal-light mb-3">Set a timer. If you don't check in, your emergency contact gets notified.</p>
          <div className="flex gap-2">
            {['2 hours', '6 hours', '12 hours', '24 hours'].map(t => (
              <button key={t} onClick={() => setSaved(true)}
                className="flex-1 py-2.5 bg-cream rounded-xl text-xs font-semibold text-charcoal-light hover:bg-gold/10 hover:text-gold transition-all active:scale-95">
                {t}
              </button>
            ))}
          </div>
          {saved && <p className="text-[10px] text-green-600 mt-2 text-center font-medium">Check-in timer set! We'll remind you.</p>}
        </div>

        {/* Destination Safety Intel */}
        <div>
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-gold" /> Community Safety Intel
          </h3>
          <div className="space-y-3">
            {SAFETY_ALERTS.map((dest, idx) => (
              <div key={dest.dest} className={`p-4 rounded-2xl border ${levelColors[dest.level]} animate-fade-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold">{dest.dest}</p>
                  <span className="text-[10px] font-bold uppercase">{dest.level} risk</span>
                </div>
                <ul className="space-y-1.5">
                  {dest.alerts.map((alert, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                      {alert}
                    </li>
                  ))}
                </ul>
                <p className="text-[9px] mt-2 opacity-60">Sourced from member reports in the last 30 days</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
