// src/components/CyberHeader.jsx
import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./cyber-header.css";

const CyberHeader = () => {
  const loc = useLocation();
  const rainRef = useRef(null);

  // Create looping "code rain"
  useEffect(() => {
    const root = rainRef.current;
    if (!root) return;
    const cols = 40;
    root.innerHTML = "";
    for (let i = 0; i < cols; i++) {
      const span = document.createElement("span");
      span.style.left = `${(i / cols) * 100}%`;
      span.style.animationDelay = `${Math.random() * 4}s`;
      span.textContent = "01".repeat(80);
      root.appendChild(span);
    }
  }, []);

  return (
    <header className="cy-head">
      {/* layered backgrounds */}
      <div className="cy-beams" />
      <div className="cy-grid" />
      <div className="cy-rain" ref={rainRef} />

      <div className="cy-wrap">
        <Link to="/" className="cy-brand">
          <div className="cy-lock">
            <div className="ring ring1" />
            <div className="ring ring2" />
            <div className="dot" />
          </div>
          <span className="brand-text">CyberGuard</span>
        </Link>

        <nav className="cy-nav">
          <Link className={`cy-pill ${loc.pathname==="/attack"?"active":""}`} to="/attack">
            <span className="icon">🗡️</span> Attack
          </Link>
          <Link className={`cy-pill ${loc.pathname==="/defense"?"active":""}`} to="/defense">
            <span className="icon">🛡️</span> Defense
          </Link>
          <Link className={`cy-pill ${loc.pathname==="/dashboard"?"active":""}`} to="/dashboard">
            <span className="icon">📊</span> Dashboard
          </Link>
          <Link className="cy-cta" to="/login">Login</Link>
        </nav>
      </div>

      <div className="cy-ticker">
        <div className="track">
          <span>Threat intel updating...</span>
          <span>Packets scanned: 24,583</span>
          <span>Alerts: LOW</span>
          <span>WAF rules synced</span>
          <span>Honeypot: Online</span>
          <span>Threat intel updating...</span>
          <span>Packets scanned: 24,583</span>
          <span>Alerts: LOW</span>
          <span>WAF rules synced</span>
          <span>Honeypot: Online</span>
        </div>
      </div>
    </header>
  );
};

export default CyberHeader;
