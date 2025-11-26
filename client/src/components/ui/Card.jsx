import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title = null, 
  subtitle = null,
  headerAction = null,
  className = '',
  variant = 'default',
  hoverable = false,
  padding = 'md'
}) => {
  const classes = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable ? 'card-hoverable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;