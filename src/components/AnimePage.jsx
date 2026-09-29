import { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import ContentRow from './ContentRow';
import { ChevronDown, Play, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimeWatchModal from './animewatchmodels';

const ANIME_GENRES = [
  { id: 'all', name: 'All Anime' },
  { id: '10759', name: 'Action & Adventure' },
  { id: '10765', name: 'Sci-Fi & Fantasy' },
  { id: '18', name: 'Drama' },
  { id: '35', name: 'Comedy' },
  { id: '9648', name: 'Mystery' }
];

export default function AnimePage({ onItemClick, setSelectedMedia }) {
  const [categories, setCategories] = useState([]);
  const [heroAnime, setHeroAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAnimeMedia, setActiveAnimeMedia] = useState(null);

  // Genre filter state
  const [selectedGenre, setSelectedGenre] = useState(ANIME_GENRES[0]);
  const [genreAnimeList, setGenreAnimeList] = useState([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Check sessionStorage
    const cachedData = sessionStorage.getItem('netflix_anime_data_v2');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setCategories(parsed.categories || []);
        setHeroAnime(parsed.heroAnime || null);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse cached anime data:", e);
      }
    }

    const fetchAnimeData = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const [trendingRes, topRatedRes, moviesRes, actionRes, fantasyRes] = await Promise.all([
          // Trending / Popular Anime TV Series
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&vote_count.gte=100&sort_by=popularity.desc`),
          // Top Rated Classics
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=500`),
          // Top Anime Masterpiece Movies
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_genres=16&with_original_language=ja&vote_count.gte=50&sort_by=popularity.desc`),
          // High-Octane Action & Adventure Shonen
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_genres=16,10759&without_genres=10765&with_original_language=ja&vote_count.gte=50&sort_by=popularity.desc`),
          // Fantasy, Supernatural & Mystery Anime
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_genres=16,10765&without_genres=10759&with_original_language=ja&vote_count.gte=50&sort_by=vote_average.desc&page=1`)
        ]);

        const trendingData = await trendingRes.json();
        const topRatedData = await topRatedRes.json();
        const moviesData = await moviesRes.json();
        const actionData = await actionRes.json();
        const fantasyData = await fantasyRes.json();

        // NSFW & suggestive keywords blacklist
        const NSFW_KEYWORDS = [
          'hentai', 'ecchi', 'erotic', 'lust', 'passion', 'ecstasy', 'naked', 'sex', 
          'monk', 'souryo', 'shikiyoku', 'overflow', 'redo of healer', 'valkyrie drive', 
          'kiss', 'doraemon', 'cartoon', 'pleasure', 'fetish', 'incest', 'harem',
          'boobs', 'oppai', 'nude', 'nsfw', 'sensual', 'yosuga', 'school days',
          'prison school', 'highschool dxd', 'shinmai maou', 'masou gakuen',
          'peter grill', 'ishuzoku', 'interspecies', 'seikatsu', 'succubus'
        ];

        const cleanAnime = (results, mediaType = 'tv') => {
          return (results || []).filter(item => {
            if (item.adult) return false;
            
            const title = (item.name || item.title || item.original_name || '').toLowerCase();
            const overview = (item.overview || '').toLowerCase();

            // Filter out items matching NSFW words in title or overview description
            const isNsfw = NSFW_KEYWORDS.some(kw => title.includes(kw) || overview.includes(` ${kw} `) || overview.includes(`${kw} `) || overview.includes(` ${kw}`));
            if (isNsfw) return false;

            // Must have a valid backdrop image for hero/cards
            if (!item.backdrop_path && !item.poster_path) return false;

            return true;
          }).map(item => ({
            ...item,
            type: 'video',
            title: item.name || item.title,
            thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
            media_type: mediaType,
            isTvSeries: mediaType === 'tv'
          }));
        };

        const trendingItems = cleanAnime(trendingData.results, 'tv');
        const topRatedItems = cleanAnime(topRatedData.results, 'tv');
        const animeMovieItems = cleanAnime(moviesData.results, 'movie');
        const actionItems = cleanAnime(actionData.results, 'tv');
        const fantasyItems = cleanAnime(fantasyData.results, 'tv');

        const nextCategories = [
          { title: "Trending Anime Series", items: trendingItems },
          { title: "Top Rated Masterpieces", items: topRatedItems },
          { title: "Anime Blockbuster Movies", items: animeMovieItems },
          { title: "High-Octane Action & Shonen", items: actionItems },
          { title: "Fantasy & Supernatural Anime", items: fantasyItems }
        ];

        // Pick top popular mainstream anime with high rating and safe backdrop for hero
        let nextHero = null;
        if (trendingItems.length > 0) {
          nextHero = trendingItems.find(item => item.backdrop_path && item.vote_average >= 7.5) || trendingItems[0];
        }

        setCategories(nextCategories);
        setHeroAnime(nextHero);

        sessionStorage.setItem('netflix_anime_data_v2', JSON.stringify({
          categories: nextCategories,
          heroAnime: nextHero
        }));

      } catch (err) {
        console.error("Failed to fetch Anime data from TMDB:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, []);

  // Handle Genre Filter Fetching
  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    setIsDropdownOpen(false);

    if (genre.id === 'all') {
      setGenreAnimeList([]);
      return;
    }

    setGenreLoading(true);
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    try {
      const res = await fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_genres=16,${genre.id}&with_original_language=ja&vote_count.gte=30&sort_by=popularity.desc`);
      const data = await res.json();
      
      const NSFW_KEYWORDS = [
        'hentai', 'ecchi', 'erotic', 'lust', 'passion', 'ecstasy', 'naked', 'sex', 
        'monk', 'souryo', 'shikiyoku', 'overflow', 'redo of healer', 'valkyrie drive', 
        'kiss', 'doraemon', 'cartoon', 'pleasure', 'fetish', 'incest', 'harem',
        'boobs', 'oppai', 'nude', 'nsfw', 'sensual', 'yosuga', 'school days',
        'prison school', 'highschool dxd', 'shinmai maou', 'masou gakuen',
        'peter grill', 'ishuzoku', 'interspecies', 'seikatsu', 'succubus'
      ];

      const items = (data.results || []).filter(item => {
        if (item.adult) return false;
        const title = (item.name || item.title || item.original_name || '').toLowerCase();
        const overview = (item.overview || '').toLowerCase();
        const isNsfw = NSFW_KEYWORDS.some(kw => title.includes(kw) || overview.includes(` ${kw} `) || overview.includes(`${kw} `) || overview.includes(` ${kw}`));
        return !isNsfw;
      }).map(item => ({
        ...item,
        type: 'video',
        title: item.name || item.title,
        thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
        media_type: 'tv',
        isTvSeries: true
      }));
      setGenreAnimeList(items);
    } catch (e) {
      console.error("Failed to load genre anime:", e);
    } finally {
      setGenreLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">Loading anime...</p>
        </div>
      ) : selectedGenre.id === 'all' ? (
        <>
          {/* Hero Banner (matching MoviesPage structure) */}
          <HeroBanner 
            title={heroAnime ? (heroAnime.name || heroAnime.title) : undefined}
            overview={heroAnime ? heroAnime.overview : undefined}
            backdropPath={heroAnime ? (heroAnime.backdrop_path || heroAnime.poster_path) : undefined}
            onPlay={() => {
              if (heroAnime) setActiveAnimeMedia(heroAnime);
            }}
            onMoreInfo={() => {
              if (heroAnime) {
                if (onItemClick) onItemClick(heroAnime);
                else setActiveAnimeMedia(heroAnime);
              }
            }}
          />

          {/* Categorized Rows matching MoviesPage & NetflixHome layout */}
          <div className="relative z-20 mt-4 md:-mt-32 px-4 md:px-12 space-y-12">
            {categories.map((cat, idx) => (
              <ContentRow
                key={cat.title || idx}
                title={cat.title}
                items={cat.items}
                onItemClick={(item) => setActiveAnimeMedia(item)}
                setSelectedMedia={setSelectedMedia}
              />
            ))}
          </div>
        </>
      ) : (
        /* Filtered Genre Grid */
        <div className="px-4 md:px-12 mt-8">
          {genreLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {genreAnimeList.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => setActiveAnimeMedia(anime)}
                  className="group relative cursor-pointer rounded-md overflow-hidden bg-zinc-900 border border-white/5 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <img
                    src={anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : anime.thumb}
                    alt={anime.title}
                    className="w-full aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                    <p className="text-white text-sm font-semibold truncate">{anime.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">Rating: ⭐ {anime.vote_average?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dedicated Anime Watch Modal */}
      <AnimatePresence>
        {activeAnimeMedia && (
          <AnimeWatchModal
            key={activeAnimeMedia.id || activeAnimeMedia.tmdbId || activeAnimeMedia.title}
            media={activeAnimeMedia}
            onMediaUpdate={setActiveAnimeMedia}
            onClose={() => setActiveAnimeMedia(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
