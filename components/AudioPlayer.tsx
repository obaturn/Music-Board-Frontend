import React from 'react';
import { useAudio } from '../hooks/useAudio';

const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    toggleFullPlayer,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    removeFromPlaylist,
  } = useAudio();

  const [showQueue, setShowQueue] = React.useState(false);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-dark border-t border-spotify-gray p-2 md:p-4 shadow-spotify z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 max-w-xs">
          {currentTrack.coverArt ? (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/cover-arts/${currentTrack.coverArt}`}
              alt={currentTrack.album}
              className="w-14 h-14 rounded shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-14 h-14 rounded shadow-lg flex items-center justify-center ${currentTrack.coverArt ? 'hidden' : ''}`}
               style={{ background: 'linear-gradient(135deg, #535353, #282828)' }}>
            <svg className="w-8 h-8 text-spotify-gray-light" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold text-sm truncate hover:text-spotify-green transition-colors cursor-pointer">
              {currentTrack.title}
            </h4>
            <p className="text-spotify-gray-light text-xs truncate hover:text-white transition-colors cursor-pointer">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="p-2 text-spotify-gray-light hover:text-white transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
            aria-label="Toggle queue"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={toggleFullPlayer}
            className="p-2 text-spotify-gray-light hover:text-white transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
            aria-label="Open full player"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 md:gap-3 flex-1 max-w-md">
          {/* Buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Shuffle Button */}
            <button
              onClick={toggleShuffle}
              className={`p-1 md:p-2 transition-colors hover:scale-110 transform ${
                isShuffled ? 'text-spotify-green' : 'text-spotify-gray-light hover:text-white'
              }`}
              aria-label="Toggle shuffle"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={previous}
              className="p-1 md:p-2 text-spotify-gray-light hover:text-white transition-colors hover:scale-110 transform"
              aria-label="Previous track"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            <button
              onClick={isPlaying ? pause : play}
              className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full text-spotify-black hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM12 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 md:w-4 md:h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v6l7 5V2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              onClick={next}
              className="p-1 md:p-2 text-spotify-gray-light hover:text-white transition-colors hover:scale-110 transform"
              aria-label="Next track"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>

            {/* Repeat Button */}
            <button
              onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
              className={`p-1 md:p-2 transition-colors hover:scale-110 transform ${
                repeatMode !== 'none' ? 'text-spotify-green' : 'text-spotify-gray-light hover:text-white'
              }`}
              aria-label={`Repeat ${repeatMode}`}
            >
              <div className="relative">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
                )}
              </div>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3 text-xs">
            <span className="text-spotify-gray-light min-w-[35px] text-center">{formatTime(currentTime)}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer slider hover:h-1.5 transition-all"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercentage}%, #535353 ${progressPercentage}%, #535353 100%)`
                }}
              />
            </div>
            <span className="text-spotify-gray-light min-w-[35px] text-center">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Additional Controls */}
        <div className="flex items-center gap-1 md:gap-3 min-w-0 flex-1 justify-end max-w-xs">
          <button
            onClick={toggleFullPlayer}
            className="p-1 md:p-2 text-spotify-gray-light hover:text-white transition-colors hidden md:block"
            aria-label="Open full player"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={toggleMute}
              className="p-1 md:p-2 text-spotify-gray-light hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-12 md:w-20 h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer slider hover:h-1.5 transition-all"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #535353 ${(isMuted ? 0 : volume) * 100}%, #535353 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Queue Panel */}
      {showQueue && playlist.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 bg-spotify-dark border-t border-spotify-gray max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Queue</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="text-spotify-gray-light hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {playlist.map((track, index) => (
                <div
                  key={`${track._id}-${index}`}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-spotify-light transition-colors ${
                    index === currentIndex ? 'bg-spotify-green bg-opacity-20' : ''
                  }`}
                  onClick={() => {
                    // This would need to be implemented in AudioContext
                    // For now, just close the queue
                    setShowQueue(false);
                  }}
                >
                  <div className="w-10 h-10 bg-spotify-light rounded overflow-hidden flex-shrink-0">
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
                    <h4 className={`font-medium truncate ${index === currentIndex ? 'text-spotify-green' : 'text-white'}`}>
                      {track.title}
                    </h4>
                    <p className="text-spotify-gray-light text-sm truncate">{track.artist}</p>
                  </div>
                  <div className="text-spotify-gray-light text-sm">
                    {formatTime(track.duration)}
                  </div>
                  {index !== currentIndex && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPlaylist(index);
                      }}
                      className="p-1 text-spotify-gray-light hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;