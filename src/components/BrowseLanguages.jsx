import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BrowseLanguages({ onItemClick }) {
  const [languagesList, setLanguagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Preference and language filter states
  const [preference, setPreference] = useState('Original Language');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  useEffect(() => {
    const fetchLanguagesList = async () => {
      setLoading(true);
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      
      const langCodes = {
        'English': 'en',
        'Hindi': 'hi',
        'Spanish': 'es',
        'French': 'fr',
        'Korean': 'ko'
      };
      const langCode = langCodes[selectedLanguage];

      try {
        // Fetch matching TV shows and movies for the selected language
        const [tvRes, movieRes] = await Promise.all([
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_original_language=${langCode}&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_original_language=${langCode}&sort_by=popularity.desc`)
        ]);

        if (!tvRes.ok || !movieRes.ok) throw new Error("TMDB language query failed");
        const tvData = await tvRes.json();
        const movieData = await movieRes.json();

        const cleanResults = (results) => {
          return (results || []).filter(item => {
            if (item.adult) return false;
            if (item.genre_ids && item.genre_ids.includes(16)) return false; // Animation
            const title = (item.title || item.name || '').toLowerCase();
            if (title.includes('doraemon') || title.includes('overflow') || title.includes('hentai') || title.includes('cartoon')) return false;
            return true;
          });
        };

        const tvItems = cleanResults(tvData.results).map(item => ({
          ...item,
          media_type: 'tv',
          title: item.name,
          thumb: `https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`
        }));

        const movieItems = cleanResults(movieData.results).map(item => ({
          ...item,
          media_type: 'movie',
          title: item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`
        }));

        // Merge TV and Movie results alternately
        const merged = [];
        const maxLength = Math.max(tvItems.length, movieItems.length);
        for (let i = 0; i < maxLength; i++) {
          if (i < tvItems.length) merged.push(tvItems[i]);
          if (i < movieItems.length) merged.push(movieItems[i]);
        }

        setLanguagesList(merged.slice(0, 18));
      } catch (err) {
        console.error("Error fetching language list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguagesList();
  }, [selectedLanguage, preference]);

  return (
    <div className="relative z-20 pt-28 px-4 md:px-12 min-h-screen">
      {/* Browse by Languages Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl md:text-5xl font-sans font-bold text-neutral-100 tracking-tight">
          Browse by Languages
        </h2>
        <div className="flex items-center gap-3 text-xs md:text-sm">
          <span className="text-neutral-400">Select Your Preferences</span>
          <select 
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            className="bg-black border border-neutral-700 text-white px-3 py-1.5 rounded cursor-pointer font-sans"
          >
            <option value="Original Language">Original Language</option>
            <option value="Dubbing">Dubbing</option>
            <option value="Subtitles">Subtitles</option>
          </select>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-black border border-neutral-700 text-white px-3 py-1.5 rounded cursor-pointer font-sans"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">Loading titles...</p>
        </div>
      ) : (
        /* 6-Column Grid of Languages Items */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-20">
          {languagesList.map((item) => (
            <motion.div
              key={`${item.media_type}-${item.id}`}
              whileHover={{ scale: 1.08, zIndex: 30 }}
              onClick={() => onItemClick(item)}
              className="bg-[#1f1f23]/60 border border-white/5 rounded-md overflow-hidden cursor-pointer group hover:border-white/10 transition-all shadow-lg"
            >
              <div className="aspect-[2/3] relative bg-zinc-900">
                <img 
                  src={item.thumb} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=300";
                  }}
                />
              </div>
              <div className="p-2 truncate font-sans text-xs text-neutral-300 group-hover:text-white font-semibold">
                {item.title}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
