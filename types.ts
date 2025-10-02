
export enum UserRole {
  USER = 'user',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

export interface Artist {
  _id: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  genres: string[];
  followerCount: number;
  verified: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  _id: string;
  title: string;
  artist: Artist;
  releaseYear: number;
  coverArt?: string;
  description?: string;
  genres: string[];
  tracks: Music[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Music {
  _id: string;
  title: string;
  artist: string;
  genre: string;
  album: string;
  releaseYear: number;
  duration: number; // in seconds
  description: string;
  audioFilePath: string;
  fileSize: number;
  mimeType: string;
  popularity: number;
  coverArt?: string;
  createdAt: string;
  ownerId: string;
}

export interface PlaylistCollaborator {
  user: User;
  role: 'editor' | 'viewer';
  addedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  user: User;
  tracks: Music[];
  collaborators: PlaylistCollaborator[];
  isPublic: boolean;
  inviteCode?: string;
  lastModifiedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  _id: string;
  user: User;
  track: Music;
  createdAt: string;
}

export interface Following {
  _id: string;
  user: string;
  artist: Artist;
  followedAt: string;
}

export interface WordPressPost {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    link: string;
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface AudioContextType {
  currentTrack: Music | null;
  playlist: Music[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  isFullPlayerOpen: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setPlaybackRate: (rate: number) => void;
  setPlaylist: (playlist: Music[], startIndex?: number) => void;
  addToPlaylist: (track: Music) => void;
  removeFromPlaylist: (index: number) => void;
  playTrack: (track: Music) => void;
  clearPlaylist: () => void;
  toggleFullPlayer: () => void;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string, role: UserRole, profilePicture?: File) => Promise<void>;
  logout: () => void;
}
