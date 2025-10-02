
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicForm from '../components/MusicForm';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Music } from '../types';

const AddMusicPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (formData: Omit<Music, '_id' | 'createdAt' | 'coverArt' | 'ownerId' | 'audioFilePath' | 'fileSize' | 'mimeType'> & { audioFile: File }) => {
    if (!token) {
        setError("You must be logged in to add music.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newMusic = await api.createMusic(formData, token);
      navigate(`/music/${newMusic._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add music');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white mb-6">Add New Music</h2>
      {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-center max-w-lg mx-auto">{error}</p>}
      <MusicForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText="Add Music"
      />
    </div>
  );
};

export default AddMusicPage;
