
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Music } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAudio } from '../hooks/useAudio';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MusicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [music, setMusic] = useState<Music | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack } = useAudio();

  useEffect(() => {
    const fetchMusic = async () => {
      if (!id) {
        setError("No music ID provided.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getMusicById(id);
        setMusic(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch music details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusic();
  }, [id]);
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-400 text-xl">{error}</p>
    </div>
  );
  if (!music) return (
    <div className="text-center py-20">
      <p className="text-spotify-gray-light text-xl">Music not found.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-spotify-gray-light hover:text-white transition-colors hover:bg-spotify-light rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-spotify-gray-light text-sm uppercase tracking-wider">Track</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Album Art */}
        <div className="flex-shrink-0">
          <img
            src={music.coverArt}
            alt={music.album}
            className="w-80 h-80 rounded-lg shadow-2xl object-cover"
          />
        </div>

        {/* Track Information */}
        <div className="flex-1 space-y-6">
          {/* Title and Artist */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {music.title}
            </h1>
            <p className="text-2xl text-spotify-gray-light hover:text-white transition-colors cursor-pointer">
              {music.artist}
            </p>
          </div>

          {/* Track Details */}
          <div className="flex flex-wrap gap-6 text-spotify-gray-light">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Album:</span>
              <span className="hover:text-white transition-colors cursor-pointer">{music.album}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Released:</span>
              <span>{music.releaseYear}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Genre:</span>
              <span className="bg-spotify-dark px-3 py-1 rounded-full text-sm">{music.genre}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Duration:</span>
              <span>{formatDuration(music.duration)}</span>
            </div>
          </div>

          {/* Description */}
          {music.description && (
            <div className="max-w-2xl">
              <p className="text-spotify-gray-light leading-relaxed whitespace-pre-wrap">
                {music.description}
              </p>
            </div>
          )}

          {/* Play Button */}
          {music.audioFilePath && (
            <div className="pt-4">
              <button
                onClick={() => playTrack(music)}
                className="w-14 h-14 bg-spotify-green rounded-full text-spotify-black hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
                aria-label="Play track"
              >
                <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v6l7 5V2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Additional Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button className="p-3 text-spotify-gray-light hover:text-white transition-colors hover:bg-spotify-light rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </button>
            <button className="p-3 text-spotify-gray-light hover:text-white transition-colors hover:bg-spotify-light rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button className="p-3 text-spotify-gray-light hover:text-white transition-colors hover:bg-spotify-light rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Related Content Section */}
      <div className="border-t border-spotify-gray pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">More from {music.artist}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* This would be populated with related tracks in a real app */}
          <div className="text-center py-8">
            <p className="text-spotify-gray-light">More tracks from this artist would appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDetailPage;
