import React from 'react';
import { Link } from 'react-router-dom';
import { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: (id: string) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-brand-light rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white truncate group-hover:text-brand-primary transition-colors">
              {playlist.name}
            </h3>
            <p className="text-sm text-brand-subtext mt-1">
              {playlist.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-brand-subtext">
          <span>{playlist.tracks.length} tracks</span>
          <span>Created {formatDate(playlist.createdAt)}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/playlists/${playlist._id}`}
            className="text-brand-primary hover:underline"
          >
            View Playlist
          </Link>
          <button
            onClick={() => onDelete(playlist._id)}
            className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;