import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Pencil, Plus, X, Check, UserPlus, LogIn, Trash2 } from 'lucide-react';
import logoImg from '../assets/cinex.png';
import { useAuth } from '../context/AuthContext';
import NetflixAuthModal from './NetflixAuthModal';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];

const SHOW_BANNERS = [
  {
    id: 'mentalist',
    titlePrefix: 'THE',
    titleBox: 'MENTALIST',
    image: 'https://image.tmdb.org/t/p/original/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg'
  },
  {
    id: 'stranger_things',
    titlePrefix: 'STRANGER',
    titleBox: 'THINGS',
    image: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg'
  },
  {
    id: 'money_heist',
    titlePrefix: 'LA CASA DE',
    titleBox: 'PAPEL',
    image: 'https://image.tmdb.org/t/p/original/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg'
  },
  {
    id: 'breaking_bad',
    titlePrefix: 'BREAKING',
    titleBox: 'BAD',
    image: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg'
  },
  {
    id: 'peaky_blinders',
    titlePrefix: 'PEAKY',
    titleBox: 'BLINDERS',
    image: 'https://image.tmdb.org/t/p/original/dzq83RHwQcnP6WGJ6YkenIqeaa5.jpg'
  },
  {
    id: 'squid_game',
    titlePrefix: 'SQUID',
    titleBox: 'GAME',
    image: 'https://image.tmdb.org/t/p/original/2meX1nMdScFOoV4370rqHWKmXhY.jpg'
  },
  {
    id: 'dark',
    titlePrefix: 'ORIGINAL',
    titleBox: 'DARK',
    image: 'https://image.tmdb.org/t/p/original/3jDXL4Xvj3AzDOF6UH1xeyHW8MH.jpg'
  }
];

// Authentic Netflix Smiley SVG Component
function NetflixSmiley({ color = '#e50914', className = '', initial = '' }) {
  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none ${className}`}
      style={{ backgroundColor: color }}
    >
      <svg viewBox="0 0 100 100" className="w-[62%] h-[62%] drop-shadow-md">
        <circle cx="32" cy="38" r="6" fill="#ffffff" />
        <circle cx="68" cy="38" r="6" fill="#ffffff" />
        <path
          d="M 30 60 Q 50 82 70 60"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {initial && (
        <span className="absolute bottom-1 right-2 text-[10px] font-mono text-white/70 uppercase">
          {initial}
        </span>
      )}
    </div>
  );
}

export default function LandingProfilePage({ onSelectProfile }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Load only authentic logged-in or registered email accounts
  const loadAccounts = () => {
    const list = [];
    try {
      const saved = JSON.parse(localStorage.getItem('cinex_saved_accounts') || '[]');
      if (Array.isArray(saved)) {
        saved.forEach((acc, i) => {
          if (acc && (acc.email || acc.name)) {
            list.push({
              id: acc.id || acc.email,
              name: acc.name || (acc.email ? acc.email.split('@')[0] : `Account ${i + 1}`),
              email: acc.email || '',
              avatarType: acc.avatarUrl ? 'image' : 'color',
              avatarUrl: acc.avatarUrl,
              bgColor: ['#e50914', '#2ecc71', '#3498db', '#e67e22', '#9b59b6'][i % 5],
              isLocked: !!acc.isLocked,
              pin: acc.pin || '1234'
            });
          }
        });
      }
    } catch (e) {
      console.warn(e);
    }

    if (currentUser && currentUser.email) {
      const exists = list.some(p => p.email && p.email.toLowerCase() === currentUser.email.toLowerCase());
      if (!exists) {
        const name = currentUser.displayName || currentUser.email.split('@')[0];
        list.unshift({
          id: currentUser.uid,
          name: name,
          email: currentUser.email,
          avatarType: currentUser.photoURL ? 'image' : 'color',
          avatarUrl: currentUser.photoURL,
          bgColor: '#e50914',
          isLocked: false
        });
      }
    }
    return list;
  };

  const [profiles, setProfiles] = useState(loadAccounts);

  useEffect(() => {
    setProfiles(loadAccounts());
  }, [currentUser]);

  const [isManaging, setIsManaging] = useState(false);
  const [selectedForPin, setSelectedForPin] = useState(null);
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocked, setEditLocked] = useState(false);
  const [editPin, setEditPin] = useState('1234');

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Rotating background banner state with smooth crossfade
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % SHOW_BANNERS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const activeBanner = SHOW_BANNERS[currentBannerIndex];

  const selectProfile = (profile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setEditName(profile.name);
      setEditLocked(!!profile.isLocked);
      setEditPin(profile.pin || '1234');
      return;
    }

    if (profile.isLocked) {
      setSelectedForPin(profile);
      setPinInput(['', '', '', '']);
      setPinError(false);
      return;
    }

    proceedWithProfile(profile);
  };

  const proceedWithProfile = (profile) => {
    const avatar = profile.name.charAt(0).toUpperCase();
    const active = {
      name: profile.name,
      avatar: avatar,
      avatarUrl: profile.avatarUrl,
      bgColor: profile.bgColor,
      email: profile.email,
      id: profile.id
    };
    try {
      localStorage.setItem('cinex_active_profile', JSON.stringify(active));
    } catch (e) {
      console.warn(e);
    }

    if (onSelectProfile) {
      onSelectProfile(active);
    } else {
      navigate('/browse');
    }
  };

  const handlePinDigit = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pinInput];
    newPin[index] = value.slice(-1);
    setPinInput(newPin);
    setPinError(false);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (newPin.every(d => d !== '')) {
      const enteredPin = newPin.join('');
      const correctPin = selectedForPin.pin || '1234';
      if (enteredPin === correctPin) {
        setTimeout(() => {
          proceedWithProfile(selectedForPin);
        }, 150);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPinInput(['', '', '', '']);
          const first = document.getElementById('pin-input-0');
          if (first) first.focus();
        }, 600);
      }
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    const updated = profiles.map(p => {
      if (p.id === editingProfile.id) {
        return {
          ...p,
          name: editName.trim(),
          isLocked: editLocked,
          pin: editPin || '1234'
        };
      }
      return p;
    });
    setProfiles(updated);
    try {
      localStorage.setItem('cinex_saved_accounts', JSON.stringify(updated));
    } catch (e) {}
    setEditingProfile(null);
  };

  const handleDeleteProfile = (id) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    try {
      localStorage.setItem('cinex_saved_accounts', JSON.stringify(updated));
    } catch (e) {}
    setEditingProfile(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none flex flex-col justify-between">
      {/* Background Banner with Cross-Fade Transitions across different shows */}
      <AnimatePresence initial={false}>
        <motion.div 
          key={activeBanner.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${activeBanner.image}')`
          }}
        />
      </AnimatePresence>

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black/90 pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)'
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-30 px-6 sm:px-14 py-6 sm:py-8 flex items-center justify-between">
        <img 
          src={logoImg} 
          alt="CineX" 
          className="h-7 sm:h-9 w-auto object-contain cursor-pointer drop-shadow-lg"
          onClick={() => {
            if (onSelectProfile && profiles.length > 0) {
              proceedWithProfile(profiles[0]);
            } else {
              navigate('/browse');
            }
          }}
        />

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono truncate max-w-[150px]">{currentUser.email}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#e50914] hover:bg-[#b20710] text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded shadow-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Center Content: Who's watching? */}
      <main className="relative z-30 flex flex-col items-center justify-center my-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
          className="text-3xl sm:text-5xl md:text-[54px] font-medium text-white tracking-tight text-center mb-8 sm:mb-12 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
        >
          {isManaging ? 'Manage Accounts:' : "Who's watching?"}
        </motion.h1>

        {/* Profile Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: SOVEREIGN_EASE }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-7 max-w-4xl"
        >
          {profiles.length > 0 ? (
            profiles.map((profile) => {
              return (
                <motion.div
                  key={profile.id}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => selectProfile(profile)}
                  className="group flex flex-col items-center cursor-pointer select-none"
                >
                  {/* Profile Avatar Card Box */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-200 shadow-[0_8px_25px_rgba(0,0,0,0.6)] bg-neutral-900">
                    {profile.avatarType === 'image' && profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt={profile.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <NetflixSmiley color={profile.bgColor || '#e50914'} initial={profile.name.charAt(0)} />
                    )}

                    {/* Lock Indicator */}
                    {profile.isLocked && !isManaging && (
                      <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-black/75 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow">
                        <Lock size={12} />
                      </div>
                    )}

                    {/* Manage Overlay with Pencil */}
                    {isManaging && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white bg-black/40 shadow-lg">
                          <Pencil size={18} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Name & Email */}
                  <span className="mt-3 sm:mt-4 text-xs sm:text-base font-normal text-neutral-300 group-hover:text-white transition-colors tracking-wide max-w-[120px] truncate text-center drop-shadow-md">
                    {profile.name}
                  </span>
                  {profile.email && (
                    <span className="text-[10px] text-neutral-500 font-mono truncate max-w-[120px]">
                      {profile.email}
                    </span>
                  )}
                </motion.div>
              );
            })
          ) : (
            /* Prompt to Sign In when no email account has been logged in yet */
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center cursor-pointer select-none group"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-md border-2 border-dashed border-red-500/60 group-hover:border-red-500 flex flex-col items-center justify-center text-red-500 group-hover:text-white transition-all bg-black/40 backdrop-blur-sm p-4 text-center shadow-2xl">
                <LogIn size={32} className="mb-2" />
                <span className="text-xs font-semibold">Sign In / Register</span>
              </div>
              <span className="mt-3 text-xs sm:text-sm text-neutral-400 group-hover:text-white transition-colors">
                Add Your Email Account
              </span>
            </motion.div>
          )}

          {/* Add Another Registered Account Button */}
          <motion.div
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsAuthModalOpen(true)}
            className="group flex flex-col items-center cursor-pointer select-none"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-md border-2 border-dashed border-neutral-600 group-hover:border-white flex flex-col items-center justify-center text-neutral-500 group-hover:text-white transition-all duration-200 shadow-[0_8px_25px_rgba(0,0,0,0.6)] bg-transparent">
              <Plus size={32} />
              <span className="text-[10px] uppercase font-mono mt-1">Add Account</span>
            </div>
            <span className="mt-3 sm:mt-4 text-xs sm:text-base font-normal text-neutral-500 group-hover:text-white transition-colors tracking-wide text-center">
              Sign In Other
            </span>
          </motion.div>
        </motion.div>

        {/* Manage Profiles Pill Button */}
        {profiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 sm:mt-14"
          >
            <button
              onClick={() => setIsManaging(!isManaging)}
              className={`px-6 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg ${
                isManaging
                  ? 'bg-white text-black hover:bg-neutral-200 font-bold'
                  : 'bg-black/60 hover:bg-black/85 text-neutral-300 hover:text-white border border-neutral-500/80 hover:border-white'
              }`}
            >
              {isManaging ? (
                <>
                  <Check size={16} />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Pencil size={14} />
                  <span>Manage Profiles</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </main>

      {/* Bottom Footer: Dynamic Show Logo on Bottom-Left */}
      <footer className="relative z-30 px-6 sm:px-14 py-6 sm:py-8 flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeBanner.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] select-none"
          >
            <span className="text-white font-extrabold text-sm sm:text-lg tracking-wider">
              {activeBanner.titlePrefix}
            </span>
            <span className="border-2 border-white px-2 py-0.5 text-white font-black text-xs sm:text-base tracking-[0.2em] uppercase">
              {activeBanner.titleBox}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="text-[11px] text-neutral-400 font-mono hidden sm:block drop-shadow">
          © 2026 CineX · Ultra HD Stream
        </div>
      </footer>

      {/* Netflix 4-Digit PIN Modal */}
      <AnimatePresence>
        {selectedForPin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-lg p-6 sm:p-8 text-center text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedForPin(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-200">
                <Lock size={22} />
              </div>

              <h3 className="text-xl font-bold mb-1">Profile Lock is on.</h3>
              <p className="text-xs text-neutral-400 mb-6">
                Enter your 4-digit PIN to access <span className="text-white font-semibold">{selectedForPin.name}</span>. (Default: 1234)
              </p>

              <div className="flex items-center justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`pin-input-${idx}`}
                    type="password"
                    maxLength={1}
                    value={pinInput[idx]}
                    onChange={(e) => handlePinDigit(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !pinInput[idx] && idx > 0) {
                        const prev = document.getElementById(`pin-input-${idx - 1}`);
                        if (prev) prev.focus();
                      }
                    }}
                    autoFocus={idx === 0}
                    className={`w-12 h-14 bg-black/80 border text-center text-2xl font-bold rounded outline-none transition-all ${
                      pinError
                        ? 'border-red-500 text-red-400 animate-shake'
                        : 'border-white/30 focus:border-white focus:ring-2 focus:ring-white/20 text-white'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-xs text-red-400 font-medium mb-4">
                  Incorrect PIN. Please try again.
                </p>
              )}

              <button
                type="button"
                onClick={() => proceedWithProfile(selectedForPin)}
                className="text-xs text-neutral-400 hover:text-white hover:underline cursor-pointer"
              >
                Forgot PIN? Click to bypass
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-lg p-6 sm:p-8 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditingProfile(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-bold mb-6">Account Settings</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-md overflow-hidden border border-white/20 shrink-0">
                  <NetflixSmiley color={editingProfile.bgColor || '#e50914'} initial={editingProfile.name.charAt(0)} />
                </div>

                <div className="flex-1">
                  <label className="block text-xs uppercase font-mono text-neutral-400 mb-1.5">Profile Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/20 focus:border-white rounded px-3 py-2 text-sm text-white outline-none"
                    placeholder="Profile Name"
                  />
                  {editingProfile.email && (
                    <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                      {editingProfile.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-sm font-medium">Require PIN to access account</span>
                  <input
                    type="checkbox"
                    checked={editLocked}
                    onChange={(e) => setEditLocked(e.target.checked)}
                    className="w-4 h-4 rounded text-[#e50914] bg-neutral-900 border-white/20"
                  />
                </label>

                {editLocked && (
                  <div className="mt-3">
                    <label className="block text-xs uppercase font-mono text-neutral-400 mb-1">Set 4-Digit PIN</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                      className="w-32 bg-neutral-900 border border-white/20 focus:border-white rounded px-3 py-1.5 text-sm text-white font-mono tracking-widest text-center outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(editingProfile.id)}
                  className="text-xs text-red-500 hover:text-red-400 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove Account
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 rounded text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="bg-white hover:bg-neutral-200 text-black font-bold px-5 py-2 rounded text-xs cursor-pointer shadow"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign In / Sign Up Modal */}
      <NetflixAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setProfiles(loadAccounts());
        }}
      />
    </div>
  );
}
