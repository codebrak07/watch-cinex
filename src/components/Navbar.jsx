import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Heart } from 'lucide-react';

const SOVEREIGN_EASE = [0.16, 1, 0.3, 1];
const HOVER_EASE = [0.25, 1, 0.5, 1];

export default function Navbar({ onSwitchProfile, onLogout, onAalekhClick, onAalekhProfileClick, onSugandhClick, onHomeClick, onSearch, onSearchClear }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileBrowseOpen, setIsMobileBrowseOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState({ name: 'Nigga Ishanvi', avatar: 'N' });

  useEffect(() => {
    const active = localStorage.getItem('netflix_active_profile');
    if (active) {
      setActiveProfile(JSON.parse(active));
    }
  }, [isDropdownOpen]);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (link) => {
    if (link === 'Home' && (location.pathname === '/browse' || location.pathname === '/')) return true;
    if (link === 'Movies' && location.pathname === '/movies') return true;
    if (link === 'My List' && location.pathname === '/favorites') return true;
    if (link === 'Browse by Languages' && location.pathname === '/languages') return true;
    return false;
  };
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const notifications = [];

  // Background scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Autofocus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navLinks = ['Home', 'Movies', 'My List', 'Browse by Languages'];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-colors duration-300 px-4 md:px-12 py-5 flex items-center justify-between ${
        isScrolled ? 'bg-[#141414]' : 'bg-transparent'
      }`}
    >
      {/* Left Side: Brand Logo and Navigation Links */}
      <div className="flex items-center gap-6 md:gap-10">
        {/* Netflix-style Red Logo */}
        <h1 
          onClick={() => {
            if (onHomeClick) onHomeClick();
            else {
              navigate('/browse');
            }
          }}
          className="text-[#e50914] text-3xl font-extrabold tracking-tighter cursor-pointer select-none font-sans uppercase" 
        >
          NETFLIX
        </h1>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-5 text-sm font-sans">
          {navLinks.map((link) => (
            <li 
              key={link} 
              onClick={() => {
                if (link === 'Home') {
                  navigate('/browse');
                } else if (link === 'Movies') {
                  navigate('/movies');
                } else if (link === 'My List') {
                  navigate('/favorites');
                } else if (link === 'Browse by Languages') {
                  navigate('/languages');
                }
              }}
              className={`cursor-pointer transition-colors duration-300 text-[14px] ${
                isActive(link) ? 'text-white font-medium' : 'text-[#e5e5e5] hover:text-[#b3b3b3]'
              }`}
            >
              {link}
            </li>
          ))}
        </ul>

        {/* Mobile Link Browse Button */}
        <div className="relative md:hidden">
          <button 
            onClick={() => setIsMobileBrowseOpen(!isMobileBrowseOpen)}
            className="text-white text-xs font-mono tracking-[0.08em] uppercase flex items-center gap-1 bg-black/30 border border-white/10 px-3 py-1.5 rounded-[4px] cursor-pointer"
          >
            Browse
            <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileBrowseOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Dropdown menu */}
          <AnimatePresence>
            {isMobileBrowseOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsMobileBrowseOpen(false)}
                />
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: HOVER_EASE }}
                  className="absolute left-0 mt-2 z-40 bg-[#141414] border border-white/10 w-44 rounded-md shadow-2xl p-2 flex flex-col gap-2 text-xs font-mono tracking-[0.08em] uppercase text-neutral-300"
                >
                  {navLinks.map((link) => (
                    <li 
                      key={link}
                      onClick={() => {
                        setIsMobileBrowseOpen(false);
                        if (link === 'Home') {
                          navigate('/browse');
                        } else if (link === 'Movies') {
                          navigate('/movies');
                        } else if (link === 'My List') {
                          navigate('/favorites');
                        } else if (link === 'Browse by Languages') {
                          navigate('/languages');
                        }
                      }}
                      className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${
                        isActive(link) ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {link}
                    </li>
                  ))}
                </motion.ul>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side: Interactive Controls */}
      <div className="flex items-center gap-4 md:gap-6 text-white">
        {/* Animated Search Bar */}
        <div className="flex items-center relative h-8">
          <motion.div
            initial={false}
            animate={{ width: isSearchOpen ? (window.innerWidth <= 480 ? 130 : 200) : 0 }}
            transition={{ duration: 0.35, ease: SOVEREIGN_EASE }}
            className="overflow-hidden flex items-center bg-black/40 border border-white/10 rounded-[4px]"
            style={{ paddingLeft: isSearchOpen ? '8px' : '0px', paddingRight: isSearchOpen ? '8px' : '0px' }}
          >
            <Search 
              size={16} 
              className="text-neutral-400 flex-shrink-0 cursor-pointer" 
              onClick={() => {
                if (searchQuery.trim() && onSearch) {
                  onSearch(searchQuery.trim());
                }
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Titles, photos, memories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() === '') {
                  if (onSearchClear) onSearchClear();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim() && onSearch) {
                  onSearch(searchQuery.trim());
                }
              }}
              className="bg-transparent border-none outline-none text-xs ml-2 text-white w-full py-1 font-sans placeholder-neutral-500"
              onBlur={() => {
                if (searchQuery === '') {
                  setIsSearchOpen(false);
                  if (onSearchClear) onSearchClear();
                }
              }}
            />
          </motion.div>
          {!isSearchOpen && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="p-1 cursor-pointer text-neutral-300 hover:text-white transition-colors"
            >
              <Search size={20} />
            </motion.button>
          )}
        </div>



        {/* Notifications Icon & Dropdown */}
        <div 
          ref={notificationsRef}
          className="relative"
          onMouseEnter={() => setIsNotificationsOpen(true)}
          onMouseLeave={() => setIsNotificationsOpen(false)}
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsDropdownOpen(false);
            }}
            className="p-1 cursor-pointer text-neutral-300 hover:text-white transition-colors relative block"
          >
            <Bell size={20} />
            {/* Red alert dot if there are notifications */}
            {notifications.length > 0 && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#e50914] rounded-full border border-[#141414]" />
            )}
          </motion.button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: HOVER_EASE }}
                className="absolute right-0 mt-2 z-40 bg-[#141414] border border-white/10 w-72 md:w-80 rounded-md shadow-2xl overflow-hidden py-1.5"
              >
                {/* Triangle tooltip marker */}
                <div className="absolute top-[-6px] right-3 w-3 h-3 bg-[#141414] border-t border-l border-white/10 rotate-45 z-10" />

                <div className="relative bg-[#141414] z-20 flex flex-col p-6 text-center text-neutral-500 text-xs font-sans">
                  No new notifications.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar & Dropdown Trigger */}
        <div 
          ref={dropdownRef}
          className="relative py-2"
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-1 cursor-pointer"
          >
            {/* Avatar Box - Clicking toggles the dropdown, no longer switches profiles */}
            <div 
              className="w-8 h-8 rounded-md bg-gradient-to-br from-[#e50914] to-[#f43f5e] border border-white/20 flex items-center justify-center font-bold text-white shadow-md text-sm select-none hover:scale-105 transition-transform"
              title="View account details"
            >
              {activeProfile.avatar}
            </div>
            <ChevronDown 
              size={14} 
              className={`text-neutral-400 hover:text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>

          {/* Profile Dropdown Overlay */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: HOVER_EASE }}
                className="absolute right-0 mt-2 z-40 bg-[#000000] border border-zinc-800 w-60 rounded-sm shadow-2xl overflow-hidden py-3 font-sans"
              >
                {/* Triangle tooltip marker */}
                <div className="absolute top-[-6px] right-3 w-3 h-3 bg-black border-t border-l border-zinc-800 rotate-45 z-10" />

                <div className="relative bg-black z-20 flex flex-col gap-3">
                  {/* Active Profile indicator */}
                  <div className="flex items-center gap-3 px-3 py-2 cursor-default border-b border-zinc-800 pb-3">
                    <div className="w-8 h-8 rounded bg-[#e50914] flex items-center justify-center font-bold text-white text-sm select-none">
                      {activeProfile.avatar}
                    </div>
                    <span className="text-xs text-neutral-200 font-semibold">{activeProfile.name}</span>
                  </div>

                  {/* Settings Actions Menu */}
                  <div className="flex flex-col px-1 text-[13px] text-neutral-300">
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer rounded-sm">
                      <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Manage Profiles</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer rounded-sm">
                      <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 2.1l4 4-4 4" />
                        <path d="M3 12.2v-2a4 4 0 0 1 4-4h14" />
                        <path d="M7 21.9l-4-4 4-4" />
                        <path d="M21 11.8v2a4 4 0 0 1-4 4H3" />
                      </svg>
                      <span>Transfer Profile</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer rounded-sm">
                      <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Account</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer rounded-sm">
                      <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>Help Centre</span>
                    </div>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-zinc-800 mt-1 pt-3 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="text-xs text-neutral-200 hover:underline cursor-pointer w-full text-center"
                    >
                      Sign out of Netflix
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
