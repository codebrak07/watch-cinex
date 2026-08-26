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
  const isTvSeries = media.title === 'Off Campus' || 
                     media.mediaType === 'tv' || 
                     media.media_type === 'tv' || 
                     (media.url && (media.url.includes('/tv/') || media.url.includes('media_type=tv') || media.url.includes('/embed/tv/')));

  const currentSeason = parseInt(media.season || (() => {
    if (!media.url) return '1';
    const match = media.url.match(/\/season\/(\d+)/) || 
                  media.url.match(/season=(\d+)/) || 
                  media.url.match(/\/embed\/tv\/[^/]+\/(\d+)\//) || 
                  media.url.match(/\/tv\/[^/]+\/(\d+)\//);
    return match ? match[1] : '1';
  })(), 10) || 1;

  const currentEpisode = parseInt(media.episode || (() => {
    if (!media.url) return '1';
    const match = media.url.match(/\/episode\/(\d+)/) || 
                  media.url.match(/episode=(\d+)/) || 
                  media.url.match(/\/embed\/tv\/[^/]+\/\d+\/(\d+)/) || 
                  media.url.match(/\/tv\/[^/]+\/\d+\/(\d+)/) ||
                  media.url.match(/\/1\/(\d+)/) ||
                  media.url.match(/\/273240\/\d+\/(\d+)/);
    return match ? match[1] : '1';
  })(), 10) || 1;

  const totalSeasons = Math.max(1, media.numberOfSeasons || media.totalSeasons || 10);

  // Force default provider to vidsrc_pm on mount
  useEffect(() => {
    const saved = localStorage.getItem('off_campus_provider');
    if (saved !== 'vidsrc_pm') {
      localStorage.setItem('off_campus_provider', 'vidsrc_pm');
    }
  }, []);

  // Retrieve initial saved timestamp from browser cache
  const getInitialTime = () => {
    const key = isTvSeries ? `pos_${mediaId}_s_${currentSeason}_ep_${currentEpisode}` : `pos_${mediaId}`;
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
        const key = isTvSeries ? `pos_${mediaId}_s_${currentSeason}_ep_${currentEpisode}` : `pos_${mediaId}`;
        try {
          localStorage.setItem(key, JSON.stringify({ time: next, duration: 3600, ts: Date.now() }));
        } catch (e) {
          console.warn(e);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mediaId, isTvSeries, currentSeason, currentEpisode]);

  const handleSeasonChange = (seasonVal) => {
    const sVal = parseInt(seasonVal, 10);
    const epVal = 1;
    let newUrl = media.url || '';
    
    if (newUrl.includes('off-campus') || newUrl.includes('273240')) {
      newUrl = `https://vidsrc.sbs/embed/tv/273240/${sVal}/${epVal}`;
    } else if (newUrl.includes('/season/')) {
      newUrl = newUrl.replace(/\/season\/\d+/, `/season/${sVal}`).replace(/\/episode\/\d+/, `/episode/${epVal}`);
    } else if (newUrl.includes('season=')) {
      newUrl = newUrl.replace(/season=\d+/, `season=${sVal}`).replace(/episode=\d+/, `episode=${epVal}`);
    } else if (newUrl.match(/\/tv\/([^/]+)\/\d+\/\d+/)) {
      newUrl = newUrl.replace(/\/tv\/([^/]+)\/\d+\/\d+/, `/tv/$1/${sVal}/${epVal}`);
    } else if (newUrl.includes('/embed/')) {
      if (newUrl.includes('?')) {
        const [base, query] = newUrl.split('?');
        const cleanQuery = query.split('&').filter(p => !p.startsWith('season=') && !p.startsWith('episode=')).join('&');
        newUrl = `${base}?season=${sVal}&episode=${epVal}${cleanQuery ? '&' + cleanQuery : ''}`;
      } else {
        newUrl = `${newUrl}?season=${sVal}&episode=${epVal}`;
      }
    }

    setCurrentTime(0);
    if (onMediaUpdate) {
      onMediaUpdate({
        ...media,
        season: sVal.toString(),
        episode: epVal.toString(),
        url: newUrl
      });
    }
  };

  const handleEpisodeChange = (epVal) => {
    const sVal = currentSeason;
    let newUrl = media.url || '';
    if (newUrl.includes('off-campus') || newUrl.includes('273240')) {
      newUrl = `https://vidsrc.sbs/embed/tv/273240/${sVal}/${epVal}`;
    } else if (newUrl.includes('/episode/')) {
      newUrl = newUrl.replace(/\/episode\/\d+/, `/episode/${epVal}`);
    } else if (newUrl.includes('episode=')) {
      newUrl = newUrl.replace(/episode=\d+/, `episode=${epVal}`);
    } else if (newUrl.match(/\/tv\/([^/]+)\/\d+\/\d+/)) {
      newUrl = newUrl.replace(/\/tv\/([^/]+)\/\d+\/\d+/, `/tv/$1/${sVal}/${epVal}`);
    } else {
      if (newUrl.includes('?')) {
        const [base, query] = newUrl.split('?');
        const cleanQuery = query.split('&').filter(p => !p.startsWith('episode=')).join('&');
        newUrl = `${base}?episode=${epVal}${cleanQuery ? '&' + cleanQuery : ''}`;
      } else {
        newUrl = `${newUrl}/episode/${epVal}`;
      }
    }

    setCurrentTime(0);
    if (onMediaUpdate) {
      onMediaUpdate({
        ...media,
        season: sVal.toString(),
        episode: epVal.toString(),
        url: newUrl
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
        {(isTvSeries || (media.url && (media.url.includes('streamimdb.ru') || media.url.includes('tmdb_id') || media.url.includes('vidsrc')))) && (
          <div className="absolute top-4 left-4 flex gap-2.5 z-50 pointer-events-auto">
            <select
              value={media.provider || window.localStorage.getItem('off_campus_provider') || 'vidsrc_pm'}
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
              className="bg-[#ff4d85]/90 hover:bg-[#ff4d85] border border-white/20 text-white rounded px-2.5 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer shadow-lg transition-colors"
            >
              <option value="vidsrc_pm">Mirror 1 (vidsrc.pm - Fast HD)</option>
              <option value="vidsrc_xyz">Mirror 2 (vidsrc.xyz)</option>
              <option value="smashystream">Mirror 3 (smashystream.xyz)</option>
              <option value="multiembed">Mirror 4 (multiembed.mov)</option>
              <option value="autoembed">Mirror 5 (autoembed.cc)</option>
              <option value="embed_su">Mirror 6 (embed.su)</option>
              <option value="vidsrc_in">Mirror 7 (vidsrc.in)</option>
              <option value="streamimdb">Mirror 8 (streamimdb.ru)</option>
            </select>

            {isTvSeries && (
              <>
                <select
                  value={currentSeason}
                  onChange={(e) => handleSeasonChange(e.target.value)}
                  className="bg-black/80 hover:bg-black/95 text-white border border-white/20 rounded px-2 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer transition-colors shadow-lg"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => (
                    <option key={sNum} value={sNum}>Season {sNum}</option>
                  ))}
                </select>

                <select
                  value={currentEpisode}
                  onChange={(e) => handleEpisodeChange(e.target.value)}
                  className="bg-black/80 hover:bg-black/95 text-white border border-white/20 rounded px-2 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer transition-colors shadow-lg"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map((num) => (
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
          (media.url && (media.url.includes('drive.google.com') || media.url.includes('streamimdb.ru') || media.url.includes('vidsrc') || media.url.includes('embed.su') || media.url.includes('watchmode') || media.url.includes('autoembed') || media.url.includes('multiembed') || media.url.includes('smashystream'))) ? (
            <iframe 
              ref={localPlayerRef}
              key={`${media.url}_s${currentSeason}_e${currentEpisode}_prov_${media.provider || window.localStorage.getItem('off_campus_provider') || 'vidsrc_pm'}`}
              src={(() => {
                if (media.url.includes('drive.google.com')) {
                  return media.url.replace('/view', '/preview');
                }

                const isTv = isTvSeries || media.url.includes('/tv/') || media.url.includes('media_type=tv');
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

                const id = isOffCampus ? '273240' : (tmdbIdParam || media.tmdbId || media.id || (media.url.match(/\/embed\/(?:tv|movie)\/([^/?]+)/) || [])[1] || (media.url.match(/\/tv\/([^/?]+)/) || [])[1] || '10625');
                const provider = window.localStorage.getItem('off_campus_provider') || 'vidsrc_pm';
                const startParam = startOffsetTime ? `&start=${Math.floor(startOffsetTime)}` : '';
                
                if (provider === 'vidsrc_pm') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.pm/embed/tv/${id}/${currentSeason}/${currentEpisode}?autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.pm/embed/movie/${id}?autoplay=1${startParam}`;
                } else if (provider === 'vidsrc_xyz') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}&autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1${startParam}`;
                } else if (provider === 'smashystream') {
                  if (isTv || isOffCampus) {
                    return `https://player.smashy.stream/tv/${id}?s=${currentSeason}&e=${currentEpisode}`;
                  }
                  return `https://player.smashy.stream/movie/${id}`;
                } else if (provider === 'multiembed') {
                  if (isTv) {
                    return `https://www.2embed.cc/embedtv/${id}&s=${currentSeason}&e=${currentEpisode}`;
                  }
                  return `https://www.2embed.cc/embed/${id}`;
                } else if (provider === 'autoembed') {
                  if (isTv || isOffCampus) {
                    return `https://player.autoembed.cc/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
                  }
                  return `https://player.autoembed.cc/embed/movie/${id}`;
                } else if (provider === 'embed_su') {
                  if (isTv || isOffCampus) {
                    return `https://embed.su/embed/tv/${id}/${currentSeason}/${currentEpisode}?start=${Math.floor(startOffsetTime)}`;
                  }
                  return `https://embed.su/embed/movie/${id}?start=${Math.floor(startOffsetTime)}`;
                } else if (provider === 'vidsrc_in') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.in/embed/tv/${id}/${currentSeason}/${currentEpisode}?autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.in/embed/movie/${id}?autoplay=1${startParam}`;
                }
                
                let base = media.url ? media.url.replace('streamimdb.ru/tv/', 'streamimdb.ru/embed/tv/') : '';
                if (isTv && base.includes('/embed/tv/')) {
                  const idPart = media.imdbId || id;
                  base = `https://streamimdb.ru/embed/tv/${idPart}/${currentSeason}/${currentEpisode}`;
                }
                const separator = base.includes('?') ? '&' : '?';
                return base ? `${base}${separator}start=${Math.floor(startOffsetTime)}` : '';
              })()}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
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

        {isTvSeries && (
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
