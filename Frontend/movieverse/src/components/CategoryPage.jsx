// // src/components/CategoryPage.jsx (continued)
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { FiArrowLeft, FiStar, FiLoader, FiUser } from 'react-icons/fi';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useNavigate, useParams } from 'react-router-dom';

// const API_BASE_URL = 'http://localhost:5000';
// const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// function CategoryPage() {
//   const { category, type } = useParams();
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const observer = useRef();
  
//   const lastItemRef = useCallback(node => {
//     if (loadingMore) return;
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting && hasMore && !loadingMore) {
//         setPage(prevPage => prevPage + 1);
//       }
//     });
//     if (node) observer.current.observe(node);
//   }, [loadingMore, hasMore]);

//   useEffect(() => {
//     setItems([]);
//     setPage(1);
//     setHasMore(true);
//     fetchItems(1);
//   }, [category, type]);

//   useEffect(() => {
//     if (page > 1) {
//       fetchItems(page);
//     }
//   }, [page]);

//   const fetchItems = async (pageNum) => {
//     try {
//       if (pageNum === 1) {
//         setLoading(true);
//       } else {
//         setLoadingMore(true);
//       }
      
//       let endpoint = '';
      
//       // Determine endpoint based on category and type
//       if (category === 'movies') {
//         switch(type) {
//           case 'popular':
//             endpoint = '/movie/popular';
//             break;
//           case 'now-playing':
//             endpoint = '/movie/now_playing';
//             break;
//           case 'upcoming':
//             endpoint = '/movie/upcoming';
//             break;
//           case 'top-rated':
//             endpoint = '/movie/top_rated';
//             break;
//           default:
//             endpoint = '/movie/popular';
//         }
//       } else if (category === 'tv') {
//         switch(type) {
//           case 'popular':
//             endpoint = '/tv/popular';
//             break;
//           case 'airing-today':
//             endpoint = '/tv/airing_today';
//             break;
//           case 'on-the-air':
//             endpoint = '/tv/on_the_air';
//             break;
//           case 'top-rated':
//             endpoint = '/tv/top_rated';
//             break;
//           default:
//             endpoint = '/tv/popular';
//         }
//       } else if (category === 'people') {
//         switch(type) {
//           case 'popular':
//             endpoint = '/person/popular';
//             break;
//           default:
//             endpoint = '/person/popular';
//         }
//       } else if (category === 'awards') {
//         // For awards, we'll use top rated movies as placeholder
//         endpoint = '/movie/top_rated';
//       }
      
//       console.log(`Fetching: ${API_BASE_URL}${endpoint}?page=${pageNum}`);
//       const response = await axios.get(`${API_BASE_URL}${endpoint}?page=${pageNum}`);
      
//       if (response.data && response.data.results) {
//         if (pageNum === 1) {
//           setItems(response.data.results);
//         } else {
//           setItems(prev => [...prev, ...response.data.results]);
//         }
        
//         setTotalPages(response.data.total_pages || 1);
//         setHasMore(pageNum < (response.data.total_pages || 1));
//       } else {
//         console.error('No results in response:', response.data);
//         toast.error('Failed to load items');
//       }
      
//     } catch (error) {
//       console.error('Error fetching items:', error);
//       toast.error('Failed to fetch items. Make sure backend is running.');
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   const getImageUrl = (path) => {
//     if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
//     if (path.startsWith('http')) return path;
//     return `${IMAGE_BASE_URL}${path}`;
//   };

//   const handleItemClick = (item) => {
//     if (category === 'people') {
//       navigate(`/person/${item.id}`);
//     } else if (category === 'tv') {
//       navigate(`/tv/${item.id}`);
//     } else {
//       navigate(`/movie/${item.id}`);
//     }
//   };

//   const getTitle = () => {
//     const titles = {
//       movies: {
//         popular: 'Popular Movies',
//         'now-playing': 'Now Playing',
//         upcoming: 'Upcoming Movies',
//         'top-rated': 'Top Rated Movies'
//       },
//       tv: {
//         popular: 'Popular TV Shows',
//         'airing-today': 'Airing Today',
//         'on-the-air': 'On TV',
//         'top-rated': 'Top Rated TV Shows'
//       },
//       people: {
//         popular: 'Popular People'
//       },
//       awards: {
//         popular: 'Award Winning Movies',
//         upcoming: 'Upcoming Award Shows'
//       }
//     };
//     return titles[category]?.[type] || 'Movies';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//             className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
//           />
//           <p className="text-white text-xl">Loading {getTitle()}...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
//       {/* Back Button */}
//       <div className="fixed top-4 left-4 z-40">
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
//         >
//           <FiArrowLeft /> Back
//         </motion.button>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <h1 className="text-4xl font-bold text-white mb-8">{getTitle()}</h1>

//         {items.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-white text-xl mb-4">No items found</p>
//             <button
//               onClick={() => navigate('/')}
//               className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//             >
//               Go Back Home
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
//               {items.map((item, index) => {
//                 const cardContent = (
//                   <div className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 h-full">
//                     <div className="relative aspect-[2/3] overflow-hidden">
//                       <img
//                         src={getImageUrl(item.poster_path || item.profile_path)}
//                         alt={item.title || item.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
//                         }}
//                       />
                      
//                       {/* Rating Badge (for movies/TV) */}
//                       {item.vote_average > 0 && (
//                         <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
//                           <FiStar className="text-yellow-400 text-xs" />
//                           <span className="text-white text-xs font-semibold">
//                             {item.vote_average.toFixed(1)}
//                           </span>
//                         </div>
//                       )}

//                       {/* Popularity Badge (for people) */}
//                       {category === 'people' && item.popularity > 0 && (
//                         <div className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded-lg">
//                           <span className="text-white text-xs">
//                             {Math.round(item.popularity)}
//                           </span>
//                         </div>
//                       )}
//                     </div>
                    
//                     {/* Card Footer with Title - Always Visible */}
//                     <div className="p-3">
//                       <h3 className="text-white font-semibold text-sm line-clamp-2">
//                         {item.title || item.name}
//                       </h3>
//                       {item.release_date && (
//                         <p className="text-gray-400 text-xs mt-1">
//                           {new Date(item.release_date).getFullYear()}
//                         </p>
//                       )}
//                       {item.first_air_date && (
//                         <p className="text-gray-400 text-xs mt-1">
//                           {new Date(item.first_air_date).getFullYear()}
//                         </p>
//                       )}
//                       {category === 'people' && item.known_for_department && (
//                         <p className="text-purple-400 text-xs mt-1">
//                           {item.known_for_department}
//                         </p>
//                       )}
//                       {category === 'people' && item.known_for && item.known_for.length > 0 && (
//                         <p className="text-gray-400 text-xs mt-1 line-clamp-1">
//                           Known for: {item.known_for[0]?.title || item.known_for[0]?.name}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 );

//                 // Add ref to last item for infinite scroll
//                 if (items.length === index + 1) {
//                   return (
//                     <motion.div
//                       key={item.id}
//                       ref={lastItemRef}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: Math.min(index * 0.02, 1) }}
//                       whileHover={{ y: -5 }}
//                       onClick={() => handleItemClick(item)}
//                       className="cursor-pointer"
//                     >
//                       {cardContent}
//                     </motion.div>
//                   );
//                 } else {
//                   return (
//                     <motion.div
//                       key={item.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: Math.min(index * 0.02, 1) }}
//                       whileHover={{ y: -5 }}
//                       onClick={() => handleItemClick(item)}
//                       className="cursor-pointer"
//                     >
//                       {cardContent}
//                     </motion.div>
//                   );
//                 }
//               })}
//             </div>

//             {/* Loading More Indicator */}
//             {loadingMore && (
//               <div className="flex justify-center mt-8">
//                 <div className="flex items-center gap-2 text-white bg-white/5 px-4 py-2 rounded-lg">
//                   <FiLoader className="animate-spin" />
//                   <span>Loading more...</span>
//                 </div>
//               </div>
//             )}

//             {/* No More Items */}
//             {!hasMore && items.length > 0 && (
//               <p className="text-center text-gray-400 mt-8">
//                 You've reached the end! ({items.length} items loaded)
//               </p>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CategoryPage;

// src/components/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiStar, 
  FiChevronLeft, 
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function CategoryPage() {
  const { category, type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Get page from URL or default to 1
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    setCurrentPage(page);
    fetchItems(page);
  }, [category, type, searchParams]);

  const fetchItems = async (pageNum) => {
    try {
      setLoading(true);
      
      let endpoint = '';
      
      // Determine endpoint based on category and type
      if (category === 'movies') {
        switch(type) {
          case 'popular':
            endpoint = '/movie/popular';
            break;
          case 'now-playing':
            endpoint = '/movie/now_playing';
            break;
          case 'upcoming':
            endpoint = '/movie/upcoming';
            break;
          case 'top-rated':
            endpoint = '/movie/top_rated';
            break;
          default:
            endpoint = '/movie/popular';
        }
      } else if (category === 'tv') {
        switch(type) {
          case 'popular':
            endpoint = '/tv/popular';
            break;
          case 'airing-today':
            endpoint = '/tv/airing_today';
            break;
          case 'on-the-air':
            endpoint = '/tv/on_the_air';
            break;
          case 'top-rated':
            endpoint = '/tv/top_rated';
            break;
          default:
            endpoint = '/tv/popular';
        }
      } else if (category === 'people') {
        switch(type) {
          case 'popular':
            endpoint = '/person/popular';
            break;
          default:
            endpoint = '/person/popular';
        }
      } else if (category === 'awards') {
        // For awards, we'll use top rated movies as placeholder
        endpoint = '/movie/top_rated';
      }
      
      console.log(`Fetching: ${API_BASE_URL}${endpoint}?page=${pageNum}`);
      const response = await axios.get(`${API_BASE_URL}${endpoint}?page=${pageNum}`);
      
      if (response.data && response.data.results) {
        setItems(response.data.results);
        setTotalPages(response.data.total_pages || 1);
        setTotalResults(response.data.total_results || 0);
      } else {
        console.error('No results in response:', response.data);
        toast.error('Failed to load items');
      }
      
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch items. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    // Update URL with new page parameter
    setSearchParams({ page: newPage.toString() });
    setCurrentPage(newPage);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE_URL}${path}`;
  };

  const handleItemClick = (item) => {
    if (category === 'people') {
      navigate(`/person/${item.id}`);
    } else if (category === 'tv') {
      navigate(`/tv/${item.id}`);
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  const getTitle = () => {
    const titles = {
      movies: {
        popular: 'Popular Movies',
        'now-playing': 'Now Playing',
        upcoming: 'Upcoming Movies',
        'top-rated': 'Top Rated Movies'
      },
      tv: {
        popular: 'Popular TV Shows',
        'airing-today': 'Airing Today',
        'on-the-air': 'On TV',
        'top-rated': 'Top Rated TV Shows'
      },
      people: {
        popular: 'Popular People'
      },
      awards: {
        popular: 'Award Winning Movies',
        upcoming: 'Upcoming Award Shows'
      }
    };
    return titles[category]?.[type] || 'Movies';
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-white text-xl">Loading {getTitle()}...</p>
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
        {/* Header with Results Count */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">{getTitle()}</h1>
          {totalResults > 0 && (
            <p className="text-gray-400">
              {totalResults.toLocaleString()} results
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white text-xl mb-4">No items found</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Back Home
            </button>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleItemClick(item)}
                  className="cursor-pointer group"
                >
                  <div className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 h-full">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={getImageUrl(item.poster_path || item.profile_path)}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                        }}
                      />
                      
                      {/* Rating Badge - Only for movies/TV, not for people */}
                      {category !== 'people' && item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                          <FiStar className="text-yellow-400 text-xs" />
                          <span className="text-white text-xs font-semibold">
                            {item.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Footer with Title */}
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
                      {category === 'people' && item.known_for_department && (
                        <p className="text-purple-400 text-xs mt-1">
                          {item.known_for_department}
                        </p>
                      )}
                      {category === 'people' && item.known_for && item.known_for.length > 0 && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                          {item.known_for[0]?.title || item.known_for[0]?.name}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                {/* Results info */}
                <p className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </p>
                
                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <FiChevronsLeft size={20} />
                  </button>
                  
                  {/* Previous page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft size={20} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-2">
                    {getPageNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`dots-${index}`} className="px-3 py-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight size={20} />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <FiChevronsRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;