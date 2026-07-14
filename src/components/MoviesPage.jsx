import { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import ContentRow from './ContentRow';

export default function MoviesPage({ onItemClick, setSelectedMedia }) {
  const [categories, setCategories] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Genre filter states
  const [selectedGenre, setSelectedGenre] = useState('Genres');
  const [genreMovies, setGenreMovies] = useState([]);
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => {
    const cachedData = sessionStorage.getItem('netflix_movies_data');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setCategories(parsed.categories || []);
        setHeroMovie(parsed.heroMovie || null);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse cached movies data:", e);
      }
    }

    const fetchMoviesData = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const [popularRes, asianRes, horrorRes, epicRes] = await Promise.all([
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&region=IN&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_original_language=ko|ja|zh&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_genres=27&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_genres=878|12|14&sort_by=popularity.desc`)
        ]);

        const popularData = await popularRes.json();
        const asianData = await asianRes.json();
        const horrorData = await horrorRes.json();
        const epicData = await epicRes.json();

        const cleanResults = (results) => {
          return (results || []).filter(item => {
            if (item.adult) return false;
            if (item.genre_ids && item.genre_ids.includes(16)) return false;
            const title = (item.title || '').toLowerCase();
            if (title.includes('doraemon') || title.includes('overflow') || title.includes('hentai') || title.includes('cartoon')) return false;
            return true;
          });
        };

        const top10IndiaItems = cleanResults(popularData.results).slice(0, 10).map(item => ({
          ...item,
          type: 'video',
          title: item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'movie'
        }));

        const asianItems = cleanResults(asianData.results).map(item => ({
          ...item,
          type: 'video',
          title: item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'movie'
        }));

        const horrorItems = cleanResults(horrorData.results).map(item => ({
          ...item,
          type: 'video',
          title: item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'movie'
        }));

        const epicItems = cleanResults(epicData.results).map(item => ({
          ...item,
          type: 'video',
          title: item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'movie'
        }));

        const nextCategories = [
          { title: "Indian Drama Movies", items: top10IndiaItems },
          { title: "Asian Movies", items: asianItems },
          { title: "Horror Movies", items: horrorItems },
          { title: "Epic Worlds", items: epicItems }
        ];

        let nextHeroMovie = null;
        if (top10IndiaItems.length > 0) {
          nextHeroMovie = top10IndiaItems[0];
        }

        setCategories(nextCategories);
        setHeroMovie(nextHeroMovie);

        sessionStorage.setItem('netflix_movies_data', JSON.stringify({
          categories: nextCategories,
          heroMovie: nextHeroMovie
        }));
      } catch (err) {
        console.error("Failed to fetch movies data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoviesData();
  }, []);

  // Fetch genre filtered movies dynamically from TMDB
  useEffect(() => {
    if (selectedGenre === 'Genres') return;

    const fetchGenreMovies = async () => {
      setGenreLoading(true);
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const genreIds = {
        'Action': 28,
        'Comedy': 35,
        'Drama': 18,
        'Horror': 27,
        'Sci-Fi': 878
      };
      const genreId = genreIds[selectedGenre];

      try {
        const res = await fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc`);
        if (!res.ok) throw new Error("Failed to fetch genre list");
        const data = await res.json();

        const cleanResults = (results) => {
          return (results || []).filter(item => {
            if (item.adult) return false;
            if (item.genre_ids && item.genre_ids.includes(16)) return false;
            const title = (item.title || '').toLowerCase();
            if (title.includes('doraemon') || title.includes('overflow') || title.includes('hentai') || title.includes('cartoon')) return false;
            return true;
          });
        };

        const items = cleanResults(data.results).map(item => ({
          ...item,
          type: 'video',
          title: item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'movie'
        }));

        setGenreMovies(items);
      } catch (err) {
        console.error("Error fetching genre movies:", err);
      } finally {
        setGenreLoading(false);
      }
    };

    fetchGenreMovies();
  }, [selectedGenre]);

  const currentHero = selectedGenre !== 'Genres' && genreMovies.length > 0 ? genreMovies[0] : heroMovie;

  return (
    <div className="min-h-screen pb-12">
      {/* Movies genres dropdown header */}
      <div className="pt-28 px-4 md:px-12 flex items-center gap-4 relative z-30 mb-[-60px]">
        <h2 className="text-3xl md:text-5xl font-sans font-bold text-neutral-100 tracking-tight">
          Movies
        </h2>
        <select 
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-black border border-neutral-700 text-white text-xs font-semibold px-3 py-1 rounded cursor-pointer font-sans mt-2"
        >
          <option value="Genres">Genres</option>
          <option value="Action">Action</option>
          <option value="Comedy">Comedy</option>
          <option value="Drama">Drama</option>
          <option value="Horror">Horror</option>
          <option value="Sci-Fi">Sci-Fi</option>
        </select>
      </div>

      {loading || (selectedGenre !== 'Genres' && genreLoading) ? (
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">Loading movies...</p>
        </div>
      ) : (
        <>
          <HeroBanner
            title={currentHero ? currentHero.title : undefined}
            overview={currentHero ? currentHero.overview : undefined}
            backdropPath={currentHero ? (currentHero.backdrop_path || currentHero.poster_path) : undefined}
            onPlay={() => {
              if (currentHero) {
                const streamUrl = `https://streamimdb.ru/embed/movie/${currentHero.id}?tmdb_id=${currentHero.id}`;
                setSelectedMedia({
                  type: 'video',
                  url: streamUrl,
                  title: currentHero.title,
                  tmdbId: currentHero.id,
                  mediaType: 'movie'
                });
              }
            }}
            onMoreInfo={() => {
              if (currentHero) {
                onItemClick(currentHero);
              }
            }}
          />

          <div className="relative z-20 mt-4 md:-mt-32 px-4 md:px-12 space-y-12">
            {selectedGenre === 'Genres' ? (
              categories.map((cat, i) => (
                <ContentRow
                  key={i}
                  title={cat.title}
                  items={cat.items}
                  onItemClick={onItemClick}
                />
              ))
            ) : (
              <ContentRow
                title={`${selectedGenre} Movies`}
                items={genreMovies}
                onItemClick={onItemClick}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
