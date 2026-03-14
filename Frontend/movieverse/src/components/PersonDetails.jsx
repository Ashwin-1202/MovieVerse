// src/components/PersonDetails.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiMapPin, 
  FiFilm,
  FiTv,
  FiStar,
  FiAward,
  FiUser,
  FiHeart
} from 'react-icons/fi';
import { FaBirthdayCake, FaSkull, FaImdb } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

function PersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [movieCredits, setMovieCredits] = useState({ cast: [], crew: [] });
  const [tvCredits, setTvCredits] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('movies');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPersonDetails();
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/person/${id}`);
      setPerson(response.data.person);
      setMovieCredits(response.data.movie_credits);
      setTvCredits(response.data.tv_credits || []);
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching person:', error);
      toast.error('Failed to fetch person details');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE_URL}${path}`;
  };

  const calculateAge = (birthday, deathday) => {
    if (!birthday) return 'Unknown';
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreditClick = (id, type) => {
    navigate(`/${type}/${id}`);
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
          <p className="text-white text-xl">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Person not found</p>
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
      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={selectedImage}
            alt={person.name}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-purple-400 text-2xl font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
        {/* Header with Name */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{person.name}</h1>
          {person.known_for_department && (
            <p className="text-xl text-purple-400 mt-2">{person.known_for_department}</p>
          )}
        </div>

        {/* Horizontal Layout - Profile and Basic Info */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="md:w-64 flex-shrink-0">
              <img
                src={getImageUrl(person.profile_path)}
                alt={person.name}
                className="w-full rounded-2xl shadow-2xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(getImageUrl(person.profile_path))}
              />
            </div>

            {/* Personal Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Birthday */}
              {person.birthday && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Birthday</p>
                  <div className="flex items-center gap-2 text-white">
                    <FaBirthdayCake className="text-purple-400 text-xl" />
                    <div>
                      <span className="font-semibold">{formatDate(person.birthday)}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({calculateAge(person.birthday, person.deathday)} years old)
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Deathday */}
              {person.deathday && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Died</p>
                  <div className="flex items-center gap-2 text-white">
                    <FaSkull className="text-red-400 text-xl" />
                    <span className="font-semibold">{formatDate(person.deathday)}</span>
                  </div>
                </div>
              )}
              
              {/* Place of Birth */}
              {person.place_of_birth && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Place of Birth</p>
                  <div className="flex items-center gap-2 text-white">
                    <FiMapPin className="text-purple-400 text-xl" />
                    <span className="font-semibold">{person.place_of_birth}</span>
                  </div>
                </div>
              )}
              
              {/* Known For */}
              {person.known_for_department && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Known For</p>
                  <div className="flex items-center gap-2 text-white">
                    <FiAward className="text-purple-400 text-xl" />
                    <span className="font-semibold">{person.known_for_department}</span>
                  </div>
                </div>
              )}

              {/* Popularity */}
              {person.popularity > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Popularity</p>
                  <div className="flex items-center gap-2 text-white">
                    <FiHeart className="text-pink-400 text-xl" />
                    <span className="font-semibold">{Math.round(person.popularity)}</span>
                  </div>
                </div>
              )}

              {/* IMDb Link */}
              {person.imdb_id && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">External Link</p>
                  <a
                    href={`https://www.imdb.com/name/${person.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                  >
                    <FaImdb className="text-yellow-400 text-2xl" />
                    <span className="font-semibold">IMDb Profile</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Also Known As */}
          {person.also_known_as?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-500/30">
              <p className="text-gray-400 text-sm mb-3">Also Known As</p>
              <div className="flex flex-wrap gap-2">
                {person.also_known_as.slice(0, 5).map((name, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Biography Section */}
        {person.biography && person.biography !== 'No biography available.' && (
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
              <FiUser className="text-purple-400" />
              Biography
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {person.biography}
            </p>
          </div>
        )}

        {/* Photo Gallery */}
        {images.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-semibold text-xl mb-4">Photos</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {images.slice(0, 12).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${person.name} ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs for Credits */}
        <div className="bg-white/5 rounded-t-2xl p-4 border-b border-purple-500/30">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-4 py-2 text-lg font-semibold transition-colors relative ${
                activeTab === 'movies' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              Movies ({movieCredits.cast.length + movieCredits.crew.length})
              {activeTab === 'movies' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`px-4 py-2 text-lg font-semibold transition-colors relative ${
                activeTab === 'tv' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              TV Shows ({tvCredits.length})
              {activeTab === 'tv' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                />
              )}
            </button>
          </div>
        </div>

        {/* Credits Content */}
        <div className="bg-white/5 rounded-b-2xl p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
          {activeTab === 'movies' && (
            <div className="space-y-8">
              {/* Acting Credits */}
              {movieCredits.cast.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiFilm className="text-purple-400" />
                    Acting
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {movieCredits.cast.map((credit, index) => (
                      <motion.div
                        key={`${credit.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleCreditClick(credit.id, 'movie')}
                        className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={credit.poster_path || 'https://via.placeholder.com/60x90?text=No+Image'}
                            alt={credit.title}
                            className="w-12 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60x90?text=No+Image';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold truncate">{credit.title}</h4>
                            <p className="text-purple-400 text-sm truncate">as {credit.character}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-gray-400 text-xs">
                                {credit.release_date ? new Date(credit.release_date).getFullYear() : 'N/A'}
                              </span>
                              {credit.vote_average > 0 && (
                                <span className="flex items-center gap-1 text-xs">
                                  <FiStar className="text-yellow-400" />
                                  <span className="text-gray-300">{credit.vote_average}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crew Credits */}
              {movieCredits.crew.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <FiAward className="text-purple-400" />
                    Crew
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {movieCredits.crew.map((credit, index) => (
                      <motion.div
                        key={`${credit.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleCreditClick(credit.id, 'movie')}
                        className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={credit.poster_path || 'https://via.placeholder.com/60x90?text=No+Image'}
                            alt={credit.title}
                            className="w-12 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60x90?text=No+Image';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold truncate">{credit.title}</h4>
                            <p className="text-purple-400 text-sm">{credit.job}</p>
                            <p className="text-gray-400 text-xs">
                              {credit.release_date ? new Date(credit.release_date).getFullYear() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tv' && (
            <div>
              {tvCredits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tvCredits.map((credit, index) => (
                    <motion.div
                      key={`${credit.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleCreditClick(credit.id, 'tv')}
                      className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={credit.poster_path || 'https://via.placeholder.com/60x90?text=No+Image'}
                          alt={credit.name}
                          className="w-12 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x90?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold truncate">{credit.name}</h4>
                          <p className="text-purple-400 text-sm truncate">as {credit.character}</p>
                          <p className="text-gray-400 text-xs">
                            {credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No TV shows found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
}

export default PersonDetails;