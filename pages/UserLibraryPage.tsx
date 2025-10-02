import React, { useState, useEffect } from 'react';
import { Playlist, Music } from '../types';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import PlaylistCard from '../components/PlaylistCard';
import MusicCard from '../components/MusicCard';
import PlaylistForm from '../components/PlaylistForm';
import PlaylistSelector from '../components/PlaylistSelector';
import LoadingSpinner from '../components/LoadingSpinner';

const UserLibraryPage: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'playlists' | 'favorites'>('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playlistsData, favoritesData] = await Promise.all([
        api.getPlaylists(token!),
        api.getFavorites(token!),
      ]);
      setPlaylists(playlistsData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Failed to fetch library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (data: { name: string; description: string }) => {
    if (!token) return;
    try {
      const newPlaylist = await api.createPlaylist(data.name, data.description, token);
      setPlaylists(prev => [newPlaylist, ...prev]);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.deletePlaylist(id, token);
      setPlaylists(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handleAddToPlaylist = (music: Music) => {
    setSelectedMusic(music);
    setShowPlaylistSelector(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Your Library</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-spotify-gray mb-8">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`pb-4 font-semibold text-lg transition-colors relative ${
              activeTab === 'playlists'
                ? 'text-spotify-green'
                : 'text-spotify-gray-light hover:text-white'
            }`}
          >
            Playlists
            <span className="ml-2 text-spotify-gray-light">({playlists.length})</span>
            {activeTab === 'playlists' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-spotify-green"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-4 font-semibold text-lg transition-colors relative ${
              activeTab === 'favorites'
                ? 'text-spotify-green'
                : 'text-spotify-gray-light hover:text-white'
            }`}
          >
            Liked Songs
            <span className="ml-2 text-spotify-gray-light">({favorites.length})</span>
            {activeTab === 'favorites' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-spotify-green"></div>
            )}
          </button>
        </div>

        {/* Create Playlist Button */}
        {activeTab === 'playlists' && (
          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="spotify-button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Playlist
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'playlists' ? (
        playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-spotify-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Create your first playlist</h3>
            <p className="text-spotify-gray-light text-lg mb-6">It's easy, we'll help you</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="spotify-button"
            >
              Create playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map(playlist => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onDelete={handleDeletePlaylist}
              />
            ))}
          </div>
        )
      ) : (
        favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-spotify-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Songs you like will appear here</h3>
            <p className="text-spotify-gray-light text-lg mb-6">Save songs by tapping the heart icon.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="spotify-button-secondary"
            >
              Find songs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header for liked songs */}
            <div className="flex items-center gap-4 p-4 bg-spotify-dark rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-spotify-green to-spotify-green-dark rounded flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-spotify-gray-light text-sm uppercase tracking-wider">Playlist</p>
                <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
                <p className="text-spotify-gray-light">{favorites.length} songs</p>
              </div>
            </div>

            {/* Songs list */}
            <div className="space-y-2">
              {favorites.map((track, index) => (
                <div
                  key={track._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-spotify-light transition-colors group"
                >
                  <span className="text-spotify-gray-light w-6 text-center text-sm">{index + 1}</span>
                  <img
                    src={track.coverArt}
                    alt={track.album}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{track.title}</h4>
                    <p className="text-spotify-gray-light text-sm truncate">{track.artist}</p>
                  </div>
                  <div className="text-spotify-gray-light text-sm">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-spotify-gray-light hover:text-white transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6L3 13h4v7h6v-7h4l-7-7z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <PlaylistForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreatePlaylist}
        title="Create New Playlist"
      />

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

export default UserLibraryPage;