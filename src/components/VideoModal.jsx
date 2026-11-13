import { motion } from 'framer-motion';
import { X, Maximize, ChevronRight, Volume2, Play } from 'lucide-react';
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

  // Audio Language / Dubbed states
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(media.dubbedLang || 'default');
  const [showDubbedShowcase, setShowDubbedShowcase] = useState(!!media.dubbedLang);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  const [currentProvider, setCurrentProvider] = useState(() => {
    const saved = window.localStorage.getItem('off_campus_provider');
    if (saved === 'netmirror' || saved === 'artplayer') return saved;
    return 'artplayer';
  });

  useEffect(() => {
    if (media.provider === 'netmirror' || media.provider === 'artplayer') {
      setCurrentProvider(media.provider);
    }
  }, [media.provider]);

  // Background fallback listener: if player emits an error, seamlessly switch in bg
  useEffect(() => {
    const handlePlayerMessage = (e) => {
      if (
        e.data === 'PLAYER_ERROR' ||
        e.data === 'NOT_FOUND' ||
        (typeof e.data === 'object' && (e.data?.type === 'PLAYER_ERROR' || e.data?.status === 'not_found' || e.data?.status === 'error'))
      ) {
        setCurrentProvider(prev => (prev === 'artplayer' ? 'netmirror' : 'artplayer'));
      }
    };
    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, []);

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
      const cleanTitle = (media.title || media.name || '')
        .replace(/\[.*?\]|\(.*?\)/g, '')
        .replace(/\bS\d+(-S\d+)?\b/gi, '')
        .trim();
      let rawId = String(mediaId || '');
      let targetId = rawId.replace(/^dub_/, '');

      try {
        if (!targetId || targetId === '99999' || isNaN(Number(targetId)) || rawId.startsWith('dub_')) {
          const searchRes = await fetch(`/api/tmdb/search/tv?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=en-US`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.results && searchData.results.length > 0) {
              targetId = searchData.results[0].id.toString();
              if (!isCancelled) setResolvedTmdbId(targetId);
            }
          }
        }

        if (targetId && targetId !== '99999' && !isNaN(Number(targetId))) {
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
      const rawTarget = resolvedTmdbId || mediaId;
      const targetId = String(rawTarget || '').replace(/^dub_/, '');
      if (!targetId || targetId === '99999' || isNaN(Number(targetId))) return;
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

  // Validate and set sensible default provider
  useEffect(() => {
    const saved = localStorage.getItem('off_campus_provider');
    const validProviders = ['artplayer', 'netmirror'];
    if (!saved || !validProviders.includes(saved)) {
      localStorage.setItem('off_campus_provider', 'artplayer');
    }
  }, []);

  // Fetch available audio languages / dubbed releases (e.g. Hindi, Tamil, Telugu, English)
  useEffect(() => {
    let isCancelled = false;
    const fetchLanguages = async () => {
      const rawTitle = media.title || media.name;
      if (!rawTitle) return;
      setIsLoadingLanguages(true);

      const cleanTitle = rawTitle
        .replace(/\[.*?\]|\(.*?\)/g, '')
        .replace(/\bS\d+(-S\d+)?\b/gi, '')
        .trim();

      try {
        const res = await fetch(`/api/dubbed-variants?title=${encodeURIComponent(cleanTitle)}`);
        if (!res.ok) throw new Error('Failed to fetch audio variants');
        const data = await res.json();
        if (isCancelled) return;

        if (data && data.results && data.results.length > 0) {
          const variants = [];
          data.results.forEach((item) => {
            const langMatch = item.title.match(/\[(.*?)\]/);
            const lang = langMatch ? langMatch[1].trim() : 'Original';
            if (!variants.some(v => v.lang.toLowerCase() === lang.toLowerCase())) {
              variants.push({
                lang,
                title: item.title,
                netmirrorId: item.id,
                poster: item.backdrop_path,
                year: item.release_date,
                rating: item.vote_average,
                mediaType: item.media_type || (isTvSeries ? 'tv' : 'movie')
              });
            }
          });
          setAvailableLanguages(variants);
        } else {
          setAvailableLanguages([]);
        }
      } catch (err) {
        console.warn('Could not fetch language variants:', err);
        setAvailableLanguages([]);
      } finally {
        if (!isCancelled) setIsLoadingLanguages(false);
      }
    };

    fetchLanguages();
    return () => { isCancelled = true; };
  }, [media.title, media.name, isTvSeries]);

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
        {/* Episode/Season, Mirror & Audio Language Selector Dropdowns (Top-Left) */}
        {(isTvSeries || !!(media.tmdbId || media.id || media.url)) && (
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-50 pointer-events-auto">
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
              className="bg-[#e50914] hover:bg-[#b20710] border border-white/20 text-white rounded px-3 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer shadow-lg transition-colors font-bold"
            >
              <option value="artplayer">Server 1 (Primary High Speed)</option>
              <option value="netmirror">Server 2 (Backup Cluster)</option>
            </select>

            {/* Audio Language / Dubbing Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLanguage(val);
              }}
              className="bg-amber-600/90 hover:bg-amber-600 border border-white/20 text-white rounded px-2.5 py-1.5 text-xs font-mono tracking-widest uppercase outline-none cursor-pointer shadow-lg transition-colors max-w-[190px] truncate"
              title="Select Audio Language / Dubbed Variant"
            >
              <option value="default">Audio: Original / Subs</option>
              {availableLanguages.map((variant) => (
                <option key={variant.netmirrorId} value={variant.lang}>
                  Audio: {variant.lang} Dub
                </option>
              ))}
            </select>

            {availableLanguages.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDubbedShowcase(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono tracking-wider uppercase border transition-all shadow-lg cursor-pointer ${
                  showDubbedShowcase
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-400/50'
                    : 'bg-black/80 hover:bg-black/95 text-amber-300 border-amber-500/30'
                }`}
                title="View All Dubbed Posters (Hindi, etc.)"
              >
                <span>🎙️</span>
                <span>Dubbed Posters ({availableLanguages.length})</span>
              </button>
            )}

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

        {/* Full Dubbed Poster Showcase (NetMirror Style) */}
        {showDubbedShowcase && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col p-5 md:p-7 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2">
                    Dubbed Audio Posters & Releases
                    <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 font-mono">
                      Multi-Audio Feeds
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Full dubbed poster releases with Hindi and regional audio tracks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDubbedShowcase(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                ✕ Close Posters
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-6">
              {availableLanguages.map((variant) => {
                const isSelected = selectedLanguage === variant.lang;
                return (
                  <div
                    key={variant.netmirrorId}
                    className={`group relative bg-neutral-900/90 border rounded-xl overflow-hidden shadow-xl transition-all hover:scale-[1.02] flex flex-col ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-amber-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="aspect-[16/10] relative overflow-hidden bg-zinc-950">
                      <img
                        src={variant.poster || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500'}
                        alt={variant.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-red-600 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                        {variant.lang} Dub
                      </div>
                      {variant.rating && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded border border-white/10">
                          ⭐ {variant.rating}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h4 className="text-white text-xs md:text-sm font-semibold line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {variant.title}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {variant.year || '2023'} · {isTvSeries ? `S${currentSeason} E${currentEpisode}` : 'Full Movie'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(variant.lang);
                          setShowDubbedShowcase(false);
                        }}
                        className="w-full py-2 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                      >
                        <Play size={14} fill="white" />
                        Play {variant.lang} Here
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                key={`lang_${selectedLanguage}_${media.url}_s${currentSeason}_e${currentEpisode}_prov_${currentProvider}`}
                src={(() => {
                  if (media.url && media.url.includes('drive.google.com')) {
                    return media.url.replace('/view', '/preview');
                  }

                  const isTv = isTvSeries || (media.url && (media.url.includes('/tv/') || media.url.includes('media_type=tv')));
                  const isOffCampus = media.title === 'Off Campus';

                  if (media.url && media.url.includes('/api/dubbed-player')) {
                    try {
                      const urlObj = new URL(media.url, window.location.origin);
                      urlObj.searchParams.set('se', currentSeason.toString());
                      urlObj.searchParams.set('ep', currentEpisode.toString());
                      return urlObj.pathname + urlObj.search;
                    } catch (e) {
                      return media.url;
                    }
                  }

                  // Helper to resolve active NetMirror ID across all languages (Hindi, English, Original, etc.)
                  const resolveNetmirrorId = () => {
                    if (selectedLanguage && selectedLanguage !== 'default') {
                      const match = availableLanguages.find(v => v.lang.toLowerCase() === selectedLanguage.toLowerCase());
                      if (match && match.netmirrorId) return match.netmirrorId;
                    }
                    const orig = availableLanguages.find(v => v.lang.toLowerCase() === 'original' || v.lang.toLowerCase() === 'default');
                    if (orig && orig.netmirrorId) return orig.netmirrorId;
                    if (availableLanguages.length > 0 && availableLanguages[0].netmirrorId) return availableLanguages[0].netmirrorId;
                    return media.netmirrorId || (media.url && (media.url.match(/[?&]id=([^&]+)/) || [])[1]) || '';
                  };

                  // If a dubbed language (e.g. Hindi) is selected or item is a dubbed release, play direct stream via /api/dubbed-player
                  const isDubbedActive = selectedLanguage !== 'default' || media.isDubbed;
                  if (isDubbedActive) {
                    const activeVariant = availableLanguages.find(v => v.lang.toLowerCase() === selectedLanguage.toLowerCase());
                    const netId = resolveNetmirrorId();
                    const mType = (activeVariant && activeVariant.mediaType) || media.mediaType || (isTv ? 'tv' : 'movie');
                    const tmdbIdVal = resolvedTmdbId || media.tmdbId || media.id || '';
                    const serverNum = currentProvider === 'netmirror_backup' ? '2' : '1';
                    const rawTitleVal = encodeURIComponent(media.title || media.name || '');
                    const rawLangVal = encodeURIComponent(selectedLanguage || 'default');
                    return `/api/dubbed-player?id=${netId}&se=${currentSeason}&ep=${currentEpisode}&type=${mType}&tmdb_id=${tmdbIdVal}&server=${serverNum}&title=${rawTitleVal}&lang=${rawLangVal}`;
                  }

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
                  const provider = currentProvider === 'netmirror' ? 'netmirror' : 'artplayer';
                  const netId = resolveNetmirrorId();
                  const mType = isTv || isOffCampus ? 'tv' : 'movie';
                  const mediaTitleParam = encodeURIComponent(media.title || media.name || '');
                  const currentLangParam = encodeURIComponent(selectedLanguage || 'default');

                  const serverNum = provider === 'netmirror' ? '2' : '1';
                  // ArtPlayer streaming engine powered by /api/dubbed-player (artplayer.org HTML5 video engine)
                  return `/api/dubbed-player?id=${netId}&tmdb_id=${id}&se=${currentSeason}&ep=${currentEpisode}&type=${mType}&server=${serverNum}&title=${mediaTitleParam}&lang=${currentLangParam}`;
                })()}
                onError={() => {
                  // Automatic background fallback switch
                  setCurrentProvider(prev => (prev === 'artplayer' ? 'netmirror' : 'artplayer'));
                }}
                className="w-full h-full border-0 bg-black cursor-default"
                allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *; clipboard-write *"
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
