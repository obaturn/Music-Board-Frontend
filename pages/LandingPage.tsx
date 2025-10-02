
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="text-center py-16 sm:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="relative">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight">
          Welcome to <span className="text-brand-primary">MusicBoard</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-brand-subtext">
          Discover, share, and manage your favorite music all in one place. Join a community of music lovers and creators.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="inline-block bg-brand-primary text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-green-600 transition-transform transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="inline-block bg-brand-light text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-opacity-80 transition-transform transform hover:scale-105"
          >
            I have an account
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            <div className="bg-brand-light p-6 rounded-lg">
                <h3 className="text-xl font-bold text-brand-primary mb-2">Discover New Music</h3>
                <p className="text-brand-subtext">Browse an ever-growing library of tracks from various artists and genres.</p>
            </div>
            <div className="bg-brand-light p-6 rounded-lg">
                <h3 className="text-xl font-bold text-brand-primary mb-2">Contribute Your Own</h3>
                <p className="text-brand-subtext">Employers and admins can upload and manage their own music entries for everyone to see.</p>
            </div>
            <div className="bg-brand-light p-6 rounded-lg">
                <h3 className="text-xl font-bold text-brand-primary mb-2">Stay Informed</h3>
                <p className="text-brand-subtext">Admins get access to the latest music news and articles from around the web.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
