import React from 'react';
import './Loading.css';

export const Spinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`spinner ${sizeClass}`}></div>
      </div>
    );
  }

  return <div className={`spinner ${sizeClass}`}></div>;
};

export const SkeletonLoader = ({ count = 3, type = 'text' }) => {
  return (
    <div className="skeleton-group">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={`skeleton skeleton-${type}`}></div>
        ))}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="p-lg">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="skeleton-group">
    {Array(lines)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        ></div>
      ))}
  </div>
);
