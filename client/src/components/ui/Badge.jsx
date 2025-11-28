import React from "react";
import "./Badge.css";

const difficultyClassMap = {
  easy: "cg-badge-easy",
  medium: "cg-badge-medium",
  hard: "cg-badge-hard",
};

export function Badge({
  variant = "outline",
  difficulty,
  className = "",
  children,
}) {
  const diffClass = difficulty ? difficultyClassMap[difficulty] || "" : "";

  return (
    <span className={`cg-badge cg-badge-${variant} ${diffClass} ${className}`}>
      {children}
    </span>
  );
}
