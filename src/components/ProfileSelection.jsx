import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

function ProfileCardItem({ profile, idx, onSelect, onSelectAalekh, setPopupContent, showCards, cardVariants }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  // Custom box shadow offsets based on mouse position
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Get mouse positions relative to the card's bounding box
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Center coordinates
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Normalize coordinates to [-1, 1] range
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    // Rotate up to 18 degrees
    const maxRotation = 18;
    setRotateY(percentX * maxRotation);
    setRotateX(-percentY * maxRotation);

    // Offset shadows up to 15px in opposite direction of tilt for realistic depth
    setShadowX(-percentX * 15);
    setShadowY(-percentY * 15);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setShadowX(0);
    setShadowY(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Determine shadow filter
  const glowColor = profile.isIshanvi ? 'rgba(229, 9, 20, 0.45)' : 'rgba(0, 180, 219, 0.35)';
  const shadowStyle = isHovered 
    ? `drop-shadow(${shadowX}px ${shadowY}px 25px ${glowColor})`
    : 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.5))';

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      className="flex flex-col items-center group cursor-pointer select-none"
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        localStorage.setItem('netflix_active_profile', JSON.stringify(profile));
        onSelect();
      }}
    >
      {/* 3D Continuous Floating / Hover Tilt Wrapper */}
      <motion.div
        animate={isHovered ? {
          rotateX: rotateX,
          rotateY: rotateY,
          z: 30,
          scale: 1.10
        } : (showCards ? {
          y: [0, -8, 0],
          rotateX: [0, 2.5, 0, -2.5, 0],
          rotateY: [0, -3.5, 0, 3.5, 0],
          rotateZ: [-1.5, 1.5, -1.5]
        } : {
          y: 0,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0
        })}
        transition={isHovered ? {
          type: "spring",
          stiffness: 300,
          damping: 20
        } : {
          repeat: Infinity,
          duration: 6.0 + idx * 0.8,
          ease: "easeInOut",
          delay: idx * 0.3
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Profile Avatar Card */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={`profile-card w-32 h-32 md:w-40 md:h-40 rounded-[18px] bg-gradient-to-br ${profile.colorClass} border-[3px] border-transparent ${profile.borderColor} transition-[border-color,border-radius] duration-300 flex items-center justify-center relative overflow-hidden`}
          style={{ 
            transformStyle: "preserve-3d",
            filter: shadowStyle
          }}
        >
          {/* Subtle Moving Gloss Sheen on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-0" />
          
          {/* 3D floating effect for the letter */}
          <motion.span
            animate={isHovered ? {
              scale: 1.15,
              z: 70, // push forward in 3D space!
              textShadow: "0 15px 25px rgba(0,0,0,0.45)"
            } : {
              scale: 1.0,
              z: 0,
              textShadow: "0 4px 10px rgba(0,0,0,0.3)"
            }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
            className="text-5xl md:text-6xl text-white font-bold select-none block z-10"
          >
            {profile.avatar}
          </motion.span>
        </motion.div>
      </motion.div>
      
      {/* Profile Name */}
      <motion.span
        animate={isHovered ? {
          color: "#e50914",
          y: -2
        } : {
          color: "#a3a3a3",
          y: 0
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="profile-name mt-6 text-neutral-400 text-lg md:text-xl font-light tracking-tight"
      >
        {profile.name}
      </motion.span>
    </motion.div>
  );
}

const HEARTS_CONFIG = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  duration: 4 + Math.random() * 4,
  size: Math.random() * 14 + 8
}));

export default function ProfileSelection({ onSelect, onSelectAalekh }) {
  const [popupContent, setPopupContent] = useState(null);
  const [showCards, setShowCards] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // delay of 1.8s: ensures title (0.95s) and subtitle (1.55s) are completely rendered and static
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Clear old layout configuration if it uses the wrong "N" avatar default
    let saved = localStorage.getItem('netflix_profiles');
    if (saved && saved.includes('"avatar":"N"')) {
      localStorage.removeItem('netflix_profiles');
      saved = null;
    }
    
    if (saved) {
      setProfiles(JSON.parse(saved));
    } else {
      const defaultProfiles = [
        { 
          name: 'Nigga Ishanvi', 
          avatar: 'I', 
          colorClass: 'from-[#e50914] to-[#f43f5e]', 
          hoverShadow: 'shadow-[0_0_35px_rgba(229,9,20,0.5)]',
          textColor: 'group-hover:text-[#e50914]',
          borderColor: 'group-hover:border-[#e50914]',
          isIshanvi: true
        }
      ];
      localStorage.setItem('netflix_profiles', JSON.stringify(defaultProfiles));
      setProfiles(defaultProfiles);
    }
  }, []);

  const handleAddProfile = () => {
    navigate('/register');
  };

  const titleText = "Who's Watching?";
  const subtitleText = "Welcome to Netflix";

  // Animation variants
  const titleContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0
      }
    }
  };

  const charVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.6, 
      y: 40,
      rotateX: -90, // Lie flat backwards
      z: -100
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      z: 0,
      transition: { 
        type: "spring",
        stiffness: 120,
        damping: 18 // Higher damping = smoother, no wobble
      }
    }
  };

  const subtitleContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 1.0
      }
    }
  };

  const subtitleCharVariants = {
    hidden: { 
      opacity: 0, 
      y: 12,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 150,
        damping: 20
      }
    }
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.22,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 160,
      scale: 0.5,
      rotateX: 65, // steep 3D tilt
      rotateY: -45, // horizontal spin
      rotateZ: -12, // slight rotation roll
      z: -450
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      z: 0,
      transition: { 
        type: "spring",
        damping: 20, // smooth elastic settling
        stiffness: 60
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, rotateX: 6, z: -80 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 1.15, 
        rotateX: -6, // tilt back
        z: 200, // zoom forward past the camera
        transition: { duration: 0.85, ease: SOVEREIGN_EASE } 
      }}
      transition={{ duration: 1.4, ease: SOVEREIGN_EASE }}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      className="fixed inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center z-40 overflow-hidden"
    >
      {/* Subtle dedicated glowing backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#e50914]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#e50914]/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Title Character-by-Character in clean Sans-Serif like Netflix */}
        <motion.h1 
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ perspective: 800, transformStyle: "preserve-3d" }}
          className="profile-title font-sans text-4xl md:text-5xl lg:text-6xl font-medium mb-3 text-white text-center tracking-normal leading-tight flex flex-wrap justify-center px-4"
        >
          {titleText.split(" ").map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <motion.span
                  key={cIdx}
                  variants={charVariants}
                  className="inline-block origin-bottom"
                >
                  {char}
                </motion.span>
              ))}
              {wIdx < titleText.split(" ").length - 1 && "\u00A0"}
            </span>
          ))}
        </motion.h1>

        {/* Animated Subtitle Character-by-Character */}
        <motion.p 
          variants={subtitleContainerVariants}
          initial="hidden"
          animate="visible"
          className="profile-subtitle text-neutral-400 text-xs font-mono mb-16 tracking-[0.15em] uppercase flex flex-wrap justify-center items-center gap-y-2 gap-x-1 opacity-80 px-4 text-center"
        >
          {subtitleText.split(" ").map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <motion.span
                  key={cIdx}
                  variants={subtitleCharVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              {wIdx < subtitleText.split(" ").length - 1 && "\u00A0"}
            </span>
          ))}
        </motion.p>

        {/* Animated Profile Cards Container with 3D Perspective */}
        <motion.div 
          variants={cardContainerVariants}
          initial="hidden"
          animate={showCards ? "visible" : "hidden"}
          style={{ perspective: 1200, transformStyle: "preserve-3d" }}
          className={`profile-card-container flex gap-6 md:gap-14 ${showCards ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {profiles.map((profile, idx) => (
            <ProfileCardItem
              key={profile.name}
              profile={profile}
              idx={idx}
              onSelect={onSelect}
              onSelectAalekh={onSelectAalekh}
              setPopupContent={setPopupContent}
              showCards={showCards}
              cardVariants={cardVariants}
            />
          ))}

          {/* Plus Add Button Card */}
          {profiles.length < 5 && (
            <motion.div
              variants={cardVariants}
              onClick={handleAddProfile}
              className="flex flex-col items-center group cursor-pointer select-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.95 }}
                className="profile-card w-32 h-32 md:w-40 md:h-40 rounded-[18px] border-[3px] border-dashed border-neutral-600 hover:border-white transition-[border-color,border-radius] duration-300 flex items-center justify-center relative overflow-hidden"
              >
                <span className="text-5xl text-neutral-600 group-hover:text-white font-light transition-colors z-10">+</span>
              </motion.div>
              <span className="profile-name mt-6 text-neutral-500 group-hover:text-white text-lg md:text-xl font-light tracking-tight transition-colors">
                Add Profile
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Animated Manage Profiles Button */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          animate={showCards ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ delay: 0.8, duration: 0.8, ease: SOVEREIGN_EASE }}
          className={`mt-20 ${showCards ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
           <motion.button 
             onClick={() => {
               setPopupContent({
                 title: "Manage Profiles?",
                 desc: <span className="text-lg block my-4 leading-relaxed text-white">Profile settings are managed through your account settings on the web.</span>,
                 sub: "Profile is ready!"
               });
             }}
             whileHover={{ scale: 1.06, transition: { duration: 0.2, ease: HOVER_EASE } }}
             whileTap={{ scale: 0.95 }}
             className="border border-white/10 font-mono text-xs text-neutral-400 px-6 py-2.5 hover:border-white/50 hover:text-white transition-colors tracking-[0.08em] uppercase rounded-[4px]"
           >
             Manage Profiles
           </motion.button>
        </motion.div>
      </div>

      {/* Custom Modal Popup for Dynamic Content */}
      <AnimatePresence>
        {popupContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: SOVEREIGN_EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 15, opacity: 0 }}
              transition={{ duration: 0.6, ease: SOVEREIGN_EASE }}
              className="bg-[#141414] border border-white/10 rounded-lg p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              {/* Red Glow Border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e50914] to-neutral-700 rounded-lg blur opacity-30 -z-10" />

              <div className="w-16 h-16 rounded-full bg-[#e50914]/10 flex items-center justify-center mx-auto mb-6 text-[#e50914]">
                <Heart size={32} fill="currentColor" />
              </div>
              
              <h3 className="text-2xl font-sans font-medium text-white mb-3 tracking-tight">{popupContent.title}</h3>
              <div className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6 font-sans">
                {popupContent.desc}
                <span className="text-xs text-neutral-400 mt-4 block font-mono uppercase tracking-wider">{popupContent.sub}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: HOVER_EASE } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPopupContent(null)}
                className="w-full bg-[#e50914] hover:bg-[#b20710] text-white font-mono text-xs tracking-[0.08em] uppercase font-bold py-3 px-6 rounded-md transition-colors shadow-lg"
              >
                Okay
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
