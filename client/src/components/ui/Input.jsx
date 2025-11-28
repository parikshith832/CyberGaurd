import React from "react";
import "./input.css";

export function Input({
  label,
  helperText,
  error,
  className = "",
  id,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={`cg-input-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="cg-input-label">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`cg-input ${error ? "cg-input-error" : ""}`}
        {...props}
      />

      {helperText && !error && <p className="cg-input-helper">{helperText}</p>}

      {error && <p className="cg-input-error-text">{error}</p>}
    </div>
  );
}
