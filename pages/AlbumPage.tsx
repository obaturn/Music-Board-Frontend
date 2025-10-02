import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Album, Music } from '../types';
import { useAudio } from '../hooks/useAudio';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, setPlaylist } = useAudio();

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const albumData = await api.getAlbumById(id);
        setAlbum(albumData);
      } catch (err) {
        setError('Failed to load album');
        console.error('Error fetching album:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const handlePlayAll = () => {
    if (album && album.tracks.length > 0) {
      setPlaylist(album.tracks, 0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">{error || 'Album not found'}</p>
        <Link to="/" className="text-spotify-green hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  const totalDuration = album.tracks.reduce((total, track) => total + track.duration, 0);

  return (
    <div className="space-y-8">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-spotify-dark p-6 rounded-lg">
        <div className="w-48 h-48 bg-spotify-light rounded-lg overflow-hidden flex-shrink-0">
          {album.coverArt ? (
            <img
              src={album.coverArt}
              alt={album.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/seed/${album.title}/400`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-light flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {album.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Album</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{album.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-300 mb-4">
            <Link
              to={`/artists/${album.artist._id}`}
              className="text-white font-medium hover:underline"
            >
              {album.artist.name}
            </Link>
            <span className="hidden md:inline">•</span>
            <span>{album.releaseYear}</span>
            <span className="hidden md:inline">•</span>
            <span>{album.tracks.length} songs</span>
            <span className="hidden md:inline">•</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
          {album.description && (
            <p className="text-gray-400 max-w-2xl">{album.description}</p>
          )}
        </div>
      </div>

      {/* Play All Button */}
      {album.tracks.length > 0 && (
        <div className="flex justify-center md:justify-start">
          <button
            onClick={handlePlayAll}
            className="bg-spotify-green text-black px-8 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors"
          >
            Play All
          </button>
        </div>
      )}

      {/* Tracks List */}
      {album.tracks.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 text-sm font-medium border-b border-spotify-light">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-3">Duration</div>
            <div className="col-span-2">Popularity</div>
          </div>

          {album.tracks.map((track, index) => (
            <div
              key={track._id}
              className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-spotify-light transition-colors group items-center"
            >
              <div className="col-span-1 text-gray-400 group-hover:text-white">
                <span className="group-hover:hidden">{index + 1}</span>
                <button
                  onClick={() => playTrack(track)}
                  className="hidden group-hover:inline text-spotify-green hover:text-green-400"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="col-span-6">
                <h3 className="text-white font-medium truncate">{track.title}</h3>
                <p className="text-gray-400 text-sm truncate">{track.genre}</p>
              </div>

              <div className="col-span-3 text-gray-400">
                {formatDuration(track.duration)}
              </div>

              <div className="col-span-2 text-gray-400">
                {track.popularity}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No tracks in this album yet.</p>
        </div>
      )}
    </div>
  );
};

export default AlbumPage;