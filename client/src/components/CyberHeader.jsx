// client/src/components/CyberHeader.jsx

import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./cyber-header.css";

const CyberHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read token once per render; this is enough for header swaps after login/logout
  const isLoggedIn = useMemo(() => !!localStorage.getItem("token"), []);

  const isActive = (path) =>
    location.pathname.startsWith(path) ? "cy-pill active" : "cy-pill"; // active class matches your CSS [web:374][web:380]

  const onLogin = () => navigate("/login"); // simple navigate to login page [web:382][web:384]
  const onLogout = () => {
    localStorage.removeItem("token"); // clear JWT on logout [web:351][web:352]
    navigate("/login"); // return to login after logout [web:357][web:351]
  };

  // optional tiny binary rain seeds
  const rain = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    dur: `${5 + Math.random() * 4}s`,
    txt: "1011001110010101",
  }));

  return (
    <header className="cy-head">
      <div className="cy-beams" />
      <div className="cy-grid" />
      <div className="cy-rain">
        {rain.map((r) => (
          <span
            key={r.id}
            style={{
              left: r.left,
              animationDelay: r.delay,
              animationDuration: r.dur,
            }}
          >
            {r.txt}
          </span>
        ))}
      </div>

      <div className="cy-wrap">
        {/* Brand */}
        <Link to="/" className="cy-brand">
          <div className="cy-lock">
            <div className="ring ring1" />
            <div className="ring ring2" />
            <div className="dot" />
          </div>
          <div className="brand-text">CyberGuard</div>
        </Link>

        {/* Nav */}
        <nav className="cy-nav">
          <Link to="/attack" className={isActive("/attack")}>
            <svg
              className="icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M3 12h18M12 3v18" stroke="#9db4ff" strokeWidth="2" />
            </svg>
            Attack
          </Link>

          <Link to="/defense" className={isActive("/defense")}>
            <svg
              className="icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z"
                stroke="#9db4ff"
                strokeWidth="2"
              />
            </svg>
            Defense
          </Link>

          <Link to="/dashboard" className={isActive("/dashboard")}>
            <svg
              className="icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 13h6v7H4zM14 4h6v16h-6zM4 4h6v7H4z"
                stroke="#9db4ff"
                strokeWidth="2"
              />
            </svg>
            Dashboard
          </Link>

          {/* Auth CTA keeps same style; label/action switches via token */}
          {isLoggedIn ? (
            <button className="cy-cta" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <button className="cy-cta" onClick={onLogin}>
              Login
            </button>
          )}
        </nav>
      </div>

      {/* Bottom ticker */}
      <div className="cy-ticker">
        <div className="track">
          <span>WAF RULES SYNCED</span>
          <span>HONEYPOT: ONLINE</span>
          <span>THREAT INTEL UPDATING…</span>
          <span>PACKETS SCANNED: 24,583</span>
          <span>ALERTS: LOW</span>
        </div>
      </div>
    </header>
  );
};

export default CyberHeader;
