// src/components/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiStar,
  FiFilm,
  FiTv,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query) {
      searchAll();
    }
  }, [query]);

  const searchAll = async () => {
    try {
      setLoading(true);
      
      // Search movies
      const movieRes = await axios.get(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`);
      setMovies(movieRes.data.results || []);
      
      // Search TV shows
      const tvRes = await axios.get(`${API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}`);
      setTvShows(tvRes.data.results || []);
      
      // Search people
      const peopleRes = await axios.get(`${API_BASE_URL}/search/person?query=${encodeURIComponent(query)}`);
      setPeople(peopleRes.data.results || []);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE_URL}${path}`;
  };

  const handleItemClick = (item, type) => {
    if (type === 'person') {
      navigate(`/person/${item.id}`);
    } else if (type === 'tv') {
      navigate(`/tv/${item.id}`);
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  const getTotalCount = () => {
    return movies.length + tvShows.length + people.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-white text-xl">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
        >
          <FiArrowLeft /> Back
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Search Results</h1>
          <p className="text-gray-400">
            Found {getTotalCount()} results for "{query}"
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-purple-500/30">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-lg font-semibold transition-colors relative ${
              activeTab === 'all' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({getTotalCount()})
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 text-lg font-semibold transition-colors relative ${
              activeTab === 'movies' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-4 py-2 text-lg font-semibold transition-colors relative ${
              activeTab === 'tv' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            TV Shows ({tvShows.length})
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-4 py-2 text-lg font-semibold transition-colors relative ${
              activeTab === 'people' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            People ({people.length})
          </button>
        </div>

        {/* Results Grid */}
        {getTotalCount() === 0 ? (
          <div className="text-center py-12">
            <p className="text-white text-xl mb-4">No results found</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Back Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Movies */}
            {(activeTab === 'all' || activeTab === 'movies') && movies.map((item) => (
              <SearchCard
                key={`movie-${item.id}`}
                item={item}
                type="movie"
                onClick={handleItemClick}
                getImageUrl={getImageUrl}
              />
            ))}

            {/* TV Shows */}
            {(activeTab === 'all' || activeTab === 'tv') && tvShows.map((item) => (
              <SearchCard
                key={`tv-${item.id}`}
                item={item}
                type="tv"
                onClick={handleItemClick}
                getImageUrl={getImageUrl}
              />
            ))}

            {/* People */}
            {(activeTab === 'all' || activeTab === 'people') && people.map((item) => (
              <SearchCard
                key={`person-${item.id}`}
                item={item}
                type="person"
                onClick={handleItemClick}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Search Card Component
const SearchCard = ({ item, type, onClick, getImageUrl }) => {
  const getIcon = () => {
    switch(type) {
      case 'movie': return <FiFilm className="text-purple-400" />;
      case 'tv': return <FiTv className="text-purple-400" />;
      case 'person': return <FiUser className="text-purple-400" />;
      default: return null;
    }
  };

  const getTitle = () => {
    if (type === 'person') return item.name;
    return item.title || item.name;
  };

  const getYear = () => {
    if (type === 'person') return null;
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => onClick(item, type)}
      className="cursor-pointer group"
    >
      <div className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 h-full">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={getImageUrl(item.poster_path || item.profile_path)}
            alt={getTitle()}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
          
          {/* Type Badge */}
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            {getIcon()}
            <span className="text-white text-xs capitalize">{type}</span>
          </div>

          {/* Rating Badge - Only for movies/TV */}
          {type !== 'person' && item.vote_average > 0 && (
            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <FiStar className="text-yellow-400 text-xs" />
              <span className="text-white text-xs font-semibold">
                {item.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {getTitle()}
          </h3>
          {getYear() && (
            <p className="text-gray-400 text-xs mt-1">{getYear()}</p>
          )}
          {type === 'person' && item.known_for_department && (
            <p className="text-purple-400 text-xs mt-1">{item.known_for_department}</p>
          )}
          {type === 'person' && item.known_for && item.known_for.length > 0 && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-1">
              Known for: {item.known_for[0]?.title || item.known_for[0]?.name}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResults;