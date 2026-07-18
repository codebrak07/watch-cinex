import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];

export default function VideoModal({ media, onClose, onMediaUpdate }) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const localPlayerRef = useRef(null);

  const mediaId = media.tmdbId || media.id || '99999';
  const isTvSeries = media.title === 'Off Campus' || (media.url && (media.url.includes('/tv/') || media.url.includes('media_type=tv')));
  const currentEpisode = parseInt(media.episode || (() => {
    const match = media.url ? (media.url.match(/\/episode\/(\d+)/) || media.url.match(/\/1\/(\d+)/) || media.url.match(/episode=(\d+)/) || media.url.match(/\/273240\/1\/(\d+)/)) : null;
    return match ? match[1] : '1';
  })(), 10);

  // Initialize currentTime from the localStorage cache
  const [currentTime, setCurrentTime] = useState(() => {
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
  });

  // Keep simulated clock tick to allow skip calculations on iframes and save progress
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
  }, [media.url, mediaId, isTvSeries, currentEpisode]);

  const handleSkip = (sec) => {
    const video = localPlayerRef.current;
    if (!video) return;

    // Calculate time based on previous state to avoid enclosure scope issues
    setCurrentTime(prev => {
      const nextTime = Math.max(0, prev + sec);
      
      const key = isTvSeries ? `pos_${mediaId}_ep_${currentEpisode}` : `pos_${mediaId}`;
      try {
        localStorage.setItem(key, JSON.stringify({ time: nextTime, duration: 3600, ts: Date.now() }));
      } catch (e) {
        console.warn(e);
      }

      if (video instanceof HTMLIFrameElement) {
        const isTv = media.url ? (media.url.includes('/tv/') || media.url.includes('media_type=tv')) : false;
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

        const id = isOffCampus ? '273240' : (tmdbIdParam || (media.url && media.url.split('/embed/')[1]?.split('/')[1]?.split('?')[0]) || (media.url && media.url.split('/tv/')[1]) || '10625');
        const provider = window.localStorage.getItem('off_campus_provider') || 'streamimdb';
        const startParam = nextTime ? `&start=${Math.floor(nextTime)}` : '';

        let targetUrl = '';
        if (provider === 'vidsrc_to') {
          targetUrl = (isTv || isOffCampus)
            ? `https://vidsrc.pm/embed/tv/${id}/1/${currentEpisode}?autoplay=1${startParam}`
            : `https://vidsrc.pm/embed/movie/${id}?autoplay=1${startParam}`;
        } else if (provider === 'vidsrc_xyz') {
          targetUrl = (isTv || isOffCampus)
            ? `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=${currentEpisode}&autoplay=1${startParam}`
            : `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1${startParam}`;
        } else if (provider === 'embed_su') {
          const base = (isTv || isOffCampus)
            ? `https://embed.su/embed/tv/${id}/1/${currentEpisode}`
            : `https://embed.su/embed/movie/${id}`;
          targetUrl = `${base}?start=${Math.floor(nextTime)}`;
        } else if (provider === 'vidsrc_in') {
          targetUrl = (isTv || isOffCampus)
            ? `https://vidsrc.in/embed/tv/${id}/1/${currentEpisode}?autoplay=1${startParam}`
            : `https://vidsrc.in/embed/movie/${id}?autoplay=1${startParam}`;
        } else if (provider === 'streamimdb') {
          const base = media.url ? media.url.replace('streamimdb.ru/tv/', 'streamimdb.ru/embed/tv/') : '';
          const separator = base.includes('?') ? '&' : '?';
          targetUrl = base ? `${base}${separator}start=${Math.floor(nextTime)}` : '';
        } else {
          const separator = media.url?.includes('?') ? '&' : '?';
          targetUrl = media.url ? `${media.url}${separator}start=${Math.floor(nextTime)}` : '';
        }
        video.src = targetUrl;
      } else {
        video.currentTime = nextTime;
      }
      
      return nextTime;
    });
  };

  // Keyboard shortcut listeners (Arrow Keys, Escape, Backspace)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handleSkip(-10);
      } else if (e.key === 'ArrowRight') {
        handleSkip(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media.url]);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
      className="fixed inset-0 z-[9995] flex items-center justify-center bg-black p-0"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full bg-black overflow-hidden"
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 pointer-events-none">
            <Loader2 className="w-12 h-12 text-[#ff4d85] animate-spin mb-3" />
            <span className="text-sm font-mono tracking-widest text-neutral-400 uppercase">Loading video...</span>
          </div>
        )}

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
                const provider = window.localStorage.getItem('off_campus_provider') || 'streamimdb';
                const startParam = currentTime ? `&start=${Math.floor(currentTime)}` : '';
                
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
                    return `https://embed.su/embed/tv/${id}/1/${currentEpisode}?start=${Math.floor(currentTime)}`;
                  }
                  return `https://embed.su/embed/movie/${id}?start=${Math.floor(currentTime)}`;
                } else if (provider === 'vidsrc_in') {
                  if (isTv || isOffCampus) {
                    return `https://vidsrc.in/embed/tv/${id}/1/${currentEpisode}?autoplay=1${startParam}`;
                  }
                  return `https://vidsrc.in/embed/movie/${id}?autoplay=1${startParam}`;
                }
                
                const base = media.url ? media.url.replace('streamimdb.ru/tv/', 'streamimdb.ru/embed/tv/') : '';
                const separator = base.includes('?') ? '&' : '?';
                return base ? `${base}${separator}start=${Math.floor(currentTime)}` : '';
              })()}
              onLoad={() => setIsLoading(false)}
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
              onCanPlay={() => setIsLoading(false)}
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
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
