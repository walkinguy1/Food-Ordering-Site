import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon = null,
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    fullWidth && 'btn-block',
    loading && 'btn-loading',
    disabled && 'btn-disabled'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <span className="spinner spinner-sm"></span>
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
};

export const ButtonGroup = ({ children, className = '' }) => (
  <div className={`button-group ${className}`}>{children}</div>
);
