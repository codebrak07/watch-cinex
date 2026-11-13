import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import Navbar from './Navbar';
import VideoModal from './VideoModal';
import Footer from './Footer';
import { createPortal } from 'react-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function FavoritesPage({ onSwitchProfile, onLogout, onHomeClick }) {
  const [favorites, setFavorites] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
    setFavorites(favs);
  }, []);

  useEffect(() => {
    if (selectedSearchResult) {
      const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
      const found = favs.some(f => f.id === selectedSearchResult.id);
      setIsFavorite(found);
    }
  }, [selectedSearchResult]);

  const toggleFavoriteInModal = () => {
    if (!selectedSearchResult) return;
    const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
    const foundIdx = favs.findIndex(f => f.id === selectedSearchResult.id);
    if (foundIdx > -1) {
      favs.splice(foundIdx, 1);
      setIsFavorite(false);
    } else {
      favs.push(selectedSearchResult);
      setIsFavorite(true);
    }
    localStorage.setItem('netflix_favorites', JSON.stringify(favs));
    setFavorites(favs); // Sync favorites grid
  };

  const handleSelectSearchResult = async (item) => {
    setIsFetchingDetails(true);
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const [detailRes, externalRes, creditsRes] = await Promise.all([
        fetch(`/api/tmdb/${item.media_type || 'movie'}/${item.id}?api_key=${apiKey}&language=en-US`),
        fetch(`/api/tmdb/${item.media_type || 'movie'}/${item.id}/external_ids?api_key=${apiKey}`),
        fetch(`/api/tmdb/${item.media_type || 'movie'}/${item.id}/credits?api_key=${apiKey}`)
      ]);

      const detailData = await detailRes.json();
      const externalData = await externalRes.json();
      const creditsData = await creditsRes.json();

      setSelectedSearchResult({
        ...item,
        ...detailData,
        imdb_id: externalData.imdb_id || detailData.imdb_id,
        cast: (creditsData.cast || []).slice(0, 8)
      });
    } catch (err) {
      console.error("Error fetching details:", err);
      setSelectedSearchResult({
        ...item,
        imdb_id: null,
        cast: []
      });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#141414] text-white pt-24 pb-12 px-4 md:px-12 relative overflow-x-hidden">
      <Navbar
        onSwitchProfile={onSwitchProfile}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
      />

      <div className="max-w-7xl mx-auto mt-8">
        <h2 className="text-3xl md:text-5xl font-sans font-bold text-neutral-100 mb-8 tracking-tight flex items-center gap-3">
          My List
        </h2>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <span className="text-neutral-500 font-sans font-light text-lg">Your list is currently empty.</span>
            <span className="text-neutral-600 text-xs font-mono uppercase tracking-widest max-w-md leading-relaxed">
              Explore trending shows and movies on the home screen and add them to My List to save them here!
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.8, ease: SOVEREIGN_EASE }}
                whileHover={{
                  scale: 1.08,
                  y: -8,
                  transition: { duration: 0.25, ease: HOVER_EASE }
                }}
                onClick={() => handleSelectSearchResult(item)}
                className="bg-[#1f1f23]/60 border border-white/5 rounded-lg overflow-hidden cursor-pointer group hover:border-white/10 transition-all shadow-lg hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-zinc-900">
                  <img
                    src={item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500";
                    }}
                  />
                  {item.media_type && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] font-mono font-semibold px-2 py-0.5 rounded text-neutral-300 uppercase tracking-wider">
                      {item.media_type}
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <h4 className="text-neutral-200 font-sans text-xs md:text-sm font-semibold truncate group-hover:text-[#e50914] transition-colors">
                    {item.title}
                  </h4>
                  {item.vote_average ? (
                    <span className="text-[10px] font-mono text-neutral-500">
                      ⭐ {item.vote_average.toFixed(1)} / 10
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <Footer />

      {/* Render VideoModal outside of transformed AnimatePresence to ensure correct viewport centering */}
      <AnimatePresence>
        {selectedMedia && (
          <VideoModal
            media={selectedMedia}
            onMediaUpdate={setSelectedMedia}
            onClose={() => setSelectedMedia(null)}
            onMainVideoEnd={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* Search Result Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedSearchResult && (
            <motion.div
              key="search-detail-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 overflow-y-auto"
              onClick={() => setSelectedSearchResult(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, ease: SOVEREIGN_EASE }}
                className="relative bg-[#0d0d0f] border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedSearchResult(null)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full z-50 border border-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Left Column: Media (Backdrop + Floating Poster) */}
                <div className="w-full md:w-1/2 relative aspect-video md:aspect-auto md:h-full overflow-hidden bg-black flex-shrink-0">
                  <img
                    src={selectedSearchResult.backdrop_path
                      ? `https://image.tmdb.org/t/p/original${selectedSearchResult.backdrop_path}`
                      : `https://image.tmdb.org/t/p/original${selectedSearchResult.poster_path}`
                    }
                    alt={selectedSearchResult.title || selectedSearchResult.name}
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d0d0f] hidden md:block" />

                  {/* Floating small poster on top of backdrop */}
                  <div className="absolute bottom-4 left-4 flex gap-4 items-end">
                    <div
                      className="relative group/poster cursor-pointer w-24 md:w-32 aspect-[2/3] rounded-md overflow-hidden border border-white/20 shadow-2xl"
                      onClick={() => {
                        if (selectedSearchResult.imdb_id || selectedSearchResult.id) {
                          const mType = selectedSearchResult.media_type || 'movie';
                          const streamUrl = `https://streamimdb.ru/embed/${mType}/${selectedSearchResult.imdb_id || selectedSearchResult.id}?tmdb_id=${selectedSearchResult.id}`;
                          setSelectedMedia({
                            type: 'video',
                            url: streamUrl,
                            title: selectedSearchResult.title || selectedSearchResult.name,
                            tmdbId: selectedSearchResult.id,
                            imdbId: selectedSearchResult.imdb_id,
                            mediaType: mType,
                            isTvSeries: mType === 'tv',
                            season: '1',
                            episode: '1',
                            numberOfSeasons: selectedSearchResult.number_of_seasons || 10,
                            provider: (window.localStorage.getItem('off_campus_provider') && window.localStorage.getItem('off_campus_provider') !== 'videasy') ? window.localStorage.getItem('off_campus_provider') : 'vidlink'
                          });
                          setSelectedSearchResult(null);
                        }
                      }}
                    >
                      <img
                        src={selectedSearchResult.poster_path
                          ? `https://image.tmdb.org/t/p/w300${selectedSearchResult.poster_path}`
                          : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=300'
                        }
                        alt="Poster"
                        className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=300";
                        }}
                      />
                      {(selectedSearchResult.imdb_id || selectedSearchResult.id) && (
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-2">
                          <Play size={20} fill="#e50914" stroke="#e50914" className="mb-1 text-[#e50914]" />
                          <span className="text-[9px] font-mono tracking-wider text-[#e50914] font-bold uppercase">Watch It Here</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 pb-1">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#e50914] font-semibold bg-[#e50914]/10 px-2 py-0.5 rounded border border-[#e50914]/20 self-start">
                        {selectedSearchResult.media_type || 'movie'}
                      </span>
                      <h3 className="text-lg md:text-2xl font-sans font-semibold text-white leading-tight">
                        {selectedSearchResult.title || selectedSearchResult.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Right Column: Details & Credits */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto h-full">
                  <div className="flex flex-col gap-4">
                    {/* Rating / Meta */}
                    <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                      {selectedSearchResult.vote_average ? (
                        <span className="text-yellow-400 flex items-center gap-1">
                          ★ {selectedSearchResult.vote_average.toFixed(1)}/10
                        </span>
                      ) : null}
                      {selectedSearchResult.release_date || selectedSearchResult.first_air_date ? (
                        <span>
                          {(selectedSearchResult.release_date || selectedSearchResult.first_air_date).slice(0, 4)}
                        </span>
                      ) : null}
                      {selectedSearchResult.genres ? (
                        <span className="truncate max-w-[200px]">
                          {selectedSearchResult.genres.map(g => g.name).join(', ')}
                        </span>
                      ) : null}
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">Overview</h4>
                      <p className="text-neutral-300 text-sm font-light leading-relaxed text-justify">
                        {selectedSearchResult.overview || "No overview available for this title."}
                      </p>
                    </div>

                    {/* Cast */}
                    {selectedSearchResult.cast && selectedSearchResult.cast.length > 0 ? (
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">Cast</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSearchResult.cast.map((actor, idx) => (
                            <span
                              key={idx}
                              className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 px-2.5 py-1 rounded text-xs text-neutral-300 font-sans tracking-wide transition-colors"
                            >
                              <span className="font-semibold text-neutral-100">{actor.name}</span>
                              <span className="text-neutral-500 font-light text-[11px] ml-1">as {actor.character}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Footer: External IMDb Link & Watch It Here */}
                  <div className="mt-8 border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    <div className="flex flex-wrap gap-2.5">
                      {(selectedSearchResult.imdb_id || selectedSearchResult.id) ? (
                        <>
                          <button
                            onClick={() => {
                              const mType = selectedSearchResult.media_type || 'movie';
                              const streamUrl = `https://streamimdb.ru/embed/${mType}/${selectedSearchResult.imdb_id || selectedSearchResult.id}?tmdb_id=${selectedSearchResult.id}`;
                              setSelectedMedia({
                                type: 'video',
                                url: streamUrl,
                                title: selectedSearchResult.title || selectedSearchResult.name,
                                tmdbId: selectedSearchResult.id,
                                imdbId: selectedSearchResult.imdb_id,
                                mediaType: mType,
                                isTvSeries: mType === 'tv',
                                season: '1',
                                episode: '1',
                                numberOfSeasons: selectedSearchResult.number_of_seasons || 10,
                                provider: (window.localStorage.getItem('off_campus_provider') && window.localStorage.getItem('off_campus_provider') !== 'videasy') ? window.localStorage.getItem('off_campus_provider') : 'vidlink'
                              });
                              setSelectedSearchResult(null);
                            }}
                            className="flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#b20710] text-white font-semibold text-sm px-4 py-2.5 rounded-lg font-sans shadow-lg hover:shadow-[#e50914]/20 transition-all uppercase tracking-wider cursor-pointer"
                          >
                            <Play size={16} fill="currentColor" />
                            Watch It Here
                          </button>
                          <button
                            onClick={toggleFavoriteInModal}
                            className={`flex items-center justify-center gap-2 border font-semibold text-sm px-4 py-2.5 rounded-lg font-sans transition-all uppercase tracking-wider cursor-pointer ${isFavorite
                                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                : 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                              }`}
                          >
                            {isFavorite ? '✓ In My List' : '+ My List'}
                          </button>
                          {selectedSearchResult.imdb_id && (
                            <a
                              href={`https://www.imdb.com/title/${selectedSearchResult.imdb_id}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 bg-[#f5c518] hover:bg-[#e2b616] text-black font-semibold text-sm px-4 py-2.5 rounded-lg font-sans shadow-lg hover:shadow-yellow-500/10 transition-all uppercase tracking-wider"
                            >
                              IMDb
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-neutral-500 font-mono italic">No streaming details</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Fetching Details Spinner */}
      <AnimatePresence>
        {isFetchingDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 pointer-events-none"
          >
            <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-mono tracking-widest text-neutral-400 uppercase">Fetching details...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
