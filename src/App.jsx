import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import NetflixHome from './components/NetflixHome';
import FavoritesPage from './components/FavoritesPage';
import SampleInfoPage from './components/SampleInfoPage';
import LoginPage from './components/LoginPage';
import LandingProfilePage from './components/LandingProfilePage';
import { JamProvider } from './context/JamContext';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Reset scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const handleHomeClick = () => {
    navigate('/browse');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('netflix_active_profile');
      localStorage.removeItem('cinex_active_profile');
    } catch (e) {}
    navigate('/browse');
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/profiles" element={<Navigate to="/browse" replace />} />
          <Route path="/profile" element={<Navigate to="/browse" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route 
            path="/browse" 
            element={
              <NetflixHome 
                onLogout={handleLogout}
                onHomeClick={handleHomeClick}
                key="home" 
              />
            } 
          />
          <Route 
            path="/movies" 
            element={
              <NetflixHome 
                onLogout={handleLogout}
                onHomeClick={handleHomeClick}
                key="movies" 
              />
            } 
          />
          <Route 
            path="/anime" 
            element={
              <NetflixHome 
                onLogout={handleLogout}
                onHomeClick={handleHomeClick}
                key="anime" 
              />
            } 
          />
          <Route 
            path="/languages" 
            element={
              <NetflixHome 
                onLogout={handleLogout}
                onHomeClick={handleHomeClick}
                key="languages" 
              />
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <FavoritesPage 
                onLogout={handleLogout}
                onHomeClick={handleHomeClick}
              />
            } 
          />
          <Route path="/audio-description" element={<SampleInfoPage />} />
          <Route path="/investor-relations" element={<SampleInfoPage />} />
          <Route path="/legal-notices" element={<SampleInfoPage />} />
          <Route path="/help-centre" element={<SampleInfoPage />} />
          <Route path="/jobs" element={<SampleInfoPage />} />
          <Route path="/cookie-preferences" element={<SampleInfoPage />} />
          <Route path="/gift-cards" element={<SampleInfoPage />} />
          <Route path="/terms-of-use" element={<SampleInfoPage />} />
          <Route path="/corporate-information" element={<SampleInfoPage />} />
          <Route path="/media-centre" element={<SampleInfoPage />} />
          <Route path="/privacy" element={<SampleInfoPage />} />
          <Route path="/contact-us" element={<SampleInfoPage />} />
          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JamProvider>
          <AppContent />
        </JamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
