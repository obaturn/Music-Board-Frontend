
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAudio } from '../hooks/useAudio';
import { api } from '../services/api';

interface MusicCardProps {
  music: Music;
  onDelete: (id: string) => void;
  onPlay?: (music: Music, playlist: Music[]) => void;
  playlist?: Music[];
  onAddToPlaylist?: (music: Music) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ music, onDelete, onPlay, playlist = [], onAddToPlaylist }) => {
  const { user, token } = useAuth();
  const { playTrack, setPlaylist } = useAudio();
  const canModify = user && (user.role === UserRole.ADMIN || user.id === music.ownerId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    if (user && token) {
      api.isFavorite(music._id, token).then(({ isFavorite }) => {
        setIsFavorite(isFavorite);
      }).catch(console.error);
    }
  }, [user, token, music._id]);

  const toggleFavorite = async () => {
    if (!user || !token) return;
    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await api.removeFavorite(music._id, token);
        setIsFavorite(false);
      } else {
        await api.addFavorite(music._id, token);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay(music, playlist);
    } else {
      // Default: set playlist to the provided playlist or [music]
      const playList = playlist.length > 0 ? playlist : [music];
      const index = playList.findIndex(m => m._id === music._id);
      setPlaylist(playList, index >= 0 ? index : 0);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="spotify-card group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        {music.coverArt ? (
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/cover-arts/${music.coverArt}`}
            alt={music.album}
            onError={(e) => {
              // Fallback to default album art
              e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="#282828"/>
                  <circle cx="100" cy="80" r="25" fill="#535353"/>
                  <path d="M70 130 Q100 110 130 130 L130 160 L70 160 Z" fill="#535353"/>
                  <circle cx="85" cy="75" r="3" fill="#b3b3b3"/>
                  <circle cx="115" cy="75" r="3" fill="#b3b3b3"/>
                </svg>
              `)}`;
            }}
          />
        ) : (
          // Default album art
          <div className="w-full h-full bg-gradient-to-br from-spotify-gray to-spotify-dark flex items-center justify-center">
            <svg className="w-16 h-16 text-spotify-gray-light" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
            </svg>
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-60"
          aria-label={`Play ${music.title}`}
        >
          <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v6l7 5V2z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="text-white font-semibold text-base truncate group-hover:text-spotify-green transition-colors">
              {music.title}
            </h3>
            <p className="text-spotify-gray-light text-sm truncate">{music.artist}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-spotify-gray-light">
            <span>{formatDuration(music.duration)}</span>
            <span className="bg-spotify-dark px-2 py-1 rounded-full">{music.genre}</span>
          </div>
        </div>

        {/* Action buttons - shown on hover */}
        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            {user && (
              <>
                <button
                  onClick={toggleFavorite}
                  disabled={loadingFavorite}
                  className={`p-2 rounded-full transition-colors hover:bg-spotify-light ${
                    isFavorite ? 'text-red-500' : 'text-spotify-gray-light hover:text-red-500'
                  }`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => onAddToPlaylist?.(music)}
                  className="p-2 rounded-full text-spotify-gray-light hover:text-white hover:bg-spotify-light transition-colors"
                  aria-label="Add to playlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <Link
            to={`/music/${music._id}`}
            className="text-spotify-green hover:text-spotify-green-hover font-medium text-sm transition-colors"
          >
            Details
          </Link>
        </div>

        {canModify && (
          <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              to={`/edit/${music._id}`}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-full transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(music._id)}
              className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-full transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicCard;
