import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import IntroAnimation from './components/IntroAnimation';
import ProfileSelection from './components/ProfileSelection';
import NetflixHome from './components/NetflixHome';
import FavoritesPage from './components/FavoritesPage';
import SampleInfoPage from './components/SampleInfoPage';
import { JamProvider } from './context/JamContext';
import RegisterForm from './components/RegisterForm';

function AppContent() {
  const [stage, setStage] = useState('intro'); // intro, profiles, home
  const navigate = useNavigate();
  const location = useLocation();

  const stageRef = useRef(stage);
  const shouldPlayAudio = useRef(false);
  const audioRef = useRef(null);

  const playAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/assets/intro.mp3');
        audioRef.current.volume = 0.8;
      }
      shouldPlayAudio.current = false;
      return audioRef.current.play();
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const triggerPlay = () => {
    if (!shouldPlayAudio.current) return;
    if (stageRef.current !== 'intro' && stageRef.current !== 'profiles') {
      shouldPlayAudio.current = false;
      return;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/assets/intro.mp3');
        audioRef.current.volume = 0.8;
      }
      audioRef.current.play()
        .then(() => {
          shouldPlayAudio.current = false;
        })
        .catch(() => {
          // Autoplay blocked: will trigger on fallback user interaction
        });
    } catch (e) {
      // Silent catch
    }
  };

  useEffect(() => {
    stageRef.current = stage;
    if (stage === 'intro') {
      shouldPlayAudio.current = true;
    }
  }, [stage]);

  useEffect(() => {
    const handleInteraction = () => {
      triggerPlay();
    };

    window.addEventListener('click', handleInteraction, true);
    window.addEventListener('touchstart', handleInteraction, true);
    window.addEventListener('keydown', handleInteraction, true);

    return () => {
      window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('touchstart', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };
  }, []);

  const handleSwitchProfile = () => {
    setStage('profiles');
    navigate('/');
  };

  const handleLogout = () => {
    setStage('intro');
    navigate('/');
  };

  const handleHomeClick = () => {
    if (stage !== 'home') setStage('home');
    navigate('/');
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <AnimatePresence>
        {stage === 'intro' && (
          <IntroAnimation 
            onComplete={() => setStage('profiles')} 
            playAudio={playAudio} 
            key="intro" 
          />
        )}
      </AnimatePresence>

      {stage !== 'intro' && (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/" 
              element={
                <AnimatePresence mode="wait">
                  {stage === 'profiles' && (
                    <ProfileSelection onSelect={() => setStage('home')} key="profiles" />
                  )}
                  {stage === 'home' && (
                    <Navigate to="/browse" replace />
                  )}
                </AnimatePresence>
              }
            />
            <Route 
              path="/browse" 
              element={
                stage === 'home' ? (
                  <NetflixHome 
                    onSwitchProfile={handleSwitchProfile}
                    onLogout={handleLogout}
                    onHomeClick={handleHomeClick}
                    key="home" 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/movies" 
              element={
                stage === 'home' ? (
                  <NetflixHome 
                    onSwitchProfile={handleSwitchProfile}
                    onLogout={handleLogout}
                    onHomeClick={handleHomeClick}
                    key="movies" 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/languages" 
              element={
                stage === 'home' ? (
                  <NetflixHome 
                    onSwitchProfile={handleSwitchProfile}
                    onLogout={handleLogout}
                    onHomeClick={handleHomeClick}
                    key="languages" 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/favorites" 
              element={
                stage === 'home' ? (
                  <FavoritesPage 
                    onSwitchProfile={handleSwitchProfile}
                    onLogout={handleLogout}
                    onHomeClick={handleHomeClick}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/audio-description" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/investor-relations" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/legal-notices" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/help-centre" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/jobs" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/cookie-preferences" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/gift-cards" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/terms-of-use" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/corporate-information" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/media-centre" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/privacy" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/contact-us" 
              element={stage === 'home' ? <SampleInfoPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/register" 
              element={<RegisterForm />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <JamProvider>
        <AppContent />
      </JamProvider>
    </BrowserRouter>
  );
}
