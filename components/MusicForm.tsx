
import React, { useState, useEffect } from 'react';
import { Music } from '../types';

interface MusicFormProps {
  onSubmit: (formData: Omit<Music, '_id' | 'createdAt' | 'coverArt' | 'ownerId' | 'audioFilePath' | 'fileSize' | 'mimeType' | 'videoFilePath' | 'videoFileSize' | 'videoMimeType'> & { audioFile?: File; videoFile?: File }) => void;
  initialData?: Music;
  isLoading: boolean;
  submitButtonText: string;
  requireAudioFile?: boolean;
}

type FormData = Omit<Music, '_id' | 'createdAt' | 'coverArt' | 'ownerId' | 'audioFilePath' | 'fileSize' | 'mimeType' | 'videoFilePath' | 'videoFileSize' | 'videoMimeType'> & { audioFile?: File; videoFile?: File };

const MusicForm: React.FC<MusicFormProps> = ({ onSubmit, initialData, isLoading, submitButtonText, requireAudioFile = true }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    genre: '',
    album: '',
    releaseYear: new Date().getFullYear(),
    duration: 0,
    description: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [videoFileError, setVideoFileError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        artist: initialData.artist,
        genre: initialData.genre,
        album: initialData.album,
        releaseYear: initialData.releaseYear,
        duration: initialData.duration,
        description: initialData.description,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const validateAudioFile = (file: File): string | null => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-flac'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload an audio file (mp3, wav, m4a, etc.)';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 50MB.';
    }
    return null;
  };

  const validateVideoFile = (file: File): string | null => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/ogg'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a video file (mp4, mov, avi, webm, etc.)';
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 100MB.';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldName = e.target.name;

    if (fieldName === 'audioFile') {
      if (file) {
        const error = validateAudioFile(file);
        if (error) {
          setFileError(error);
          setAudioFile(null);
        } else {
          setFileError('');
          setAudioFile(file);
        }
      } else {
        setAudioFile(null);
        setFileError('');
      }
    } else if (fieldName === 'videoFile') {
      if (file) {
        const error = validateVideoFile(file);
        if (error) {
          setVideoFileError(error);
          setVideoFile(null);
        } else {
          setVideoFileError('');
          setVideoFile(file);
        }
      } else {
        setVideoFile(null);
        setVideoFileError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAudioFile && !audioFile) {
      setFileError('Please select an audio file');
      return;
    }
    onSubmit({
      ...formData,
      ...(audioFile && { audioFile }),
      ...(videoFile && { videoFile })
    });
  };

  const renderInput = (name: keyof FormData, label: string, type = 'text') => (
    <div className="mb-6">
      <label className="block text-spotify-gray-light text-sm font-medium mb-2" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        className="spotify-input"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="space-y-6">
        {renderInput('title', 'Title')}
        {renderInput('artist', 'Artist')}
        {renderInput('genre', 'Genre')}
        {renderInput('album', 'Album')}
        {renderInput('releaseYear', 'Release Year', 'number')}
        {renderInput('duration', 'Duration (seconds)', 'number')}

        <div className="mb-6">
          <label className="block text-spotify-gray-light text-sm font-medium mb-2" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="spotify-input resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-spotify-gray-light text-sm font-medium mb-2" htmlFor="audioFile">Audio File</label>
          <input
            id="audioFile"
            name="audioFile"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full p-3 bg-spotify-dark border border-spotify-gray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-spotify-green file:text-white hover:file:bg-spotify-green-hover transition-colors"
          />
          {fileError && <p className="text-red-400 text-sm mt-2">{fileError}</p>}
          {audioFile && <p className="text-green-400 text-sm mt-2">Selected: {audioFile.name}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-spotify-gray-light text-sm font-medium mb-2" htmlFor="videoFile">
            Background Video (Optional)
            <span className="text-xs text-spotify-gray-light ml-2">MP4, MOV, AVI, WebM - Max 100MB</span>
          </label>
          <input
            id="videoFile"
            name="videoFile"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full p-3 bg-spotify-dark border border-spotify-gray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-spotify-green file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-spotify-green file:text-white hover:file:bg-spotify-green-hover transition-colors"
          />
          {videoFileError && <p className="text-red-400 text-sm mt-2">{videoFileError}</p>}
          {videoFile && <p className="text-green-400 text-sm mt-2">Selected: {videoFile.name}</p>}
          <p className="text-spotify-gray-light text-xs mt-1">
            Upload a short video that will play as background when this track is playing (like Spotify Canvas)
          </p>
        </div>

        {isLoading && (
          <div className="mb-6">
            <div className="w-full bg-spotify-gray rounded-full h-2 overflow-hidden">
              <div
                className="bg-spotify-green h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-spotify-gray-light mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="spotify-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default MusicForm;
