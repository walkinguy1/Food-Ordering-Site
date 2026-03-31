import React from 'react';
import './Alert.css';

export const Alert = ({ type = 'info', message, onClose = null, icon: Icon = null }) => {
  return (
    <div className={`alert alert-${type}`}>
      {Icon && <Icon size={20} className="flex-shrink-0" />}
      <div className="flex-1">
        <p style={{ margin: 0 }}>{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          ✕
        </button>
      )}
    </div>
  );
};

export const AlertGroup = ({ alerts, onClose }) => (
  <div className="alert-group">
    {alerts.map((alert, i) => (
      <Alert
        key={i}
        type={alert.type}
        message={alert.message}
        icon={alert.icon}
        onClose={() => onClose(i)}
      />
    ))}
  </div>
);

export const ErrorBoundary = ({ children, fallback = null }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="error-page">
          <div className="container">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => setHasError(false)} className="btn btn-primary">
              Try again
            </button>
          </div>
        </div>
      )
    );
  }

  return children;
};
