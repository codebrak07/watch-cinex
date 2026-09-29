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

  const [resolvedTmdbId, setResolvedTmdbId] = useState(mediaId);
  const [seasonsList, setSeasonsList] = useState([]);
  const [episodesList, setEpisodesList] = useState([]);
  const [firstClickShieldActive, setFirstClickShieldActive] = useState(false);

  const [currentProvider, setCurrentProvider] = useState(() => {
    return media.provider || window.localStorage.getItem('off_campus_provider') || 'videasy';
  });

  useEffect(() => {
    if (media.provider && media.provider !== currentProvider) {
      setCurrentProvider(media.provider);
    }
  }, [media.provider]);

  // Notify parent window that a player modal is active to block popups & navigation hijacks
  useEffect(() => {
    window.__isPlayerModalOpen = true;
    return () => {
      window.__isPlayerModalOpen = false;
    };
  }, []);

  // Fetch TMDB TV show details for all seasons
  useEffect(() => {
    if (!isTvSeries) return;
    let isCancelled = false;

    const fetchTvShow = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let targetId = mediaId;

      try {
        if (!targetId || targetId === '99999' || isNaN(Number(targetId))) {
          const searchRes = await fetch(`/api/tmdb/search/tv?api_key=${apiKey}&query=${encodeURIComponent(media.title || '')}&language=en-US`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.results && searchData.results.length > 0) {
              targetId = searchData.results[0].id.toString();
              if (!isCancelled) setResolvedTmdbId(targetId);
            }
          }
        }

        if (targetId && targetId !== '99999') {
          const res = await fetch(`/api/tmdb/tv/${targetId}?api_key=${apiKey}&language=en-US`);
          if (res.ok) {
            const data = await res.json();
            if (!isCancelled) {
              setResolvedTmdbId(targetId);
              if (data.seasons && data.seasons.length > 0) {
                const validSeasons = data.seasons.filter(s => s.season_number > 0);
                setSeasonsList(validSeasons.length > 0 ? validSeasons : data.seasons);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch TV details in VideoModal:', err);
      }
    };

    fetchTvShow();
    return () => { isCancelled = true; };
  }, [mediaId, media.title, isTvSeries]);

  // Fetch TMDB TV episodes for current season
  useEffect(() => {
    if (!isTvSeries) return;
    let isCancelled = false;

    const fetchEpisodes = async () => {
      const targetId = resolvedTmdbId || mediaId;
      if (!targetId || targetId === '99999') return;
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;

      try {
        const res = await fetch(`/api/tmdb/tv/${targetId}/season/${currentSeason}?api_key=${apiKey}&language=en-US`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.episodes && data.episodes.length > 0) {
            setEpisodesList(data.episodes);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch season episodes in VideoModal:', err);
      }
    };

    fetchEpisodes();
    return () => { isCancelled = true; };
  }, [resolvedTmdbId, mediaId, currentSeason, isTvSeries]);

  // Validate and set sensible default provider (Videasy clean HD, or VidLink Pro / VidSrc PM)
  useEffect(() => {
    const saved = localStorage.getItem('off_campus_provider');
    const validProviders = [
      'videasy',
      'vidlink',
      'vidsrc_in',
      'vidsrc_sh',
      'autoembed',
      'vidsrc_pm',
      'vidplay',
      'vidsrc_xyz',
      'vidsrc_cc',
      'embed_su',
      'multiembed',
      'smashystream'
    ];
    if (!saved || !validProviders.includes(saved)) {
      localStorage.setItem('off_campus_provider', 'videasy');
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
              value={currentProvider}
              onChange={(e) => {
                const provVal = e.target.value;
                setCurrentProvider(provVal);
                window.localStorage.setItem('off_campus_provider', provVal);
                if (onMediaUpdate) {
                  onMediaUpdate({
                    ...media,
                    provider: provVal,
                    url: `${(media.url || '').split('?')[0]}?t=${Date.now()}`
                  });
                }
              }}
              className="bg-[#ff4d85]/90 hover:bg-[#ff4d85] border border-white/20 text-white rounded px-2.5 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer shadow-lg transition-colors"
            >
              <option value="videasy">Mirror 1 (Videasy - Clean HD / Multi-Lang & Subs)</option>
              <option value="vidlink">Mirror 2 (VidLink Pro - Clean 1080p / No Ads)</option>
              <option value="vidsrc_in">Mirror 3 (DGHG / vidsrc.in)</option>
              <option value="vidsrc_sh">Mirror 4 (VidSrc SH - Universal Fast)</option>
              <option value="autoembed">Mirror 5 (AutoEmbed - Clean HD)</option>
              <option value="vidsrc_pm">Mirror 6 (VidSrc PM - Fast HD)</option>
              <option value="vidplay">Mirror 7 (Vidplay - Anime & Fast HD)</option>
              <option value="vidsrc_xyz">Mirror 8 (BYFMS / vidsrc.xyz)</option>
              <option value="vidsrc_cc">Mirror 9 (VidSrc CC)</option>
              <option value="embed_su">Mirror 10 (embed.su)</option>
              <option value="multiembed">Mirror 11 (2Embed - Global Mirrors)</option>
              <option value="smashystream">Mirror 12 (SmashyStream)</option>
            </select>

            {isTvSeries && (
              <>
                <select
                  value={currentSeason}
                  onChange={(e) => handleSeasonChange(e.target.value)}
                  className="bg-black/80 hover:bg-black/95 text-white border border-white/20 rounded px-2 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer transition-colors shadow-lg max-w-[130px] truncate"
                >
                  {seasonsList.length > 0 ? (
                    seasonsList.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`}
                      </option>
                    ))
                  ) : (
                    Array.from({ length: 10 }, (_, i) => i + 1).map((sNum) => (
                      <option key={sNum} value={sNum}>Season {sNum}</option>
                    ))
                  )}
                </select>

                <select
                  value={currentEpisode}
                  onChange={(e) => handleEpisodeChange(e.target.value)}
                  className="bg-black/80 hover:bg-black/95 text-white border border-white/20 rounded px-2 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer transition-colors shadow-lg max-w-[140px] truncate"
                >
                  {episodesList.length > 0 ? (
                    episodesList.map((ep) => (
                      <option key={ep.episode_number} value={ep.episode_number}>
                        EP {ep.episode_number}{ep.name ? `: ${ep.name.slice(0, 16)}` : ''}
                      </option>
                    ))
                  ) : (
                    Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>Episode {num}</option>
                    ))
                  )}
                </select>
              </>
            )}
          </div>
        )}

        {/* Floating Top-Right Standard Options */}
        <div className="absolute top-4 right-4 flex items-center gap-2.5 z-50 pointer-events-auto">

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
          ((media.url && (media.url.includes('drive.google.com') || media.url.includes('streamimdb.ru') || media.url.includes('vidsrc') || media.url.includes('embed.su') || media.url.includes('watchmode') || media.url.includes('autoembed') || media.url.includes('multiembed') || media.url.includes('smashystream') || media.url.includes('videasy') || media.url.includes('vidlink') || media.url.includes('vidplay') || media.url.includes('2embed') || media.url.includes('/embed/'))) || !!(media.tmdbId || media.id || media.imdbId)) ? (
            <>
              {firstClickShieldActive && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setFirstClickShieldActive(false);
                    if (localPlayerRef.current) {
                      try {
                        localPlayerRef.current.focus();
                      } catch (err) { }
                    }
                  }}
                  className="absolute inset-0 z-30 cursor-pointer flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                  title="Click to activate player (Pop-up protected)"
                />
              )}
              <iframe
                ref={localPlayerRef}
                key={`${media.url}_s${currentSeason}_e${currentEpisode}_prov_${currentProvider}`}
                src={(() => {
                  if (media.url && media.url.includes('drive.google.com')) {
                    return media.url.replace('/view', '/preview');
                  }

                  const isTv = isTvSeries || (media.url && (media.url.includes('/tv/') || media.url.includes('media_type=tv')));
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

                  const id = isOffCampus ? '273240' : (resolvedTmdbId || tmdbIdParam || media.tmdbId || media.id || (media.url && (media.url.match(/\/embed\/(?:tv|movie)\/([^/?]+)/) || [])[1]) || (media.url && (media.url.match(/\/tv\/([^/?]+)/) || [])[1]) || '10625');
                  const provider = currentProvider;
                  const startParam = startOffsetTime ? `&start=${Math.floor(startOffsetTime)}` : '';

                  if (provider === 'videasy') {
                    if (isTv || isOffCampus) {
                      return `https://player.videasy.to/tv/${id}/${currentSeason}/${currentEpisode}?color=e50914`;
                    }
                    return `https://player.videasy.to/movie/${id}?color=e50914`;
                  } else if (provider === 'vidlink') {
                    if (isTv || isOffCampus) {
                      return `https://vidlink.pro/tv/${id}/${currentSeason}/${currentEpisode}?primaryColor=e50914&autoplay=false&fallback=true`;
                    }
                    return `https://vidlink.pro/movie/${id}?primaryColor=e50914&autoplay=false&fallback=true`;
                  } else if (provider === 'vidsrc_in') {
                    if (isTv || isOffCampus) {
                      return `https://vidsrc.in/embed/tv/${id}/${currentSeason}/${currentEpisode}?autoplay=1${startParam}`;
                    }
                    return `https://vidsrc.in/embed/movie/${id}?autoplay=1${startParam}`;
                  } else if (provider === 'vidsrc_sh') {
                    if (isTv || isOffCampus) {
                      return `https://vidsrc.sh/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}&autoplay=1${startParam}`;
                    }
                    return `https://vidsrc.sh/embed/movie?tmdb=${id}&autoplay=1${startParam}`;
                  } else if (provider === 'vidsrc_xyz') {
                    if (isTv || isOffCampus) {
                      return `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${currentSeason}&episode=${currentEpisode}&autoplay=1${startParam}`;
                    }
                    return `https://vidsrc.xyz/embed/movie?tmdb=${id}&autoplay=1${startParam}`;
                  } else if (provider === 'vidsrc_cc') {
                    if (isTv || isOffCampus) {
                      return `https://vidsrc.cc/v2/embed/tv/${id}/${currentSeason}/${currentEpisode}`;
                    }
                    return `https://vidsrc.cc/v2/embed/movie/${id}`;
                  } else if (provider === 'autoembed') {
                    if (isTv || isOffCampus) {
                      return `https://autoembed.co/tv/tmdb/${id}-${currentSeason}-${currentEpisode}`;
                    }
                    return `https://autoembed.co/movie/tmdb/${id}`;
                  } else if (provider === 'vidsrc_pm') {
                    if (isTv || isOffCampus) {
                      return `https://vidsrc.pm/embed/tv/${id}/${currentSeason}/${currentEpisode}?autoplay=1${startParam}`;
                    }
                    return `https://vidsrc.pm/embed/movie/${id}?autoplay=1${startParam}`;
                  } else if (provider === 'vidplay') {
                    if (isTv || isOffCampus) {
                      return `https://vidplay.to/stream/embed?imdbid=${media.imdbId || ''}&tmdbid=${id}&type=tv&name=${encodeURIComponent(media.title || '')}&year=2024&season=${currentSeason}&episode=${currentEpisode}`;
                    }
                    return `https://vidplay.to/stream/embed?imdbid=${media.imdbId || ''}&tmdbid=${id}&type=movie&name=${encodeURIComponent(media.title || '')}&year=2024&season=0&episode=0`;
                  } else if (provider === 'embed_su') {
                    if (isTv || isOffCampus) {
                      return `https://embed.su/embed/tv/${id}/${currentSeason}/${currentEpisode}?start=${Math.floor(startOffsetTime)}`;
                    }
                    return `https://embed.su/embed/movie/${id}?start=${Math.floor(startOffsetTime)}`;
                  } else if (provider === 'multiembed') {
                    if (isTv) {
                      return `https://www.2embed.cc/embedtv/${id}&s=${currentSeason}&e=${currentEpisode}`;
                    }
                    return `https://www.2embed.cc/embed/${id}`;
                  } else if (provider === 'smashystream') {
                    if (isTv || isOffCampus) {
                      return `https://player.smashy.stream/tv/${id}?s=${currentSeason}&e=${currentEpisode}`;
                    }
                    return `https://player.smashy.stream/movie/${id}`;
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
                sandbox={currentProvider === 'vidsrc_pm' ? "allow-scripts allow-same-origin allow-forms allow-presentation" : undefined}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </>
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
