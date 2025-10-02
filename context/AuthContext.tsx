import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { User, AuthContextType, UserRole } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // For short sessions (15min), refresh 2 minutes before expiry
      // For long sessions (7 days), refresh 1 hour before expiry
      const isLongSession = timeUntilExpiry > (24 * 60 * 60 * 1000); // > 24 hours
      const refreshBuffer = isLongSession ? (60 * 60 * 1000) : (2 * 60 * 1000); // 1 hour or 2 minutes
      const refreshTime = Math.max(timeUntilExpiry - refreshBuffer, 0);

      clearRefreshTimeout();

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          if (refreshToken) {
            console.log('Refreshing access token...');
            const { accessToken: newAccessToken } = await api.refreshToken(refreshToken);
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);
            scheduleTokenRefresh(newAccessToken);
            console.log('Access token refreshed successfully');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }, refreshTime);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }, [refreshToken]);

  const initializeAuth = useCallback(() => {
    try {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && storedRefreshToken) {
        const currentUser = api.getCurrentUser(storedAccessToken);
        if (currentUser) {
          // Access token is still valid
          setUser(currentUser);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          scheduleTokenRefresh(storedAccessToken);
        } else {
          // Access token expired, try to refresh asynchronously
          refreshTokenOnStartup(storedRefreshToken);
        }
      } else {
        // No stored tokens, user is not authenticated
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  const refreshTokenOnStartup = useCallback(async (storedRefreshToken: string) => {
    try {
      console.log('Access token expired, attempting refresh on startup...');
      const { accessToken: newAccessToken } = await api.refreshToken(storedRefreshToken);
      const refreshedUser = api.getCurrentUser(newAccessToken);
      if (refreshedUser) {
        localStorage.setItem('accessToken', newAccessToken);
        setUser(refreshedUser);
        setAccessToken(newAccessToken);
        setRefreshToken(storedRefreshToken);
        scheduleTokenRefresh(newAccessToken);
        console.log('Token refreshed successfully on app start');
      } else {
        throw new Error('Failed to decode refreshed token');
      }
    } catch (refreshError) {
      console.error('Token refresh failed on app start:', refreshError);
      // Clear all tokens if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  useEffect(() => {
    initializeAuth();
    return () => clearRefreshTimeout();
  }, [initializeAuth, refreshTokenOnStartup]);

  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefresh = (event: CustomEvent) => {
      const { accessToken: newAccessToken } = event.detail;
      setAccessToken(newAccessToken);
      scheduleTokenRefresh(newAccessToken);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
    return () => window.removeEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
  }, [scheduleTokenRefresh]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await api.login(email, password, rememberMe);
    const currentUser = api.getCurrentUser(newAccessToken);

    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUser(currentUser);

    scheduleTokenRefresh(newAccessToken);
  };

  const register = async (username: string, email: string, password: string, role: UserRole, profilePicture?: File) => {
    await api.register(username, email, password, role, profilePicture);
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    clearRefreshTimeout();
  }, []);

  const contextValue = {
    user,
    token: accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
