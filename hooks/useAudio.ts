import { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';
import { AudioContextType } from '../types';

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};