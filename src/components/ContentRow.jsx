import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ThumbsUp, ThumbsDown, Heart, ChevronDown } from 'lucide-react';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function ContentRow({ title, items, onItemClick }) {
  const rowRef = useRef(null);

  return (
    <div className="flex flex-col gap-2 md:gap-4 z-20 relative">
      <h3 className="row-title font-sans text-lg md:text-xl font-bold text-[#e5e5e5] px-2 md:px-0 tracking-normal leading-tight">
        {title}
      </h3>
      
      <div className="relative">
        <div 
          ref={rowRef}
          className="flex gap-2 overflow-x-auto px-2 md:px-0 pb-8 pt-4 scrollbar-hide snap-x"
          style={{ scrollbarWidth: 'none', perspective: 1000, transformStyle: "preserve-3d" }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 1.0, ease: SOVEREIGN_EASE }}
              whileHover={{ 
                scale: 1.15, 
                zIndex: 50, 
                y: -15,
                rotateX: -4,
                rotateY: 6,
                z: 20,
                transition: { duration: 0.25, ease: HOVER_EASE }
              }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => onItemClick(item)}
              className={`row-card group relative flex-none w-[175px] md:w-[270px] aspect-[4/3.5] bg-[#2f2f2f] rounded-md overflow-hidden cursor-pointer snap-start transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)] ${
                index === 0 ? 'origin-left' : index === items.length - 1 ? 'origin-right' : 'origin-center'
              }`}
            >
              <img 
                src={item.thumb} 
                alt={item.title}
                className="w-full h-full object-cover"
                style={{ objectPosition: item.objectPosition || 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-30 font-sans">
                {/* Title */}
                <h4 className="text-white font-sans font-semibold text-xs md:text-sm truncate mb-2">
                  {item.title}
                </h4>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black hover:bg-neutral-200 transition-colors">
                    <Play size={12} fill="currentColor" className="translate-x-[0.5px]" />
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
                      const foundIdx = favs.findIndex(f => f.id === item.id);
                      if (foundIdx > -1) {
                        favs.splice(foundIdx, 1);
                      } else {
                        favs.push(item);
                      }
                      localStorage.setItem('netflix_favorites', JSON.stringify(favs));
                    }}
                    className="group/add relative cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full border border-neutral-500 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors text-sm font-semibold">
                      +
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/add:opacity-100 group-hover/add:pointer-events-auto transition-opacity duration-200 z-50 flex flex-col items-center">
                      <div className="bg-[#e6e6e6] text-[#141414] font-sans font-bold text-[9px] px-2.5 py-1.5 rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] whitespace-nowrap tracking-wide leading-none">
                        Add to My List
                      </div>
                      <div className="w-2.5 h-2.5 bg-[#e6e6e6] rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.15)]" />
                    </div>
                  </div>
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="group/like relative flex items-center justify-center w-7 h-7"
                  >
                    {/* Reaction Pill */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center w-7 h-7 group-hover/like:w-[96px] group-hover/like:bg-[#202020] group-hover/like:border-neutral-500 rounded-full border border-neutral-500 justify-center bg-transparent transition-all duration-300 px-0 group-hover/like:px-1.5 gap-0 group-hover/like:gap-1.5 text-white z-40">
                      
                      {/* Default visible ThumbsUp icon */}
                      <div className="flex items-center justify-center w-7 h-7 flex-shrink-0 group-hover/like:hidden">
                        <ThumbsUp size={11} fill="currentColor" />
                      </div>

                      {/* Expanded Buttons */}
                      
                      {/* Dislike */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
                          const filtered = favs.filter(f => f.id !== item.id);
                          localStorage.setItem('netflix_favorites', JSON.stringify(filtered));
                        }}
                        className="hidden group-hover/like:flex group/dislike relative items-center justify-center w-6 h-6 rounded-full hover:bg-white/15 transition-colors cursor-pointer text-white"
                      >
                        <ThumbsDown size={11} fill="currentColor" />
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/dislike:opacity-100 group-hover/dislike:pointer-events-auto transition-opacity duration-150 flex flex-col items-center">
                          <div className="bg-[#e6e6e6] text-[#141414] font-sans font-bold text-[9px] px-2.5 py-1.5 rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] whitespace-nowrap leading-none tracking-wide">
                            Not for me
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#e6e6e6] rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.15)]" />
                        </div>
                      </div>

                      {/* Like */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
                          if (!favs.some(f => f.id === item.id)) {
                            favs.push(item);
                            localStorage.setItem('netflix_favorites', JSON.stringify(favs));
                          }
                        }}
                        className="hidden group-hover/like:flex group/singlelike relative items-center justify-center w-6 h-6 rounded-full hover:bg-white/15 transition-colors cursor-pointer text-white"
                      >
                        <ThumbsUp size={11} fill="currentColor" />
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/singlelike:opacity-100 group-hover/singlelike:pointer-events-auto transition-opacity duration-150 flex flex-col items-center">
                          <div className="bg-[#e6e6e6] text-[#141414] font-sans font-bold text-[9px] px-2.5 py-1.5 rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] whitespace-nowrap leading-none tracking-wide">
                            Like it
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#e6e6e6] rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.15)]" />
                        </div>
                      </div>

                      {/* Love (Heart) */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
                          if (!favs.some(f => f.id === item.id)) {
                            favs.push(item);
                            localStorage.setItem('netflix_favorites', JSON.stringify(favs));
                          }
                        }}
                        className="hidden group-hover/like:flex group/love relative items-center justify-center w-6 h-6 rounded-full hover:bg-white/15 transition-colors cursor-pointer text-white"
                      >
                        <Heart size={11} fill="currentColor" />
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/love:opacity-100 group-hover/love:pointer-events-auto transition-opacity duration-150 flex flex-col items-center">
                          <div className="bg-[#e6e6e6] text-[#141414] font-sans font-bold text-[9px] px-2.5 py-1.5 rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.5)] whitespace-nowrap leading-none tracking-wide">
                            Love it
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#e6e6e6] rotate-45 -mt-1.5 shadow-[2px_2px_4px_rgba(0,0,0,0.15)]" />
                        </div>
                      </div>

                    </div>
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemClick(item);
                    }}
                    className="w-7 h-7 rounded-full border border-neutral-500 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors ml-auto cursor-pointer"
                  >
                    <ChevronDown size={11} />
                  </div>
                </div>

                {/* Rating Info Tags */}
                <div className="flex items-center gap-2 text-[10px] text-neutral-300 font-medium mb-1">
                  <span className="text-green-500 font-bold">
                    {Math.floor((item.vote_average || 7.5) * 10)}% Match
                  </span>
                  <span className="border border-neutral-500 px-1 rounded-[2px] text-[8px] uppercase tracking-wider scale-90 origin-left">
                    {item.media_type === 'tv' ? 'U/A 13+' : 'U/A 16+'}
                  </span>
                  <span className="border border-neutral-500 px-1 rounded-[2px] text-[8px] font-bold scale-90 origin-left">HD</span>
                </div>

                {/* Genre Bullets */}
                <div className="text-[9px] text-neutral-400 font-light truncate">
                  {item.genre_ids ? item.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(' • ') : (item.media_type === 'tv' ? 'TV Show' : 'Movie')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
