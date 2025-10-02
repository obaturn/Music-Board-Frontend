
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-spotify-gray"></div>
        <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-spotify-green animation-delay-150"></div>
      </div>
      <p className="text-spotify-gray-light text-sm mt-4 animate-bounce-subtle">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
