import { User, Music, UserRole, WordPressPost, Playlist, Favorite } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Global token refresh promise to prevent multiple concurrent refreshes
let refreshPromise: Promise<string> | null = null;

// Function to refresh access token
const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { accessToken } = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      }).then(res => {
        if (!res.ok) throw new Error('Token refresh failed');
        return res.json();
      });

      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Enhanced fetch with automatic token refresh
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const makeRequest = (token?: string) => {
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  let response = await makeRequest();

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      response = await makeRequest(newToken);

      // Update the global access token in AuthContext
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { accessToken: newToken } }));
      }
    } catch (refreshError) {
      // Refresh failed, user needs to login again
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};

// Helper function to decode JWT
const decodeJWT = (token: string): User | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      profilePicture: decoded.profilePicture,
    };
  } catch (error) {
    return null;
  }
};

// Helper function to get auth headers
const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  register: async (username: string, email: string, password: string, role: UserRole, profilePicture?: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData, // Remove headers for FormData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token refresh failed');
    }
    return response.json();
  },

  getCurrentUser: (token: string): User | null => {
    return decodeJWT(token);
  },

  getMusic: async (): Promise<Music[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/music`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch music');
    }
    const data = await response.json();
    // Transform backend data to match frontend Music interface
    return data.map((item: any) => ({
      _id: item._id,
      title: item.title,
      artist: item.artist,
      genre: item.genre,
      album: item.album,
      releaseYear: item.releaseYear,
      duration: item.duration,
      description: item.description,
      audioFilePath: item.audioFilePath,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      popularity: item.popularity || 0,
      coverArt: item.coverArt || `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400`,
      createdAt: item.timestamp || item.createdAt,
      ownerId: item.postedBy,
    }));
  },

  searchMusic: async (params: {
    q?: string;
    genre?: string;
    artist?: string;
    album?: string;
    releaseYearMin?: number;
    releaseYearMax?: number;
    sortBy?: 'relevance' | 'popularity' | 'date' | 'alphabetical';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ music: Music[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/music/search?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to search music');
    }
    const data = await response.json();
    // Transform backend data to match frontend Music interface
    return {
      music: data.music.map((item: any) => ({
        _id: item._id,
        title: item.title,
        artist: item.artist,
        genre: item.genre,
        album: item.album,
        releaseYear: item.releaseYear,
        duration: item.duration,
        description: item.description,
        audioFilePath: item.audioFilePath,
        fileSize: item.fileSize,
        mimeType: item.mimeType,
        popularity: item.popularity || 0,
        coverArt: item.coverArt || `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400`,
        createdAt: item.timestamp || item.createdAt,
        ownerId: item.postedBy,
      })),
      pagination: data.pagination
    };
  },

  getMusicById: async (id: string): Promise<Music> => {
    const response = await fetch(`${API_BASE_URL}/music/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Music not found');
    }
    const item = await response.json();
    return {
      _id: item._id,
      title: item.title,
      artist: item.artist,
      genre: item.genre,
      album: item.album,
      releaseYear: item.releaseYear,
      duration: item.duration,
      description: item.description,
      audioFilePath: item.audioFilePath,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      popularity: item.popularity || 0,
      coverArt: item.coverArt || `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400`,
      createdAt: item.timestamp || item.createdAt,
      ownerId: item.postedBy,
    };
  },

  createMusic: async (data: Omit<Music, '_id' | 'createdAt' | 'coverArt' | 'ownerId' | 'audioFilePath' | 'fileSize' | 'mimeType'> & { audioFile: File }, token: string): Promise<Music> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('artist', data.artist);
    formData.append('genre', data.genre);
    formData.append('album', data.album);
    formData.append('releaseYear', data.releaseYear.toString());
    formData.append('duration', data.duration.toString());
    formData.append('description', data.description);
    formData.append('audio', data.audioFile);

    const response = await fetch(`${API_BASE_URL}/music`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create music');
    }
    const item = await response.json();
    return {
      _id: item._id,
      title: item.title,
      artist: item.artist,
      genre: item.genre,
      album: item.album,
      releaseYear: item.releaseYear,
      duration: item.duration,
      description: item.description,
      audioFilePath: item.audioFilePath,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      popularity: item.popularity || 0,
      coverArt: item.coverArt || `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400`,
      createdAt: item.timestamp || item.createdAt,
      ownerId: item.postedBy,
    };
  },

  updateMusic: async (id: string, data: Partial<Music> & { audioFile?: File }, token: string): Promise<Music> => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.artist) formData.append('artist', data.artist);
    if (data.genre) formData.append('genre', data.genre);
    if (data.album) formData.append('album', data.album);
    if (data.releaseYear !== undefined) formData.append('releaseYear', data.releaseYear.toString());
    if (data.duration !== undefined) formData.append('duration', data.duration.toString());
    if (data.description) formData.append('description', data.description);
    if (data.audioFile) formData.append('audio', data.audioFile);

    const response = await fetch(`${API_BASE_URL}/music/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update music');
    }
    const item = await response.json();
    return {
      _id: item._id,
      title: item.title,
      artist: item.artist,
      genre: item.genre,
      album: item.album,
      releaseYear: item.releaseYear,
      duration: item.duration,
      description: item.description,
      audioFilePath: item.audioFilePath,
      fileSize: item.fileSize,
      mimeType: item.mimeType,
      popularity: item.popularity || 0,
      coverArt: item.coverArt || `https://picsum.photos/seed/${item.title.replace(/\s/g, '')}/400`,
      createdAt: item.timestamp || item.createdAt,
      ownerId: item.postedBy,
    };
  },

  deleteMusic: async (id: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/music/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete music');
    }
    return response.json();
  },

  getWpPosts: async (): Promise<WordPressPost[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/music/external/wp`, {
      method: 'GET',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch WordPress posts');
    }
    const data = await response.json();
    // Data is already in the correct format from backend
    return data;
  },

  // Playlist APIs
  getPlaylists: async (token: string): Promise<Playlist[]> => {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    return response.json();
  },

  createPlaylist: async (name: string, description: string, token: string): Promise<Playlist> => {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create playlist');
    }
    return response.json();
  },

  getPlaylistById: async (id: string, token: string): Promise<Playlist> => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Playlist not found');
    }
    return response.json();
  },

  updatePlaylist: async (id: string, name: string, description: string, token: string): Promise<Playlist> => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update playlist');
    }
    return response.json();
  },

  deletePlaylist: async (id: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete playlist');
    }
    return response.json();
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string, token: string): Promise<Playlist> => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add track to playlist');
    }
    return response.json();
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string, token: string): Promise<Playlist> => {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove track from playlist');
    }
    return response.json();
  },

  // Favorite APIs
  getFavorites: async (token: string): Promise<Music[]> => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    return response.json();
  },

  addFavorite: async (trackId: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/favorites/${trackId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add favorite');
    }
    return response.json();
  },

  removeFavorite: async (trackId: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/favorites/${trackId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove favorite');
    }
    return response.json();
  },

  isFavorite: async (trackId: string, token: string): Promise<{ isFavorite: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/favorites/${trackId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error('Failed to check favorite status');
    }
    return response.json();
  },
};