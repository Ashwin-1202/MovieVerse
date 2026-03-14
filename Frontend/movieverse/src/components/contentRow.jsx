// src/components/ContentRow.jsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlayCircle, FiStar, FiYoutube } from 'react-icons/fi';

const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/';

const ContentRow = ({ 
  title, 
  items, 
  filter, 
  setFilter, 
  filterOptions,
  onItemClick,
  getImageUrl,
  showPlayButton = false
}) => {
  const scrollRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handlePlayClick = (e, item) => {
    e.stopPropagation();
    if (item.trailerKey) {
      setSelectedVideo(item);
    } else {
      onItemClick(item.id, item.mediaType);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <>
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
                className="absolute -top-12 right-0 text-white hover:text-purple-400 transition-colors text-lg font-semibold"
              >
                Close [X]
              </button>
              <iframe
                src={`${YOUTUBE_EMBED_URL}${selectedVideo.trailerKey}?autoplay=1&rel=0`}
                title={selectedVideo.title || selectedVideo.name}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-12">
        {/* Title and Filter */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          
          {/* Filter Buttons */}
          {filterOptions && filterOptions.length > 0 && setFilter && (
            <div className="flex gap-2 bg-white/5 rounded-lg p-1 overflow-x-auto">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="relative group">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
          >
            <FiChevronLeft size={24} />
          </button>

          {/* Items Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-none w-40 md:w-48 cursor-pointer group/card"
                onClick={() => onItemClick(item.id, item.mediaType)}
              >
                <div className="relative rounded-lg overflow-hidden bg-white/5">
                  <div className="relative aspect-[2/3]">
                    <img
                      src={getImageUrl(item.poster_path)}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                      }}
                    />
                    
                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <FiStar className="text-yellow-400 text-xs" />
                        <span className="text-white text-xs font-semibold">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Trailer Badge */}
                    {showPlayButton && item.trailerKey && (
                      <div className="absolute top-2 left-2 bg-red-600/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <FiYoutube className="text-white text-xs" />
                        <span className="text-white text-xs">Trailer</span>
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    {showPlayButton && (
                      <button
                        onClick={(e) => handlePlayClick(e, item)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity"
                      >
                        <div className="bg-purple-600 rounded-full p-3 transform hover:scale-110 transition-transform">
                          <FiPlayCircle size={24} className="text-white" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Title and Info - Always Visible */}
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">
                      {item.title || item.name}
                    </h3>
                    {item.release_date && (
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(item.release_date).getFullYear()}
                      </p>
                    )}
                    {item.first_air_date && (
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(item.first_air_date).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ContentRow;