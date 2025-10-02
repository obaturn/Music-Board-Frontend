import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Playlist, Music, PlaylistCollaborator } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAudio } from '../hooks/useAudio';
import { api } from '../services/api';
import MusicCard from '../components/MusicCard';
import PlaylistForm from '../components/PlaylistForm';
import CollaboratorList from '../components/CollaboratorList';
import InviteModal from '../components/InviteModal';
import LoadingSpinner from '../components/LoadingSpinner';

const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const { setPlaylist } = useAudio();
  const navigate = useNavigate();

  const [playlist, setPlaylistData] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canManageCollaborators: false,
    canInvite: false
  });

  useEffect(() => {
    if (id && token) {
      fetchPlaylist();
    }
  }, [id, token]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const data = await api.getPlaylistById(id!, token!);
      setPlaylistData(data);
      checkUserPermissions(data);
    } catch (err) {
      setError('Failed to load playlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermissions = (playlistData: Playlist) => {
    if (!user) return;

    const isOwner = playlistData.user.id === user.id;
    const collaborator = playlistData.collaborators.find(collab => collab.user.id === user.id);
    const userRole = collaborator?.role || (isOwner ? 'owner' : 'viewer');

    const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy];

    setUserPermissions({
      canEdit: userRoleLevel >= roleHierarchy.editor,
      canDelete: isOwner,
      canManageCollaborators: isOwner,
      canInvite: isOwner
    });
  };

  const handlePlayAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      setPlaylist(playlist.tracks, 0);
    }
  };

  const handleEditPlaylist = async (data: { name: string; description: string }) => {
    if (!playlist || !token) return;
    try {
      const updated = await api.updatePlaylist(playlist._id, data.name, data.description, token);
      setPlaylistData(updated);
    } catch (err) {
      console.error('Failed to update playlist:', err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist || !token) return;
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.deletePlaylist(playlist._id, token);
      navigate('/library');
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlist || !token) return;
    try {
      const updated = await api.removeTrackFromPlaylist(playlist._id, trackId, token);
      setPlaylistData(updated);
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

  const handleGenerateInvite = async () => {
    if (!playlist || !token) throw new Error('Playlist or token not available');
    return await api.inviteCollaborator(playlist._id, token);
  };

  const handleUpdateCollaboratorRole = async (userId: string, role: 'editor' | 'viewer') => {
    if (!playlist || !token) return;
    try {
      const updated = await api.updateCollaboratorRole(playlist._id, userId, role, token);
      setPlaylistData(updated);
    } catch (err) {
      console.error('Failed to update collaborator role:', err);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!playlist || !token) return;
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      const updated = await api.removeCollaborator(playlist._id, userId, token);
      setPlaylistData(updated);
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !playlist) return <div className="text-center text-red-500">{error || 'Playlist not found'}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
            <p className="text-brand-subtext">{playlist.description || 'No description'}</p>
            <p className="text-sm text-brand-gray mt-2">{playlist.tracks.length} tracks</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePlayAll}
              disabled={playlist.tracks.length === 0}
              className="px-4 py-2 bg-spotify-green hover:bg-green-400 text-black rounded-md transition-colors disabled:opacity-50"
            >
              Play All
            </button>
            {userPermissions.canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Invite
              </button>
            )}
            {userPermissions.canEdit && (
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Edit
              </button>
            )}
            {userPermissions.canDelete && (
              <button
                onClick={handleDeletePlaylist}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {playlist.tracks.length === 0 ? (
        <div className="text-center text-spotify-gray-light py-12">
          <div className="w-32 h-32 bg-spotify-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-spotify-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No tracks in this playlist yet</h3>
          <p className="text-spotify-gray-light text-lg mb-6">Add some tracks to get started!</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="spotify-button"
            >
              Browse Music
            </button>
            {userPermissions.canEdit && (
              <button
                onClick={() => navigate('/search')}
                className="spotify-button-secondary"
              >
                Search & Add Tracks
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlist.tracks.map((track, index) => (
            <div key={track._id} className="relative">
              <MusicCard
                music={track}
                onDelete={() => {}} // Not used in playlist context
                playlist={playlist.tracks}
                onPlay={(music, playlist) => {
                  const idx = playlist.findIndex(t => t._id === music._id);
                  setPlaylist(playlist, idx >= 0 ? idx : 0);
                }}
              />
              {userPermissions.canEdit && (
                <button
                  onClick={() => handleRemoveTrack(track._id)}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove from playlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Collaborators Section */}
      <div className="mt-12">
        <CollaboratorList
          collaborators={playlist.collaborators}
          currentUser={user!}
          playlistOwnerId={playlist.user.id}
          onUpdateRole={handleUpdateCollaboratorRole}
          onRemoveCollaborator={handleRemoveCollaborator}
          canManage={userPermissions.canManageCollaborators}
        />
      </div>

      <PlaylistForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditPlaylist}
        initialData={{ name: playlist.name, description: playlist.description }}
        title="Edit Playlist"
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onGenerateInvite={handleGenerateInvite}
      />
    </div>
  );
};

export default PlaylistDetailPage;