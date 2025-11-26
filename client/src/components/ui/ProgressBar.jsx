import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label = null,
  animated = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="progress-wrapper">
      {(showLabel || label) && (
        <div className="progress-label">
          <span>{label || `Progress`}</span>
          <span className="progress-percentage">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`progress-bar progress-${size} progress-${variant}`}>
        <div 
          className={`progress-fill ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {animated && <div className="progress-glow" />}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;