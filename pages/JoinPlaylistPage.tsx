import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Playlist } from '../types';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';

const JoinPlaylistPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // For demo purposes, we'll create a mock playlist since we don't have a way to fetch by invite code yet
    // In a real app, you'd fetch playlist details by invite code
    if (inviteCode) {
      // Mock playlist data
      setPlaylist({
        _id: 'mock-playlist-id',
        name: 'Collaborative Playlist',
        description: 'A playlist for collaboration',
        user: { id: 'owner-id', username: 'Playlist Owner', email: 'owner@example.com', role: 'user' },
        tracks: [],
        collaborators: [],
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [inviteCode]);

  const handleJoinPlaylist = async (role: 'viewer' | 'editor' = 'viewer') => {
    if (!token || !inviteCode) return;

    setJoining(true);
    try {
      const result = await api.acceptInvitation(inviteCode, role, token);
      addNotification({
        type: 'success',
        title: 'Joined Playlist Successfully!',
        message: `You are now a ${role} of "${result.name}"`
      });
      navigate(`/playlists/${result._id}`);
    } catch (err) {
      setError('Failed to join playlist. The invite code may be invalid or expired.');
      addNotification({
        type: 'error',
        title: 'Failed to Join Playlist',
        message: 'Please check the invite code and try again.'
      });
      console.error('Error joining playlist:', err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Invite Code</h1>
          <p className="text-spotify-gray-light mb-6">
            {error || 'This invite code is not valid or has expired.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="spotify-button"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-spotify-dark rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Join Playlist</h1>
        <p className="text-spotify-gray-light mb-6">
          You've been invited to collaborate on <strong className="text-white">"{playlist.name}"</strong>
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleJoinPlaylist('editor')}
            disabled={joining}
            className="w-full bg-spotify-green text-black py-3 px-4 rounded-full font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join as Editor'}
          </button>
          <button
            onClick={() => handleJoinPlaylist('viewer')}
            disabled={joining}
            className="w-full bg-spotify-light text-white py-3 px-4 rounded-full font-semibold hover:bg-spotify-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join as Viewer'}
          </button>
        </div>

        <div className="text-xs text-spotify-gray-light space-y-1">
          <p><strong>Editor:</strong> Can add/remove tracks and edit playlist details</p>
          <p><strong>Viewer:</strong> Can view and play tracks only</p>
        </div>
      </div>
    </div>
  );
};

export default JoinPlaylistPage;