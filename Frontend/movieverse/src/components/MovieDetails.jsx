// src/components/MovieDetails.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, 
  FiClock, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp,
  FiArrowLeft,
  FiPlayCircle,
  FiInfo,
  FiYoutube,
  FiFilm,
  FiUser
} from 'react-icons/fi';
import { FaImdb, FaWikipediaW } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/';

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/movie/${id}`);
      setMovie(response.data.movie);
      setCast(response.data.cast || []);
      setCrew(response.data.crew || []);
      setRecommendations(response.data.recommendations || []);
      setVideos(response.data.videos || []);
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast.error('Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleCastClick = (personId) => {
    navigate(`/person/${personId}`);
  };

  const handleRecommendationClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    window.scrollTo(0, 0);
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE_URL}${path}`;
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          <p className="text-white text-xl">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Movie not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-purple-400 transition-colors text-lg font-semibold bg-purple-600 px-4 py-2 rounded-lg"
              >
                Close ✕
              </button>
              <iframe
                src={`${YOUTUBE_EMBED_URL}${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.name}
                className="w-full h-full rounded-lg shadow-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1920x1080?text=No+Backdrop+Available';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent" />
        </motion.div>

        {/* Movie Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-4"
            >
              {movie.title}
            </motion.h1>
            {movie.tagline && (
              <p className="text-xl text-gray-300 italic">"{movie.tagline}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Poster */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full rounded-2xl shadow-2xl"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster+Available';
                }}
              />
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2"
          >
            {/* Rating and Quick Info */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                <FiStar className="text-yellow-400 text-2xl" />
                <div>
                  <span className="text-white text-2xl font-bold">{movie.vote_average}</span>
                  <span className="text-gray-400 text-sm ml-1">/10</span>
                  <p className="text-gray-400 text-xs">{movie.vote_count} votes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                <FiCalendar className="text-purple-400 text-xl" />
                <div>
                  <span className="text-white">{movie.release_date}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                <FiClock className="text-purple-400 text-xl" />
                <div>
                  <span className="text-white">{formatRuntime(movie.runtime)}</span>
                </div>
              </div>

              {movie.status && (
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                  <FiInfo className="text-purple-400 text-xl" />
                  <div>
                    <span className="text-white">{movie.status}</span>
                  </div>
                </div>
              )}

              {movie.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaImdb className="text-yellow-400 text-xl" />
                  <span className="text-white">IMDb</span>
                </a>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
            </div>

            {/* Videos/Trailers Section - FIXED: 100% working */}
            {videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiYoutube className="text-red-500" />
                  Videos & Trailers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.slice(0, 4).map((video, index) => (
                    <motion.div
                      key={video.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedVideo(video)}
                      className="relative group cursor-pointer rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                          alt={video.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-red-600 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                            <FiPlayCircle className="text-white text-3xl" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-red-600 px-2 py-1 rounded text-xs text-white">
                          {video.type}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-white font-semibold text-sm line-clamp-1">{video.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {videos.length > 4 && (
                  <button
                    onClick={() => setActiveTab('videos')}
                    className="mt-4 text-purple-400 hover:text-purple-300 transition-colors text-sm font-semibold"
                  >
                    View all {videos.length} videos →
                  </button>
                )}
              </div>
            )}

            {/* Budget & Revenue */}
            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {movie.budget > 0 && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Budget</p>
                    <p className="text-white text-xl font-bold">
                      {formatCurrency(movie.budget)}
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Revenue</p>
                    <p className="text-white text-xl font-bold">
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="mb-8 p-4 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Production Companies</p>
                <p className="text-white">{movie.production_companies.join(' • ')}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex gap-4 border-b border-purple-500/30 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('cast')}
                  className={`px-4 py-2 text-lg font-semibold transition-colors relative whitespace-nowrap ${
                    activeTab === 'cast' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Cast ({cast.length})
                  {activeTab === 'cast' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('crew')}
                  className={`px-4 py-2 text-lg font-semibold transition-colors relative whitespace-nowrap ${
                    activeTab === 'crew' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Crew ({crew.length})
                  {activeTab === 'crew' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    />
                  )}
                </button>
                {videos.length > 4 && (
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors relative whitespace-nowrap ${
                      activeTab === 'videos' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All Videos ({videos.length})
                    {activeTab === 'videos' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                      />
                    )}
                  </button>
                )}
                {images.backdrops.length > 0 && (
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors relative whitespace-nowrap ${
                      activeTab === 'media' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Media
                    {activeTab === 'media' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                      />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="mb-12">
              {activeTab === 'cast' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                  {cast.map((actor, index) => (
                    <motion.div
                      key={actor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCastClick(actor.id)}
                      className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={getImageUrl(actor.profile_path)}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-semibold text-sm">{actor.name}</h3>
                        <p className="text-purple-400 text-xs truncate">{actor.character}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'crew' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {crew.map((member, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <h3 className="text-white font-semibold">{member.name}</h3>
                      <p className="text-purple-400 text-sm">{member.job}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'videos' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedVideo(video)}
                      className="relative group cursor-pointer rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-red-600 rounded-full p-3">
                            <FiPlayCircle className="text-white text-2xl" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-red-600 px-2 py-1 rounded text-xs text-white">
                          {video.type}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-white font-semibold text-sm line-clamp-2">{video.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'media' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Backdrops */}
                  {images?.backdrops?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">Backdrops</h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {images.backdrops.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Backdrop ${index}`}
                            className="h-32 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Posters */}
                  {images?.posters?.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Posters</h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {images.posters.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Poster ${index}`}
                            className="h-48 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(image, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recommendations.slice(0, 8).map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      onClick={() => handleRecommendationClick(rec.id)}
                      className="cursor-pointer group"
                    >
                      <div className="relative rounded-lg overflow-hidden bg-white/5">
                        <div className="aspect-[2/3] overflow-hidden">
                          <img
                            src={getImageUrl(rec.poster_path)}
                            alt={rec.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="text-white text-sm font-semibold line-clamp-2">{rec.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <FiStar className="text-yellow-400 text-xs" />
                            <span className="text-white text-xs">{rec.vote_average}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;