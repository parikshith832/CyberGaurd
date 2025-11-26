import React from 'react';
import './Loading.css';

const Loading = ({ size = 'md', text = null, fullScreen = false }) => {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '60px',
  };

  const Spinner = () => (
    <div className="loading-spinner" style={{ width: sizeMap[size], height: sizeMap[size] }}>
      <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <Spinner />
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <Spinner />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;