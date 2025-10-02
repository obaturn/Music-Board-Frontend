import React from 'react';
import { PlaylistCollaborator, User } from '../types';

interface CollaboratorListProps {
  collaborators: PlaylistCollaborator[];
  currentUser: User;
  playlistOwnerId: string;
  onUpdateRole: (userId: string, role: 'owner' | 'editor' | 'viewer') => void;
  onRemoveCollaborator: (userId: string) => void;
  canManage: boolean;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  collaborators,
  currentUser,
  playlistOwnerId,
  onUpdateRole,
  onRemoveCollaborator,
  canManage
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-500 text-white';
      case 'editor': return 'bg-blue-500 text-white';
      case 'viewer': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const canChangeRole = (collaborator: PlaylistCollaborator) => {
    // Only owner can change roles, and can't change their own role
    return canManage && collaborator.user.id !== currentUser.id;
  };

  const canRemove = (collaborator: PlaylistCollaborator) => {
    // Only owner can remove collaborators, and can't remove themselves
    return canManage && collaborator.user.id !== currentUser.id;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Collaborators</h3>

      {/* Owner */}
      <div className="flex items-center justify-between p-3 bg-spotify-dark rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {currentUser.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{currentUser.username} (You)</p>
            <p className="text-spotify-gray-light text-sm">Playlist Owner</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor('owner')}`}>
          Owner
        </span>
      </div>

      {/* Collaborators */}
      {collaborators.map((collaborator) => (
        <div key={collaborator.user.id} className="flex items-center justify-between p-3 bg-spotify-dark rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-spotify-light rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {collaborator.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{collaborator.user.username}</p>
              <p className="text-spotify-gray-light text-sm">
                Added {new Date(collaborator.addedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canChangeRole(collaborator) && (
              <select
                value={collaborator.role}
                onChange={(e) => onUpdateRole(collaborator.user.id, e.target.value as 'owner' | 'editor' | 'viewer')}
                className="bg-spotify-light text-white text-sm rounded px-2 py-1 border border-spotify-gray focus:outline-none focus:ring-1 focus:ring-spotify-green"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            )}

            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(collaborator.role)}`}>
              {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
            </span>

            {canRemove(collaborator) && (
              <button
                onClick={() => onRemoveCollaborator(collaborator.user.id)}
                className="p-1 text-spotify-gray-light hover:text-red-400 transition-colors"
                title="Remove collaborator"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {collaborators.length === 0 && (
        <p className="text-spotify-gray-light text-center py-4">
          No collaborators yet. Invite friends to collaborate on this playlist!
        </p>
      )}
    </div>
  );
};

export default CollaboratorList;