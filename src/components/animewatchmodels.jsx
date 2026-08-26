import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize, ChevronLeft, ChevronRight, Play, Volume2, Globe, Radio, Server } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function AnimeWatchModal({ media, onClose, onMediaUpdate }) {
  const containerRef = useRef(null);
  const localPlayerRef = useRef(null);

  // Extract TMDB / Anime details
  const rawId = media.tmdbId || media.id || (media.url?.match(/\/embed\/(?:tv|movie)\/([^/?]+)/) || [])[1] || (media.url?.match(/\/tv\/([^/?]+)/) || [])[1] || '1429';
  const animeTitle = media.title || media.name || 'Anime Stream';
  const isTv = media.isTvSeries !== false && (media.mediaType !== 'movie' && media.media_type !== 'movie');

  // State for episodes, audio (Sub/Dub), and servers (Zoro, Vidplay, BYFMS, DGHG, etc.)
  const [currentSeason, setCurrentSeason] = useState(parseInt(media.season || '1', 10) || 1);
  const [currentEpisode, setCurrentEpisode] = useState(parseInt(media.episode || '1', 10) || 1);
  const [audioType, setAudioType] = useState('sub'); // 'sub' or 'dub'
  const [selectedServer, setSelectedServer] = useState('vidlink'); // vidlink.pro as default reliable player
  const [totalEpisodes, setTotalEpisodes] = useState(media.number_of_episodes || 24);
  const totalSeasons = Math.max(1, media.numberOfSeasons || media.totalSeasons || 4);

  // Focus iframe on open
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

  // Extract additional parameters
  const imdbId = media.imdb_id || media.imdbId || '';
  const mediaType = isTv ? 'tv' : 'movie';
  const releaseYear = (media.first_air_date || media.release_date || '2024').substring(0, 4);

  // Compute streaming URL directly formatted for vidplay.to and servers
  const getStreamUrl = () => {
    const ep = isTv ? currentEpisode : 0;
    const s = isTv ? currentSeason : 0;
    const isDub = audioType === 'dub';
    const cleanTitle = encodeURIComponent(animeTitle);

    switch (selectedServer) {
      case 'vidlink':
        // VidLink.pro (Top tier 2024/2026 anime and movie stream provider)
        if (isTv) {
          return `https://vidlink.pro/tv/${rawId}/${currentSeason}/${currentEpisode}?primaryColor=e50914&autoplay=true`;
        }
        return `https://vidlink.pro/movie/${rawId}?primaryColor=e50914&autoplay=true`;

      case 'vidsrc_cc':
        // VidSrc.cc V2 Player
        if (isTv) {
          return `https://vidsrc.cc/v2/embed/tv/${rawId}/${currentSeason}/${currentEpisode}`;
        }
        return `https://vidsrc.cc/v2/embed/movie/${rawId}`;

      case 'vidplay':
        // Vidplay direct streaming embed formats
        if (isTv) {
          return `https://vidplay.to/stream/embed?imdbid=${imdbId}&tmdbid=${rawId}&type=tv&name=${cleanTitle}&year=${releaseYear}&season=${currentSeason}&episode=${currentEpisode}${isDub ? '&dub=1' : ''}`;
        }
        return `https://vidplay.to/stream/embed?imdbid=${imdbId}&tmdbid=${rawId}&type=movie&name=${cleanTitle}&year=${releaseYear}&season=0&episode=0${isDub ? '&dub=1' : ''}`;

      case 'vidsrc_me':
        // VidSrc ME (Direct, original embed provider)
        if (isTv) {
          return `https://vidsrc.me/embed/tv?tmdb=${rawId}&season=${currentSeason}&episode=${currentEpisode}&color=e50914`;
        }
        return `https://vidsrc.me/embed/movie?tmdb=${rawId}&color=e50914`;

      case 'vidsrc_to':
        // VidSrc TO / CC Stream
        if (isTv) {
          return `https://vidsrc.to/embed/tv/${rawId}/${currentSeason}/${currentEpisode}`;
        }
        return `https://vidsrc.to/embed/movie/${rawId}`;

      case 'zoro':
        // Zoro / Aniwatch Anime Stream (vidsrc.pm - active HLS stream)
        if (isTv) {
          return `https://vidsrc.pm/embed/tv/${rawId}/${currentSeason}/${currentEpisode}?autoplay=1`;
        }
        return `https://vidsrc.pm/embed/movie/${rawId}?autoplay=1`;

      case 'gogoanime':
        // Gogoanime Stream Server (SmashyStream embed)
        if (isTv) {
          return `https://player.smashy.stream/tv/${rawId}?s=${currentSeason}&e=${currentEpisode}`;
        }
        return `https://player.smashy.stream/movie/${rawId}`;

      case 'byfms':
        // BYFMS Fast Stream Server (VidSrc XYZ)
        if (isTv) {
          return `https://vidsrc.xyz/embed/tv?tmdb=${rawId}&season=${currentSeason}&episode=${currentEpisode}&autoplay=1`;
        }
        return `https://vidsrc.xyz/embed/movie?tmdb=${rawId}&autoplay=1`;

      case 'dghg':
        // DGHG Ultra Server (VidSrc IN)
        if (isTv) {
          return `https://vidsrc.in/embed/tv/${rawId}/${currentSeason}/${currentEpisode}?autoplay=1`;
        }
        return `https://vidsrc.in/embed/movie/${rawId}?autoplay=1`;

      case 'aniwaves':
        // Aniwaves Pro Mirror
        if (isTv) {
          return `https://vidsrc.pro/embed/tv/${rawId}/${currentSeason}/${currentEpisode}`;
        }
        return `https://vidsrc.pro/embed/movie/${rawId}`;

      default:
        return `https://vidsrc.me/embed/tv?tmdb=${rawId}&season=${currentSeason}&episode=${currentEpisode}`;
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
              <span className="text-neutral-400 font-mono text-xs hidden sm:inline">
                S{currentSeason} • EP {currentEpisode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Fullscreen"
            >
              <Maximize size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white bg-red-500/80 hover:bg-red-500 p-2 rounded-full transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            ref={localPlayerRef}
            key={`${selectedServer}_${currentSeason}_${currentEpisode}_${audioType}`}
            src={getStreamUrl()}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Anime Controls Bar: SUB / DUB & 3 Primary Streaming Servers */}
        <div className="bg-[#111217] p-4 border-t border-white/10 flex flex-col gap-3">

          {/* Status info bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-neutral-400 gap-2 border-b border-white/5 pb-2.5">
            <p>
              You're watching <span className="text-pink-400 font-bold">Episode {currentEpisode}</span>. If the current server doesn't load, please switch servers beside.
            </p>
            {isTv && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentEpisode <= 1}
                  onClick={() => handleEpisodeSelect(currentEpisode - 1)}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded text-[11px] font-mono text-white transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  disabled={currentEpisode >= totalEpisodes}
                  onClick={() => handleEpisodeSelect(currentEpisode + 1)}
                  className="flex items-center gap-1 bg-pink-600/80 hover:bg-pink-600 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded text-[11px] font-mono text-white transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* SUB / DUB Audio and 3 Servers Selector (Aniwave style) */}
          <div className="flex flex-col gap-2.5">

            {/* SUB Selector Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-[70px] text-xs font-mono font-bold text-neutral-300">
                <Globe size={14} className="text-pink-400" />
                <span>SUB</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('vidlink'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'vidlink'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  VidLink
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('vidsrc_cc'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'vidsrc_cc'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  VidSrc CC
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('vidplay'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'vidplay'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Vidplay
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('vidsrc_me'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'vidsrc_me'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  VidSrc ME
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('vidsrc_to'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'vidsrc_to'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  VidSrc TO
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('zoro'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'zoro'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Zoro
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('aniwaves'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'aniwaves'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Aniwaves
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('zoro'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'zoro'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Zoro
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('gogoanime'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'gogoanime'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Gogoanime
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('byfms'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'byfms'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Server size={12} />
                  BYFMS
                </button>

                <button
                  onClick={() => { setAudioType('sub'); setSelectedServer('dghg'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'sub' && selectedServer === 'dghg'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Server size={12} />
                  DGHG
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
                  onClick={() => { setAudioType('dub'); setSelectedServer('vidplay'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'dub' && selectedServer === 'vidplay'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Vidplay
                </button>

                <button
                  onClick={() => { setAudioType('dub'); setSelectedServer('zoro'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'dub' && selectedServer === 'zoro'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Zoro
                </button>

                <button
                  onClick={() => { setAudioType('dub'); setSelectedServer('gogoanime'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'dub' && selectedServer === 'gogoanime'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Radio size={12} />
                  Gogoanime
                </button>

                <button
                  onClick={() => { setAudioType('dub'); setSelectedServer('byfms'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${audioType === 'dub' && selectedServer === 'byfms'
                      ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                >
                  <Server size={12} />
                  BYFMS
                </button>
              </div>
            </div>

          </div>

          {/* Episode Grid for TV series */}
          {isTv && (
            <div className="mt-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider font-semibold">
                    Episodes
                  </span>
                  {totalSeasons > 1 && (
                    <select
                      value={currentSeason}
                      onChange={(e) => setCurrentSeason(parseInt(e.target.value, 10))}
                      className="bg-black/60 border border-white/10 text-white text-xs rounded px-2 py-0.5 font-mono"
                    >
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s}>Season {s}</option>
                      ))}
                    </select>
                  )}
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  Total: {totalEpisodes} Episodes
                </span>
              </div>

              {/* Episode Number Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => (
                  <button
                    key={epNum}
                    onClick={() => handleEpisodeSelect(epNum)}
                    className={`min-w-[40px] px-2.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${currentEpisode === epNum
                        ? 'bg-pink-600 text-white font-bold shadow-md shadow-pink-600/30'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {epNum < 10 ? `0${epNum}` : epNum}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
