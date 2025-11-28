import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import "../styles/theme.css";
import "./home-junni.css";

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <div
      className="feature-card animate-fadeIn"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

const TiltCard = ({ title, lines, tag, to, accent }) => {
  const ref = useRef(null);
  const [transform, setTransform] = useState("");

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    const rx = (-y / 18).toFixed(2);
    const ry = (x / 18).toFixed(2);
    setTransform(
      `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`
    );
  };
  const onLeave = () =>
    setTransform("perspective(900px) rotateX(0) rotateY(0) scale(1)");

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
          <Badge
            variant={
              accent === "tile-red"
                ? "danger"
                : accent === "tile-blue"
                ? "primary"
                : accent === "tile-purple"
                ? "info"
                : "success"
            }
          >
            {tag}
          </Badge>
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

const HomePageNew = () => {
  const [headline, setHeadline] = useState("");
  const slogan = "Master Cybersecurity Through Practice";

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
      title: "Attack Lab",
      lines: ["SQL Injection", "XSS Exploits", "Auth Bypass", "Code Execution"],
      tag: "Offense",
      to: "/attack",
      accent: "tile-red",
    },
    {
      title: "Defense Mode",
      lines: [
        "Secure Coding",
        "Threat Detection",
        "Incident Response",
        "Best Practices",
      ],
      tag: "Defense",
      to: "/defense",
      accent: "tile-blue",
    },
    {
      title: "Learn & Grow",
      lines: [
        "Interactive Labs",
        "Real Scenarios",
        "Progressive Difficulty",
        "Skill Building",
      ],
      tag: "Training",
      to: "/login",
      accent: "tile-purple",
    },
    {
      title: "Track Progress",
      lines: [
        "Performance Metrics",
        "Score History",
        "Achievement System",
        "Analytics",
      ],
      tag: "Analytics",
      to: "/dashboard",
      accent: "tile-green",
    },
  ];

  return (
    <main className="home-viewport">
      {/* Background effects */}
      <div className="home-gradient" />
      <div className="home-grain" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Badge variant="primary">🔒 Ethical Hacking Platform</Badge>
          </div>

          <h1 className="hero-title">CyberGuard</h1>

          <p className="hero-subtitle">
            {headline}
            <span className="cursor-blink">|</span>
          </p>

          <p className="hero-description">
            Learn cybersecurity through hands-on challenges. Practice SQL
            injection, XSS, and more in a safe, sandboxed environment.
          </p>

          {/* Hero CTA */}
          <div className="hero-cta">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                }
              >
                Start Training
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Challenges</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">Difficulty Levels</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Learning</div>
            </div>
          </div>
        </div>

        {/* Animated orb */}
        <div className="hero-visual">
          <div className="orbit-ring ring1" />
          <div className="orbit-ring ring2" />
          <div className="orbit-ring ring3" />
          <div className="central-orb" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose CyberGuard?</h2>
          <p className="section-subtitle">
            Everything you need to master cybersecurity
          </p>
        </div>

        <div className="features-grid">
          <FeatureCard
            delay={0}
            icon="🎯"
            title="Hands-On Learning"
            description="Practice real attacks in a safe, isolated environment with instant feedback"
          />
          <FeatureCard
            delay={0.1}
            icon="🧪"
            title="Progressive Labs"
            description="Start easy and advance through moderate to hard challenges at your pace"
          />
          <FeatureCard
            delay={0.2}
            icon="📊"
            title="Track Progress"
            description="Monitor your scores, completion rates, and improvement over time"
          />
          <FeatureCard
            delay={0.3}
            icon="🤖"
            title="AI Assistance"
            description="Get hints and guidance from our AI when you're stuck on challenges"
          />
        </div>
      </section>

      {/* Lab Cards Grid */}
      <section className="labs-section">
        <div className="section-header">
          <h2 className="section-title">Choose Your Path</h2>
          <p className="section-subtitle">Select a lab to begin your journey</p>
        </div>

        <div className="labs-grid">
          {tiles.map((t, i) => (
            <div
              key={t.title}
              className="lab-cell fade-in"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <TiltCard {...t} />
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start?</h2>
          <p>Join thousands learning cybersecurity through practice</p>
          <Link to="/login">
            <Button variant="primary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default HomePageNew;
