
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MusicForm from '../components/MusicForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Music } from '../types';

const EditMusicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [initialData, setInitialData] = useState<Music | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      if (!id) return;
      try {
        const data = await api.getMusicById(id);
        setInitialData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch music data');
      } finally {
        setIsFetching(false);
      }
    };
    fetchMusic();
  }, [id]);

  const handleSubmit = async (formData: Partial<Music> & { audioFile?: File }) => {
    if (!id || !token) {
        setError("Missing ID or authentication token.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.updateMusic(id, formData, token);
      navigate(`/music/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update music');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white mb-6">Edit Music</h2>
      {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-center max-w-lg mx-auto">{error}</p>}
      {initialData ? (
        <MusicForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isLoading}
          submitButtonText="Update Music"
          requireAudioFile={false}
        />
      ) : (
        <p className="text-center text-brand-subtext">Could not load music data to edit.</p>
      )}
    </div>
  );
};

export default EditMusicPage;
