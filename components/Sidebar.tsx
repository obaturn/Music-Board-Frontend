import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = (e: React.MouseEvent) => {
    // Only call onClick for mobile (when sidebar needs to close)
    if (onClick && window.innerWidth < 768) {
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`spotify-sidebar-link ${isActive ? 'active' : ''}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const navigationItems = [
    {
      to: '/',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-6 6A1 1 0 004 9v8a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9a1 1 0 00-.293-.707l-6-6z" />
        </svg>
      ),
      label: 'Home',
    },
    {
      to: '/search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Search',
    },
  ];

  const libraryItems = isAuthenticated ? [
    {
      to: '/library',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      label: 'Your Library',
    },
  ] : [];

  const adminItems = user?.role === UserRole.ADMIN ? [
    {
      to: '/add',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'Add Music',
    },
    {
      to: '/wp-content',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'WP Content',
    },
  ] : [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-full w-64 bg-spotify-black border-r border-spotify-dark
        transform transition-transform duration-300 ease-in-out pointer-events-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed left-0 top-0 z-50 md:static md:translate-x-0 md:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-spotify-dark">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
            </svg>
            <span className="text-xl font-bold text-white">MusicBoard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={onClose}
              />
            ))}
          </div>

          {libraryItems.length > 0 && (
            <div className="mt-8 space-y-1">
              {libraryItems.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={onClose}
                />
              ))}
            </div>
          )}

          {adminItems.length > 0 && (
            <div className="mt-8 space-y-1">
              <div className="px-4 py-2 text-xs font-semibold text-spotify-gray-light uppercase tracking-wider">
                Admin
              </div>
              {adminItems.map((item) => (
                <SidebarLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={onClose}
                />
              ))}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-spotify-dark">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user?.profilePicture ? (
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
                ) : (
                  <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.username}
                  </p>
                  <p className="text-spotify-gray-light text-xs capitalize">
                    {user?.role.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-spotify-gray-light hover:text-white p-1"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full spotify-button-secondary text-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="block w-full spotify-button text-center"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;