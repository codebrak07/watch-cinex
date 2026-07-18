import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { TVFocusable, useTVFocus } from './TVFocusEngine';
import EpisodeBrowser from './EpisodeBrowser';

export default function QuickPanel({ 
  show, onClose, isTvSeries, currentEpisode, onSelectEpisode,
  selectedSub, onSelectSub, selectedAudio, onSelectAudio,
  selectedQuality, onSelectQuality, selectedSpeed, onSelectSpeed,
  selectedProvider, onSelectProvider
}) {
  const { focusedId } = useTVFocus();

  const getFocusStyle = (id) => {
    return focusedId === id 
      ? 'border-[#ff4d85] bg-[#ff4d85]/10 text-[#ff4d85] scale-[1.03] shadow-[0_0_12px_rgba(255,77,133,0.3)]' 
      : 'border-white/5 hover:border-white/20 hover:bg-white/5 text-neutral-400';
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm pointer-events-auto"
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: show ? 0 : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 180 }}
        className="absolute top-0 right-0 bottom-0 w-[420px] max-w-full z-50 bg-[#0a0b0d]/95 border-l border-white/10 p-6 overflow-y-auto flex flex-col gap-6 select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-sm font-bold text-white uppercase tracking-widest font-mono">
            Player Settings
          </span>
          <TVFocusable
            id="panel-close-btn"
            group="quick-panel"
            order={0}
            onSelect={onClose}
            className="p-2 rounded-full border border-white/5 transition-all text-neutral-400"
            activeClassName="border-[#ff4d85] bg-[#ff4d85]/20 text-[#ff4d85] scale-110"
          >
            <X size={16} />
          </TVFocusable>
        </div>

        {/* Content sections */}
        <div className="space-y-5 flex-1 pr-1 overflow-x-hidden">
          
          {/* Mirrors / Providers */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase text-neutral-500 font-mono tracking-widest">Streaming Mirror</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'vidsrc_to', label: 'Mirror 1 (vidsrc.pm)' },
                { id: 'vidsrc_xyz', label: 'Mirror 2 (vidsrc.xyz)' },
                { id: 'embed_su', label: 'Mirror 3 (embed.su)' },
                { id: 'vidsrc_in', label: 'Mirror 4 (vidsrc.in)' },
                { id: 'streamimdb', label: 'Mirror 5 (streamimdb.ru)' }
              ].map((prov, i) => (
                <TVFocusable
                  key={prov.id}
                  id={`pref-prov-btn-${prov.id}`}
                  group="quick-panel"
                  order={1 + i}
                  onSelect={() => onSelectProvider(prov.id)}
                  className={`py-2.5 px-3 rounded-xl text-left text-xs font-medium border transition-all ${
                    selectedProvider === prov.id ? 'bg-[#ff4d85]/5 text-[#ff4d85] border-[#ff4d85]/20 font-bold' : ''
                  } ${getFocusStyle(`pref-prov-btn-${prov.id}`)}`}
                >
                  <span className="truncate">{prov.label}</span>
                </TVFocusable>
              ))}
            </div>
          </div>

          {/* Subtitle toggle */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase text-neutral-500 font-mono tracking-widest">Subtitles (CC)</span>
            <div className="grid grid-cols-4 gap-1.5">
              {['Off', 'English', 'Spanish', 'French'].map((sub, i) => (
                <TVFocusable
                  key={sub}
                  id={`pref-sub-btn-${sub}`}
                  group="quick-panel"
                  order={4 + i}
                  onSelect={() => onSelectSub(sub)}
                  className={`py-2 px-1 rounded-xl text-center text-xs border transition-all ${
                    selectedSub === sub ? 'bg-[#ff4d85]/5 text-[#ff4d85] border-[#ff4d85]/20 font-bold' : ''
                  } ${getFocusStyle(`pref-sub-btn-${sub}`)}`}
                >
                  {sub}
                </TVFocusable>
              ))}
            </div>
          </div>

          {/* Speed settings */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase text-neutral-500 font-mono tracking-widest">Playback Speed</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[0.75, 1, 1.25, 1.5].map((speed, i) => (
                <TVFocusable
                  key={speed}
                  id={`pref-speed-btn-${speed}`}
                  group="quick-panel"
                  order={8 + i}
                  onSelect={() => onSelectSpeed(speed)}
                  className={`py-2 px-1 rounded-xl text-center text-xs border transition-all ${
                    selectedSpeed === speed ? 'bg-[#ff4d85]/5 text-[#ff4d85] border-[#ff4d85]/20 font-bold' : ''
                  } ${getFocusStyle(`pref-speed-btn-${speed}`)}`}
                >
                  {speed}x
                </TVFocusable>
              ))}
            </div>
          </div>

          {/* Episode List Section */}
          {isTvSeries && (
            <div className="border-t border-white/10 pt-4">
              <EpisodeBrowser 
                currentEpisode={currentEpisode} 
                onSelectEpisode={onSelectEpisode} 
              />
            </div>
          )}

        </div>
      </motion.div>
    </>
  );
}
