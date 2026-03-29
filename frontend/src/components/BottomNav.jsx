import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, MessageCircle, Users, User } from 'lucide-react';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/discover', icon: Compass, label: 'Discover' },
  { path: '/companion', icon: MessageCircle, label: 'Companion', isCenter: true },
  { path: '/circles', icon: Users, label: 'Circles' },
  { path: '/passport', icon: User, label: 'Passport' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 z-50">
      <div className="flex items-center justify-around px-2 pb-5 pt-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative -mt-6 flex flex-col items-center"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'gradient-gold animate-pulse-gold'
                    : 'bg-gold hover:bg-gold-light'
                }`}>
                  <Icon size={24} className="text-white" strokeWidth={2} />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-gold' : 'text-charcoal-light'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 py-1 px-3 transition-all duration-200"
            >
              <Icon
                size={22}
                className={`transition-colors duration-200 ${isActive ? 'text-navy' : 'text-charcoal-light/50'}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-navy' : 'text-charcoal-light/50'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
