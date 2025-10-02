import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { User, AuthContextType, UserRole } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleTokenRefresh = useCallback((token: string, storedRefreshToken?: string) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Don't schedule refresh if token is already expired or expires in less than 30 seconds
      if (timeUntilExpiry < 30000) {
        console.log('Token expires too soon, not scheduling refresh');
        return;
      }

      // For short sessions (1 hour), refresh 5 minutes before expiry
      // For long sessions (7 days), refresh 1 hour before expiry
      const isLongSession = timeUntilExpiry > (24 * 60 * 60 * 1000); // > 24 hours
      const refreshBuffer = isLongSession ? (60 * 60 * 1000) : (5 * 60 * 1000); // 1 hour or 5 minutes
      const refreshTime = Math.max(timeUntilExpiry - refreshBuffer, 30000); // Minimum 30 seconds

      clearRefreshTimeout();

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const currentRefreshToken = storedRefreshToken || localStorage.getItem('refreshToken');
          if (currentRefreshToken) {
            console.log('Refreshing access token...');
            setIsRefreshing(true);
            const { accessToken: newAccessToken } = await api.refreshToken(currentRefreshToken);
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);
            setIsRefreshing(false);
            scheduleTokenRefresh(newAccessToken, currentRefreshToken);
            console.log('Access token refreshed successfully');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          setIsRefreshing(false);
          logout();
        }
      }, refreshTime);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
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
          scheduleTokenRefresh(storedAccessToken, storedRefreshToken);
        } else {
          // Access token expired, try to refresh
          try {
            const { accessToken: newAccessToken } = await api.refreshToken(storedRefreshToken);
            const refreshedUser = api.getCurrentUser(newAccessToken);
            if (refreshedUser) {
              localStorage.setItem('accessToken', newAccessToken);
              setUser(refreshedUser);
              setAccessToken(newAccessToken);
              setRefreshToken(storedRefreshToken);
              scheduleTokenRefresh(newAccessToken, storedRefreshToken);
            } else {
              throw new Error('Failed to decode refreshed token');
            }
          } catch (refreshError) {
            console.error('Token refresh failed on startup:', refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
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
      scheduleTokenRefresh(newAccessToken, localStorage.getItem('refreshToken') || undefined);
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

    scheduleTokenRefresh(newAccessToken, newRefreshToken);
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

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const contextValue = {
    user,
    token: accessToken,
    isAuthenticated: !!accessToken || isRefreshing, // Stay authenticated during refresh
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
