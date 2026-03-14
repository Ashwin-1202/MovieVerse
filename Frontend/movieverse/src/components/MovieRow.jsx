import React, { useRef } from 'react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieClick }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' 
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
      
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative px-8 mb-8 group">
      <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>
      
      {/* Left Scroll Button */}
      <button 
        className="absolute left-2 top-[55%] -translate-y-1/2 z-20 w-12 h-12 
                   bg-black/70 text-white rounded-full flex items-center 
                   justify-center cursor-pointer hover:bg-black/90 
                   border-2 border-transparent hover:border-white/50
                   transition-all duration-300 opacity-0 group-hover:opacity-100
                   disabled:opacity-20 disabled:cursor-not-allowed"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <span className="text-3xl">‹</span>
      </button>
      
      {/* Movies Container - Allow horizontal scroll */}
      <div 
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{
          scrollbarWidth: 'none',  /* Firefox */
          msOverflowStyle: 'none',  /* IE and Edge */
        }}
      >
        <style>{`
          /* Chrome, Safari, Opera */
          .flex.overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={onMovieClick}
          />
        ))}
      </div>
      
      {/* Right Scroll Button */}
      <button 
        className="absolute right-2 top-[55%] -translate-y-1/2 z-20 w-12 h-12 
                   bg-black/70 text-white rounded-full flex items-center 
                   justify-center cursor-pointer hover:bg-black/90 
                   border-2 border-transparent hover:border-white/50
                   transition-all duration-300 opacity-0 group-hover:opacity-100
                   disabled:opacity-20 disabled:cursor-not-allowed"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <span className="text-3xl">›</span>
      </button>
    </div>
  );
};

export default MovieRow;