// src/App.jsx - Updated with simplified upcoming section
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiStar, 
  FiTrendingUp, 
  FiPlayCircle, 
  FiCalendar
} from 'react-icons/fi';
import { FaFilm } from 'react-icons/fa';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ContentRow from './components/ContentRow';

const API_BASE_URL = 'http://localhost:5000';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function App() {
  const navigate = useNavigate();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Section data states
  const [trending, setTrending] = useState({ today: [], week: [] });
  const [trendingFilter, setTrendingFilter] = useState('week');
  
  const [latestTrailers, setLatestTrailers] = useState([]);
  const [trailerFilter, setTrailerFilter] = useState('popular');
  
  const [whatsPopular, setWhatsPopular] = useState([]);
  const [popularFilter, setPopularFilter] = useState('streaming');
  
  const [freeToWatch, setFreeToWatch] = useState([]);
  const [freeFilter, setFreeFilter] = useState('movies');
  
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [trendingFilter]);

  useEffect(() => {
    fetchTrailers();
  }, [trailerFilter]);

  useEffect(() => {
    fetchWhatsPopular();
  }, [popularFilter]);

  useEffect(() => {
    fetchFreeToWatch();
  }, [freeFilter]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured movie
      const popularRes = await axios.get(`${API_BASE_URL}/movie/popular?page=1`);
      if (popularRes.data.results && popularRes.data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(10, popularRes.data.results.length));
        setFeaturedMovie(popularRes.data.results[randomIndex]);
      }
      
      // Fetch all sections
      await Promise.all([
        fetchTrending(),
        fetchTrailers(),
        fetchWhatsPopular(),
        fetchFreeToWatch(),
        fetchUpcoming()
      ]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const [todayRes, weekRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/trending/movie/day`),
        axios.get(`${API_BASE_URL}/trending/movie/week`)
      ]);
      
      setTrending({
        today: todayRes.data.results || [],
        week: weekRes.data.results || []
      });
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const fetchTrailers = async () => {
    try {
      let endpoint = '';
      switch (trailerFilter) {
        case 'popular':
          endpoint = '/movie/popular?page=1';
          break;
        case 'streaming':
          endpoint = '/discover/movie?with_watch_monetization_types=flatrate';
          break;
        case 'onTV':
          endpoint = '/tv/on_the_air?page=1';
          break;
        case 'forRent':
          endpoint = '/discover/movie?with_watch_monetization_types=rent';
          break;
        case 'inTheatres':
          endpoint = '/movie/now_playing?page=1';
          break;
        default:
          endpoint = '/movie/popular?page=1';
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const items = (response.data.results || []).slice(0, 10);
      
      const trailerPromises = items.map(async (item) => {
        try {
          const id = item.id;
          const mediaType = item.media_type || (endpoint.includes('tv') ? 'tv' : 'movie');
          const videosRes = await axios.get(`${API_BASE_URL}/${mediaType}/${id}/videos`);
          const trailer = videosRes.data.results?.find(v => v.type === 'Trailer') || videosRes.data.results?.[0];
          
          return {
            ...item,
            trailerKey: trailer?.key,
            mediaType
          };
        } catch (error) {
          return { ...item, trailerKey: null };
        }
      });
      
      const itemsWithTrailers = await Promise.all(trailerPromises);
      setLatestTrailers(itemsWithTrailers.filter(item => item.trailerKey));
      
    } catch (error) {
      console.error('Error fetching trailers:', error);
    }
  };

  const fetchWhatsPopular = async () => {
    try {
      let endpoint = '';
      switch (popularFilter) {
        case 'streaming':
          endpoint = '/discover/movie?with_watch_monetization_types=flatrate';
          break;
        case 'onTV':
          endpoint = '/tv/on_the_air?page=1';
          break;
        case 'forRent':
          endpoint = '/discover/movie?with_watch_monetization_types=rent';
          break;
        case 'inTheatres':
          endpoint = '/movie/now_playing?page=1';
          break;
        default:
          endpoint = '/movie/popular?page=1';
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      setWhatsPopular((response.data.results || []).slice(0, 20));
    } catch (error) {
      console.error('Error fetching whats popular:', error);
    }
  };

  const fetchFreeToWatch = async () => {
    try {
      let endpoint = '';
      if (freeFilter === 'movies') {
        endpoint = '/discover/movie?with_watch_monetization_types=free';
      } else {
        endpoint = '/discover/tv?with_watch_monetization_types=free';
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      setFreeToWatch((response.data.results || []).slice(0, 20));
    } catch (error) {
      console.error('Error fetching free to watch:', error);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movie/upcoming?page=1`);
      
      if (response.data && response.data.results) {
        // Filter to ensure only unreleased movies (release_date >= today)
        const today = new Date().toISOString().split('T')[0];
        const unreleased = response.data.results.filter(movie => 
          movie.release_date && movie.release_date >= today
        );
        setUpcoming(unreleased.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
    }
  };

  const handleMovieClick = (id, mediaType = 'movie') => {
    navigate(`/${mediaType}/${id}`);
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE_URL}${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* Dynamic Banner */}
        {featuredMovie && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[70vh] overflow-hidden cursor-pointer"
            onClick={() => handleMovieClick(featuredMovie.id)}
          >
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0"
            >
              <img
                src={getImageUrl(featuredMovie.backdrop_path || featuredMovie.poster_path)}
                alt={featuredMovie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1920x1080?text=Movie+Image+Not+Available';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </motion.div>

            <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-block px-4 py-2 bg-purple-600 rounded-full text-white text-sm mb-6"
                >
                  Featured Movie
                </motion.div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                  {featuredMovie.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-400" />
                    <span className="text-white font-semibold">
                      {featuredMovie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-300">
                    {featuredMovie.release_date ? new Date(featuredMovie.release_date).getFullYear() : 'N/A'}
                  </span>
                </div>
                
                <p className="text-gray-200 text-lg mb-8 line-clamp-3">
                  {featuredMovie.overview || 'No description available.'}
                </p>
                
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(featuredMovie.id);
                    }}
                    className="flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <FiPlayCircle /> View Details
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Content Sections */}
        <div className="relative z-10 -mt-32 pb-12">
          <div className="max-w-7xl mx-auto px-4 space-y-12">
            
            {/* Trending Section */}
            <ContentRow
              title="Trending"
              items={trending[trendingFilter] || []}
              filter={trendingFilter}
              setFilter={setTrendingFilter}
              filterOptions={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' }
              ]}
              onItemClick={handleMovieClick}
              getImageUrl={getImageUrl}
            />

            {/* Upcoming Section - No Filter, Only Unreleased Movies */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FiCalendar className="text-purple-400" />
                    Coming Soon
                  </h2>
                </div>

                <div className="relative group">
                  <div
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {upcoming.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-none w-40 md:w-48 cursor-pointer group/card"
                        onClick={() => handleMovieClick(movie.id)}
                      >
                        <div className="relative rounded-lg overflow-hidden bg-white/5">
                          <div className="relative aspect-[2/3]">
                            <img
                              src={getImageUrl(movie.poster_path)}
                              alt={movie.title}
                              className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                              }}
                            />
                            
                            {movie.release_date && (
                              <div className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                                <span className="text-white text-xs">
                                  {new Date(movie.release_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <h3 className="text-white font-semibold text-sm line-clamp-2">
                              {movie.title}
                            </h3>
                            {movie.release_date && (
                              <p className="text-gray-400 text-xs mt-1">
                                {new Date(movie.release_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Latest Trailers Section */}
            <ContentRow
              title="Latest Trailers"
              items={latestTrailers}
              filter={trailerFilter}
              setFilter={setTrailerFilter}
              filterOptions={[
                { value: 'popular', label: 'Popular' },
                { value: 'streaming', label: 'Streaming' },
                { value: 'onTV', label: 'On TV' },
                { value: 'forRent', label: 'For Rent' },
                { value: 'inTheatres', label: 'In Theatres' }
              ]}
              onItemClick={handleMovieClick}
              getImageUrl={getImageUrl}
              showPlayButton={true}
            />

            {/* What's Popular Section */}
            <ContentRow
              title="What's Popular"
              items={whatsPopular}
              filter={popularFilter}
              setFilter={setPopularFilter}
              filterOptions={[
                { value: 'streaming', label: 'Streaming' },
                { value: 'onTV', label: 'On TV' },
                { value: 'forRent', label: 'For Rent' },
                { value: 'inTheatres', label: 'In Theatres' }
              ]}
              onItemClick={handleMovieClick}
              getImageUrl={getImageUrl}
            />

            {/* Free To Watch Section */}
            <ContentRow
              title="Free To Watch"
              items={freeToWatch}
              filter={freeFilter}
              setFilter={setFreeFilter}
              filterOptions={[
                { value: 'movies', label: 'Movies' },
                { value: 'tv', label: 'TV' }
              ]}
              onItemClick={handleMovieClick}
              getImageUrl={getImageUrl}
            />
            
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2024 MovieVerse. All rights reserved. Powered by TMDB API.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;