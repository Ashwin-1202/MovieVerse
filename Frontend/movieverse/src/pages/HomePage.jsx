import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from '../components/MovieRow';
import { fetchPopularMovies, fetchTrendingMovies } from '../services/api';

const HomePage = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch first 3 pages of popular movies to get more content
        const [popular1, popular2, popular3, trending] = await Promise.all([
          fetchPopularMovies(1),
          fetchPopularMovies(2),
          fetchPopularMovies(3),
          fetchTrendingMovies()
        ]);
        
        // Combine all popular movies from multiple pages
        const allPopularMovies = [
          ...(popular1.results || []),
          ...(popular2.results || []),
          ...(popular3.results || [])
        ];
        
        setPopularMovies(allPopularMovies);
        setTrendingMovies(trending.results || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#141414]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen pt-20">
      {/* Hero Section */}
      <div 
        className="h-[60vh] bg-cover bg-center relative mb-8 w-full"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(20,20,20,1)), 
          url('https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.svg')`
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Welcome to MovieVerse
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Discover your next favorite movie
          </p>
        </div>
      </div>

      {/* Only render rows if there are movies */}
      {trendingMovies.length > 0 && (
        <MovieRow 
          title="Trending Now" 
          movies={trendingMovies} 
          onMovieClick={handleMovieClick}
        />
      )}
      
      {popularMovies.length > 0 && (
        <MovieRow 
          title="Popular Movies" 
          movies={popularMovies} 
          onMovieClick={handleMovieClick}
        />
      )}
    </div>
  );
};

export default HomePage;