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
import Translate from './screens/Translate';
import Replay from './screens/Replay';
import Alerts from './screens/Alerts';
import Fixers from './screens/Fixers';
import Journal from './screens/Journal';
import Packing from './screens/Packing';
import Costs from './screens/Costs';
import Safety from './screens/Safety';
import Wishlist from './screens/Wishlist';
import SeasonalCalendar from './screens/Calendar';
import Gear from './screens/Gear';
import Expenses from './screens/Expenses';
import Avatar from './screens/Avatar';
import VirtualTravel from './screens/VirtualTravel';
import Itinerary from './screens/Itinerary';

const SHOW_NAV_PATHS = ['/home', '/discover', '/circles', '/passport', '/perks', '/live'];

function AppLayout() {
  const { isOnboarded } = useApp();
  const location = useLocation();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  const showNav = SHOW_NAV_PATHS.includes(location.pathname);

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
        <Route path="/translate" element={<Translate />} />
        <Route path="/replay" element={<Replay />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/fixers" element={<Fixers />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/packing" element={<Packing />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/calendar" element={<SeasonalCalendar />} />
        <Route path="/gear" element={<Gear />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/avatar" element={<Avatar />} />
        <Route path="/virtual-travel" element={<VirtualTravel />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {showNav && <BottomNav />}
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
