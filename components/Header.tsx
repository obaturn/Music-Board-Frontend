
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-spotify-black/80 backdrop-blur-sm sticky top-0 z-40 border-b border-spotify-dark">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-spotify-gray-light hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop logo (hidden on mobile since it's in sidebar) */}
        <div className="hidden md:flex items-center">
          <Link to="/" className="text-white font-bold text-xl flex items-center gap-2">
            <svg className="h-6 w-6 text-spotify-green" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
            </svg>
            <span>MusicBoard</span>
          </Link>
        </div>

        {/* User section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Profile and Admin Links */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/profile"
                  className="group relative text-spotify-gray-light hover:text-white font-medium transition-all duration-200 text-xs sm:text-sm px-3 py-2 rounded-lg hover:bg-spotify-dark border border-transparent hover:border-spotify-gray-light/30 hover:shadow-lg"
                  title="Profile Settings"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">Profile</span>
                  </span>
                </Link>
                {user?.role === UserRole.ADMIN && (
                  <Link
                    to="/admin"
                    className="group relative bg-gradient-to-r from-spotify-green to-spotify-green-hover hover:from-spotify-green-hover hover:to-spotify-green text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-spotify-green/50"
                    title="Admin Dashboard"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="hidden sm:inline">Admin</span>
                    </span>
                  </Link>
                )}
              </div>

              {/* Mobile: Just profile picture, Desktop: Full info */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  {user?.profilePicture ? (
                    <>
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/profile-pictures/${user.profilePicture}`}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border-2 border-spotify-green"
                        onError={(e) => {
                          console.error('Profile picture failed to load:', e.currentTarget.src);
                          // Hide the broken image and show fallback
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-8 h-8 bg-spotify-green rounded-full  items-center justify-center absolute top-0 left-0 hidden">
                        <span className="text-white font-semibold text-sm">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Desktop only: Welcome message */}
                <span className="hidden sm:inline text-spotify-gray-light text-sm">Welcome, {user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-full transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="text-spotify-gray-light hover:text-white font-medium transition-colors text-xs sm:text-sm px-2 py-1 sm:px-0 sm:py-0"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-spotify-green hover:bg-spotify-green-hover text-white font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-full transition-colors text-xs sm:text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
