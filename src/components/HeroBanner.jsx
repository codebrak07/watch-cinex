import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function HeroBanner({ 
  title = "Stranger Things", 
  overview = "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.", 
  backdropPath = "/56v2Kj0qLGO2fh4wTTFbPBcrHj7.jpg", // Default Stranger Things backdrop
  onPlay, 
  onMoreInfo 
}) {
  const bgUrl = backdropPath.startsWith('http') 
    ? backdropPath 
    : `https://image.tmdb.org/t/p/original${backdropPath}`;

  return (
    <div className="hero-banner-container relative h-[70vh] md:h-[85vh] w-full">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={bgUrl} 
          alt={title} 
          className="w-full h-full object-cover opacity-80"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200";
          }}
        />
        {/* Netflix style gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="hero-content-wrapper relative z-20 h-full flex flex-col justify-end px-4 md:px-12 pb-32 md:pb-48">
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.4, ease: SOVEREIGN_EASE }}
          className="hero-title font-sans text-4xl md:text-7xl lg:text-8xl font-extrabold text-white mb-4 drop-shadow-2xl leading-[1.05] tracking-tight max-w-4xl"
        >
          {title}
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.4, ease: SOVEREIGN_EASE }}
          className="hero-desc text-sm md:text-base text-neutral-300 mb-8 max-w-xl drop-shadow-lg font-light leading-[1.6]"
        >
          {overview}
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1.4, ease: SOVEREIGN_EASE }}
          className="hero-buttons flex gap-4"
        >
          <motion.button 
            whileHover={{ scale: 1.05, transition: { duration: 0.2, ease: HOVER_EASE } }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 md:px-8 md:py-3.5 rounded-[4px] font-bold text-sm tracking-[0.08em] font-mono uppercase hover:bg-white/90 transition-colors shadow-lg cursor-pointer"
          >
            <Play fill="currentColor" size={18} />
            Play
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, transition: { duration: 0.2, ease: HOVER_EASE } }}
            whileTap={{ scale: 0.95 }}
            onClick={onMoreInfo}
            className="flex items-center gap-2 bg-[#6d6d6e]/50 text-white px-6 py-2.5 md:px-8 md:py-3.5 rounded-[4px] font-bold text-sm tracking-[0.08em] font-mono uppercase hover:bg-[#6d6d6e]/30 transition-colors backdrop-blur-sm border border-white/10 cursor-pointer"
          >
            <Info size={18} />
            More Info
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
