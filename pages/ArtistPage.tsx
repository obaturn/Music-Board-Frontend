import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Artist, Album, Music } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useAuth } from '../hooks/useAuth';
import MusicCard from '../components/MusicCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [topTracks, setTopTracks] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { playTrack, setPlaylist } = useAudio();
  const { user, token } = useAuth();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch artist data first
        const artistResponse = await api.getArtistById(id);
        setArtist(artistResponse.artist);
        setAlbums(artistResponse.albums.data);
        setTopTracks(artistResponse.topTracks.data);

        // Then check follow status separately to avoid loading loops
        if (user && token) {
          try {
            const followStatus = await api.checkFollowStatus(id, token);
            setIsFollowing(followStatus.isFollowing);
          } catch (followError) {
            // Silently fail follow check, don't break the page
            console.warn('Could not check follow status:', followError);
            setIsFollowing(false);
          }
        }
      } catch (err) {
        setError('Failed to load artist data');
        console.error('Error fetching artist:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id]); // Remove user and token from dependencies to prevent re-fetching

  const handlePlayAll = () => {
    if (topTracks.length > 0) {
      setPlaylist(topTracks, 0);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !token || !artist) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.unfollowArtist(artist._id, token);
        setIsFollowing(false);
        setArtist(prev => prev ? { ...prev, followerCount: prev.followerCount - 1 } : null);
      } else {
        await api.followArtist(artist._id, token);
        setIsFollowing(true);
        setArtist(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">{error || 'Artist not found'}</p>
        <Link to="/" className="text-spotify-green hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Artist Header - Spotify Style */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-spotify-green/20 via-spotify-dark to-spotify-black h-80"></div>

        {/* Artist Info */}
        <div className="relative z-10 pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Artist Image */}
            <div className="w-48 h-48 md:w-56 md:h-56 bg-spotify-light rounded-full overflow-hidden shadow-2xl flex-shrink-0">
              {artist.profilePicture ? (
                <img
                  src={artist.profilePicture}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/${artist.name}/400`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-light flex items-center justify-center">
                  <span className="text-8xl font-bold text-white">
                    {artist.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Artist Details */}
            <div className="flex-1 text-center md:text-left">
              {artist.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-spotify-green text-black mb-4">
                  ✓ Verified Artist
                </span>
              )}
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">{artist.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-spotify-gray-light mb-6 justify-center md:justify-start">
                <span className="font-medium">{artist.followerCount.toLocaleString()} followers</span>
                {artist.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex gap-2">
                      {artist.genres.slice(0, 3).map((genre, index) => (
                        <span key={index} className="text-sm">{genre}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Follow Button */}
              {user && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                    isFollowing
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-spotify-green hover:bg-green-400 text-black shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-8 pb-8">
        {/* Play All Button */}
        {topTracks.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handlePlayAll}
              className="bg-spotify-green text-black px-8 py-3 rounded-full font-bold hover:bg-green-400 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play
            </button>
          </div>
        )}

        {/* Popular Tracks */}
        {topTracks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Popular</h2>
            <div className="space-y-2">
              {topTracks.slice(0, 5).map((track, index) => (
                <div key={track._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-spotify-dark/50 transition-colors group">
                  <span className="text-spotify-gray-light w-8 text-center text-sm font-medium">{index + 1}</span>

                  <div className="w-12 h-12 bg-spotify-light rounded overflow-hidden flex-shrink-0">
                    {track.coverArt ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/cover-arts/${track.coverArt}`}
                        alt={track.album}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${track.coverArt ? 'hidden' : ''}`}
                         style={{ background: 'linear-gradient(135deg, #535353, #282828)' }}>
                      <svg className="w-4 h-4 text-spotify-gray-light" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-spotify-green transition-colors cursor-pointer">
                      {track.title}
                    </h3>
                  </div>

                  <div className="text-spotify-gray-light text-sm hidden md:block">
                    {track.album}
                  </div>

                  <div className="text-spotify-gray-light text-sm min-w-[60px] text-right">
                    {formatTime(track.duration)}
                  </div>

                  <button
                    onClick={() => playTrack(track)}
                    className="opacity-0 group-hover:opacity-100 text-spotify-green hover:text-green-400 p-2 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Albums</h2>
              <Link to={`/artists/${artist._id}/albums`} className="text-spotify-gray-light hover:text-white text-sm font-medium">
                Show all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {albums.slice(0, 6).map((album) => (
                <Link
                  key={album._id}
                  to={`/albums/${album._id}`}
                  className="bg-spotify-dark p-4 rounded-lg hover:bg-spotify-light transition-all group cursor-pointer"
                >
                  <div className="aspect-square bg-spotify-light rounded-lg mb-4 overflow-hidden shadow-lg">
                    {album.coverArt ? (
                      <img
                        src={album.coverArt}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://picsum.photos/seed/${album.title}/300`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-light flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {album.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold truncate mb-1 group-hover:text-spotify-green transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-spotify-gray-light text-sm">
                    {album.releaseYear}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;