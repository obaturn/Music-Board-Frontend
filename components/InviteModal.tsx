import React, { useState } from 'react';
import Modal from './Modal';
import { useNotifications } from '../context/NotificationContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateInvite: () => Promise<{ inviteCode: string; inviteLink: string }>;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onGenerateInvite }) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteLink, setInviteLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { addNotification } = useNotifications();

  const handleGenerateInvite = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await onGenerateInvite();
      setInviteCode(result.inviteCode);
      setInviteLink(result.inviteLink);
      addNotification({
        type: 'success',
        title: 'Invite Code Generated',
        message: 'Share this code with friends to collaborate on your playlist!'
      });
    } catch (err) {
      setError('Failed to generate invite code');
      addNotification({
        type: 'error',
        title: 'Failed to Generate Invite',
        message: 'Please try again later.'
      });
      console.error('Error generating invite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Link copied successfully!'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy to clipboard.'
      });
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const resetModal = () => {
    setInviteCode('');
    setInviteLink('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Collaborators"
    >
      <div className="space-y-4">
        <p className="text-spotify-gray-light">
          Share this playlist with friends! Generate an invite code that others can use to join as collaborators.
        </p>

        {!inviteCode ? (
          <div className="text-center">
            <button
              onClick={handleGenerateInvite}
              disabled={isLoading}
              className="bg-spotify-green text-black px-6 py-2 rounded-full font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Invite Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Invite Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="flex-1 bg-spotify-dark border border-spotify-gray rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-spotify-green"
                />
                <button
                  onClick={() => copyToClipboard(inviteCode)}
                  className="px-4 py-2 bg-spotify-light text-white rounded hover:bg-spotify-gray transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-spotify-dark border border-spotify-gray rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-spotify-green"
                />
                <button
                  onClick={() => copyToClipboard(inviteLink)}
                  className="px-4 py-2 bg-spotify-light text-white rounded hover:bg-spotify-gray transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-spotify-dark p-3 rounded-lg">
              <h4 className="text-white font-medium mb-2">How to invite:</h4>
              <ol className="text-spotify-gray-light text-sm space-y-1">
                <li>1. Share the invite code or link with your friends</li>
                <li>2. They can join the playlist and start collaborating</li>
                <li>3. You can manage their permissions as the playlist owner</li>
              </ol>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleGenerateInvite}
                disabled={isLoading}
                className="px-4 py-2 text-spotify-gray-light hover:text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate New Code'}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-spotify-green text-black rounded hover:bg-green-400 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </Modal>
  );
};

export default InviteModal;