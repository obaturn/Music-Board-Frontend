import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Music } from '../types';
import MusicCard from '../components/MusicCard';
import PlaylistSelector from '../components/PlaylistSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const BrowsePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  // Define browse categories
  const categories = [
    { id: 'all', name: 'All Music', icon: '🎵' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'pop', name: 'Pop', icon: '🎤' },
    { id: 'hip-hop', name: 'Hip Hop', icon: '🎤' },
    { id: 'electronic', name: 'Electronic', icon: '🎧' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'classical', name: 'Classical', icon: '🎼' },
    { id: 'country', name: 'Country', icon: '🤠' },
    { id: 'r&b', name: 'R&B', icon: '🎶' },
    { id: 'reggae', name: 'Reggae', icon: '🌴' },
  ];

  const moodCategories = [
    { id: 'happy', name: 'Happy', icon: '😊', color: 'from-yellow-400 to-orange-500' },
    { id: 'chill', name: 'Chill', icon: '😌', color: 'from-blue-400 to-purple-500' },
    { id: 'energetic', name: 'Energetic', icon: '⚡', color: 'from-red-400 to-pink-500' },
    { id: 'romantic', name: 'Romantic', icon: '💕', color: 'from-pink-400 to-red-500' },
    { id: 'focus', name: 'Focus', icon: '🎯', color: 'from-green-400 to-blue-500' },
    { id: 'party', name: 'Party', icon: '🎉', color: 'from-purple-400 to-pink-500' },
  ];

  const activityCategories = [
    { id: 'workout', name: 'Workout', icon: '💪', color: 'from-orange-400 to-red-500' },
    { id: 'commute', name: 'Commute', icon: '🚗', color: 'from-gray-400 to-gray-600' },
    { id: 'study', name: 'Study', icon: '📚', color: 'from-blue-400 to-indigo-500' },
    { id: 'cooking', name: 'Cooking', icon: '👨‍🍳', color: 'from-green-400 to-emerald-500' },
    { id: 'sleep', name: 'Sleep', icon: '😴', color: 'from-indigo-400 to-purple-500' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: 'from-sky-400 to-blue-500' },
  ];

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let params: any = {};
        if (selectedCategory !== 'all') {
          params.genre = selectedCategory;
        }

        // Use searchMusic which doesn't require authentication for basic search
        const response = await api.searchMusic(params);
        setMusicList(response.music);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch music');
        setMusicList([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, [selectedCategory, isAuthenticated]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleMoodClick = (moodId: string) => {
    // Map moods to appropriate genres
    const moodToGenreMap: { [key: string]: string } = {
      'happy': 'pop',
      'chill': 'ambient',
      'energetic': 'electronic',
      'romantic': 'r&b',
      'focus': 'classical',
      'party': 'hip-hop'
    };
    setSelectedCategory(moodToGenreMap[moodId] || 'all');
  };

  const handleActivityClick = (activityId: string) => {
    // Map activities to appropriate genres
    const activityToGenreMap: { [key: string]: string } = {
      'workout': 'electronic',
      'commute': 'pop',
      'study': 'classical',
      'cooking': 'jazz',
      'sleep': 'ambient',
      'travel': 'rock'
    };
    setSelectedCategory(activityToGenreMap[activityId] || 'all');
  };

  const handleAddToPlaylist = (music: Music) => {
    setSelectedMusic(music);
    setShowPlaylistSelector(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Browse by Genre */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-6 rounded-lg bg-gradient-to-br from-spotify-gray to-spotify-dark hover:from-spotify-green hover:to-spotify-green-dark transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id ? 'ring-2 ring-spotify-green' : ''
              }`}
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="text-white font-semibold text-lg">{category.name}</h3>
            </button>
          ))}
        </div>
      </section>

      {/* Browse by Mood */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Mood</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {moodCategories.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`p-6 rounded-lg bg-gradient-to-br ${mood.color} hover:scale-105 transition-all duration-300 cursor-pointer text-left w-full`}
            >
              <div className="text-4xl mb-3">{mood.icon}</div>
              <h3 className="text-white font-semibold text-lg">{mood.name}</h3>
              <p className="text-white text-opacity-80 text-sm mt-1">Perfect for feeling {mood.name.toLowerCase()}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Browse by Activity */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activityCategories.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleActivityClick(activity.id)}
              className={`p-6 rounded-lg bg-gradient-to-br ${activity.color} hover:scale-105 transition-all duration-300 cursor-pointer text-left w-full`}
            >
              <div className="text-4xl mb-3">{activity.icon}</div>
              <h3 className="text-white font-semibold text-lg">{activity.name}</h3>
              <p className="text-white text-opacity-80 text-sm mt-1">Great for {activity.name.toLowerCase()}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Music Results */}
      {selectedCategory !== 'all' && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            {categories.find(c => c.id === selectedCategory)?.name || 'Selected'} Music
          </h2>
          {musicList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {musicList.map(music => (
                <MusicCard key={music._id} music={music} onDelete={() => {}} onAddToPlaylist={handleAddToPlaylist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-spotify-gray-light text-lg">No music found in this category yet.</p>
              <p className="text-spotify-gray-light text-sm mt-2">Be the first to upload some {selectedCategory} music!</p>
            </div>
          )}
        </section>
      )}

      {selectedMusic && (
        <PlaylistSelector
          isOpen={showPlaylistSelector}
          onClose={() => {
            setShowPlaylistSelector(false);
            setSelectedMusic(null);
          }}
          music={selectedMusic}
        />
      )}
    </div>
  );
};

export default BrowsePage;