
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Music } from '../types';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { token } = useAuth();
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getMusic();
        setMusicList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch music');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, []);

  const genres = useMemo(() => {
    const allGenres = musicList.map(m => m.genre);
    return ['All', ...Array.from(new Set(allGenres))];
  }, [musicList]);

  const filteredMusic = useMemo(() => {
    return musicList.filter(music => {
      const matchesSearch = 
        music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = genreFilter === '' || genreFilter === 'All' || music.genre === genreFilter;
      return matchesSearch && matchesGenre;
    });
  }, [musicList, searchTerm, genreFilter]);

  const handleDeleteRequest = (id: string) => {
    setMusicToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!musicToDelete || !token) return;
    try {
      await api.deleteMusic(musicToDelete, token);
      setMusicList(prevList => prevList.filter(m => m._id !== musicToDelete));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete music');
    } finally {
      setIsModalOpen(false);
      setMusicToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="bg-spotify-dark rounded-xl p-6 shadow-spotify">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="spotify-input w-full pl-10"
            />
          </div>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="spotify-input w-full md:w-48"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Playlists Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Made for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Featured playlist cards would go here - for now showing recent music */}
          {filteredMusic.slice(0, 4).map(music => (
            <div key={`featured-${music._id}`} className="spotify-card group">
              <div className="aspect-square bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded-lg flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2">Daily Mix 1</h3>
                <p className="text-spotify-gray-light text-sm">Based on your listening history</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Recently Played</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMusic.slice(0, 8).map(music => (
            <MusicCard key={`recent-${music._id}`} music={music} onDelete={handleDeleteRequest} playlist={filteredMusic} />
          ))}
        </div>
      </section>

      {/* All Music Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">All Music</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMusic.length > 0 ? (
            filteredMusic.map(music => (
              <MusicCard key={music._id} music={music} onDelete={handleDeleteRequest} playlist={filteredMusic} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="w-16 h-16 text-spotify-gray-light mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <p className="text-spotify-gray-light text-lg">No music found.</p>
              <p className="text-spotify-gray-light text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        Are you sure you want to delete this music entry? This action cannot be undone.
      </Modal>
    </div>
  );
};

export default HomePage;
