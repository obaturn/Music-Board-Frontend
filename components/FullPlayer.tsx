import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { RepeatMode } from '../types';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    playbackRate,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    setPlaybackRate,
  } = useAudio();

  if (!isOpen || !currentTrack) return null;

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

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-spotify-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={onClose}
          className="text-spotify-gray-light hover:text-white transition-colors p-2"
          aria-label="Close full player"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-spotify-gray-light text-sm uppercase tracking-wider">Now Playing</p>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Album Art */}
        <div className="mb-8">
          <img
            src={currentTrack.coverArt}
            alt={currentTrack.album}
            className="w-80 h-80 md:w-96 md:h-96 rounded-lg object-cover shadow-2xl"
          />
        </div>

        {/* Track Info */}
        <div className="text-center mb-8 max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {currentTrack.title}
          </h1>
          <p className="text-xl text-spotify-gray-light mb-2 hover:text-white transition-colors cursor-pointer">
            {currentTrack.artist}
          </p>
          <p className="text-spotify-gray-light text-sm">
            {currentTrack.album} • {currentTrack.releaseYear}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer slider mb-3"
            style={{
              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progressPercentage}%, #535353 ${progressPercentage}%, #535353 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-spotify-gray-light">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={previous}
            className="p-3 text-spotify-gray-light hover:text-white transition-colors hover:scale-110 transform"
            aria-label="Previous track"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? pause : play}
            className="w-14 h-14 bg-white rounded-full text-spotify-black hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM12 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v6l7 5V2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={next}
            className="p-3 text-spotify-gray-light hover:text-white transition-colors hover:scale-110 transform"
            aria-label="Next track"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between w-full max-w-md">
          {/* Left side - Repeat and Shuffle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'none' ? 'text-spotify-green' : 'text-spotify-gray-light hover:text-white'
              }`}
              aria-label={`Repeat ${repeatMode}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 bg-spotify-green text-spotify-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">1</span>
              )}
            </button>

            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffled ? 'text-spotify-green' : 'text-spotify-gray-light hover:text-white'
              }`}
              aria-label="Shuffle"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                <path d="M14.707 10.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L11.586 12H7a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 011.414-1.414l3 3z" />
              </svg>
            </button>
          </div>

          {/* Center - Playback Rate */}
          <div className="flex items-center gap-2">
            <select
              id="playback-rate"
              value={playbackRate}
              onChange={handlePlaybackRateChange}
              className="bg-transparent text-spotify-gray-light hover:text-white border border-spotify-gray rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-spotify-green"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>

          {/* Right side - Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-spotify-gray-light hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              className="w-24 h-1 bg-spotify-gray rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #535353 ${(isMuted ? 0 : volume) * 100}%, #535353 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayer;