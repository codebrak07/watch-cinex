import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, CreditCard, Film, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountModal({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const [continueWatching, setContinueWatching] = useState([]);
  const [autoplayNext, setAutoplayNext] = useState(() => {
    return localStorage.getItem('cinex_autoplay_next') !== 'false';
  });
  const [showClearSuccess, setShowClearSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const items = JSON.parse(localStorage.getItem('netflix_continue_watching') || '[]');
      setContinueWatching(items);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    localStorage.removeItem('netflix_continue_watching');
    setContinueWatching([]);
    setShowClearSuccess(true);
    setTimeout(() => setShowClearSuccess(false), 2500);
  };

  const handleAutoplayToggle = (checked) => {
    setAutoplayNext(checked);
    localStorage.setItem('cinex_autoplay_next', checked.toString());
  };

  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl bg-[#141414] border border-zinc-800 rounded-lg p-6 sm:p-8 text-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
          <User className="text-[#e50914]" size={24} />
          Account & Preferences
        </h2>

        {/* Membership Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800 pb-6 mb-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-zinc-500 tracking-wider">Account Email</span>
            <span className="text-sm font-semibold text-zinc-200 mt-1 truncate">
              {currentUser?.email || 'Guest User'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-zinc-500 tracking-wider">Plan</span>
            <span className="text-sm font-semibold text-[#e50914] mt-1 flex items-center gap-1.5">
              <Shield size={14} /> Premium Ultra HD 4K
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-zinc-500 tracking-wider">Member Since</span>
            <span className="text-sm font-semibold text-zinc-200 mt-1">{memberSince}</span>
          </div>
        </div>

        {/* Playback Preferences */}
        <div className="border-b border-zinc-800 pb-6 mb-6">
          <h3 className="text-base font-semibold mb-4 text-zinc-100">Playback Settings</h3>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">Autoplay next episode</p>
              <p className="text-xs text-zinc-400">Automatically play the next episode when watching a series</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoplayNext}
                onChange={(e) => handleAutoplayToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e50914]" />
            </label>
          </div>

          <div className="flex items-center justify-between py-2 mt-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">Stream Quality</p>
              <p className="text-xs text-zinc-400">Default video streaming resolution</p>
            </div>
            <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded border border-zinc-700 font-mono">
              Auto (Up to 4K Ultra HD)
            </span>
          </div>
        </div>

        {/* Watch History & Continue Watching */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Film size={18} className="text-zinc-400" />
                Watch History ({continueWatching.length})
              </h3>
              <p className="text-xs text-zinc-400">Titles you recently streamed</p>
            </div>
            {continueWatching.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/50 text-red-300 rounded text-xs transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                Clear History
              </button>
            )}
          </div>

          {showClearSuccess && (
            <div className="bg-green-950/60 border border-green-700/50 text-green-300 text-xs px-3 py-2 rounded mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} /> Watch history cleared successfully.
            </div>
          )}

          {continueWatching.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
              {continueWatching.slice(0, 8).map((item, idx) => (
                <div key={idx} className="bg-zinc-900 rounded p-2 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-200 truncate">{item.title || item.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {item.season ? `S${item.season} E${item.episode || 1}` : 'Movie'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-6 text-center text-xs text-zinc-500 font-sans">
              No watch history yet. Start watching movies and shows to see them here!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-red-500 hover:text-red-400 hover:underline cursor-pointer font-medium"
          >
            Sign out of all devices
          </button>
          <button
            onClick={onClose}
            className="bg-[#e50914] hover:bg-[#c11119] text-white px-5 py-2 rounded font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

