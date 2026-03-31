import React from 'react';
import './Input.css';

export const Input = ({
  label,
  error,
  hint,
  type = 'text',
  required = false,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`input-field ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <div className="input-error">{error}</div>}
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  );
};

export const TextArea = ({
  label,
  error,
  hint,
  required = false,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        className={`input-field textarea ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <div className="input-error">{error}</div>}
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  hint,
  options = [],
  required = false,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select className={`input-field ${error ? 'error' : ''}`} {...props}>
        <option value="">Select {label?.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="input-error">{error}</div>}
      {hint && <div className="input-hint">{hint}</div>}
    </div>
  );
};
