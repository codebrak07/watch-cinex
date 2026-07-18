import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight, 
  Settings, Maximize, X 
} from 'lucide-react';
import { TVFocusable, useTVFocus } from './TVFocusEngine';
import Timeline from './Timeline';

export default function TVOverlay({ 
  media, isPlaying, onPlayPause, onSkip, onRestart, 
  onOpenSettings, onToggleFullscreen, onClose,
  currentTime, duration, bufferedTime, onChangeTime,
  isTvSeries, currentEpisode, selectedQuality,
  dimLevel // 'active' (100% opacity), 'dim' (buttons fade, hud 65%), 'hide' (buttons hide, progress/title 65%)
}) {
  const { focusedId } = useTVFocus();

  const getFocusStyle = (id) => {
    return focusedId === id 
      ? 'border-[#ff4d85] bg-[#ff4d85]/20 text-[#ff4d85] scale-110 shadow-[0_0_15px_rgba(255,77,133,0.5)]' 
      : 'border-white/10 hover:border-white/40 hover:scale-105 hover:bg-white/5';
  };

  const getOverlayOpacity = () => {
    if (dimLevel === 'hide') return 0;
    if (dimLevel === 'dim') return 0.2;
    return 1;
  };

  const getHudOpacity = () => {
    if (dimLevel === 'hide') return 0.65;
    if (dimLevel === 'dim') return 0.65;
    return 1;
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-end">
      
      {/* Persistent Glassmorphic HUD */}
      <motion.div
        animate={{ opacity: getHudOpacity() }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-8 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5 backdrop-blur-xl flex flex-col gap-5 pointer-events-auto"
      >
        {/* Progress Timeline */}
        <Timeline 
          currentTime={currentTime} 
          duration={duration} 
          bufferedTime={bufferedTime} 
          onChangeTime={onChangeTime} 
        />

        {/* Title, Badges, and Remote buttons row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Metadata Block */}
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
              {media.title}
            </h2>
            <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-mono">
              {isTvSeries && (
                <span className="font-semibold text-[#ff4d85]">
                  S1:E{currentEpisode}
                </span>
              )}
              <span>•</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold text-[9px]">
                {selectedQuality}
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold text-[9px]">
                5.1 AUDIO
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold text-[9px]">
                CC
              </span>
            </div>
          </div>

          {/* Action Button Row */}
          <motion.div 
            animate={{ opacity: getOverlayOpacity() }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-center gap-3 transition-opacity ${dimLevel === 'hide' ? 'pointer-events-none' : ''}`}
          >
            <TVFocusable
              id="btn-rewind"
              group="player-controls"
              order={1}
              onSelect={() => onSkip(-10)}
              className="p-3 rounded-full border text-white"
              activeClassName={getFocusStyle('btn-rewind')}
              title="Rewind 10s"
            >
              <ChevronLeft size={20} />
            </TVFocusable>

            <TVFocusable
              id="btn-play-pause"
              group="player-controls"
              order={2}
              onSelect={onPlayPause}
              className="p-4 rounded-full border text-white bg-white/5"
              activeClassName={getFocusStyle('btn-play-pause')}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </TVFocusable>

            <TVFocusable
              id="btn-forward"
              group="player-controls"
              order={3}
              onSelect={() => onSkip(10)}
              className="p-3 rounded-full border text-white"
              activeClassName={getFocusStyle('btn-forward')}
              title="Forward 10s"
            >
              <ChevronRight size={20} />
            </TVFocusable>

            <TVFocusable
              id="btn-restart"
              group="player-controls"
              order={4}
              onSelect={onRestart}
              className="p-3 rounded-full border text-white"
              activeClassName={getFocusStyle('btn-restart')}
              title="Restart Stream"
            >
              <RotateCcw size={20} />
            </TVFocusable>

            <TVFocusable
              id="btn-settings"
              group="player-controls"
              order={5}
              onSelect={onOpenSettings}
              className="p-3 rounded-full border text-white"
              activeClassName={getFocusStyle('btn-settings')}
              title="Settings"
            >
              <Settings size={20} />
            </TVFocusable>

            <TVFocusable
              id="btn-fullscreen"
              group="player-controls"
              order={6}
              onSelect={onToggleFullscreen}
              className="p-3 rounded-full border text-white"
              activeClassName={getFocusStyle('btn-fullscreen')}
              title="Toggle Fullscreen"
            >
              <Maximize size={20} />
            </TVFocusable>

            <TVFocusable
              id="btn-close"
              group="player-controls"
              order={7}
              onSelect={onClose}
              className="p-3 rounded-full border text-white bg-red-600/70 border-red-600/20"
              activeClassName={getFocusStyle('btn-close')}
              title="Close Modal"
            >
              <X size={20} />
            </TVFocusable>
          </motion.div>

        </div>
      </motion.div>
      
    </div>
  );
}
