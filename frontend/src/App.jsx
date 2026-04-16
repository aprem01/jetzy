import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Companion from './screens/Companion';
import Discover from './screens/Discover';
import DestinationDetail from './screens/DestinationDetail';
import Circles from './screens/Circles';
import Passport from './screens/Passport';
import Perks from './screens/Perks';
import Live from './screens/Live';
import Debrief from './screens/Debrief';
import AddRecommendation from './screens/AddRecommendation';
import Voice from './screens/Voice';
import Match from './screens/Match';
import Concierge from './screens/Concierge';
import ForTwo from './screens/ForTwo';
import Intel from './screens/Intel';

const HIDE_NAV_PATHS = ['/companion', '/debrief', '/add-rec', '/voice', '/match', '/concierge', '/for-two', '/intel'];

function AppLayout() {
  const { isOnboarded } = useApp();
  const location = useLocation();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  const hideNav = HIDE_NAV_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-cream">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/companion" element={<Companion />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/:id" element={<DestinationDetail />} />
        <Route path="/circles" element={<Circles />} />
        <Route path="/passport" element={<Passport />} />
        <Route path="/perks" element={<Perks />} />
        <Route path="/live" element={<Live />} />
        <Route path="/debrief" element={<Debrief />} />
        <Route path="/add-rec" element={<AddRecommendation />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/match" element={<Match />} />
        <Route path="/concierge" element={<Concierge />} />
        <Route path="/for-two" element={<ForTwo />} />
        <Route path="/intel" element={<Intel />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
