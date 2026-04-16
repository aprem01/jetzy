import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_USERS } from '../data/seed';
import { ArrowLeft, DollarSign, Plus, Utensils, Bed, Bus, Ticket, ShoppingBag, Coffee, Check, Sparkles, PieChart } from 'lucide-react';

const CATEGORIES = [
  { name: 'Food', icon: <Utensils size={14} />, color: 'bg-orange-100 text-orange-600' },
  { name: 'Lodging', icon: <Bed size={14} />, color: 'bg-blue-100 text-blue-600' },
  { name: 'Transport', icon: <Bus size={14} />, color: 'bg-green-100 text-green-600' },
  { name: 'Activities', icon: <Ticket size={14} />, color: 'bg-purple-100 text-purple-600' },
  { name: 'Shopping', icon: <ShoppingBag size={14} />, color: 'bg-pink-100 text-pink-600' },
  { name: 'Coffee', icon: <Coffee size={14} />, color: 'bg-amber-100 text-amber-600' },
];

const INITIAL_EXPENSES = [
  { id: 1, category: 'Lodging', item: 'Senderos Hostería (5 nights)', amount: 600, currency: 'USD' },
  { id: 2, category: 'Food', item: 'La Cervecería — beer + empanadas', amount: 12, currency: 'USD' },
  { id: 3, category: 'Transport', item: 'El Calafate → El Chaltén bus', amount: 16, currency: 'USD' },
  { id: 4, category: 'Food', item: 'Refugio hot chocolate', amount: 2, currency: 'USD' },
  { id: 5, category: 'Activities', item: 'Perito Moreno glacier entry', amount: 35, currency: 'USD' },
  { id: 6, category: 'Transport', item: 'Flights (round trip)', amount: 480, currency: 'USD' },
  { id: 7, category: 'Food', item: 'Groceries for trail snacks', amount: 25, currency: 'USD' },
  { id: 8, category: 'Coffee', item: 'Daily coffee (5 days)', amount: 8, currency: 'USD' },
];

export default function Expenses() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const user = currentUser || SAMPLE_USERS[0];
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const days = 5;
  const perDay = Math.round(total / days);

  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const addExpense = () => {
    if (!newItem || !newAmount) return;
    setExpenses(prev => [...prev, { id: Date.now(), category: newCategory, item: newItem, amount: parseFloat(newAmount), currency: 'USD' }]);
    setNewItem('');
    setNewAmount('');
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="gradient-navy content-px pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-gold" />
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Trip Expenses</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">{user.recentTrip?.destination || 'Patagonia'}</h1>
          <p className="text-white/50 text-sm mt-1">{days} days · {expenses.length} expenses logged</p>

          <div className="flex gap-3 mt-5">
            <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
              <p className="text-2xl font-bold text-gold">${total.toLocaleString()}</p>
              <p className="text-white/40 text-[11px]">Total spent</p>
            </div>
            <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
              <p className="text-2xl font-bold text-gold">${perDay}</p>
              <p className="text-white/40 text-[11px]">Per day avg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-px mt-5 space-y-5">
        {/* Category breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-5">
          <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
            <PieChart size={14} className="text-gold" /> Spending Breakdown
          </h3>
          <div className="space-y-2.5">
            {byCategory.map(cat => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                    {cat.icon} {cat.name}
                  </span>
                  <span className="text-sm font-bold text-navy">${cat.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="gradient-gold rounded-full h-2 transition-all duration-500" style={{ width: `${(cat.total / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-cream rounded-xl">
            <p className="text-[11px] text-charcoal flex items-center gap-1">
              <Sparkles size={10} className="text-gold" />
              <span className="font-semibold">Jetzy Insight:</span> You spent 28% less than the average travel blog suggests for Patagonia ($87/day vs $120/day)
            </p>
          </div>
        </div>

        {/* Add expense */}
        {showAdd ? (
          <div className="bg-white rounded-2xl border border-gold/20 shadow-md p-4 animate-fade-up">
            <div className="flex flex-wrap gap-2 mb-3">
              {CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setNewCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${newCategory === cat.name ? cat.color : 'bg-cream text-charcoal-light'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="What did you spend on?" className="w-full px-3 py-2.5 bg-cream rounded-xl outline-none text-sm mb-2" />
            <div className="flex gap-2">
              <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Amount ($)" className="flex-1 px-3 py-2.5 bg-cream rounded-xl outline-none text-sm" />
              <button onClick={addExpense} className="px-5 py-2.5 gradient-gold rounded-xl text-white text-xs font-semibold active:scale-[0.97]">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-cream rounded-xl text-charcoal-light text-xs">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="w-full py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm font-semibold text-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Plus size={16} /> Add Expense
          </button>
        )}

        {/* Expense list */}
        <div>
          <h3 className="text-sm font-bold text-navy mb-3">All Expenses</h3>
          <div className="space-y-2">
            {expenses.map(exp => {
              const cat = CATEGORIES.find(c => c.name === exp.category);
              return (
                <div key={exp.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat?.color || 'bg-gray-100 text-gray-500'}`}>
                    {cat?.icon || <DollarSign size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{exp.item}</p>
                    <p className="text-[10px] text-charcoal-light">{exp.category}</p>
                  </div>
                  <span className="text-sm font-bold text-navy">${exp.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
