
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-spotify-dark to-spotify-black">
      <div className="text-center py-16 sm:py-24 px-4">
        <div className="relative max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-spotify-green rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-6">
              Welcome to <span className="text-spotify-green">MusicBoard</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-spotify-gray-light leading-relaxed">
              Discover, share, and manage your favorite music all in one place. Join a community of music lovers and creators.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="spotify-button text-lg px-8 py-4 hover:scale-105 transition-transform"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="spotify-button-secondary text-lg px-8 py-4 hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-spotify-dark/50 backdrop-blur-sm p-8 rounded-xl border border-spotify-gray/20 hover:bg-spotify-dark/70 transition-colors">
              <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Discover New Music</h3>
              <p className="text-spotify-gray-light leading-relaxed">Browse an ever-growing library of tracks from various artists and genres. Find your next favorite song.</p>
            </div>

            <div className="bg-spotify-dark/50 backdrop-blur-sm p-8 rounded-xl border border-spotify-gray/20 hover:bg-spotify-dark/70 transition-colors">
              <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Contribute Your Own</h3>
              <p className="text-spotify-gray-light leading-relaxed">Employers and admins can upload and manage their own music entries for everyone to discover and enjoy.</p>
            </div>

            <div className="bg-spotify-dark/50 backdrop-blur-sm p-8 rounded-xl border border-spotify-gray/20 hover:bg-spotify-dark/70 transition-colors">
              <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-spotify-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stay Informed</h3>
              <p className="text-spotify-gray-light leading-relaxed">Admins get access to the latest music news and articles from around the web through our integrated content system.</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start your musical journey?</h2>
            <p className="text-spotify-gray-light mb-8 max-w-md mx-auto">
              Join thousands of music enthusiasts already exploring MusicBoard
            </p>
            <Link
              to="/register"
              className="spotify-button text-xl px-10 py-4 hover:scale-105 transition-transform inline-block"
            >
              Join MusicBoard Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
