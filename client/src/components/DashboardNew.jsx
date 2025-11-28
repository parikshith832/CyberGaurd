import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
import Loading from "./ui/Loading";
import { useToast } from "./ui/ToastContainer";
import "../styles/theme.css";
import "./DashboardNew.css";

const API_BASE = "http://localhost:3001";

const DashboardNew = () => {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [sRes, eRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/summary`),
        fetch(`${API_BASE}/api/dashboard/events`),
      ]);

      const sData = await sRes.json();
      const eData = await eRes.json();

      if (!sRes.ok) throw new Error(sData.error || "Summary failed");
      if (!eRes.ok) throw new Error(eData.error || "Events failed");

      setSummary(sData);
      setEvents(Array.isArray(eData) ? eData : []);
      setLoading(false);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      toast.error(e.message || "Failed to load dashboard");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(id);
  }, []);

  const fmtTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const safe = (val, def = 0) => val ?? def;

  // Calculate progress percentages
  const getProgress = (score, maxScore) => {
    if (!maxScore) return 0;
    return Math.round((score / maxScore) * 100);
  };

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Lab Results</h1>
          <p className="dashboard-subtitle">
            View your challenge scores and progress
          </p>
        </div>
        <div className="status-badge">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Top Row */}
      <div className="stats-grid">
        <Card variant="glass" className="stat-card animate-fadeIn">
          <div className="stat-label">Total Runs</div>
          <div className="stat-value">{summary?.totalRuns || 0}</div>
          <div className="stat-change">+12% from last week</div>
        </Card>

        <Card
          variant="glass"
          className="stat-card animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="stat-label">Total Score</div>
          <div className="stat-value">{summary?.totalScore || 0}</div>
          <div className="stat-change">
            Out of {summary?.maxScore || 0} possible
          </div>
        </Card>

        <Card
          variant="glass"
          className="stat-card animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="stat-label">Success Rate</div>
          <div className="stat-value">
            {summary?.maxScore
              ? Math.round((summary.totalScore / summary.maxScore) * 100)
              : 0}
            %
          </div>
          <div className="stat-change">Completion rate</div>
        </Card>

        <Card
          variant="glass"
          className="stat-card animate-fadeIn"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="stat-label">Total Tests</div>
          <div className="stat-value">{summary?.totalTests || 0}</div>
          <div className="stat-change">Across all difficulties</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column - Difficulty Breakdown */}
        <div className="left-column">
          <Card
            title="Performance by Difficulty"
            className="animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="difficulty-section">
              {/* Easy */}
              <div className="difficulty-item">
                <div className="difficulty-header">
                  <div className="difficulty-info">
                    <Badge variant="success">Easy</Badge>
                    <span className="run-count">
                      {safe(summary?.byDifficulty.easy.runs)} runs
                    </span>
                  </div>
                  <div className="score-display">
                    {safe(summary?.byDifficulty.easy.score)} /{" "}
                    {safe(summary?.byDifficulty.easy.maxScore)}
                  </div>
                </div>
                <ProgressBar
                  value={safe(summary?.byDifficulty.easy.score)}
                  max={safe(summary?.byDifficulty.easy.maxScore) || 1}
                  variant="success"
                  size="md"
                  animated
                />
              </div>

              {/* Moderate */}
              <div className="difficulty-item">
                <div className="difficulty-header">
                  <div className="difficulty-info">
                    <Badge variant="warning">Moderate</Badge>
                    <span className="run-count">
                      {safe(summary?.byDifficulty.moderate.runs)} runs
                    </span>
                  </div>
                  <div className="score-display">
                    {safe(summary?.byDifficulty.moderate.score)} /{" "}
                    {safe(summary?.byDifficulty.moderate.maxScore)}
                  </div>
                </div>
                <ProgressBar
                  value={safe(summary?.byDifficulty.moderate.score)}
                  max={safe(summary?.byDifficulty.moderate.maxScore) || 1}
                  variant="primary"
                  size="md"
                  animated
                />
              </div>

              {/* Hard */}
              <div className="difficulty-item">
                <div className="difficulty-header">
                  <div className="difficulty-info">
                    <Badge variant="danger">Hard</Badge>
                    <span className="run-count">
                      {safe(summary?.byDifficulty.hard.runs)} runs
                    </span>
                  </div>
                  <div className="score-display">
                    {safe(summary?.byDifficulty.hard.score)} /{" "}
                    {safe(summary?.byDifficulty.hard.maxScore)}
                  </div>
                </div>
                <ProgressBar
                  value={safe(summary?.byDifficulty.hard.score)}
                  max={safe(summary?.byDifficulty.hard.maxScore) || 1}
                  variant="danger"
                  size="md"
                  animated
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="right-column">
          <Card
            title="Recent Activity"
            subtitle="Last 20 runs"
            className="animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="activity-feed">
              {events.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <p>No runs yet. Start your first attack!</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="activity-item">
                    <div className="activity-icon">
                      {event.status === "success" ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="icon-success"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="icon-neutral"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="activity-content">
                      <div className="activity-main">
                        <span className="activity-finding">
                          {event.finding || event.status}
                        </span>
                        <Badge
                          variant={
                            event.difficulty === "easy"
                              ? "success"
                              : event.difficulty === "moderate"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {event.difficulty}
                        </Badge>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-time">
                          {fmtTime(event.created_at)}
                        </span>
                        <span className="activity-score">
                          Score: {event.score}/{event.max_score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
