# app.py - Updated TV endpoints and upcoming movies filter
import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# TMDB API configuration
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
TMDB_IMAGE_ORIGINAL_URL = 'https://image.tmdb.org/t/p/original'

def make_tmdb_request(endpoint, params=None):
    """Helper function to make TMDB API requests"""
    if params is None:
        params = {}
    
    params['api_key'] = TMDB_API_KEY
    params['language'] = 'en-US'
    
    try:
        response = requests.get(f"{TMDB_BASE_URL}/{endpoint}", params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"TMDB API Error: {e}")
        return None

def format_movie(movie):
    """Format movie data consistently"""
    return {
        'id': movie['id'],
        'title': movie['title'],
        'name': movie.get('title', movie.get('name')),
        'overview': movie.get('overview', ''),
        'poster_path': f"{TMDB_IMAGE_BASE_URL}{movie['poster_path']}" if movie.get('poster_path') else None,
        'backdrop_path': f"{TMDB_IMAGE_ORIGINAL_URL}{movie['backdrop_path']}" if movie.get('backdrop_path') else None,
        'release_date': movie.get('release_date'),
        'first_air_date': movie.get('first_air_date'),
        'vote_average': round(movie.get('vote_average', 0), 1),
        'vote_count': movie.get('vote_count', 0),
        'popularity': movie.get('popularity', 0),
        'genre_ids': movie.get('genre_ids', []),
        'media_type': movie.get('media_type', 'movie')
    }

def format_tv_show(tv):
    """Format TV show data consistently"""
    return {
        'id': tv['id'],
        'title': tv['name'],
        'name': tv['name'],
        'overview': tv.get('overview', ''),
        'poster_path': f"{TMDB_IMAGE_BASE_URL}{tv['poster_path']}" if tv.get('poster_path') else None,
        'backdrop_path': f"{TMDB_IMAGE_ORIGINAL_URL}{tv['backdrop_path']}" if tv.get('backdrop_path') else None,
        'first_air_date': tv.get('first_air_date'),
        'release_date': tv.get('first_air_date'),
        'vote_average': round(tv.get('vote_average', 0), 1),
        'vote_count': tv.get('vote_count', 0),
        'popularity': tv.get('popularity', 0),
        'genre_ids': tv.get('genre_ids', []),
        'media_type': 'tv'
    }

def format_person(person):
    """Format person data consistently"""
    return {
        'id': person['id'],
        'name': person['name'],
        'profile_path': f"{TMDB_IMAGE_BASE_URL}{person['profile_path']}" if person.get('profile_path') else None,
        'known_for_department': person.get('known_for_department'),
        'popularity': person.get('popularity', 0),
        'known_for': [format_movie(m) for m in person.get('known_for', [])] if person.get('known_for') else []
    }

# ============= MOVIE ENDPOINTS =============

@app.route('/movie/popular', methods=['GET'])
def get_movie_popular():
    """Get popular movies"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('movie/popular', {'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_movie(m) for m in data['results']]
        })
    return jsonify({'error': 'Failed to fetch popular movies', 'results': []}), 500

@app.route('/movie/now_playing', methods=['GET'])
def get_movie_now_playing():
    """Get now playing movies"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('movie/now_playing', {'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_movie(m) for m in data['results']]
        })
    return jsonify({'error': 'Failed to fetch now playing movies', 'results': []}), 500

@app.route('/movie/upcoming', methods=['GET'])
def get_movie_upcoming():
    """Get upcoming movies (only unreleased)"""
    page = request.args.get('page', 1, type=int)
    
    # Get current date to filter only unreleased movies
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # Use discover endpoint with release date filter
    params = {
        'page': page,
        'sort_by': 'release_date.asc',
        'release_date.gte': current_date,  # Only movies not released yet
        'with_release_type': '2|3',  # Theatrical release
        'vote_count.gte': 10  # Minimum votes to ensure quality
    }
    
    data = make_tmdb_request('discover/movie', params)
    
    if data and data.get('results'):
        # Additional filter to ensure only unreleased movies
        results = []
        for movie in data['results']:
            if movie.get('release_date') and movie['release_date'] >= current_date:
                results.append(format_movie(movie))
        
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': len(results),
            'results': results
        })
    
    return jsonify({'error': 'Failed to fetch upcoming movies', 'results': []}), 500

@app.route('/movie/top_rated', methods=['GET'])
def get_movie_top_rated():
    """Get top rated movies"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('movie/top_rated', {'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_movie(m) for m in data['results']]
        })
    return jsonify({'error': 'Failed to fetch top rated movies', 'results': []}), 500

# ============= TV SHOW ENDPOINTS =============

@app.route('/tv/popular', methods=['GET'])
def get_tv_popular():
    """Get popular TV shows"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('tv/popular', {'page': page})
    if data and data.get('results'):
        formatted_results = [format_tv_show(t) for t in data['results']]
        print(f"Found {len(formatted_results)} popular TV shows")  # Debug log
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': formatted_results
        })
    print("Failed to fetch popular TV shows")  # Debug log
    return jsonify({'error': 'Failed to fetch popular TV shows', 'results': []}), 500

@app.route('/tv/on_the_air', methods=['GET'])
def get_tv_on_the_air():
    """Get TV shows currently on air"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('tv/on_the_air', {'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_tv_show(t) for t in data['results']]
        })
    return jsonify({'error': 'Failed to fetch on the air TV shows', 'results': []}), 500

@app.route('/tv/airing_today', methods=['GET'])
def get_tv_airing_today():
    """Get TV shows airing today"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('tv/airing_today', {'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_tv_show(t) for t in data['results']]
        })
    return jsonify({'error': 'Failed to fetch airing today TV shows', 'results': []}), 500

@app.route('/tv/top_rated', methods=['GET'])
def get_tv_top_rated():
    """Get top rated TV shows"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('tv/top_rated', {'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_tv_show(t) for t in data['results']]
        })
    return jsonify({'error': 'Failed to fetch top rated TV shows', 'results': []}), 500

# ============= PEOPLE ENDPOINTS =============

@app.route('/person/popular', methods=['GET'])
def get_person_popular():
    """Get popular people"""
    page = request.args.get('page', 1, type=int)
    data = make_tmdb_request('person/popular', {'page': page})
    
    if data and data.get('results'):
        formatted_results = []
        for person in data['results']:
            formatted_person = {
                'id': person['id'],
                'name': person['name'],
                'profile_path': f"{TMDB_IMAGE_BASE_URL}{person['profile_path']}" if person.get('profile_path') else None,
                'known_for_department': person.get('known_for_department'),
                'popularity': person.get('popularity', 0),
                'known_for': []
            }
            
            if person.get('known_for'):
                for item in person['known_for']:
                    if item.get('media_type') == 'movie':
                        formatted_person['known_for'].append({
                            'id': item['id'],
                            'title': item.get('title', ''),
                            'name': item.get('name', ''),
                            'media_type': 'movie'
                        })
                    elif item.get('media_type') == 'tv':
                        formatted_person['known_for'].append({
                            'id': item['id'],
                            'name': item.get('name', ''),
                            'title': item.get('name', ''),
                            'media_type': 'tv'
                        })
            
            formatted_results.append(formatted_person)
        
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': formatted_results
        })
    
    return jsonify({'error': 'Failed to fetch popular people', 'results': []}), 500

@app.route('/person/<int:person_id>', methods=['GET'])
def get_person_details(person_id):
    """Get detailed information about a person"""
    data = make_tmdb_request(f'person/{person_id}', {
        'append_to_response': 'images,movie_credits,tv_credits,external_ids'
    })
    
    if not data:
        return jsonify({'error': 'Person not found'}), 404
    
    person = {
        'id': data['id'],
        'name': data['name'],
        'biography': data.get('biography', 'No biography available.'),
        'birthday': data.get('birthday'),
        'deathday': data.get('deathday'),
        'place_of_birth': data.get('place_of_birth'),
        'profile_path': f"{TMDB_IMAGE_ORIGINAL_URL}{data['profile_path']}" if data.get('profile_path') else None,
        'known_for_department': data.get('known_for_department'),
        'popularity': data.get('popularity', 0),
        'also_known_as': data.get('also_known_as', []),
        'gender': data.get('gender'),
        'homepage': data.get('homepage'),
        'imdb_id': data.get('external_ids', {}).get('imdb_id') if data.get('external_ids') else None
    }
    
    images = []
    if data.get('images') and data['images'].get('profiles'):
        for img in data['images']['profiles'][:20]:
            images.append(f"{TMDB_IMAGE_ORIGINAL_URL}{img['file_path']}")
    
    movie_credits = {
        'cast': [],
        'crew': []
    }
    
    if data.get('movie_credits'):
        cast_list = data['movie_credits'].get('cast', [])
        cast_list.sort(key=lambda x: x.get('release_date', ''), reverse=True)
        
        for credit in cast_list[:50]:
            movie_credits['cast'].append({
                'id': credit['id'],
                'title': credit['title'],
                'character': credit.get('character', 'Unknown'),
                'poster_path': f"{TMDB_IMAGE_BASE_URL}{credit['poster_path']}" if credit.get('poster_path') else None,
                'release_date': credit.get('release_date'),
                'vote_average': round(credit.get('vote_average', 0), 1)
            })
        
        crew_list = data['movie_credits'].get('crew', [])
        crew_list.sort(key=lambda x: x.get('release_date', ''), reverse=True)
        
        for credit in crew_list[:30]:
            movie_credits['crew'].append({
                'id': credit['id'],
                'title': credit['title'],
                'job': credit.get('job', 'Unknown'),
                'poster_path': f"{TMDB_IMAGE_BASE_URL}{credit['poster_path']}" if credit.get('poster_path') else None,
                'release_date': credit.get('release_date')
            })
    
    tv_credits = []
    
    if data.get('tv_credits') and data['tv_credits'].get('cast'):
        tv_list = data['tv_credits']['cast']
        tv_list.sort(key=lambda x: x.get('first_air_date', ''), reverse=True)
        
        for credit in tv_list[:30]:
            tv_credits.append({
                'id': credit['id'],
                'name': credit['name'],
                'character': credit.get('character', 'Unknown'),
                'poster_path': f"{TMDB_IMAGE_BASE_URL}{credit['poster_path']}" if credit.get('poster_path') else None,
                'first_air_date': credit.get('first_air_date')
            })
    
    return jsonify({
        'person': person,
        'images': images,
        'movie_credits': movie_credits,
        'tv_credits': tv_credits
    })

# ============= MOVIE DETAILS ENDPOINT =============

@app.route('/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    """Get detailed information about a specific movie"""
    data = make_tmdb_request(f'movie/{movie_id}', {
        'append_to_response': 'credits,images,videos,recommendations,similar,external_ids'
    })
    
    if not data:
        return jsonify({'error': 'Movie not found'}), 404
    
    movie = {
        'id': data['id'],
        'title': data['title'],
        'overview': data.get('overview', ''),
        'poster_path': f"{TMDB_IMAGE_ORIGINAL_URL}{data['poster_path']}" if data.get('poster_path') else None,
        'backdrop_path': f"{TMDB_IMAGE_ORIGINAL_URL}{data['backdrop_path']}" if data.get('backdrop_path') else None,
        'release_date': data.get('release_date'),
        'vote_average': round(data.get('vote_average', 0), 1),
        'vote_count': data.get('vote_count', 0),
        'runtime': data.get('runtime'),
        'genres': [g['name'] for g in data.get('genres', [])],
        'genre_ids': [g['id'] for g in data.get('genres', [])],
        'tagline': data.get('tagline'),
        'status': data.get('status'),
        'budget': data.get('budget'),
        'revenue': data.get('revenue'),
        'popularity': data.get('popularity', 0),
        'homepage': data.get('homepage'),
        'imdb_id': data.get('imdb_id'),
        'original_language': data.get('original_language'),
        'production_companies': [c['name'] for c in data.get('production_companies', [])],
        'production_countries': [c['name'] for c in data.get('production_countries', [])]
    }
    
    cast = []
    if data.get('credits'):
        for actor in data['credits'].get('cast', [])[:20]:
            cast.append({
                'id': actor['id'],
                'name': actor['name'],
                'character': actor.get('character', 'Unknown'),
                'profile_path': f"{TMDB_IMAGE_ORIGINAL_URL}{actor['profile_path']}" if actor.get('profile_path') else None,
                'order': actor.get('order', 0)
            })
    
    crew = []
    if data.get('credits'):
        for member in data['credits'].get('crew', [])[:10]:
            if member.get('job') in ['Director', 'Writer', 'Screenplay', 'Producer', 'Music']:
                crew.append({
                    'id': member['id'],
                    'name': member['name'],
                    'job': member.get('job'),
                    'profile_path': f"{TMDB_IMAGE_ORIGINAL_URL}{member['profile_path']}" if member.get('profile_path') else None
                })
    
    videos = []
    if data.get('videos'):
        for video in data['videos'].get('results', []):
            if video.get('site') == 'YouTube':
                videos.append({
                    'key': video['key'],
                    'name': video['name'],
                    'type': video.get('type'),
                    'site': video.get('site'),
                    'published_at': video.get('published_at')
                })
    
    images = {
        'backdrops': [],
        'posters': []
    }
    if data.get('images'):
        for img in data['images'].get('backdrops', [])[:10]:
            images['backdrops'].append(f"{TMDB_IMAGE_ORIGINAL_URL}{img['file_path']}")
        for img in data['images'].get('posters', [])[:10]:
            images['posters'].append(f"{TMDB_IMAGE_ORIGINAL_URL}{img['file_path']}")
    
    recommendations = []
    if data.get('recommendations'):
        for rec in data['recommendations'].get('results', [])[:12]:
            recommendations.append(format_movie(rec))
    
    return jsonify({
        'movie': movie,
        'cast': cast,
        'crew': crew,
        'videos': videos,
        'images': images,
        'recommendations': recommendations
    })

# ============= TV DETAILS ENDPOINT =============

@app.route('/tv/<int:tv_id>', methods=['GET'])
def get_tv_details(tv_id):
    """Get detailed information about a specific TV show"""
    data = make_tmdb_request(f'tv/{tv_id}', {
        'append_to_response': 'credits,images,videos,recommendations'
    })
    
    if not data:
        return jsonify({'error': 'TV show not found'}), 404
    
    tv_show = {
        'id': data['id'],
        'name': data['name'],
        'title': data['name'],
        'overview': data.get('overview', ''),
        'poster_path': f"{TMDB_IMAGE_ORIGINAL_URL}{data['poster_path']}" if data.get('poster_path') else None,
        'backdrop_path': f"{TMDB_IMAGE_ORIGINAL_URL}{data['backdrop_path']}" if data.get('backdrop_path') else None,
        'first_air_date': data.get('first_air_date'),
        'release_date': data.get('first_air_date'),
        'vote_average': round(data.get('vote_average', 0), 1),
        'vote_count': data.get('vote_count', 0),
        'genres': [g['name'] for g in data.get('genres', [])],
        'number_of_seasons': data.get('number_of_seasons'),
        'number_of_episodes': data.get('number_of_episodes'),
        'status': data.get('status'),
        'networks': [n['name'] for n in data.get('networks', [])]
    }
    
    cast = []
    if data.get('credits'):
        for actor in data['credits'].get('cast', [])[:20]:
            cast.append({
                'id': actor['id'],
                'name': actor['name'],
                'character': actor.get('character', 'Unknown'),
                'profile_path': f"{TMDB_IMAGE_ORIGINAL_URL}{actor['profile_path']}" if actor.get('profile_path') else None
            })
    
    videos = []
    if data.get('videos'):
        for video in data['videos'].get('results', []):
            if video.get('site') == 'YouTube':
                videos.append({
                    'key': video['key'],
                    'name': video['name'],
                    'type': video.get('type')
                })
    
    return jsonify({
        'movie': tv_show,
        'cast': cast,
        'videos': videos
    })

# ============= TRENDING =============

@app.route('/trending/<media_type>/<time_window>', methods=['GET'])
def get_trending(media_type, time_window):
    """Get trending items"""
    data = make_tmdb_request(f'trending/{media_type}/{time_window}')
    if data and data.get('results'):
        items = []
        for item in data['results'][:20]:
            if item.get('media_type') == 'tv' or media_type == 'tv':
                items.append(format_tv_show(item))
            elif item.get('media_type') == 'person':
                items.append(format_person(item))
            else:
                items.append(format_movie(item))
        return jsonify({'results': items})
    return jsonify({'error': 'Failed to fetch trending', 'results': []}), 500

# ============= DISCOVER =============

@app.route('/discover/movie', methods=['GET'])
def discover_movies():
    """Discover movies with filters"""
    page = request.args.get('page', 1, type=int)
    with_watch_monetization_types = request.args.get('with_watch_monetization_types')
    
    params = {'page': page}
    if with_watch_monetization_types:
        params['with_watch_monetization_types'] = with_watch_monetization_types
    
    data = make_tmdb_request('discover/movie', params)
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'results': [format_movie(m) for m in data['results'][:20]]
        })
    return jsonify({'error': 'Failed to discover movies', 'results': []}), 500

@app.route('/discover/tv', methods=['GET'])
def discover_tv():
    """Discover TV shows with filters"""
    page = request.args.get('page', 1, type=int)
    with_watch_monetization_types = request.args.get('with_watch_monetization_types')
    
    params = {'page': page}
    if with_watch_monetization_types:
        params['with_watch_monetization_types'] = with_watch_monetization_types
    
    data = make_tmdb_request('discover/tv', params)
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'results': [format_tv_show(t) for t in data['results'][:20]]
        })
    return jsonify({'error': 'Failed to discover TV shows', 'results': []}), 500

# ============= SEARCH =============

@app.route('/search/movie', methods=['GET'])
def search_movies():
    """Search for movies"""
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    
    if not query:
        return jsonify({'error': 'Query parameter is required', 'results': []}), 400
    
    data = make_tmdb_request('search/movie', {'query': query, 'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_movie(m) for m in data['results']]
        })
    return jsonify({'error': 'Failed to search movies', 'results': []}), 500

@app.route('/search/tv', methods=['GET'])
def search_tv():
    """Search for TV shows"""
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    
    if not query:
        return jsonify({'error': 'Query parameter is required', 'results': []}), 400
    
    data = make_tmdb_request('search/tv', {'query': query, 'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_tv_show(t) for t in data['results']]
        })
    return jsonify({'error': 'Failed to search TV shows', 'results': []}), 500

@app.route('/search/person', methods=['GET'])
def search_person():
    """Search for people"""
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    
    if not query:
        return jsonify({'error': 'Query parameter is required', 'results': []}), 400
    
    data = make_tmdb_request('search/person', {'query': query, 'page': page})
    if data and data.get('results'):
        return jsonify({
            'page': data['page'],
            'total_pages': data['total_pages'],
            'total_results': data['total_results'],
            'results': [format_person(p) for p in data['results']]
        })
    return jsonify({'error': 'Failed to search people', 'results': []}), 500

@app.route('/genres', methods=['GET'])
def get_genres():
    """Get movie genres"""
    data = make_tmdb_request('genre/movie/list')
    if data and data.get('genres'):
        return jsonify({'genres': data['genres']})
    return jsonify({'error': 'Failed to fetch genres', 'genres': []}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'MovieVerse API is running',
        'endpoints': [
            '/movie/popular',
            '/movie/now_playing',
            '/movie/upcoming',
            '/movie/top_rated',
            '/tv/popular',
            '/tv/on_the_air',
            '/tv/airing_today',
            '/tv/top_rated',
            '/person/popular',
            '/person/<id>',
            '/movie/<id>',
            '/tv/<id>',
            '/trending/<media_type>/<time_window>',
            '/discover/movie',
            '/discover/tv',
            '/search/movie',
            '/search/tv',
            '/search/person',
            '/genres'
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')