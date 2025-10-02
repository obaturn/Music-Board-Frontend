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

      // Refresh 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

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
          setUser(currentUser);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          scheduleTokenRefresh(storedAccessToken);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  useEffect(() => {
    initializeAuth();
    return () => clearRefreshTimeout();
  }, [initializeAuth]);

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

  const login = async (email: string, password: string) => {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await api.login(email, password);
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
