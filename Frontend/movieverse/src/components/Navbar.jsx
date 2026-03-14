// src/components/Navbar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronDown, 
  FiHome,
  FiFilm,
  FiTv,
  FiUsers,
  FiAward,
  FiSearch,
  FiX
} from 'react-icons/fi';
import { FaFilm } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const menuItems = [
    {
      title: 'Movies',
      icon: <FiFilm />,
      items: [
        { label: 'Popular', path: '/movies/popular' },
        { label: 'Now Playing', path: '/movies/now-playing' },
        { label: 'Upcoming', path: '/movies/upcoming' },
        { label: 'Top Rated', path: '/movies/top-rated' }
      ]
    },
    {
      title: 'TV Shows',
      icon: <FiTv />,
      items: [
        { label: 'Popular', path: '/tv/popular' },
        { label: 'Airing Today', path: '/tv/airing-today' },
        { label: 'On TV', path: '/tv/on-the-air' },
        { label: 'Top Rated', path: '/tv/top-rated' }
      ]
    },
    {
      title: 'People',
      icon: <FiUsers />,
      items: [
        { label: 'Popular People', path: '/people/popular' }
      ]
    },
    {
      title: 'Awards',
      icon: <FiAward />,
      items: [
        { label: 'Award Winning', path: '/awards/popular' },
        { label: 'Upcoming Awards', path: '/awards/upcoming' }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setOpenMenu(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      navigate(`/search/multi?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Home */}
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <FaFilm className="text-purple-500 text-3xl" />
              <span className="text-2xl font-bold text-white hidden sm:block">MovieVerse</span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <FiHome />
              <span className="hidden sm:inline">Home</span>
            </motion.button>
          </div>

          {/* Menu Items - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((menu) => (
              <div
                key={menu.title}
                className="relative"
                onMouseEnter={() => setOpenMenu(menu.title)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  <span className="text-lg">{menu.icon}</span>
                  <span>{menu.title}</span>
                  <FiChevronDown className={`transition-transform ${openMenu === menu.title ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openMenu === menu.title && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/30 overflow-hidden"
                    >
                      {menu.items.map((item) => (
                        <motion.button
                          key={item.label}
                          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                          onClick={() => handleNavigation(item.path)}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:text-white transition-colors"
                        >
                          {item.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {showSearch ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '300px', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search movies, TV, people..."
                    className="w-full px-4 py-2 pr-10 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FiX size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="Search"
                >
                  <FiSearch size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpenMenu(openMenu ? null : 'mobile')}
              className="p-2 text-gray-300 hover:text-white"
            >
              <FiFilm size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {openMenu === 'mobile' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {menuItems.map((menu) => (
                  <div key={menu.title} className="space-y-2">
                    <div className="text-purple-400 font-semibold flex items-center gap-2">
                      {menu.icon}
                      {menu.title}
                    </div>
                    <div className="pl-6 space-y-2">
                      {menu.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleNavigation(item.path)}
                          className="block w-full text-left text-gray-300 hover:text-white py-1"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;