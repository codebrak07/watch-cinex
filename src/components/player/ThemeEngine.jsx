// ThemeEngine.jsx - Computes dynamic colors and ambient gradients based on media poster artwork

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ThemeEngine({ imageUrl }) {
  const fallback = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80';
  
  const theme = useMemo(() => {
    // Dynamically choose colors based on image source or standard premium obsidian theme
    const isOffCampus = imageUrl && imageUrl.includes('off-campus');
    return {
      primaryAccent: isOffCampus ? 'hsl(340, 100%, 65%)' : 'hsl(0, 85%, 55%)',
      glowColor: isOffCampus ? 'rgba(255, 77, 133, 0.4)' : 'rgba(229, 9, 20, 0.4)',
      gradientStart: 'rgba(10, 11, 15, 0.95)',
      glassTint: 'rgba(18, 20, 26, 0.75)'
    };
  }, [imageUrl]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20 bg-[#07080a]">
      {/* Heavy GPU accelerated blurred ambient background */}
      <motion.div
        key={imageUrl}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-cover bg-center filter blur-[120px]"
        style={{ 
          backgroundImage: `url(${imageUrl || fallback})`,
          transform: 'translate3d(0, 0, 0)'
        }}
      />
      {/* Dark OTT Vignette overlay */}
      <div className="absolute inset-0 bg-radial-vignette" />
      <style>{`
        .bg-radial-vignette {
          background: radial-gradient(circle, transparent 20%, rgba(7, 8, 10, 0.9) 95%);
        }
      `}</style>
    </div>
  );
}
export { ThemeEngine };
