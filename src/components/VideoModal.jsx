import { motion } from 'framer-motion';
import { X, Maximize, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function VideoModal({ media, onClose, onMediaUpdate }) {
  const containerRef = useRef(null);
  const localPlayerRef = useRef(null);

  const mediaId = media.tmdbId || media.id || '99999';
  const isTvSeries = media.title === 'Off Campus' || (media.url && (media.url.includes('/tv/') || media.url.includes('media_type=tv')));
  const currentEpisode = parseInt(media.episode || (() => {
    const match = media.url ? (media.url.match(/\/episode\/(\d+)/) || media.url.match(/\/1\/(\d+)/) || media.url.match(/episode=(\d+)/) || media.url.match(/\/273240\/1\/(\d+)/)) : null;
    return match ? match[1] : '1';
  })(), 10);

  // Set default provider value to vidsrc_to
  useEffect(() => {
    const saved = localStorage.getItem('off_campus_provider');
    if (!saved) {
      localStorage.setItem('off_campus_provider', 'vidsrc_to');
    }
  }, []);

  // Retrieve initial saved timestamp from browser cache
  const getInitialTime = () => {
    const key = isTvSeries ? `pos_${mediaId}_ep_${currentEpisode}` : `pos_${mediaId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.time || 0;
      }
    } catch (e) {
      console.warn(e);
    }
    return 0;
  };

  // currentTime holds the ticking simulated timeline
  const [currentTime, setCurrentTime] = useState(getInitialTime);
  
  // startOffsetTime only changes when player first loads (keeps iframe src static)
  const [startOffsetTime] = useState(getInitialTime);

  // Focus the iframe automatically on mount/load so native arrow keys go directly to the player
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (localPlayerRef.current) {
        try {
          localPlayerRef.current.focus();
        } catch (e) {
          console.warn('Iframe focus failed:', e);
        }
      }
    }, 1200);
    return () => clearTimeout(focusTimer);
  }, [media.url]);

  // Keep simulated clock ticking and saving progress in the background (does not reload iframe)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1;
        const key = isTvSeries ? `pos_${mediaId}_ep_${currentEpisode}` : `pos_${mediaId}`;
        try {
          localStorage.setItem(key, JSON.stringify({ time: next, duration: 3600, ts: Date.now() }));
        } catch (e) {
          console.warn(e);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mediaId, isTvSeries, currentEpisode]);

  const handleEpisodeChange = (epVal) => {
    let newUrl = media.url;
    if (media.url.includes('off-campus') || media.url.includes('273240')) {
      newUrl = `https://vidsrc.sbs/embed/tv/273240/1/${epVal}`;
    } else if (media.url.includes('/episode/')) {
      newUrl = media.url.replace(/\/episode\/\d+/, `/episode/${epVal}`);
    } else if (media.url.includes('/1/')) {
      newUrl = media.url.replace(/\/1\/\d+/, `/1/${epVal}`);
    } else {
      if (media.url.includes('?')) {
        const [base, query] = media.url.split('?');
        newUrl = `${base}/episode/${epVal}?${query}`;
      } else {
        newUrl = `${media.url}/episode/${epVal}`;
      }
    }

    setCurrentTime(0);
    if (onMediaUpdate) {
      onMediaUpdate({
        ...media,
        url: newUrl,
        episode: epVal
      });
    }
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } else {
      const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
      if (exitFs) exitFs.call(document);
    }
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = localPlayerRef.current;
      
      if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        // Only seek local HTML5 video directly, let iframe handle its native keys if focused
        if (video && !(video instanceof HTMLIFrameElement)) {
          video.currentTime = Math.max(0, video.currentTime - 10);
        }
      } else if (e.key === 'ArrowRight') {
        // Only seek local HTML5 video directly, let iframe handle its native keys if focused
        if (video && !(video instanceof HTMLIFrameElement)) {
          video.currentTime = Math.min(video.duration || 3600, video.currentTime + 10);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
      className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10"
      >
        {/* Episode/Season & Mirror Selector Dropdowns (Top-Left) */}
        {(media.title === 'Off Campus' || (media.url && (media.url.includes('streamimdb.ru') || media.url.includes('tmdb_id')))) && (
          <div className="absolute top-4 left-4 flex gap-2.5 z-50 pointer-events-auto">
            <select
              value={media.provider || window.localStorage.getItem('off_campus_provider') || 'vidsrc_to'}
              onChange={(e) => {
                const provVal = e.target.value;
                window.localStorage.setItem('off_campus_provider', provVal);
                if (onMediaUpdate) {
                  onMediaUpdate({
                    ...media,
                    provider: provVal,
                    url: `${media.url.split('?')[0]}?t=${Date.now()}`
                  });
                }
              }}
              className="bg-[#ff4d85]/90 border border-white/20 text-white rounded px-2.5 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer"
            >
              <option value="vidsrc_to">Mirror 1 (vidsrc.pm)</option>
              <option value="vidsrc_xyz">Mirror 2 (vidsrc.xyz)</option>
              <option value="embed_su">Mirror 3 (embed.su)</option>
              <option value="vidsrc_in">Mirror 4 (vidsrc.in)</option>
              <option value="streamimdb">Mirror 5 (streamimdb.ru)</option>
            </select>

            {isTvSeries && (
              <>
                <select
                  value="1"
                  disabled
                  className="bg-black/80 text-white border border-white/20 rounded px-2 py-1.5 text-xs font-mono tracking-widest uppercase outline-none opacity-50 cursor-not-allowed"
                >
                  <option value="1">Season 1</option>
                </select>

                <select
                  value={currentEpisode}
                  onChange={(e) => handleEpisodeChange(e.target.value)}
                  className="bg-black/80 text-white border border-white/20 rounded px-2 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>Episode {num}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {/* Floating Top-Right Standard Options */}
        <div className="absolute top-4 right-4 flex gap-2.5 z-50 pointer-events-auto">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="text-white/70 hover:text-white transition-colors bg-black/60 p-2 rounded-full cursor-pointer flex items-center justify-center border border-white/10"
            title="Toggle Fullscreen"
          >
            <Maximize size={18} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90, transition: { duration: 0.25, ease: HOVER_EASE } }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white/75 hover:text-white transition-colors bg-red-500/80 hover:bg-red-500 p-2 rounded-full cursor-pointer flex items-center justify-center border border-red-500/20 shadow-lg"
            title="Close"
          >
            <X size={18} />
          </motion.button>
        </div>

        {media.type === 'video' ? (
          (media.url && (media.url.includes('drive.google.com') || media.url.includes('streamimdb.ru') || media.url.includes('vidsrc') || media.url.includes('embed.su') || media.url.includes('watchmode'))) ? (
            <iframe 
              ref={localPlayerRef}
              key={media.url}
              src={(() => {
                if (media.url.includes('drive.google.com')) {
                  return media.url.replace('/view', '/preview');
                }

                const isTv = media.url.includes('/tv/') || media.url.includes('media_type=tv');
                const isOffCampus = media.title === 'Off Campus';
                
                let tmdbIdParam = null;
                try {
                  if (media.url && media.url.includes('?')) {
                    const urlObj = new URL(media.url, window.location.origin);
                    tmdbIdParam = urlObj.searchParams.get('tmdb_id');
                  }
                } catch (e) {
                  console.warn(e);
                }

                const id = isOffCampus ? '273240' : (tmdbIdParam || media.url.split('/embed/')[1]?.split('/')[1]?.split('?')[0] || media.url.split('/tv/')[1] || '10625');
                const provider = window.localStorage.getItem('off_campus_provider') || 'vidsrc_to';
                const startParam = startOffsetTime ? `&start=${Math.floor(startOffsetTime)}` : '';
                
                if (provider === 'vidsrc_to') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.pm/embed/tv/${id}/1/${currentEpisode}?autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.pm/embed/movie/${id}?autoplay=1${startParam}`;
                } else if (provider === 'vidsrc_xyz') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=${currentEpisode}&autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1${startParam}`;
                } else if (provider === 'embed_su') {
                  if (isTv || isOffCampus) {
                    return `https://embed.su/embed/tv/${id}/1/${currentEpisode}?start=${Math.floor(startOffsetTime)}`;
                  }
                  return `https://embed.su/embed/movie/${id}?start=${Math.floor(startOffsetTime)}`;
                } else if (provider === 'vidsrc_in') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.in/embed/tv/${id}/1/${currentEpisode}?autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.in/embed/movie/${id}?autoplay=1${startParam}`;
                }
                
                const base = media.url ? media.url.replace('streamimdb.ru/tv/', 'streamimdb.ru/embed/tv/') : '';
                const separator = base.includes('?') ? '&' : '?';
                return base ? `${base}${separator}start=${Math.floor(startOffsetTime)}` : '';
              })()}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={localPlayerRef}
              src={media.url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          )
        ) : (
          <div className="w-full h-full relative group">
            <img 
              src={media.url}
              alt="Memory"
              className="w-full h-full object-contain bg-black"
            />
          </div>
        )}

        {isTvSeries && currentEpisode < 8 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEpisodeChange((currentEpisode + 1).toString())}
            className="absolute bottom-28 right-8 z-50 bg-black/75 hover:bg-black/90 backdrop-blur-sm text-white border border-white/20 px-6 py-3.5 rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.5)] cursor-pointer flex items-center gap-2 font-mono tracking-widest text-xs uppercase"
          >
            <span>Next Episode {currentEpisode + 1}</span>
            <ChevronRight size={16} className="text-[#ff4d85]" />
          </motion.button>
        )}

        {media.isMainVideo && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute bottom-6 right-6 z-50 bg-[#ff4d85] hover:bg-[#ff4d85]/90 text-white font-semibold font-mono tracking-wider text-xs md:text-sm px-5 py-3 rounded-lg shadow-xl cursor-pointer flex items-center gap-2 border border-white/10"
          >
            Done Watching ➔
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
