import { motion, AnimatePresence } from 'framer-motion';
import HeroBanner from './HeroBanner';
import ContentRow from './ContentRow';
import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import VideoModal from './VideoModal';
import Navbar from './Navbar';
import * as THREE from 'three';
import { X, Heart, Sparkles, Play } from 'lucide-react';
import { useJam } from '../context/JamContext';
import MoviesPage from './MoviesPage';
import BrowseLanguages from './BrowseLanguages';
import AnimePage from './AnimePage';
import AnimeWatchModal from './animewatchmodels';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

function WebGLParticles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Helpers to create positions
    const createPositions = (count, areaX, areaY, areaZ) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * areaX;
        positions[i * 3 + 1] = (Math.random() - 0.5) * areaY;
        positions[i * 3 + 2] = (Math.random() - 0.5) * areaZ;
      }
      return positions;
    };

    // Helper to generate a basic dot texture
    const createDotTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(canvas);
    };

    // Helper to generate the Silver Bracelet Texture (Stacked Metallic Rings with diamond studs)
    const createBraceletTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 64, 64);

      // Outer soft glow
      const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      glow.addColorStop(0, 'rgba(230, 245, 255, 0.2)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 64, 64);

      // Silver/Chrome linear gradient for metallic strokes
      const silverGrad = ctx.createLinearGradient(12, 12, 52, 52);
      silverGrad.addColorStop(0, '#ffffff');
      silverGrad.addColorStop(0.2, '#c4cbd4');
      silverGrad.addColorStop(0.4, '#f1f5f9');
      silverGrad.addColorStop(0.6, '#8e96a2');
      silverGrad.addColorStop(0.8, '#e5e7eb');
      silverGrad.addColorStop(1, '#ffffff');

      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 4;

      // Outer Ring
      ctx.strokeStyle = silverGrad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(32, 32, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Stacked Ring (representing a multi-layer designer bracelet)
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(33, 31, 13.5, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Diamond studs on the silver bracelet
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';

      const drawStud = (cx, cy) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Star flare lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy);
        ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4);
        ctx.stroke();
      };

      drawStud(32 - 16, 32);  // Left
      drawStud(32 + 16, 32);  // Right
      drawStud(32, 32 - 16);  // Top
      drawStud(32, 32 + 16);  // Bottom

      return new THREE.CanvasTexture(canvas);
    };

    // Helper to generate a sweet filled pink heart texture
    const createHeartTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 32, 32);

      // Radial glow
      const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
      glow.addColorStop(0, 'rgba(255, 77, 133, 0.3)');
      glow.addColorStop(1, 'rgba(255, 77, 133, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 32, 32);

      ctx.fillStyle = '#ff4d85';
      ctx.beginPath();
      ctx.moveTo(16, 9);
      ctx.bezierCurveTo(16, 6, 11, 2, 7, 6);
      ctx.bezierCurveTo(3, 10, 3, 18, 16, 28);
      ctx.bezierCurveTo(29, 18, 29, 10, 25, 6);
      ctx.bezierCurveTo(21, 2, 16, 6, 16, 9);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    };

    // Helper to generate a 4-pointed sparkle diamond star
    const createSparkleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 32, 32);

      const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 32, 32);

      const cx = 16;
      const cy = 16;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13);
      ctx.quadraticCurveTo(cx, cy, cx + 13, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + 13);
      ctx.quadraticCurveTo(cx, cy, cx - 13, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - 13);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    };

    // --- Instantiate Textures & Materials ---
    const dotTex = createDotTexture();
    const braceletTex = createBraceletTexture();
    const heartTex = createHeartTexture();
    const sparkleTex = createSparkleTexture();

    // 1. Stars (Background starfield)
    const starCount = 280;
    const starGeo = new THREE.BufferGeometry();
    const starPos = createPositions(starCount, 22, 22, 15);
    const starColors = new Float32Array(starCount * 3);
    const colorChoices = [
      new THREE.Color('#ff4d85'), // pink
      new THREE.Color('#ffd700'), // gold
      new THREE.Color('#ffffff'), // white
      new THREE.Color('#38bdf8'), // sky blue
    ];
    for (let i = 0; i < starCount; i++) {
      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      map: dotTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // 2. Silver Bracelets (Floating classy bracelets!)
    const braceletCount = 14;
    const braceletGeo = new THREE.BufferGeometry();
    const braceletPos = createPositions(braceletCount, 18, 16, 10);
    braceletGeo.setAttribute('position', new THREE.BufferAttribute(braceletPos, 3));
    const braceletMat = new THREE.PointsMaterial({
      size: 0.85,
      map: braceletTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const braceletParticles = new THREE.Points(braceletGeo, braceletMat);
    scene.add(braceletParticles);

    // 3. Heart Particles (Cute floating pink hearts!)
    const heartCount = 16;
    const heartGeo = new THREE.BufferGeometry();
    const heartPos = createPositions(heartCount, 20, 18, 12);
    heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPos, 3));
    const heartMat = new THREE.PointsMaterial({
      size: 0.52,
      map: heartTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const heartParticles = new THREE.Points(heartGeo, heartMat);
    scene.add(heartParticles);

    // 4. Sparkles / Diamonds (Shimmering white sparkles!)
    const sparkleCount = 18;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = createPositions(sparkleCount, 20, 18, 12);
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      size: 0.45,
      map: sparkleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sparkleParticles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkleParticles);

    // Mouse interactivity
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 3;
    };
    window.addEventListener('mousemove', onMouseMove);

    let animId;
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Drift each particle layer at different speeds & directions for multi-layer 3D depth
      starParticles.rotation.y = elapsed * 0.04;
      starParticles.rotation.x = elapsed * 0.015;

      braceletParticles.rotation.y = elapsed * 0.08;
      braceletParticles.rotation.x = elapsed * 0.035;
      braceletParticles.rotation.z = elapsed * 0.01;

      heartParticles.rotation.y = elapsed * -0.06;
      heartParticles.rotation.x = elapsed * 0.025;

      sparkleParticles.rotation.y = elapsed * 0.05;
      sparkleParticles.rotation.x = elapsed * -0.03;

      // Parallax camera response to mouse movement
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      dotTex.dispose();

      braceletGeo.dispose();
      braceletMat.dispose();
      braceletTex.dispose();

      heartGeo.dispose();
      heartMat.dispose();
      heartTex.dispose();

      sparkleGeo.dispose();
      sparkleMat.dispose();
      sparkleTex.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
}

function MoreInfoPage({ onClose }) {
  const paragraphs = [
    "She's the kind of person who remembers what you said three conversations ago. Who checks on you before you even realize you needed it. Who shows up — not just when it's easy, but especially when it isn't.",
    "Sunshine isn't even the right word for her. Sunshine is passive. She's active. She pulls you out of your head, makes you laugh when you didn't think you could, and somehow always knows exactly what to say.",
    "She is motivating without being pushy. Honest without being harsh. Soft without being fragile. Strong without even knowing it.",
    "She's my best friend since we were kids,",
    "Charming? Obviously. Cute? Criminally. Annoying? Nevahhhh. Worth it? Every single time.",
    "There is nobody like her. There will never be anybody like her.",
    "This one's for you, Maata Shree. Happy birthday 🩷 ."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.78, rotateY: 35, z: 500 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
      exit={{
        opacity: 0,
        scale: 0.78,
        rotateY: 35,
        z: 500,
        transition: { duration: 0.75, ease: SOVEREIGN_EASE }
      }}
      transition={{ duration: 1.2, ease: SOVEREIGN_EASE }}
      style={{ transformStyle: "preserve-3d" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-start md:justify-center bg-[#09090b]/95 py-6 px-4 md:p-8 overflow-y-auto select-none"
    >
      <WebGLParticles />

      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-black via-zinc-950 to-neutral-900 pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/4 w-[60%] h-[50%] rounded-full bg-[#ff4d85]/8 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full bg-[#ffd700]/5 blur-[160px] pointer-events-none" />

      {/* Main Container - Cinema Box */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 1.0, ease: SOVEREIGN_EASE }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="more-info-card relative max-w-5xl w-full bg-[#0d0d0f]/85 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col my-auto"
      >
        {/* Glow border overlay */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff4d85]/30 via-[#ffd700]/20 to-[#38bdf8]/30 rounded-2xl blur-md opacity-30 -z-10" />

        {/* Hero Backdrop Sub-layer inside card */}
        <div className="more-info-banner absolute top-0 left-0 w-full h-[160px] md:h-[280px] -z-10 overflow-hidden">
          <img
            src="/assets/hero-bg.jpg"
            alt="Sugandh Cover"
            className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
          />
          {/* Gradients blending cover image into the card */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0f] via-transparent to-[#0d0d0f]" />
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white p-2.5 rounded-full bg-white/5 border border-white/10 cursor-pointer z-50 transition-colors shadow-lg"
        >
          <X size={20} />
        </motion.button>

        {/* Header Block */}
        <div className="px-4 pt-10 pb-4 md:px-12 md:pt-16 flex flex-col justify-end min-h-[140px] md:min-h-[220px] relative z-20">
          <span className="text-[10px] md:text-xs uppercase font-mono tracking-[0.2em] text-[#ff4d85] font-semibold">Special Presentation</span>
          <h2 className="text-3xl md:text-6xl font-serif text-white font-light tracking-tight mt-1 md:mt-2 leading-none">
            Sugandh
          </h2>

          <div className="flex flex-wrap gap-1.5 md:gap-2.5 mt-3 md:mt-4">
            <span className="bg-[#ff4d85]/10 border border-[#ff4d85]/20 text-[#ff4d85] text-[10px] md:text-xs font-mono px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-md tracking-wider">Mah Sunshine 🌻</span>
            <span className="bg-[#ffd700]/10 border border-[#ffd700]/20 text-[#ffd700] text-[10px] md:text-xs font-mono px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-md tracking-wider">Mah Maata Shree 🫶</span>
            <span className="bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-[10px] md:text-xs font-mono px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-md tracking-wider">Mah Hermoine 🩷</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Body Content Split */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-4 py-6 md:px-12 md:py-10 relative z-20">

          {/* Left Block (62% width): About Details */}
          <div className="w-full md:w-[62%] flex flex-col justify-start">
            <h3 className="text-xs uppercase font-mono tracking-widest text-[#ffd700] mb-5 flex items-center gap-2">
              <Sparkles size={12} className="animate-pulse" /> About the Star
            </h3>

            <div className="space-y-4 pr-2 text-justify">
              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.8, ease: SOVEREIGN_EASE }}
                  className={`text-neutral-300 font-light text-sm md:text-[15px] leading-relaxed tracking-wide ${para.includes("This one's for you")
                    ? "text-[#ff4d85] font-normal italic pt-3 border-t border-white/5 text-left flex items-center gap-1 text-[16px]"
                    : ""
                    }`}
                >
                  {para}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Right Block (38% width): Meta Info cards */}
          <div className="w-full md:w-[38%] flex flex-col gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
            <h3 className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-2">Show Information</h3>

            <div className="more-info-grid grid grid-cols-1 gap-3.5">

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col gap-1 transition-all hover:bg-white/[0.04] hover:border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Rating</span>
                <span className="text-sm font-sans text-neutral-200 font-medium">✨ Perfect · All audiences</span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col gap-1 transition-all hover:bg-white/[0.04] hover:border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Starring</span>
                <span className="text-sm font-sans text-neutral-200 font-medium">The one and only Sugandh</span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col gap-1 transition-all hover:bg-white/[0.04] hover:border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Also known as</span>
                <span className="text-sm font-sans text-neutral-200 font-medium leading-relaxed">Maata Shree · Perfect · My Sunshine · My Person</span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col gap-1 transition-all hover:bg-white/[0.04] hover:border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Runtime</span>
                <span className="text-sm font-sans text-neutral-200 font-medium">A lifetime of friendship and counting</span>
              </div>

            </div>

            <div className="mt-auto pt-6 flex items-center gap-2.5 text-[10px] font-mono tracking-[0.15em] text-[#ff4d85] uppercase font-semibold">
              <Heart size={12} fill="#ff4d85" stroke="#ff4d85" className="animate-pulse" /> Always Your Best Friend
            </div>

          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}

export default function NetflixHome({ onSwitchProfile, onLogout, onHomeClick }) {
  const location = useLocation();
  const { selectedMedia, setSelectedMedia } = useJam() || {};
  const [activeAnimeMedia, setActiveAnimeMedia] = useState(null);
  const [categories, setCategories] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);

  // TMDB search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [languagesList, setLanguagesList] = useState([]);

  useEffect(() => {
    if (selectedSearchResult) {
      const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
      const found = favs.some(f => f.id === selectedSearchResult.id);
      setIsFavorite(found);
    }
  }, [selectedSearchResult]);

  useEffect(() => {
    if (selectedMedia) {
      const history = JSON.parse(localStorage.getItem('netflix_continue_watching') || '[]');
      const filtered = history.filter(item => item.id !== selectedMedia.tmdbId && item.id !== selectedMedia.id);

      const newHistoryItem = {
        id: selectedMedia.tmdbId || selectedMedia.id || 99999,
        title: selectedMedia.title,
        thumb: selectedMedia.thumb || (selectedMedia.backdropPath ? `https://image.tmdb.org/t/p/w500${selectedMedia.backdropPath}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500'),
        media_type: selectedMedia.mediaType || 'movie',
        progress: Math.floor(Math.random() * 40) + 30
      };

      const updated = [newHistoryItem, ...filtered].slice(0, 10);
      localStorage.setItem('netflix_continue_watching', JSON.stringify(updated));
    }
  }, [selectedMedia]);

  const toggleFavorite = () => {
    if (!selectedSearchResult) return;
    const favs = JSON.parse(localStorage.getItem('netflix_favorites') || '[]');
    const foundIdx = favs.findIndex(f => f.id === selectedSearchResult.id);
    if (foundIdx > -1) {
      favs.splice(foundIdx, 1);
      setIsFavorite(false);
    } else {
      favs.push({
        id: selectedSearchResult.id,
        title: selectedSearchResult.title || selectedSearchResult.name,
        thumb: selectedSearchResult.poster_path
          ? `https://image.tmdb.org/t/p/w500${selectedSearchResult.poster_path}`
          : `https://image.tmdb.org/t/p/w500${selectedSearchResult.backdrop_path}`,
        poster_path: selectedSearchResult.poster_path,
        backdrop_path: selectedSearchResult.backdrop_path,
        media_type: selectedSearchResult.media_type,
        overview: selectedSearchResult.overview,
        vote_average: selectedSearchResult.vote_average,
        release_date: selectedSearchResult.release_date,
        first_air_date: selectedSearchResult.first_air_date
      });
      setIsFavorite(true);
    }
    localStorage.setItem('netflix_favorites', JSON.stringify(favs));
  };

  useEffect(() => {
    const cachedData = sessionStorage.getItem('netflix_home_data_v2');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.categories && parsed.categories.length >= 6) {
          setCategories(parsed.categories);
          setHeroMovie(parsed.heroMovie || null);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached home data:", e);
      }
    }

    const fetchHomeData = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const [
          trendingRes,
          kdramaRes,
          kdramaHindiRes,
          popularRes,
          topTvRes,
          romanticKdramaRes,
          animeRes,
          netflixMoviesRes,
          netflixTvRes
        ] = await Promise.all([
          fetch(`/api/tmdb/trending/all/day?api_key=${apiKey}`),
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_original_language=ko&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_original_language=ko&sort_by=popularity.desc&page=2`),
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&region=IN&sort_by=popularity.desc`),
          fetch(`/api/tmdb/tv/top_rated?api_key=${apiKey}`),
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_original_language=ko&with_genres=10749&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&vote_count.gte=50&include_adult=false`),
          fetch(`/api/tmdb/discover/movie?api_key=${apiKey}&with_networks=213&sort_by=popularity.desc`),
          fetch(`/api/tmdb/discover/tv?api_key=${apiKey}&with_networks=213&sort_by=popularity.desc`)
        ]);

        const trendingData = await trendingRes.json();
        const kdramaData = await kdramaRes.json();
        const kdramaHindiData = await kdramaHindiRes.json();
        const popularData = await popularRes.json();
        const topTvData = await topTvRes.json();
        const romanticKdramaData = await romanticKdramaRes.json();
        const animeData = await animeRes.json();
        const netflixMoviesData = await netflixMoviesRes.json();
        const netflixTvData = await netflixTvRes.json();

        // Global NSFW & explicit anime keywords blacklist
        const NSFW_KEYWORDS = [
          'hentai', 'ecchi', 'erotic', 'lust', 'passion', 'ecstasy', 'naked', 'sex', 
          'monk', 'souryo', 'shikiyoku', 'overflow', 'redo of healer', 'valkyrie drive', 
          'doraemon', 'cartoon', 'pleasure', 'fetish', 'incest', 'harem',
          'boobs', 'oppai', 'nude', 'nsfw', 'sensual', 'yosuga', 'school days',
          'prison school', 'highschool dxd', 'shinmai maou', 'masou gakuen',
          'peter grill', 'ishuzoku', 'interspecies', 'seikatsu', 'succubus',
          'kaifuku', 'isekai meikyuu', 'gushing over magical', 'domestic girlfriend', 'boku no pico'
        ];

        const cleanResults = (results) => {
          return (results || []).filter(item => {
            if (item.adult) return false;
            if (item.genre_ids && item.genre_ids.includes(16)) return false;
            if (item.genre_ids && (item.genre_ids.includes(10764) || item.genre_ids.includes(10767) || item.genre_ids.includes(10763) || item.genre_ids.includes(10766))) return false;
            const title = (item.title || item.name || item.original_name || item.original_title || '').toLowerCase();
            const overview = (item.overview || '').toLowerCase();
            if (NSFW_KEYWORDS.some(kw => title.includes(kw) || overview.includes(` ${kw} `))) return false;
            return true;
          });
        };

        const trendingItems = cleanResults(trendingData.results).map(item => ({
          ...item,
          type: 'video',
          title: item.title || item.name,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: item.media_type || 'movie'
        }));

        const kdramaEnglishItems = cleanResults(kdramaData.results).slice(0, 15).map(item => ({
          ...item,
          type: 'video',
          title: item.name || item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'tv'
        }));

        const kdramaHindiItems = cleanResults(kdramaHindiData.results).slice(0, 15).map(item => ({
          ...item,
          type: 'video',
          title: item.name || item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'tv'
        }));

        const top10IndiaItems = cleanResults(popularData.results).slice(0, 10).map(item => ({
          ...item,
          type: 'video',
          title: item.title || item.name,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'movie'
        }));

        const awardTvItems = cleanResults(topTvData.results).map(item => ({
          ...item,
          type: 'video',
          title: item.name || item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'tv'
        }));

        const romanticKdramaItems = cleanResults(romanticKdramaData.results).slice(0, 15).map(item => ({
          ...item,
          type: 'video',
          title: item.name || item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'tv'
        }));

        const animeItems = (animeData.results || []).filter(item => {
          if (item.adult) return false;
          const title = (item.name || item.title || '').toLowerCase();
          if (
            title.includes('doraemon') ||
            title.includes('overflow') ||
            title.includes('hentai') ||
            title.includes('cartoon') ||
            title.includes('souryo') ||
            title.includes('shikiyoku') ||
            title.includes('ecchi') ||
            title.includes('isekai meikyuu') ||
            title.includes('kaifuku') ||
            title.includes('redo of healer') ||
            title.includes('yosuga no sora')
          ) return false;
          return true;
        }).slice(0, 15).map(item => ({
          ...item,
          type: 'video',
          title: item.name || item.title,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`,
          media_type: 'tv',
          isTvSeries: true
        }));

        const netflixExclusivesItems = [
          ...cleanResults(netflixMoviesData.results).map(item => ({ ...item, media_type: 'movie' })),
          ...cleanResults(netflixTvData.results).map(item => ({ ...item, media_type: 'tv' }))
        ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 15).map(item => ({
          ...item,
          type: 'video',
          title: item.title || item.name,
          thumb: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`
        }));

        const nextCategories = [
          { title: "Today's Top Picks for You", items: trendingItems },
          { title: "Popular Anime Series", items: animeItems },
          { title: "Romantic K-dramas", items: romanticKdramaItems },
          { title: "Only on Netflix", items: netflixExclusivesItems },
          { title: "K-dramas Dubbed in English", items: kdramaEnglishItems },
          { title: "K-dramas Dubbed in Hindi", items: kdramaHindiItems },
          { title: "Top 10 Movies in India Today", items: top10IndiaItems, isTop10: true },
          { title: "Award-Winning TV Shows", items: awardTvItems }
        ];

        let nextHeroMovie = null;
        if (trendingItems.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(trendingItems.length, 10));
          nextHeroMovie = trendingItems[randomIdx];
        }

        setCategories(nextCategories);
        setHeroMovie(nextHeroMovie);

        sessionStorage.setItem('netflix_home_data_v2', JSON.stringify({
          categories: nextCategories,
          heroMovie: nextHeroMovie
        }));

      } catch (err) {
        console.error("Failed to fetch home data from TMDB:", err);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearchActive(true);

    // If query matches "off campus", bypass TMDB search and look up via Watchmode API
    if (query.toLowerCase().includes('off campus')) {
      setIsSearching(true);
      setSearchError(null);
      try {
        const watchmodeKey = 'QR6FoVmsrRYNf3jcEph0eTdiF8AvG2tQlxzOqefK';
        // 1. Search Watchmode by name
        const searchRes = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${watchmodeKey}&search_field=name&search_value=${encodeURIComponent('Off Campus')}`);
        if (!searchRes.ok) throw new Error("Watchmode search failed");
        const searchData = await searchRes.json();

        // Pick first TV series match
        const match = (searchData.title_results || searchData.results || []).find(r => r.type === 'tv_series' || r.type === 'tv') || (searchData.title_results || searchData.results || [])[0];

        if (match) {
          // 2. Fetch sources for this title ID
          const sourcesRes = await fetch(`https://api.watchmode.com/v1/title/${match.id}/sources/?apiKey=${watchmodeKey}`);
          if (!sourcesRes.ok) throw new Error("Watchmode sources failed");
          const sourcesData = await sourcesRes.json();

          // Find any valid web streaming URL
          const validSource = sourcesData.find(s => s.web_url);
          const playUrl = validSource ? validSource.web_url : 'https://streamimdb.ru/tv/71xh8-off-campus/season/1/episode/1';

          setSelectedMedia({
            type: 'video',
            url: `https://vidsrc.sbs/embed/tv/273240/1/1`,
            title: match.name || 'Off Campus'
          });
          setIsSearchActive(false);
          return;
        }
      } catch (err) {
        console.error("Watchmode fetch error:", err);
      }

      // Fallback if Watchmode lookup fails
      setSelectedMedia({
        type: 'video',
        url: 'https://vidsrc.sbs/embed/tv/273240/1/1',
        title: 'Off Campus'
      });
      setIsSearchActive(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const isAnimeRoute = location.pathname === '/anime';
      const searchEndpoint = isAnimeRoute
        ? `/api/tmdb/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        : `/api/tmdb/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

      const res = await fetch(searchEndpoint);
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();

      const NSFW_SEARCH_BLACKLIST = [
        'hentai', 'ecchi', 'erotic', 'lust', 'passion', 'ecstasy', 'naked', 'sex', 
        'monk', 'souryo', 'shikiyoku', 'overflow', 'redo of healer', 'valkyrie drive', 
        'doraemon', 'cartoon', 'pleasure', 'fetish', 'incest', 'harem',
        'boobs', 'oppai', 'nude', 'nsfw', 'sensual', 'yosuga', 'school days',
        'prison school', 'highschool dxd', 'shinmai maou', 'masou gakuen',
        'peter grill', 'ishuzoku', 'interspecies', 'seikatsu', 'succubus',
        'kaifuku', 'isekai meikyuu', 'gushing over magical', 'domestic girlfriend', 'boku no pico'
      ];

      const filtered = (data.results || []).filter(
        (item) => {
          const mediaType = isAnimeRoute ? 'tv' : item.media_type;
          if (mediaType !== 'movie' && mediaType !== 'tv') return false;
          if (item.adult) return false;
          // When on /anime route, ensure anime results (genre 16 animation or ja original language)
          if (isAnimeRoute) {
            const isAnime = (item.genre_ids && item.genre_ids.includes(16)) || item.original_language === 'ja';
            if (!isAnime) return false;
          }
          // TV Genre 10764: Reality, 10767: Talk, 10763: News, 10766: Soap
          if (item.genre_ids && (item.genre_ids.includes(10764) || item.genre_ids.includes(10767) || item.genre_ids.includes(10763) || item.genre_ids.includes(10766))) return false;
          const title = (item.title || item.name || item.original_name || item.original_title || '').toLowerCase();
          const overview = (item.overview || '').toLowerCase();
          if (NSFW_SEARCH_BLACKLIST.some(kw => title.includes(kw) || overview.includes(` ${kw} `))) return false;
          return true;
        }
      ).map(item => ({
        ...item,
        media_type: isAnimeRoute ? 'tv' : (item.media_type || 'movie'),
        isAnime: isAnimeRoute || (item.genre_ids && item.genre_ids.includes(16) && item.original_language === 'ja')
      }));
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
      setSearchError("Failed to fetch search results. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchClear = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const handleSelectSearchResult = async (item) => {
    // Open modal immediately with base item details and set loading status
    setSelectedSearchResult({
      ...item,
      isLoadingNigga: true,
      imdb_id: null,
      cast: []
    });
    
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;

      // Parallel API calls with 2s delay to show the "asking" state
      const [detailRes, externalRes, creditsRes] = await Promise.all([
        fetch(`/api/tmdb/${item.media_type}/${item.id}?api_key=${apiKey}&language=en-US`),
        fetch(`/api/tmdb/${item.media_type}/${item.id}/external_ids?api_key=${apiKey}`),
        fetch(`/api/tmdb/${item.media_type}/${item.id}/credits?api_key=${apiKey}`),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      const detailData = detailRes.ok ? await detailRes.json() : {};
      const externalData = externalRes.ok ? await externalRes.json() : {};
      const creditsData = creditsRes.ok ? await creditsRes.json() : {};

      // Gracefully handle belongs_to_collection if present
      let collectionData = null;
      if (detailData.belongs_to_collection && detailData.belongs_to_collection.id) {
        try {
          const colRes = await fetch(`/api/tmdb/collection/${detailData.belongs_to_collection.id}?api_key=${apiKey}&language=en-US`);
          if (colRes.ok) {
            collectionData = await colRes.json();
          } else {
            console.warn(`[TMDB Collection Warning] Collection ${detailData.belongs_to_collection.id} not found (${colRes.status}). Ignoring collection.`);
          }
        } catch (colErr) {
          console.warn("[TMDB Collection Warning] Failed to fetch collection:", colErr);
        }
      }

      setSelectedSearchResult({
        ...item,
        ...detailData,
        collection: collectionData,
        imdb_id: externalData.imdb_id || detailData.imdb_id,
        cast: (creditsData.cast || []).slice(0, 8),
        isLoadingNigga: false,
        niggaAnswered: true
      });
    } catch (err) {
      console.warn("Error fetching details:", err);
      setSelectedSearchResult({
        ...item,
        imdb_id: null,
        cast: [],
        isLoadingNigga: false,
        niggaAnswered: false
      });
    }
  };

  const continueWatchingItems = JSON.parse(localStorage.getItem('netflix_continue_watching') || '[]');
  const displayCategories = continueWatchingItems.length > 0
    ? [{ title: "Continue Watching for ishanvi", items: continueWatchingItems, isContinueWatching: true }, ...categories]
    : categories;

  return (
    <>
      <Navbar
        onSwitchProfile={onSwitchProfile}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
        onSearch={handleSearch}
        onSearchClear={handleSearchClear}
      />
      <div style={{ perspective: 1500, overflow: 'hidden' }} className="w-full min-h-screen relative bg-[#141414]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key="home-content"
            initial={{ opacity: 0, scale: 0.88, rotateX: 6, z: -200 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
            exit={{
              opacity: 0,
              scale: 0.82,
              rotateY: -35,
              z: -500,
              transition: { duration: 0.85, ease: SOVEREIGN_EASE }
            }}
            transition={{ duration: 1.4, ease: SOVEREIGN_EASE }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full min-h-screen pb-20 overflow-x-hidden relative"
          >

            {isSearchActive ? (
              <div className="relative z-20 pt-28 px-4 md:px-12 min-h-[80vh]">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-sans font-semibold text-neutral-200">
                    Search Results for <span className="text-[#e50914] font-semibold">"{searchQuery}"</span>
                  </h2>
                  <button
                    onClick={handleSearchClear}
                    className="text-neutral-400 hover:text-white px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase cursor-pointer transition-colors"
                  >
                    Clear Search
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 border-2 border-[#ff4d85] border-t-transparent rounded-full animate-spin" />
                    <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">Searching TMDB...</p>
                  </div>
                ) : searchError ? (
                  <div className="text-center py-20 text-red-400 font-medium">
                    {searchError}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-20 text-neutral-400">
                    No movies or TV shows found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 pb-20">
                    {searchResults.map((item, index) => {
                      const title = item.title || item.name;
                      const posterUrl = item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500';
                      const year = item.release_date
                        ? item.release_date.slice(0, 4)
                        : (item.first_air_date ? item.first_air_date.slice(0, 4) : '');

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.5, ease: SOVEREIGN_EASE }}
                          whileHover={{
                            scale: 1.05,
                            y: -5,
                            transition: { duration: 0.2 }
                          }}
                          onClick={() => handleSelectSearchResult(item)}
                          className="bg-[#1f1f23]/60 border border-white/5 rounded-lg overflow-hidden cursor-pointer group hover:border-white/10 transition-colors shadow-lg hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                        >
                          <div className="aspect-[2/3] relative overflow-hidden bg-zinc-900">
                            <img
                              src={posterUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500";
                              }}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] font-mono font-semibold px-2 py-0.5 rounded text-neutral-300 uppercase tracking-wider">
                              {item.media_type}
                            </div>
                          </div>
                          <div className="p-3 flex flex-col gap-1">
                            <h4 className="text-neutral-200 font-sans text-xs md:text-sm font-semibold truncate group-hover:text-[#ff4d85] transition-colors">
                              {title}
                            </h4>
                            <span className="text-[10px] font-mono text-neutral-500">
                              {year} {item.vote_average ? `· ⭐ ${item.vote_average.toFixed(1)}` : ''}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : location.pathname === '/languages' ? (
              <BrowseLanguages onItemClick={handleSelectSearchResult} />
            ) : location.pathname === '/movies' ? (
              <MoviesPage onItemClick={handleSelectSearchResult} setSelectedMedia={setSelectedMedia} />
            ) : location.pathname === '/anime' ? (
              <AnimePage onItemClick={handleSelectSearchResult} setSelectedMedia={setSelectedMedia} />
            ) : (
              <>
                <HeroBanner
                  title={heroMovie ? (heroMovie.title || heroMovie.name) : undefined}
                  overview={heroMovie ? heroMovie.overview : undefined}
                  backdropPath={heroMovie ? (heroMovie.backdrop_path || heroMovie.poster_path) : undefined}
                  onPlay={() => {
                    if (heroMovie) {
                      const streamUrl = `https://streamimdb.ru/embed/movie/${heroMovie.id}?tmdb_id=${heroMovie.id}`;
                      setSelectedMedia({
                        type: 'video',
                        url: streamUrl,
                        title: heroMovie.title || heroMovie.name,
                        tmdbId: heroMovie.id,
                        mediaType: 'movie'
                      });
                    }
                  }}
                  onMoreInfo={() => {
                    if (heroMovie) {
                      handleSelectSearchResult(heroMovie);
                    }
                  }}
                />

                <div className="relative z-20 mt-4 md:-mt-32 px-4 md:px-12 space-y-12">
                  {displayCategories.map((cat, i) => {
                    if (cat.isTop10) {
                      return (
                        <div key={i} className="flex flex-col gap-2 md:gap-4 z-20 relative">
                          <h3 className="row-title font-sans text-lg md:text-xl font-bold text-[#e5e5e5] px-2 md:px-0 tracking-normal leading-tight">
                            {cat.title}
                          </h3>
                          <div className="relative">
                            <div
                              className="flex gap-16 overflow-x-auto px-12 pb-8 pt-4 scrollbar-hide snap-x"
                              style={{ scrollbarWidth: 'none' }}
                            >
                              {cat.items.map((item, index) => (
                                <motion.div
                                  key={item.id}
                                  whileHover={{
                                    scale: 1.15,
                                    zIndex: 50,
                                    y: -10,
                                    transition: { duration: 0.25, ease: HOVER_EASE }
                                  }}
                                  onClick={() => handleSelectSearchResult(item)}
                                  className={`row-card group relative flex-none w-[110px] md:w-[170px] aspect-[2/3] rounded-md overflow-visible cursor-pointer snap-start ${index === 0 ? 'origin-left' : index === cat.items.length - 1 ? 'origin-right' : 'origin-center'
                                    }`}
                                >
                                  {/* Giant number behind poster */}
                                  <div
                                    className="absolute -left-12 bottom-[-10px] text-[8rem] md:text-[12rem] font-sans font-black text-black select-none z-0 leading-none select-none pointer-events-none"
                                    style={{
                                      WebkitTextStroke: "3px #595959",
                                      fontFamily: "'Impact', sans-serif"
                                    }}
                                  >
                                    {index + 1}
                                  </div>
                                  <img
                                    src={item.thumb}
                                    alt={item.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover rounded-md shadow-2xl relative z-10"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=300";
                                    }}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (cat.isContinueWatching) {
                      return (
                        <div key={i} className="flex flex-col gap-2 md:gap-4 z-20 relative">
                          <h3 className="row-title font-sans text-lg md:text-xl font-bold text-[#e5e5e5] px-2 md:px-0 tracking-normal leading-tight">
                            {cat.title}
                          </h3>
                          <div className="relative">
                            <div
                              className="flex gap-4 overflow-x-auto px-2 md:px-0 pb-8 pt-4 scrollbar-hide snap-x"
                              style={{ scrollbarWidth: 'none' }}
                            >
                              {cat.items.map((item, index) => (
                                <motion.div
                                  key={item.id}
                                  whileHover={{
                                    scale: 1.05,
                                    y: -5,
                                    transition: { duration: 0.25, ease: HOVER_EASE }
                                  }}
                                  onClick={() => handleSelectSearchResult(item)}
                                  className={`row-card group relative flex-none w-[160px] md:w-[260px] aspect-video bg-[#1f1f23] rounded-md overflow-hidden cursor-pointer snap-start border border-white/5 ${index === 0 ? 'origin-left' : index === cat.items.length - 1 ? 'origin-right' : 'origin-center'
                                    }`}
                                >
                                  <img
                                    src={item.thumb}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400";
                                    }}
                                  />
                                  {/* Red progress bar at the bottom */}
                                  <div className="absolute bottom-0 left-0 w-full h-[4px] bg-neutral-700 z-20">
                                    <div
                                      className="h-full bg-[#e50914]"
                                      style={{ width: `${item.progress || 50}%` }}
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-30">
                                    <span className="text-white font-sans font-semibold text-xs truncate">
                                      {item.title}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <ContentRow
                        key={i}
                        title={cat.title}
                        items={cat.items}
                        onItemClick={handleSelectSearchResult}
                      />
                    );
                  })}

                  {/* Footer Section */}
                  <footer className="max-w-6xl mx-auto px-4 py-20 text-neutral-500 text-xs font-sans mt-20 border-t border-white/5">
                    <div className="flex gap-6 mb-8 text-neutral-400">
                      {/* Instagram */}
                      <a href="https://www.instagram.com/_ish4nvi_/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                      </a>
                      {/* YouTube */}
                      <a href="https://www.youtube.com/channel/UC1vy0mGaVw1WVS3IpL1l92w" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 leading-loose">
                      <div className="flex flex-col gap-2">
                        <Link to="/audio-description" className="hover:underline">Audio Description</Link>
                        <Link to="/investor-relations" className="hover:underline">Investor Relations</Link>
                        <Link to="/legal-notices" className="hover:underline">Legal Notices</Link>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to="/help-centre" className="hover:underline">Help Centre</Link>
                        <Link to="/jobs" className="hover:underline">Jobs</Link>
                        <Link to="/cookie-preferences" className="hover:underline">Cookie Preferences</Link>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to="/gift-cards" className="hover:underline">Gift Cards</Link>
                        <Link to="/terms-of-use" className="hover:underline">Terms of Use</Link>
                        <Link to="/corporate-information" className="hover:underline">Corporate Information</Link>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to="/media-centre" className="hover:underline">Media Centre</Link>
                        <Link to="/privacy" className="hover:underline">Privacy</Link>
                        <Link to="/contact-us" className="hover:underline">Contact Us</Link>
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-600 font-mono">
                      © Nigga Ishanvi
                    </div>
                  </footer>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Render VideoModal outside of transformed AnimatePresence to ensure correct viewport centering */}
        <AnimatePresence>
          {selectedMedia && (
            <VideoModal
              media={selectedMedia}
              onMediaUpdate={setSelectedMedia}
              onClose={() => {
                setSelectedMedia(null);
              }}
              onMainVideoEnd={() => {
                setSelectedMedia(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Search Result Detail Modal */}
        {createPortal(
          <AnimatePresence>
            {selectedSearchResult && (
              <div 
                className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-black/90 overflow-y-auto gap-4"
                onClick={() => setSelectedSearchResult(null)}
              >
                {/* Cristiano Ronaldo Query Banner (Above Card) */}
                <div className="z-50 pointer-events-none select-none flex justify-center w-full max-w-4xl px-2">
                  {selectedSearchResult.isLoadingNigga ? (
                    <div className="bg-[#141414] border border-white/10 text-white font-sans text-sm font-semibold tracking-wide px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3">
                      <span>asking from nigga...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : selectedSearchResult.niggaAnswered ? (
                    <div className="bg-[#141414] border border-white/10 text-green-500 font-sans text-sm font-semibold tracking-wide px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-2">
                      <span>got answer from gnoat, greatest nigga of all time!</span>
                      <span className="text-green-500">✓</span>
                    </div>
                  ) : null}
                </div>

                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ duration: 0.4, ease: SOVEREIGN_EASE }}
                  className="relative max-w-4xl w-full bg-[#0d0d0f]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedSearchResult(null)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-black/60 border border-white/10 hover:bg-black/80 transition-colors z-50 cursor-pointer"
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
                            const streamUrl = `https://streamimdb.ru/embed/${selectedSearchResult.media_type}/${selectedSearchResult.imdb_id || selectedSearchResult.id}?tmdb_id=${selectedSearchResult.id}`;
                            setSelectedMedia({
                              type: 'video',
                              url: streamUrl,
                              title: selectedSearchResult.title || selectedSearchResult.name,
                              tmdbId: selectedSearchResult.id,
                              imdbId: selectedSearchResult.imdb_id,
                              mediaType: selectedSearchResult.media_type,
                              season: '1',
                              episode: '1',
                              numberOfSeasons: selectedSearchResult.number_of_seasons || 10,
                              provider: window.localStorage.getItem('off_campus_provider') || 'videasy'
                            });
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
                        {selectedSearchResult.imdb_id && (
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-2">
                            <Play size={20} fill="#ff4d85" stroke="#ff4d85" className="mb-1 text-[#ff4d85]" />
                            <span className="text-[9px] font-mono tracking-wider text-[#ff4d85] font-bold uppercase">Watch It Here</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 pb-1">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-[#ff4d85] font-semibold bg-[#ff4d85]/10 px-2 py-0.5 rounded border border-[#ff4d85]/20 self-start">
                          {selectedSearchResult.media_type}
                        </span>
                        <h3 className="text-lg md:text-2xl font-serif text-white font-medium leading-tight">
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

                    {/* Footer: Watch It Here & Add to My List */}
                    <div className="mt-8 border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() => {
                            const isAnime = selectedSearchResult.isAnime || 
                              (selectedSearchResult.genre_ids && selectedSearchResult.genre_ids.includes(16) && selectedSearchResult.original_language === 'ja') ||
                              (selectedSearchResult.genres && selectedSearchResult.genres.some(g => g.id === 16) && selectedSearchResult.original_language === 'ja');

                            if (isAnime) {
                              setActiveAnimeMedia({
                                ...selectedSearchResult,
                                title: selectedSearchResult.title || selectedSearchResult.name,
                                name: selectedSearchResult.name || selectedSearchResult.title,
                                isTvSeries: selectedSearchResult.media_type === 'tv'
                              });
                              setSelectedSearchResult(null);
                              return;
                            }

                            const streamUrl = `https://streamimdb.ru/embed/${selectedSearchResult.media_type}/${selectedSearchResult.imdb_id || selectedSearchResult.id}?tmdb_id=${selectedSearchResult.id}`;
                            setSelectedMedia({
                              type: 'video',
                              url: streamUrl,
                              title: selectedSearchResult.title || selectedSearchResult.name,
                              tmdbId: selectedSearchResult.id,
                              imdbId: selectedSearchResult.imdb_id,
                              mediaType: selectedSearchResult.media_type,
                              season: '1',
                              episode: '1',
                              numberOfSeasons: selectedSearchResult.number_of_seasons || 10,
                              provider: window.localStorage.getItem('off_campus_provider') || 'videasy'
                            });
                          }}
                          className="flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#b20710] text-white font-semibold text-sm px-4 py-2.5 rounded-lg font-sans shadow-lg hover:shadow-[#e50914]/20 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          <Play size={16} fill="currentColor" />
                          Watch It Here
                        </button>
                        <button
                          onClick={toggleFavorite}
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
                      </div>

                      <span className="text-[10px] font-mono text-neutral-600 self-center">
                        ID: {selectedSearchResult.id}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Dedicated Anime Watch Modal for anime streams */}
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
    </>
  );
}
