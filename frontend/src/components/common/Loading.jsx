import React from 'react';

const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const spinner = (
    <div className="text-center">
      <div className={`${sizeClasses[size]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto`}></div>
      <p className="mt-2 text-gray-500 text-sm">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loading;