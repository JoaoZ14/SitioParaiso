import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/sections/Hero';
import VisionSection from './components/sections/VisionSection';
import PlannerDashboard from './components/sections/PlannerDashboard';
import CoupleSection from './components/sections/CoupleSection';
import Gallery from './components/sections/Gallery';
import HowToUse from './components/sections/HowToUse';
import Footer from './components/Footer';
import HubPage from './components/hub/HubPage';
import GoalsPage from './components/metas/GoalsPage';
import CoupleGoalsDashboardPage from './pages/CoupleGoalsDashboardPage';

function MainSite() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <VisionSection />
        <PlannerDashboard />
        <CoupleSection />
        <Gallery />
        <HowToUse />
      </main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/hub" replace /> : <LoginPage />}
      />
      <Route
        path="/hub"
        element={user ? <HubPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/app"
        element={user ? <MainSite /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/app/metas"
        element={user ? <GoalsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/app/casal"
        element={user ? <CoupleGoalsDashboardPage /> : <Navigate to="/login" replace />}
      />
      {/* Redirect root: logged in → hub, else → login */}
      <Route
        path="/"
        element={<Navigate to={user ? '/hub' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? '/hub' : '/login'} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
