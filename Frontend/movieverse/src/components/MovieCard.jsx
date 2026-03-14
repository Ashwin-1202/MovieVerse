import React from 'react';

const MovieCard = ({ movie, onClick }) => {
  const imageUrl = movie.poster_path 
    ? movie.poster_path 
    : 'https://via.placeholder.com/200x300?text=No+Poster';

  return (
    <div 
      className="flex-none w-[180px] md:w-[200px] cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={() => onClick(movie.id)}
    >
      <div className="relative rounded-lg overflow-hidden bg-[#181818] shadow-lg">
        <div className="relative aspect-[2/3] w-full">
          <img 
            src={imageUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x300?text=No+Poster';
            }}
          />
          <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
            ⭐ {movie.vote_average?.toFixed(1)}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold truncate text-sm md:text-base">{movie.title}</h3>
          {movie.release_date && (
            <p className="text-gray-400 text-xs md:text-sm">
              {new Date(movie.release_date).getFullYear()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;