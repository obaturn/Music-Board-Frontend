import React, { useState, useEffect } from 'react';
import { Playlist, Music } from '../types';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface PlaylistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  music: Music;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ isOpen, onClose, music }) => {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchPlaylists();
    }
  }, [isOpen, token]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await api.getPlaylists(token!);
      // Filter to only show playlists the user can edit
      const editablePlaylists = data.filter(playlist => {
        if (!user) return false;
        const isOwner = playlist.user.id === user.id;
        const collaborator = playlist.collaborators.find(collab => collab.user.id === user.id);
        const userRole = collaborator?.role || (isOwner ? 'owner' : 'viewer');
        return userRole === 'owner' || userRole === 'editor' || user.role === 'admin';
      });
      setPlaylists(editablePlaylists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Playlists',
        message: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!token) return;

    setAddingToPlaylist(playlistId);
    try {
      await api.addTrackToPlaylist(playlistId, music._id, token);
      addNotification({
        type: 'success',
        title: 'Track Added',
        message: `"${music.title}" has been added to your playlist!`
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to add track to playlist:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Add Track',
        message: error.message || 'Please try again.'
      });
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const isTrackInPlaylist = (playlist: Playlist) => {
    return playlist.tracks.some(track => track._id === music._id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add "${music.title}" to Playlist`}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-spotify-gray-light mb-4">You don't have any playlists yet.</p>
            <p className="text-sm text-spotify-gray-light">Create a playlist first to add tracks to it.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {playlists.map((playlist) => {
              const alreadyInPlaylist = isTrackInPlaylist(playlist);
              const isAdding = addingToPlaylist === playlist._id;

              return (
                <div
                  key={playlist._id}
                  className="flex items-center justify-between p-3 bg-spotify-dark rounded-lg hover:bg-spotify-light transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{playlist.name}</h4>
                    <p className="text-spotify-gray-light text-sm">
                      {playlist.tracks.length} tracks • {playlist.collaborators.length > 0 ? 'Collaborative' : 'Personal'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToPlaylist(playlist._id)}
                    disabled={alreadyInPlaylist || isAdding}
                    className={`ml-4 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      alreadyInPlaylist
                        ? 'bg-spotify-green text-black cursor-not-allowed'
                        : isAdding
                        ? 'bg-spotify-gray text-white cursor-wait'
                        : 'bg-spotify-green hover:bg-green-400 text-black'
                    }`}
                  >
                    {alreadyInPlaylist ? 'Added' : isAdding ? 'Adding...' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-spotify-gray">
          <button
            onClick={onClose}
            className="px-4 py-2 text-spotify-gray-light hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PlaylistSelector;