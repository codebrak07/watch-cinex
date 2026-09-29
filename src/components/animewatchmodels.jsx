import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize, ChevronLeft, ChevronRight, Play, Volume2, Globe, Radio, Server, Search, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function AnimeWatchModal({ media, onClose, onMediaUpdate }) {
  const containerRef = useRef(null);
  const localPlayerRef = useRef(null);

  // Extract initial TMDB / Anime details
  const initialRawId = media?.tmdbId || media?.id || (media?.url?.match(/\/embed\/(?:tv|movie)\/([^/?]+)/) || [])[1] || (media?.url?.match(/\/tv\/([^/?]+)/) || [])[1] || '';
  const animeTitle = media?.title || media?.name || 'Anime Stream';
  const isTv = media?.isTvSeries !== false && (media?.mediaType !== 'movie' && media?.media_type !== 'movie');

  // Resolved TMDB ID state
  const [resolvedTmdbId, setResolvedTmdbId] = useState(initialRawId || '');
  const [resolvedImdbId, setResolvedImdbId] = useState(media?.imdb_id || media?.imdbId || '');
  const [resolvedYear, setResolvedYear] = useState((media?.first_air_date || media?.release_date || '').substring(0, 4) || '');
  const [currentSeason, setCurrentSeason] = useState(parseInt(media?.season || '1', 10) || 1);
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(media?.episode || '1', 10) || 1);
  const [audioType, setAudioType] = useState('sub'); // 'sub' or 'dub'
  const [selectedServer, setSelectedServer] = useState(() => {
    return localStorage.getItem('netflix_anime_server') || 'dghg';
  });

  // Dynamic TMDB Seasons and Episodes list
  const [seasonsList, setSeasonsList] = useState([]);
  const [episodesList, setEpisodesList] = useState([]);
  const [totalEpisodes, setTotalEpisodes] = useState(media?.number_of_episodes || 24);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [firstClickShieldActive, setFirstClickShieldActive] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Notify parent window that a player modal is active to block popups & navigation hijacks
  useEffect(() => {
    window.__isPlayerModalOpen = true;
    return () => {
      window.__isPlayerModalOpen = false;
    };
  }, []);

  // Fetch show details (seasons, imdb_id, release year) for TV Series or Movies
  useEffect(() => {
    let isCancelled = false;

    const fetchDetails = async () => {
      setIsLoadingSeasons(true);
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let targetId = initialRawId;

      try {
        // Search TMDB by name if targetId is missing or non-numeric
        if (!targetId || isNaN(Number(targetId))) {
          const endpoint = isTv ? '/api/tmdb/search/tv' : '/api/tmdb/search/movie';
          const searchRes = await fetch(`${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(animeTitle)}&language=en-US`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.results && searchData.results.length > 0) {
              targetId = searchData.results[0].id.toString();
              if (!isCancelled) setResolvedTmdbId(targetId);
            }
          }
        }

        if (targetId) {
          if (isTv) {
            const [res, extRes] = await Promise.all([
              fetch(`/api/tmdb/tv/${targetId}?api_key=${apiKey}&language=en-US`),
              fetch(`/api/tmdb/tv/${targetId}/external_ids?api_key=${apiKey}`)
            ]);

            if (res.ok) {
              const data = await res.json();
              if (!isCancelled) {
                setResolvedTmdbId(targetId);
                if (data.first_air_date) {
                  setResolvedYear(data.first_air_date.substring(0, 4));
                }
                if (data.seasons && data.seasons.length > 0) {
                  const validSeasons = data.seasons.filter(s => s.season_number > 0);
                  const finalSeasons = validSeasons.length > 0 ? validSeasons : data.seasons;
                  setSeasonsList(finalSeasons);

                  const currentSeasonObj = finalSeasons.find(s => s.season_number === currentSeason) || finalSeasons[0];
                  if (currentSeasonObj) {
                    setTotalEpisodes(currentSeasonObj.episode_count || 24);
                  }
                }
              }
            }

            if (extRes.ok) {
              const extData = await extRes.json();
              if (!isCancelled && extData.imdb_id) {
                setResolvedImdbId(extData.imdb_id);
              }
            }
          } else {
            // Anime Movie Details
            const [movieRes, movieExtRes] = await Promise.all([
              fetch(`/api/tmdb/movie/${targetId}?api_key=${apiKey}&language=en-US`),
              fetch(`/api/tmdb/movie/${targetId}/external_ids?api_key=${apiKey}`)
            ]);

            if (movieRes.ok) {
              const data = await movieRes.json();
              if (!isCancelled) {
                setResolvedTmdbId(targetId);
                if (data.release_date) {
                  setResolvedYear(data.release_date.substring(0, 4));
                }
              }
            }

            if (movieExtRes.ok) {
              const extData = await movieExtRes.json();
              if (!isCancelled && extData.imdb_id) {
                setResolvedImdbId(extData.imdb_id);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch anime details from TMDB:', err);
      } finally {
        if (!isCancelled) setIsLoadingSeasons(false);
      }
    };

    fetchDetails();
    return () => {
      isCancelled = true;
    };
  }, [initialRawId, animeTitle, isTv]);

  // Fetch all real episodes for the currently selected season
  useEffect(() => {
    if (!isTv) return;
    let isCancelled = false;

    const fetchSeasonEpisodes = async () => {
      const targetId = resolvedTmdbId || initialRawId;
      if (!targetId) return;

      setIsLoadingEpisodes(true);
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;

      try {
        const res = await fetch(`/api/tmdb/tv/${targetId}/season/${currentSeason}?api_key=${apiKey}&language=en-US`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.episodes && data.episodes.length > 0) {
            setEpisodesList(data.episodes);
            setTotalEpisodes(data.episodes.length);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch episodes for season ${currentSeason}:`, err);
      } finally {
        if (!isCancelled) setIsLoadingEpisodes(false);
      }
    };

    fetchSeasonEpisodes();
    return () => {
      isCancelled = true;
    };
  }, [resolvedTmdbId, initialRawId, currentSeason, isTv]);

  // Focus iframe on load
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (localPlayerRef.current) {
        try {
          localPlayerRef.current.focus();
        } catch (e) {
          console.warn(e);
        }
      }
    }, 1000);
    return () => clearTimeout(focusTimer);
  }, [selectedServer, currentEpisode, currentSeason, audioType]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const handleServerSelect = (serverName) => {
    setSelectedServer(serverName);
    try {
      localStorage.setItem('netflix_anime_server', serverName);
    } catch (e) {
      console.warn(e);
    }
  };

  const activeId = resolvedTmdbId || initialRawId || '';

  // Compute authentic streaming URL with original DGHG & BYFMS servers (no vidsrc)
  const getStreamUrl = () => {
    // If direct media url was passed and user selects original
    if (media?.url && selectedServer === 'original_url') {
      return media.url;
    }

    switch (selectedServer) {
      case 'dghg':
      case 'vidsrc_in':
        // DGHG (vidsrc.in - working stream mirror)
        if (isTv) {
          return `https://vidsrc.in/embed/tv/${activeId}/${currentSeason}/${currentEpisode}`;
        }
        return `https://vidsrc.in/embed/movie/${activeId}`;

      case 'vidsrc_sh':
        // Fast Universal HD (vidsrc.sh)
        if (isTv) {
          return `https://vidsrc.sh/embed/tv?tmdb=${activeId}&season=${currentSeason}&episode=${currentEpisode}`;
        }
        return `https://vidsrc.sh/embed/movie?tmdb=${activeId}`;

      case 'byfms':
      case 'videasy':
      case 'vidsrc_xyz':
        // Videasy HD Player with Subs/Audio
        if (isTv) {
          return `https://player.videasy.to/tv/${activeId}/${currentSeason}/${currentEpisode}?color=ff4d85`;
        }
        return `https://player.videasy.to/movie/${activeId}?color=ff4d85`;

      case 'vidlink':
        // VidLink Clean 1080p Player with fallback
        if (isTv) {
          return `https://vidlink.pro/tv/${activeId}/${currentSeason}/${currentEpisode}?primaryColor=ff4d85&autoplay=false&fallback=true`;
        }
        return `https://vidlink.pro/movie/${activeId}?primaryColor=ff4d85&autoplay=false&fallback=true`;

      case 'vidsrc_pm':
        if (isTv) {
          return `https://vidsrc.pm/embed/tv/${activeId}/${currentSeason}/${currentEpisode}?autoplay=1`;
        }
        return `https://vidsrc.pm/embed/movie/${activeId}?autoplay=1`;

      case 'autoembed':
        // AutoEmbed Player
        if (isTv) {
          return `https://autoembed.co/tv/tmdb/${activeId}-${currentSeason}-${currentEpisode}`;
        }
        return `https://autoembed.co/movie/tmdb/${activeId}`;

      case 'smashystream':
      case 'gogoanime':
        // SmashyStream Anime Player
        if (isTv) {
          return `https://player.smashy.stream/tv/${activeId}?s=${currentSeason}&e=${currentEpisode}`;
        }
        return `https://player.smashy.stream/movie/${activeId}`;

      case 'multiembed':
        if (isTv) {
          return `https://www.2embed.cc/embedtv/${activeId}&s=${currentSeason}&e=${currentEpisode}`;
        }
        return `https://www.2embed.cc/embed/${activeId}`;

      default:
        if (isTv) {
          return `https://player.videasy.to/tv/${activeId}/${currentSeason}/${currentEpisode}?color=ff4d85`;
        }
        return `https://player.videasy.to/movie/${activeId}?color=ff4d85`;
    }
  };

  const handleEpisodeSelect = (ep) => {
    setCurrentEpisode(ep);
    if (onMediaUpdate) {
      onMediaUpdate({
        ...media,
        episode: ep.toString(),
        season: currentSeason.toString()
      });
    }
  };

  // Find active episode object for display title
  const activeEpisodeObj = episodesList.find(e => e.episode_number === currentEpisode);

  // Filter episodes based on search query if applicable
  const displayedEpisodes = episodesList.length > 0
    ? episodesList.filter(ep => {
        if (!searchFilter) return true;
        const q = searchFilter.toLowerCase();
        return ep.episode_number.toString().includes(q) || (ep.name && ep.name.toLowerCase().includes(q));
      })
    : Array.from({ length: totalEpisodes }, (_, i) => ({
        episode_number: i + 1,
        name: `Episode ${i + 1}`
      }));

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 md:p-6 overflow-y-auto"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl bg-[#0b0c0e] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col my-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111217] border-b border-white/10 z-50">
          <div className="flex items-center gap-3 truncate">
            <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              Anime Player
            </span>
            <h3 className="text-white font-sans font-semibold text-sm md:text-base truncate">
              {animeTitle}
            </h3>
            {isTv && (
              <span className="text-pink-400/90 font-mono text-xs hidden sm:inline bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                S{currentSeason} • EP {currentEpisode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white bg-red-500/80 hover:bg-red-500 p-2 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player Frame with First-Click Protection Shield */}
        <div className="relative aspect-video w-full bg-black">
          {firstClickShieldActive && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setFirstClickShieldActive(false);
                if (localPlayerRef.current) {
                  try {
                    localPlayerRef.current.focus();
                  } catch (err) {}
                }
              }}
              className="absolute inset-0 z-30 cursor-pointer flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
              title="Click to activate player"
            >
              <div className="bg-black/80 backdrop-blur-md text-white border border-pink-500/30 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-mono shadow-2xl">
                <Play size={14} className="text-pink-400 fill-pink-400" />
                <span>Click to start stream</span>
              </div>
            </div>
          )}

          <iframe
            ref={localPlayerRef}
            key={`${selectedServer}_${currentSeason}_${currentEpisode}_${audioType}_${activeId}`}
            src={getStreamUrl()}
            className="w-full h-full border-0 bg-black"
            sandbox={selectedServer === 'vidsrc_pm' ? "allow-scripts allow-same-origin allow-forms allow-presentation" : undefined}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="origin"
            allowFullScreen
          />
        </div>

        {/* Anime Controls Bar: SUB / DUB & Original Streaming Servers */}
        <div className="bg-[#111217] p-4 border-t border-white/10 flex flex-col gap-3">

          {/* Status info bar & episode details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-neutral-400 gap-2 border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap truncate">
              <p className="truncate">
                Watching <span className="text-pink-400 font-bold">Episode {currentEpisode}</span>
                {activeEpisodeObj?.name && (
                  <span className="text-neutral-300 font-medium ml-1.5 truncate">
                    : &ldquo;{activeEpisodeObj.name}&rdquo;
                  </span>
                )}
              </p>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-[11px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                <Volume2 size={12} className="text-pink-400" /> Active: <span className="text-white font-mono uppercase">{selectedServer}</span>
              </span>
            </div>
            {isTv && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={currentEpisode <= 1}
                  onClick={() => handleEpisodeSelect(currentEpisode - 1)}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded text-[11px] font-mono text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  disabled={currentEpisode >= totalEpisodes}
                  onClick={() => handleEpisodeSelect(currentEpisode + 1)}
                  className="flex items-center gap-1 bg-pink-600/80 hover:bg-pink-600 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded text-[11px] font-mono text-white transition-colors cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* SUB / DUB Audio and Original Servers Selector */}
          <div className="flex flex-col gap-2.5">
            {/* SUB Selector Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-[70px] text-xs font-mono font-bold text-neutral-300">
                <Globe size={14} className="text-pink-400" />
                <span>SUB</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('dghg'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'dghg'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30 ring-1 ring-white/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Server size={12} />
                  DGHG (Main)
                </button>

                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('byfms'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'byfms'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30 ring-1 ring-white/20'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Server size={12} />
                  BYFMS (Mirror)
                </button>

                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('vidlink'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'vidlink'
                      ? 'bg-[#e50914] text-white font-bold shadow-lg shadow-red-600/30 ring-1 ring-white/20'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  VidLink (Clean 1080p)
                </button>

                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('vidsrc_cc'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'vidsrc_cc'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  VidSrc CC
                </button>

                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('embed_su'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'embed_su'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  EmbedSU (HD)
                </button>

                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('autoembed'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'autoembed'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  AutoEmbed
                </button>

                <button
                  onClick={() => { setAudioType('sub'); handleServerSelect('smashystream'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'sub' && selectedServer === 'smashystream'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  SmashyStream
                </button>
              </div>
            </div>

            {/* DUB Selector Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-[70px] text-xs font-mono font-bold text-neutral-300">
                <Volume2 size={14} className="text-yellow-400" />
                <span>DUB</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setAudioType('dub'); handleServerSelect('dghg'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'dub' && selectedServer === 'dghg'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30 ring-1 ring-white/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Server size={12} />
                  DGHG (Main)
                </button>

                <button
                  onClick={() => { setAudioType('dub'); handleServerSelect('byfms'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'dub' && selectedServer === 'byfms'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30 ring-1 ring-white/20'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Server size={12} />
                  BYFMS (Mirror)
                </button>

                <button
                  onClick={() => { setAudioType('dub'); handleServerSelect('vidlink'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'dub' && selectedServer === 'vidlink'
                      ? 'bg-[#e50914] text-white font-bold shadow-lg shadow-red-600/30 ring-1 ring-white/20'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  VidLink (Clean 1080p)
                </button>

                <button
                  onClick={() => { setAudioType('dub'); handleServerSelect('vidsrc_cc'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'dub' && selectedServer === 'vidsrc_cc'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  VidSrc CC
                </button>

                <button
                  onClick={() => { setAudioType('dub'); handleServerSelect('embed_su'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'dub' && selectedServer === 'embed_su'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  EmbedSU (HD)
                </button>

                <button
                  onClick={() => { setAudioType('dub'); handleServerSelect('smashystream'); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    audioType === 'dub' && selectedServer === 'smashystream'
                      ? 'bg-pink-600 text-white font-bold shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Radio size={12} />
                  SmashyStream
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic TMDB Season & Episode Browser for Anime/TV series */}
          {isTv && (
            <div className="mt-2 border-t border-white/5 pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider font-semibold">
                    Seasons & Episodes
                  </span>

                  {/* Dynamic Season Dropdown */}
                  {seasonsList.length > 0 ? (
                    <select
                      value={currentSeason}
                      onChange={(e) => {
                        const newS = parseInt(e.target.value, 10);
                        setCurrentSeason(newS);
                        handleEpisodeSelect(1);
                      }}
                      className="bg-black/70 border border-white/20 hover:border-pink-500 text-white text-xs rounded-md px-2.5 py-1 font-mono transition-colors cursor-pointer outline-none shadow-md"
                    >
                      {seasonsList.map((s) => (
                        <option key={s.season_number} value={s.season_number}>
                          {s.name || `Season ${s.season_number}`} ({s.episode_count || 0} eps)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      Season {currentSeason}
                    </span>
                  )}

                  {isLoadingEpisodes && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-pink-400 animate-pulse">
                      <Loader2 size={12} className="animate-spin" /> Loading episodes...
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Filter Search for shows with many episodes */}
                  {totalEpisodes > 20 && (
                    <div className="relative">
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Jump to ep # or title..."
                        className="bg-white/5 hover:bg-white/10 focus:bg-black/80 border border-white/10 focus:border-pink-500 text-white text-[11px] font-mono rounded px-2 py-0.5 pl-6 outline-none transition-all w-36 sm:w-44"
                      />
                      <Search size={11} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      {searchFilter && (
                        <button
                          onClick={() => setSearchFilter('')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-[10px]"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                    Total: {totalEpisodes} Episodes
                  </span>
                </div>
              </div>

              {/* Episode Number Pills Grid */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {displayedEpisodes.map((ep) => {
                  const epNum = ep.episode_number;
                  const isCurrent = currentEpisode === epNum;
                  return (
                    <button
                      key={epNum}
                      onClick={() => handleEpisodeSelect(epNum)}
                      title={ep.name ? `EP ${epNum}: ${ep.name}` : `Episode ${epNum}`}
                      className={`min-w-[42px] px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-pink-600 text-white font-bold shadow-md shadow-pink-600/30'
                          : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {epNum < 10 ? `0${epNum}` : epNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
