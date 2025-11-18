import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./home-junni.css";

const TiltCard = ({ title, lines, tag, to, accent }) => {
  const ref = useRef(null);
  const [transform, setTransform] = useState("");

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    const rx = (-y / 18).toFixed(2);
    const ry = (x / 18).toFixed(2);
    setTransform(`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`);
  };
  const onLeave = () => setTransform("perspective(900px) rotateX(0) rotateY(0) scale(1)");

  return (
    <Link to={to} className="tile-link">
      <div
        ref={ref}
        className={`tile ${accent}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transform }}
      >
        <div className="tile-top">
          <span className="chip">{tag}</span>
        </div>
        <h3 className="tile-title">{title}</h3>
        <ul className="tile-lines">
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <div className="tile-glow" />
      </div>
    </Link>
  );
};

const HomePage = () => {
  const [headline, setHeadline] = useState("");
  const slogan = "Protect. Detect. Respond.";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setHeadline(slogan.slice(0, i));
      i++;
      if (i > slogan.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, []);

  const tiles = [
    {
      title: "Red Team Ops",
      lines: ["Recon", "Exploit", "Privilege Escalation", "Evasion"],
      tag: "Attack",
      to: "/attack",
      accent: "tile-red",
    },
    {
      title: "Blue Team Defense",
      lines: ["Detection", "IR Playbooks", "Threat Hunting", "Hardening"],
      tag: "Defense",
      to: "/defense",
      accent: "tile-blue",
    },
    {
      title: "Cyber Academy",
      lines: ["Scenarios", "Labs", "Quests", "Cert Prep"],
      tag: "Learn",
      to: "/login",
      accent: "tile-purple",
    },
    {
      title: "Live Dashboard",
      lines: ["Active Users", "Scores", "Events", "Sockets"],
      tag: "Status",
      to: "/dashboard",
      accent: "tile-green",
    },
  ];

  return (
    <main className="j-viewport">
      {/* Gradient beams + grain */}
      <div className="j-gradient" />
      <div className="j-grain" />

      {/* Hero */}
      <section className="j-hero">
        <h1 className="j-logo">CyberGuard</h1>
        <p className="j-sub">
          {headline}
          <span className="cursor">|</span>
        </p>

        <div className="j-kv">
          <div className="j-kv-ring ring1" />
          <div className="j-kv-ring ring2" />
          <div className="j-kv-orb" />
        </div>

        <div className="j-cta">
          <Link to="/login" className="cta-btn">Start Simulation</Link>
          <Link to="/defense" className="cta-ghost">View Defense</Link>
        </div>
      </section>

      {/* Marquee */}
      <section className="j-marquee">
        <div className="track">
          <span>Real-time Simulation</span>
          <span>AI Adversaries</span>
          <span>Threat Intel</span>
          <span>WebSockets</span>
          <span>Blue vs Red</span>
          <span>Real-time Simulation</span>
          <span>AI Adversaries</span>
          <span>Threat Intel</span>
          <span>WebSockets</span>
          <span>Blue vs Red</span>
        </div>
      </section>

      {/* Tiles Grid */}
      <section className="j-grid">
        {tiles.map((t, i) => (
          <div className="j-cell fade-in" style={{ animationDelay: `${i * 0.12}s` }} key={t.title}>
            <TiltCard {...t} />
          </div>
        ))}
      </section>

      {/* Stats strip */}
      <section className="j-stats">
        <div className="stat">
          <strong>4,000+</strong>
          <span>Attacks Daily</span>
        </div>
        <div className="stat">
          <strong>1,200+</strong>
          <span>Breaches 2024</span>
        </div>
        <div className="stat">
          <strong>3.5M</strong>
          <span>Open Roles</span>
        </div>
        <div className="stat">
          <strong>$103K</strong>
          <span>Avg Salary</span>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
