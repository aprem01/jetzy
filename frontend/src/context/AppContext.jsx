import { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_USERS } from '../data/seed';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Memory layer — persists across sessions
  const [memories, setMemories] = useState(() => {
    try {
      const saved = localStorage.getItem('jetzy_memories');
      return saved ? JSON.parse(saved) : [
        'Prefers off-grid lodges over chain hotels',
        'Loves street food markets over fine dining',
        'Regrets overpacking for Kilimanjaro',
        'Wants to revisit Patagonia in better weather',
        'Met a great guide named Honest on Machame Route',
      ];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('jetzy_memories', JSON.stringify(memories));
  }, [memories]);

  const addMemory = (memory) => {
    setMemories(prev => {
      const updated = [memory, ...prev.filter(m => m !== memory)];
      return updated.slice(0, 20); // max 20
    });
  };

  const removeMemory = (memory) => {
    setMemories(prev => prev.filter(m => m !== memory));
  };

  const completeOnboarding = (userData) => {
    const user = {
      ...SAMPLE_USERS[0],
      ...userData,
      id: 'u1',
      jetPoints: 4250,
    };
    setCurrentUser(user);
    setIsOnboarded(true);
  };

  const loginAsUser = (userId) => {
    const user = SAMPLE_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsOnboarded(true);
    }
  };

  // Extract memories from conversation (called after each AI response)
  const extractMemories = async (userMessage, aiResponse) => {
    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Read this conversation exchange and extract travel memories, preferences, or lessons the user mentioned. Return ONLY a JSON array of short strings. Max 3 items. If nothing memorable, return [].

User said: "${userMessage}"
Assistant said: "${aiResponse.slice(0, 200)}"

Return format: ["memory 1", "memory 2"]` }],
          userProfile: { name: 'system' }
        })
      });
      const data = await res.json();
      try {
        const extracted = JSON.parse(data.response);
        if (Array.isArray(extracted)) {
          extracted.forEach(m => { if (m && typeof m === 'string') addMemory(m); });
        }
      } catch {}
    } catch {}
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      isOnboarded, setIsOnboarded,
      completeOnboarding, loginAsUser,
      chatMessages, setChatMessages,
      memories, addMemory, removeMemory, extractMemories,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
