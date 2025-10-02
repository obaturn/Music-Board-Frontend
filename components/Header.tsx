
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
      <div className="flex items-center justify-between h-16 px-6">
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
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                {user?.profilePicture ? (
                  <div className="relative">
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
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-spotify-gray-light text-sm">Welcome, {user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-spotify-gray-light hover:text-white font-medium transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-spotify-green hover:bg-spotify-green-hover text-white font-medium py-2 px-4 rounded-full transition-colors text-sm"
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
