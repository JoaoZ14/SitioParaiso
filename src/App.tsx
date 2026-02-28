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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
