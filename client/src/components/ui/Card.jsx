import React from "react";
import "./Card.css";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`cg-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`cg-card-header ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`cg-card-title ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardSubtitle({ className = "", children, ...props }) {
  return (
    <p className={`cg-card-subtitle ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`cg-card-content ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div className={`cg-card-footer ${className}`} {...props}>
      {children}
    </div>
  );
}
