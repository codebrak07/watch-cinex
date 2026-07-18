import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, X, Info } from 'lucide-react';
import { TVFocusable, useTVFocus } from './TVFocusEngine';

export default function ResumeManager({ media, savedTime, duration, onResume, onRestart, onClose, isTvSeries, currentEpisode }) {
  const [countdown, setCountdown] = useState(10);
  const { changeFocus, setActiveGroup } = useTVFocus();

  // Initialize focus and group
  useEffect(() => {
    setActiveGroup('resume');
    changeFocus(savedTime > 0 ? 'resume-continue' : 'resume-play');
  }, [savedTime, changeFocus, setActiveGroup]);

  // Countdown timer for TV Remote ease-of-use
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (savedTime > 0) onResume(savedTime);
      else onResume(0);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onResume, savedTime]);

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const percent = savedTime && duration ? Math.min(100, Math.round((savedTime / duration) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onKeyDown={cancelCountdown}
      onMouseMove={cancelCountdown}
      onClick={cancelCountdown}
      className="absolute inset-0 z-50 flex flex-col justify-end p-8 md:p-16 bg-gradient-to-t from-black via-black/85 to-black/30"
    >
      <div className="max-w-2xl space-y-6 select-none">
        <span className="inline-block px-3 py-1 bg-red-600/90 text-white rounded text-xs font-semibold uppercase tracking-widest font-mono">
          {isTvSeries ? 'TV Series' : 'Movie'}
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
          {media.title}
        </h1>
        
        {isTvSeries && (
          <p className="text-lg md:text-xl text-[#ff4d85] font-semibold tracking-wide">
            Season 1 • Episode {currentEpisode}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-neutral-400">
          <span>Duration: {formatTime(duration || 3600)}</span>
          <span className="flex items-center gap-2">
            Progress:
            <span className="text-[#ff4d85] font-bold">{percent}%</span>
          </span>
          {savedTime > 0 && (
            <span className="px-2.5 py-0.5 bg-white/10 text-white rounded text-xs font-mono">
              Stopped at {formatTime(savedTime)}
            </span>
          )}
        </div>

        {/* Progress Ring Visual */}
        {savedTime > 0 && (
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-[#ff4d85] h-full"
            />
          </div>
        )}

        {/* Countdown alert */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs font-mono text-[#ff4d85] flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff4d85] animate-ping" />
              Auto-playing in {countdown}s... (Press any key to pause)
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-4 pt-4">
          {savedTime > 0 ? (
            <TVFocusable
              id="resume-continue"
              group="resume"
              order={1}
              onSelect={() => onResume(savedTime)}
              className="px-8 py-4 rounded-xl text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 border flex items-center gap-3 bg-white/5"
              activeClassName="border-[#ff4d85] bg-[#ff4d85]/20 shadow-[0_0_20px_rgba(255,77,133,0.4)] scale-105"
            >
              <Play size={18} fill="currentColor" />
              <span>Resume from {formatTime(savedTime)}</span>
            </TVFocusable>
          ) : (
            <TVFocusable
              id="resume-play"
              group="resume"
              order={1}
              onSelect={() => onResume(0)}
              className="px-8 py-4 rounded-xl text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 border flex items-center gap-3 bg-white/5"
              activeClassName="border-[#ff4d85] bg-[#ff4d85]/20 shadow-[0_0_20px_rgba(255,77,133,0.4)] scale-105"
            >
              <Play size={18} fill="currentColor" />
              <span>Play Episode</span>
            </TVFocusable>
          )}

          <TVFocusable
            id="resume-restart"
            group="resume"
            order={2}
            onSelect={onRestart}
            className="px-8 py-4 rounded-xl text-neutral-300 font-bold text-sm tracking-wider uppercase transition-all duration-300 border flex items-center gap-3 bg-white/5"
            activeClassName="border-[#ff4d85] bg-[#ff4d85]/20 shadow-[0_0_20px_rgba(255,77,133,0.4)] scale-105"
          >
            <RotateCcw size={18} />
            <span>Restart</span>
          </TVFocusable>

          <TVFocusable
            id="resume-back"
            group="resume"
            order={3}
            onSelect={onClose}
            className="px-8 py-4 rounded-xl text-neutral-400 font-bold text-sm tracking-wider uppercase transition-all duration-300 border flex items-center gap-3 bg-white/5"
            activeClassName="border-[#ff4d85] bg-[#ff4d85]/20 shadow-[0_0_20px_rgba(255,77,133,0.4)] scale-105"
          >
            <X size={18} />
            <span>Back</span>
          </TVFocusable>
        </div>
      </div>
    </motion.div>
  );
}
