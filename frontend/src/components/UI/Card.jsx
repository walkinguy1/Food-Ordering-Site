import React from 'react';
import './Card.css';

export const Card = ({
  children,
  hoverable = true,
  className = '',
  compact = false,
  onClick = null,
  ...props
}) => {
  const classes = [
    'card',
    !hoverable && 'card-no-hover',
    compact && 'card-compact',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

export const CardImage = ({ src, alt = '', className = '' }) => (
  <div className={`card-image ${className}`}>
    <img src={src} alt={alt} />
  </div>
);
