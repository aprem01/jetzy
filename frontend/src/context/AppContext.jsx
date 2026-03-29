import { createContext, useContext, useState } from 'react';
import { SAMPLE_USERS } from '../data/seed';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // For the prototype, we'll use the first sample user as default after onboarding
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

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      isOnboarded, setIsOnboarded,
      completeOnboarding, loginAsUser,
      chatMessages, setChatMessages,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
