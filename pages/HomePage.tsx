
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Music, Artist, Album } from '../types';
import MusicCard from '../components/MusicCard';
import PlaylistSelector from '../components/PlaylistSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch music (public), artists and albums (now public)
        const [musicData, artistsData, albumsData] = await Promise.all([
          api.getMusic(),
          api.getArtists({ limit: 10 }).catch(() => ({ artists: [] })), // Fallback if fails
          api.getAlbums({ limit: 10 }).catch(() => ({ albums: [] }))    // Fallback if fails
        ]);

        setMusicList(musicData);
        setArtists(artistsData.artists || []);
        setAlbums(albumsData.albums || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // Still set music list to empty arrays for artists/albums if API fails
        setArtists([]);
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const handleAddToPlaylist = (music: Music) => {
    setSelectedMusic(music);
    setShowPlaylistSelector(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-12">
      {/* Welcome Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome back{user?.username ? `, ${user.username}` : ''}!
        </h1>
        <p className="text-spotify-gray-light text-lg max-w-2xl mx-auto mb-6">
          Discover new music, create playlists, and connect with artists from around the world.
        </p>
        {isAuthenticated && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/profile"
                className="group bg-gradient-to-r from-spotify-green to-spotify-green-hover hover:from-spotify-green-hover hover:to-spotify-green text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-spotify-green/50"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </span>
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="group bg-gradient-to-r from-spotify-dark to-spotify-gray hover:from-spotify-gray hover:to-spotify-light text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-spotify-gray"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin Dashboard
                  </span>
                </Link>
              )}
              <Link
                to="/library"
                className="group bg-transparent hover:bg-spotify-dark text-spotify-gray-light hover:text-white font-medium py-3 px-8 rounded-full transition-all duration-300 border border-spotify-gray hover:border-spotify-gray-light shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Your Library
                </span>
              </Link>
            </div>
            <p className="text-spotify-gray-light text-sm">
              💡 <strong>Tip:</strong> Use the menu button (☰) in the top-left to access more features like playlists and settings.
            </p>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-spotify-dark rounded-xl p-6 shadow-spotify">
        <h2 className="text-xl font-semibold text-white mb-4">Find Your Music</h2>
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

      {/* Popular Artists Section */}
      {artists.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist) => (
              <Link
                key={artist._id}
                to={`/artists/${artist._id}`}
                className="bg-spotify-dark p-4 rounded-lg hover:bg-spotify-light transition-colors group text-center"
              >
                <div className="w-24 h-24 mx-auto mb-3 bg-spotify-light rounded-full overflow-hidden">
                  {artist.profilePicture ? (
                    <img
                      src={artist.profilePicture}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${artist.name}/200`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-light flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {artist.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-white font-medium text-sm truncate group-hover:text-spotify-green transition-colors">
                  {artist.name}
                </h3>
                <p className="text-spotify-gray-light text-xs mt-1">
                  {artist.followerCount} followers
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Albums Section */}
      {albums.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">New Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album) => (
              <Link
                key={album._id}
                to={`/albums/${album._id}`}
                className="bg-spotify-dark p-4 rounded-lg hover:bg-spotify-light transition-colors group"
              >
                <div className="aspect-square bg-spotify-light rounded-lg mb-3 overflow-hidden">
                  {album.coverArt ? (
                    <img
                      src={album.coverArt}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${album.title}/300`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-light flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {album.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-white font-medium text-sm truncate group-hover:text-spotify-green transition-colors">
                  {album.title}
                </h3>
                <p className="text-spotify-gray-light text-xs truncate">
                  {album.artist.name}
                </p>
                <p className="text-spotify-gray-light text-xs mt-1">
                  {album.releaseYear}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Made for You Section - Spotify Style */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Made for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Daily Mix */}
          <div className="group cursor-pointer">
            <div className="relative aspect-square bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl mb-2">Daily Mix 1</h3>
                <p className="text-white/80 text-sm">Your daily mix of fresh music</p>
              </div>
              <div className="relative z-10 flex -space-x-2">
                {filteredMusic.slice(0, 4).map((music, index) => (
                  <div
                    key={music._id}
                    className="w-8 h-8 bg-spotify-light rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      backgroundImage: music.coverArt ? `url(${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/cover-arts/${music.coverArt})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!music.coverArt && music.title.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discover Weekly */}
          <div className="group cursor-pointer">
            <div className="relative aspect-square bg-gradient-to-br from-green-600 via-teal-500 to-blue-500 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl mb-2">Discover Weekly</h3>
                <p className="text-white/80 text-sm">Your weekly music discovery</p>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Release Radar */}
          <div className="group cursor-pointer">
            <div className="relative aspect-square bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl mb-2">Release Radar</h3>
                <p className="text-white/80 text-sm">New music from artists you follow</p>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Played */}
          <div className="group cursor-pointer">
            <div className="relative aspect-square bg-gradient-to-br from-yellow-600 via-orange-500 to-red-500 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl mb-2">Recently Played</h3>
                <p className="text-white/80 text-sm">Your recently played tracks</p>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Played Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Recently Played</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMusic.slice(0, 8).map(music => (
            <MusicCard key={`recent-${music._id}`} music={music} onDelete={handleDeleteRequest} onAddToPlaylist={handleAddToPlaylist} playlist={filteredMusic} />
          ))}
        </div>
      </section>

      {/* All Music Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">All Music</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMusic.length > 0 ? (
            filteredMusic.map(music => (
              <MusicCard key={music._id} music={music} onDelete={handleDeleteRequest} onAddToPlaylist={handleAddToPlaylist} playlist={filteredMusic} />
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

      {selectedMusic && (
        <PlaylistSelector
          isOpen={showPlaylistSelector}
          onClose={() => {
            setShowPlaylistSelector(false);
            setSelectedMusic(null);
          }}
          music={selectedMusic}
        />
      )}
    </div>
  );
};

export default HomePage;
