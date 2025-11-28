import React from "react";
import "./ProgressBar.css";

export function ProgressBar({ value = 0, max = 100, label, className = "" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`cg-progress ${className}`}>
      {label && <div className="cg-progress-label">{label}</div>}
      <div className="cg-progress-track">
        <div className="cg-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
