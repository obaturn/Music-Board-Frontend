import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Music } from '../types';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface SearchFilters {
  q: string;
  genre: string;
  artist: string;
  album: string;
  releaseYearMin: string;
  releaseYearMax: string;
  sortBy: 'relevance' | 'popularity' | 'date' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('musicSearchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to parse search history');
      }
    }
  }, []);

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('musicSearchHistory', JSON.stringify(newHistory));
  };

  const removeFromSearchHistory = (query: string) => {
    const newHistory = searchHistory.filter(h => h !== query);
    setSearchHistory(newHistory);
    localStorage.setItem('musicSearchHistory', JSON.stringify(newHistory));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('musicSearchHistory');
  };

  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    genre: searchParams.get('genre') || '',
    artist: searchParams.get('artist') || '',
    album: searchParams.get('album') || '',
    releaseYearMin: searchParams.get('releaseYearMin') || '',
    releaseYearMax: searchParams.get('releaseYearMax') || '',
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'relevance',
    sortOrder: (searchParams.get('sortOrder') as SearchFilters['sortOrder']) || 'desc',
  });

  const genres = useMemo(() => {
    // In a real app, you'd fetch unique genres from the API
    return ['All', 'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Reggae'];
  }, []);

  const performSearch = useCallback(async (searchFilters: SearchFilters, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: 20,
        ...searchFilters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const result = await api.searchMusic(params);
      setMusicList(result.music);
      setPagination(result.pagination);

      // Add to search history if it's a text search
      if (searchFilters.q && searchFilters.q.trim()) {
        addToSearchHistory(searchFilters.q.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search music');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filters.q || Object.values(filters).some(v => v !== '' && v !== 'relevance' && v !== 'desc')) {
      performSearch(filters);
    }
  }, [filters, performSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'relevance' && v !== 'desc') {
        params.set(k, String(v));
      }
    });
    setSearchParams(params);

    // Debounce search for query changes
    if (key === 'q') {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        performSearch(newFilters);
      }, 500);
    } else {
      // Immediate search for other filters
      performSearch(newFilters);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(filters);
  };

  const handlePageChange = (page: number) => {
    performSearch(filters, page);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      q: '',
      genre: '',
      artist: '',
      album: '',
      releaseYearMin: '',
      releaseYearMax: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Search</h1>

        {/* Main Search Bar */}
        <div className="max-w-2xl mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="What do you want to listen to?"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="spotify-input pl-12 text-lg py-4 w-full"
              />
              {/* Search History Dropdown */}
              {searchHistory.length > 0 && !filters.q && (
                <div className="absolute top-full left-0 right-0 bg-spotify-dark border border-spotify-gray rounded-xl mt-2 z-10 max-h-64 overflow-y-auto shadow-spotify">
                  <div className="p-4 border-b border-spotify-gray flex justify-between items-center">
                    <span className="text-spotify-gray-light font-medium">Recent searches</span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-spotify-gray-light hover:text-white text-sm transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 hover:bg-spotify-light cursor-pointer transition-colors"
                      onClick={() => handleFilterChange('q', query)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-white">{query}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(query);
                        }}
                        className="text-spotify-gray-light hover:text-white p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-full font-medium transition-colors ${
                showFilters
                  ? 'bg-spotify-green text-spotify-black'
                  : 'spotify-button-secondary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-spotify-dark p-6 rounded-xl shadow-spotify mb-8">
            <h3 className="text-white font-semibold text-lg mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-spotify-gray-light text-sm mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="spotify-input w-full"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre.toLowerCase()}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-spotify-gray-light text-sm mb-2">Artist</label>
                <input
                  type="text"
                  placeholder="Artist name"
                  value={filters.artist}
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  className="spotify-input w-full"
                />
              </div>

              <div>
                <label className="block text-spotify-gray-light text-sm mb-2">Album</label>
                <input
                  type="text"
                  placeholder="Album name"
                  value={filters.album}
                  onChange={(e) => handleFilterChange('album', e.target.value)}
                  className="spotify-input w-full"
                />
              </div>

              <div>
                <label className="block text-spotify-gray-light text-sm mb-2">Release Year</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.releaseYearMin}
                    onChange={(e) => handleFilterChange('releaseYearMin', e.target.value)}
                    className="spotify-input flex-1"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.releaseYearMax}
                    onChange={(e) => handleFilterChange('releaseYearMax', e.target.value)}
                    className="spotify-input flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-spotify-gray-light text-sm">Sort by:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value as SearchFilters['sortBy'])}
                    className="spotify-input"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="popularity">Popularity</option>
                    <option value="date">Date</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-spotify-gray-light text-sm">Order:</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as SearchFilters['sortOrder'])}
                    className="spotify-input"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="spotify-button-secondary"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      ) : (
        <>
          {musicList.length > 0 && (
            <div className="mb-6">
              <p className="text-spotify-gray-light">
                {pagination?.totalResults || 0} results
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {musicList.length > 0 ? (
              musicList.map(music => (
                <MusicCard key={music._id} music={music} playlist={musicList} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-spotify-dark rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {filters.q || Object.values(filters).some(v => v !== '' && v !== 'relevance' && v !== 'desc')
                    ? 'No results found'
                    : 'What do you want to listen to?'}
                </h3>
                <p className="text-spotify-gray-light text-lg">
                  {filters.q || Object.values(filters).some(v => v !== '' && v !== 'relevance' && v !== 'desc')
                    ? 'Try adjusting your search or filters.'
                    : 'Search for artists, songs, albums or podcasts.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="spotify-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-spotify-gray-light">
                  {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="spotify-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;