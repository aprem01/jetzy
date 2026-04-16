import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, Backpack, Check, Plus, X, Sparkles, AlertTriangle, Minus } from 'lucide-react';

const PACKING_LISTS = {
  patagonia: {
    destination: 'Torres del Paine, Chile',
    season: 'June 2026 (Winter)',
    keep: [
      { item: 'Hiking boots (broken in)', reason: 'Same pair from Kilimanjaro — they know your feet' },
      { item: 'Merino base layers (x3)', reason: 'Worked perfectly on Machame Route' },
      { item: 'Trekking poles', reason: 'Essential for the W Circuit descents' },
      { item: 'Headlamp', reason: 'You started Laguna de los Tres at 4:30am — same here' },
    ],
    add: [
      { item: 'Waterproof hardshell jacket', reason: 'Patagonia rain is horizontal — down won\'t cut it', priority: 'critical' },
      { item: 'Lightweight dry bag', reason: 'Your phone almost died in El Chaltén rain', priority: 'critical' },
      { item: 'Synthetic insulated jacket', reason: 'Replace your down jacket — too wet for down in Patagonia', priority: 'high' },
      { item: 'Gaitors', reason: 'Trail mud in winter is brutal. Rent in town if needed ($5/day)', priority: 'medium' },
      { item: 'Hand warmers (x10)', reason: 'June is winter — mornings below freezing on the trail', priority: 'medium' },
    ],
    remove: [
      { item: 'Down jacket', reason: 'Too wet for down — go synthetic (you already have one)' },
      { item: 'Heavy sleeping bag', reason: 'Refugios provide bedding on the W Circuit' },
      { item: 'Formal clothes', reason: 'Nobody dresses up in Patagonia' },
    ],
  },
};

export default function Packing() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [checked, setChecked] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showList, setShowList] = useState(true);

  const list = PACKING_LISTS.patagonia;
  const toggleCheck = (item) => setChecked(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

  const totalItems = list.keep.length + list.add.length;
  const progress = Math.round((checked.length / totalItems) * 100);

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <Backpack size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Packing AI</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Pack Smart</h1>
          <p className="text-white/50 text-sm mt-1">Based on {list.destination} + your past trips</p>

          {/* Progress */}
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/60 text-xs">{checked.length}/{totalItems} packed</span>
              <span className="text-gold text-xs font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="gradient-gold rounded-full h-2 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="content-px mt-5 space-y-5">
        {/* Keep */}
        <div>
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <Check size={14} className="text-green-500" /> Keep from Kilimanjaro Kit
          </h3>
          <div className="space-y-2">
            {list.keep.map((item, i) => (
              <button key={i} onClick={() => toggleCheck(item.item)}
                className={`w-full p-4 rounded-2xl border flex items-start gap-3 text-left transition-all active:scale-[0.99] ${
                  checked.includes(item.item) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                }`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  checked.includes(item.item) ? 'bg-green-500' : 'border-2 border-gray-200'
                }`}>
                  {checked.includes(item.item) && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${checked.includes(item.item) ? 'text-charcoal line-through' : 'text-charcoal'}`}>{item.item}</p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">{item.reason}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add */}
        <div>
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <Plus size={14} className="text-gold" /> Add for Patagonia
          </h3>
          <div className="space-y-2">
            {list.add.map((item, i) => (
              <button key={i} onClick={() => toggleCheck(item.item)}
                className={`w-full p-4 rounded-2xl border flex items-start gap-3 text-left transition-all active:scale-[0.99] ${
                  checked.includes(item.item) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                }`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  checked.includes(item.item) ? 'bg-green-500' : 'border-2 border-gray-200'
                }`}>
                  {checked.includes(item.item) && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${checked.includes(item.item) ? 'line-through text-charcoal' : 'text-charcoal'}`}>{item.item}</p>
                    {item.priority === 'critical' && <AlertTriangle size={12} className="text-red-500" />}
                  </div>
                  <p className="text-[11px] text-charcoal-light mt-0.5">{item.reason}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Remove */}
        <div>
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <Minus size={14} className="text-red-400" /> Leave Behind
          </h3>
          <div className="space-y-2">
            {list.remove.map((item, i) => (
              <div key={i} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-start gap-3">
                <X size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-charcoal line-through">{item.item}</p>
                  <p className="text-[11px] text-charcoal-light mt-0.5">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
