import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { Music, AudioContextType, RepeatMode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Music | null>(null);
  const [playlist, setPlaylist] = useState<Music[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shuffledIndicesRef = useRef<number[]>([]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Load track when currentTrack changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      setIsLoading(true);
      setError(null);
      const audioSrc = `${API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/audio/${currentTrack.audioFilePath}`;
      console.log('Loading audio from:', audioSrc); // Debug log
      console.log('Current track:', currentTrack.title, 'File:', currentTrack.audioFilePath);
      console.log('Audio element exists:', !!audioRef.current);
      console.log('Current audio src:', audioRef.current.src);

      if (audioRef.current.src !== audioSrc) {
        audioRef.current.src = audioSrc;
        console.log('Setting audio src to:', audioSrc);
        console.log('New audio src after setting:', audioRef.current.src);

        // Add error event listener for this load
        const handleLoadError = (e: Event) => {
          console.error('Audio load error:', e);
          setError('Failed to load audio file - file may not exist or be corrupted');
          setIsLoading(false);
        };

        const handleLoadSuccess = () => {
          console.log('Audio loaded successfully');
          setIsLoading(false);
          setError(null);
        };

        audioRef.current.addEventListener('error', handleLoadError);
        audioRef.current.addEventListener('loadeddata', handleLoadSuccess);

        audioRef.current.load();

        // Cleanup listeners after load attempt
        setTimeout(() => {
          audioRef.current?.removeEventListener('error', handleLoadError);
          audioRef.current?.removeEventListener('loadeddata', handleLoadSuccess);
        }, 5000);
      } else {
        console.log('Audio src already set to:', audioSrc);
        setIsLoading(false);
      }
    }
  }, [currentTrack]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      seek(0);
      play();
    } else {
      next();
    }
  }, [repeatMode]);

  const getNextIndex = useCallback(() => {
    if (playlist.length === 0) return -1;

    if (isShuffled) {
      if (shuffledIndicesRef.current.length === 0) {
        shuffledIndicesRef.current = Array.from({ length: playlist.length }, (_, i) => i);
        // Remove current index and shuffle
        const current = shuffledIndicesRef.current.indexOf(currentIndex);
        if (current > -1) {
          shuffledIndicesRef.current.splice(current, 1);
        }
        // Fisher-Yates shuffle
        for (let i = shuffledIndicesRef.current.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIndicesRef.current[i], shuffledIndicesRef.current[j]] = [shuffledIndicesRef.current[j], shuffledIndicesRef.current[i]];
        }
      }
      return shuffledIndicesRef.current.shift() ?? -1;
    } else {
      if (repeatMode === 'all') {
        return (currentIndex + 1) % playlist.length;
      } else {
        return currentIndex + 1 < playlist.length ? currentIndex + 1 : -1;
      }
    }
  }, [playlist.length, isShuffled, currentIndex, repeatMode]);

  const getPreviousIndex = useCallback(() => {
    if (playlist.length === 0) return -1;

    if (isShuffled) {
      // For shuffle, just go to previous in shuffled list or current -1
      return currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    } else {
      return currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    }
  }, [playlist.length, isShuffled, currentIndex]);

  const play = useCallback(async () => {
    if (audioRef.current && currentTrack) {
      // Ensure audio src is set
      const expectedSrc = `${API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/audio/${currentTrack.audioFilePath}`;
      if (audioRef.current.src !== expectedSrc) {
        console.log('Audio src not set correctly. Expected:', expectedSrc, 'Current:', audioRef.current.src);
        setError('Audio source not loaded. Please try selecting the track again.');
        return;
      }

      try {
        console.log('Attempting to play audio:', currentTrack.title);
        console.log('Audio element readyState:', audioRef.current.readyState);
        console.log('Audio element src:', audioRef.current.src);

        // If audio is not ready, wait for it or force a reload
        if (audioRef.current.readyState < 2) {
          console.log('Audio not ready, forcing reload...');
          audioRef.current.load(); // Force reload

          // Wait for canplay event
          await new Promise((resolve, reject) => {
            const onCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', onCanPlay);
              audioRef.current?.removeEventListener('error', onError);
              resolve(void 0);
            };
            const onError = (e: Event) => {
              audioRef.current?.removeEventListener('canplay', onCanPlay);
              audioRef.current?.removeEventListener('error', onError);
              reject(new Error('Audio failed to load'));
            };

            audioRef.current?.addEventListener('canplay', onCanPlay);
            audioRef.current?.addEventListener('error', onError);

            // Timeout after 10 seconds
            setTimeout(() => {
              audioRef.current?.removeEventListener('canplay', onCanPlay);
              audioRef.current?.removeEventListener('error', onError);
              reject(new Error('Audio load timeout'));
            }, 10000);
          });
        }

        await audioRef.current.play();
        setIsPlaying(true);
        setError(null);
        console.log('Audio started playing successfully');
      } catch (err) {
        console.error('Failed to play audio:', err);
        setError(`Failed to play audio: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsPlaying(false);
      }
    } else {
      console.log('Cannot play: audioRef exists:', !!audioRef.current, 'currentTrack exists:', !!currentTrack);
      setError('No track selected');
    }
  }, [currentTrack, API_BASE_URL]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const next = useCallback(() => {
    const nextIdx = getNextIndex();
    if (nextIdx >= 0) {
      setCurrentIndex(nextIdx);
      setCurrentTrack(playlist[nextIdx]);
    } else if (repeatMode === 'all' && playlist.length > 0) {
      setCurrentIndex(0);
      setCurrentTrack(playlist[0]);
    } else {
      setIsPlaying(false);
    }
  }, [getNextIndex, playlist, repeatMode]);

  const previous = useCallback(() => {
    const prevIdx = getPreviousIndex();
    if (prevIdx >= 0) {
      setCurrentIndex(prevIdx);
      setCurrentTrack(playlist[prevIdx]);
    }
  }, [getPreviousIndex, playlist]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setRepeatModeState = useCallback((mode: RepeatMode) => {
    setRepeatMode(mode);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
    shuffledIndicesRef.current = []; // Reset shuffle
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(Math.max(0.5, Math.min(2, rate)));
  }, []);

  const setPlaylistState = useCallback((newPlaylist: Music[], startIndex = 0) => {
    setPlaylist(newPlaylist);
    setCurrentIndex(startIndex);
    setCurrentTrack(newPlaylist[startIndex] || null);
    shuffledIndicesRef.current = [];

    // Note: Not auto-playing due to browser autoplay restrictions
    // User must click play button manually
  }, []);

  const addToPlaylist = useCallback((track: Music) => {
    setPlaylist(prev => [...prev, track]);
  }, []);

  const removeFromPlaylist = useCallback((index: number) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter((_, i) => i !== index);
      if (index === currentIndex) {
        // If removing current track, stop playback
        pause();
        setCurrentTrack(null);
        setCurrentIndex(-1);
      } else if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      }
      return newPlaylist;
    });
  }, []);

  const playTrack = useCallback((track: Music) => {
    const index = playlist.findIndex(t => t._id === track._id);
    if (index >= 0) {
      setCurrentIndex(index);
      setCurrentTrack(track);
    } else {
      // Add to playlist and play
      setPlaylist(prev => [...prev, track]);
      setCurrentIndex(playlist.length);
      setCurrentTrack(track);
    }
  }, [playlist]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentIndex(-1);
    setCurrentTrack(null);
    pause();
  }, [pause]);

  const toggleFullPlayer = useCallback(() => {
    setIsFullPlayerOpen(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previous();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, next, previous, volume, setVolume, toggleMute]);

  const contextValue: AudioContextType = {
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
    playbackRate,
    isLoading,
    error,
    isFullPlayerOpen,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setRepeatMode: setRepeatModeState,
    toggleShuffle,
    setPlaybackRate,
    setPlaylist: setPlaylistState,
    addToPlaylist,
    removeFromPlaylist,
    playTrack,
    clearPlaylist,
    toggleFullPlayer,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};