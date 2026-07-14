import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

export default function IntroAnimation({ onComplete, playAudio }) {
  const containerRef = useRef(null);
  const centerContainerRef = useRef(null);
  const streaksRef = useRef(null);

  const [animationStarted, setAnimationStarted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // References to the single SVG text letter element
  const textRef = useRef(null);
  const glowRef = useRef(null);

  // Generate 67 optimized vertical lines in a gorgeous Pinterest Rose Gold, Pink, Lavender & Champagne Gold palette
  const linesCount = 67;
  const lines = Array.from({ length: linesCount }).map((_, i) => {
    const colors = [
      '#fff0f3', // Blush White
      '#ffb3c6', // Pastel Pink
      '#ff7096', // Warm Rose
      '#ff85a2', // Rose Gold
      '#c77dff', // Soft Purple
      '#e8c547'  // Champagne Gold
    ];
    return {
      id: i,
      width: Math.random() * 3.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${(i / linesCount) * 100}%`
    };
  });

  useEffect(() => {
    playAudio()
      .then(() => {
        setAnimationStarted(true);
      })
      .catch((err) => {
        console.log('Autoplay blocked. Showing interactive overlay.', err);
        setShowOverlay(true);
      });
  }, [playAudio]);

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    playAudio()
      .then(() => {
        setShowOverlay(false);
        setAnimationStarted(true);
      })
      .catch((err) => {
        console.error('Audio play failed:', err);
        setShowOverlay(false);
        setAnimationStarted(true);
      });
  };

  useEffect(() => {
    if (!animationStarted) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 600);
      }
    });

    // 1. Reset text elements for smooth drawing of outline, then gradient fill
    gsap.set([textRef.current, glowRef.current], { 
      strokeDasharray: 600, 
      strokeDashoffset: 600,
      fill: "rgba(255, 179, 198, 0)",
      opacity: 1
    });

    // Reset streaks to be tiny in the center (scale: 0.05) and invisible initially
    gsap.set(streaksRef.current, { scale: 0.05, opacity: 0, transformOrigin: "51% 43%", z: 0 });
    gsap.set(centerContainerRef.current, { transformOrigin: "51% 43%", z: 0, scale: 1 });
    gsap.set(".netflix-streak-line", { scaleY: 0, opacity: 0 });

    // 2. Draw Outline of the single letter 'I'
    tl.to([textRef.current, glowRef.current], {
      strokeDashoffset: 0,
      duration: 0.95,
      ease: "power2.inOut"
    });

    // 3. Smoothly fade in fill color with Rose Gold gradient
    tl.to([textRef.current, glowRef.current], {
      fill: "url(#roseGoldGrad)",
      duration: 0.65,
      ease: "power2.inOut"
    }, "-=0.25");

    // Pause on fully filled, glowing giant 'I'
    tl.to({}, { duration: 0.45 });

    // 4. Cinematic Zoom fly-through: Zooming deep into the giant 'I' center
    // Instantly remove the heavy SVG glow filter on zoom start to stop rasterization lag
    tl.set(glowRef.current, { filter: "none" }, "fadeOutZoom");

    tl.to(centerContainerRef.current, {
      scale: 300,
      z: 980,
      duration: 1.8,
      ease: "power4.in",
      force3D: true
    }, "fadeOutZoom");

    tl.to([textRef.current, glowRef.current], {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "fadeOutZoom+=1.3");

    // 5. Reveal barcode lines growing out of the letters
    // Zoom/scale the entire container (which is 1 DOM operation) instead of scaling each line in 3D
    tl.to(streaksRef.current, { 
      scale: 2.2,
      z: 950,
      opacity: 1, 
      duration: 1.5,
      ease: "power2.out",
      force3D: true
    }, "fadeOutZoom+=1.1");

    tl.fromTo(".netflix-streak-line", 
      { 
        scaleY: 0, 
        opacity: 0
      },
      { 
        scaleY: 2.5, 
        opacity: () => Math.random() * 0.95 + 0.05, 
        duration: 1.5, 
        stagger: {
          each: 0.008,
          from: "center"
        },
        ease: "power2.out" 
      }, 
      "fadeOutZoom+=1.1"
    )

    // Staggered dissolve: lines dissolve in a wave from the center outward, fading out completely
    tl.to(".netflix-streak-line", {
      opacity: 0,
      scaleY: 0.1,
      duration: 0.4,
      stagger: {
        each: 0.004,
        from: "center"
      },
      ease: "power2.out"
    }, "fadeOutZoom+=2.2")
    
    .to(streaksRef.current, {
      opacity: 0,
      duration: 0.25
    }, "fadeOutZoom+=2.65")

    .to(containerRef.current, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out"
    });

  }, [animationStarted, onComplete]);

  return (
    <motion.div
      ref={containerRef}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: 'easeOut' } }}
      className="fixed inset-0 bg-black flex items-center justify-center z-[200] overflow-hidden"
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {/* Import Playfair Display Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
        
        @keyframes float-petal {
          0% {
            transform: translateY(100vh) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-20vh) rotate(360deg) translateX(50px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Interactive Unmute Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onClick={handleOverlayClick}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 pointer-events-auto cursor-pointer"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#ffb3c6]/10 blur-[80px] pointer-events-none animate-pulse" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-[#ffb3c6]/30 rounded-full blur-[1px]"
                  style={{
                    width: `${Math.random() * 8 + 6}px`,
                    height: `${Math.random() * 6 + 4}px`,
                    left: `${Math.random() * 100}%`,
                    bottom: `-${Math.random() * 20}vh`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `float-petal ${Math.random() * 10 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center text-center px-6 z-10"
            >
              <span className="font-sans text-xs tracking-[0.25em] uppercase text-neutral-500 mb-8 font-semibold">
                ishanvi
              </span>

              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className="relative w-28 h-28 rounded-full border border-[#ffb3c6]/30 flex items-center justify-center transition-colors duration-500 mb-8"
              >
                <div className="absolute inset-0 rounded-full border border-[#ffb3c6]/10 animate-ping opacity-60" style={{ animationDuration: '2s' }} />
                
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current text-[#ffb3c6] filter drop-shadow-[0_0_8px_rgba(255,179,198,0.5)] translate-x-[2px]">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
              
              <span className="font-sans text-lg md:text-xl font-light text-neutral-300 tracking-wide mb-3">
                "Tap to begin the journey"
              </span>
              <span className="font-sans text-[10px] tracking-[0.15em] text-neutral-500 font-semibold uppercase">
                🔊 Turn on sound for the best experience
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode/Ribbon Lines Container */}
      <div 
        ref={streaksRef}
        className="absolute inset-0 w-full h-full flex justify-between items-stretch pointer-events-none z-10"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className="netflix-streak-line"
            style={{
              width: `${line.width}px`,
              backgroundColor: line.color,
              transformOrigin: 'center',
              height: '100%',
              boxShadow: `0 0 8px ${line.color}`,
              opacity: 0,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      {/* Handwriting ISHANVI SVG */}
      <div 
        ref={centerContainerRef} 
        style={{ transformStyle: "preserve-3d", transformOrigin: "51% 43%", willChange: 'transform', backfaceVisibility: 'hidden' }}
        className="center-container relative w-[300px] h-[300px] flex items-center justify-center z-20"
      >
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full"
          style={{ overflow: 'visible', transformOrigin: "51% 43%" }}
        >
          <defs>
            {/* Gorgeous Pinterest Rose Gold & Lavender-Champagne Gradient */}
            <linearGradient id="roseGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff0f3" />
              <stop offset="25%" stopColor="#ffb3c6" />
              <stop offset="55%" stopColor="#ff7096" />
              <stop offset="80%" stopColor="#c77dff" />
              <stop offset="100%" stopColor="#e8c547" />
            </linearGradient>
            
            {/* Premium blur glow filter */}
            <filter id="glow-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Underlay glow text */}
          <text 
            ref={glowRef}
            x="100"
            y="140"
            textAnchor="middle"
            fontFamily="'Playfair Display', serif"
            fontStyle="italic"
            fontSize="180"
            fontWeight="600"
            fill="rgba(255, 179, 198, 0)"
            stroke="#ffb3c6"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset="600"
            filter="url(#glow-blur)"
            opacity="0.8"
          >
            I
          </text>

          {/* Main top outline/filled text */}
          <text 
            ref={textRef}
            x="100"
            y="140"
            textAnchor="middle"
            fontFamily="'Playfair Display', serif"
            fontStyle="italic"
            fontSize="180"
            fontWeight="600"
            fill="rgba(255, 179, 198, 0)"
            stroke="url(#roseGoldGrad)"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset="600"
            style={{ filter: "drop-shadow(0px 0px 5px rgba(255, 112, 150, 0.6))" }}
          >
            I
          </text>
        </svg>
      </div>
    </motion.div>
  );
}
