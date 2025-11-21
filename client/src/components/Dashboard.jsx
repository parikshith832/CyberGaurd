// client/src/components/Dashboard.jsx

import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchData = async () => {
    try {
      setErr("");
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
      setErr(e.message || "Failed to load dashboard");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000); // simple realtime polling
    return () => clearInterval(id);
  }, []);

  const fmtTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleTimeString();
  };

  const safe = (path, def = 0) => path ?? def;

  return (
    <main className="atk-viewport">
      <div className="atk-beams" />
      <div className="atk-grid" />
      <div className="atk-grain" />

      <section className="atk-wrap">
        <header className="atk-head">
          <h1>Operations Center</h1>
        </header>

        {err && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#7f1d1d",
              color: "#fee2e2",
            }}
          >
            {err}
          </div>
        )}

        {/* Top row cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Round</span>
            </div>
            <div style={{ padding: "8px 12px", fontSize: "20px" }}>1</div>
          </div>

          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Status</span>
            </div>
            <div
              style={{
                padding: "8px 12px",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#4ade80",
              }}
            >
              ACTIVE
            </div>
          </div>

          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Total Runs</span>
            </div>
            <div style={{ padding: "8px 12px", fontSize: "20px" }}>
              {summary ? summary.totalRuns : loading ? "…" : 0}
            </div>
          </div>

          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Total Score</span>
            </div>
            <div style={{ padding: "8px 12px", fontSize: "20px" }}>
              {summary ? summary.totalScore : loading ? "…" : 0}
            </div>
          </div>

          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Max Score</span>
            </div>
            <div style={{ padding: "8px 12px", fontSize: "20px" }}>
              {summary ? summary.maxScore : loading ? "…" : 0}
            </div>
          </div>
        </div>

        {/* Middle row: per-difficulty scores + event feed */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1.7fr",
            gap: "16px",
          }}
        >
          {/* Left: difficulty breakdown */}
          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Scoreboard</span>
            </div>
            <div className="sim-body">
              <div className="kv">
                <div>
                  <strong>Easy</strong>
                  <span>
                    Runs:{" "}
                    {summary
                      ? safe(summary.byDifficulty.easy.runs)
                      : loading
                      ? "…\n"
                      : 0}
                  </span>
                  <span>
                    <br></br>
                    Score:{" "}
                    {summary
                      ? safe(summary.byDifficulty.easy.score)
                      : loading
                      ? "…"
                      : 0}
                    {" / "}
                    {summary
                      ? safe(summary.byDifficulty.easy.maxScore)
                      : loading
                      ? "…"
                      : 0}
                  </span>
                </div>
                <div>
                  <strong>Moderate</strong>
                  <span>
                    Runs:{" "}
                    {summary
                      ? safe(summary.byDifficulty.moderate.runs)
                      : loading
                      ? "…"
                      : 0}
                  </span>
                  <span>
                    <br></br>
                    Score:{" "}
                    {summary
                      ? safe(summary.byDifficulty.moderate.score)
                      : loading
                      ? "…"
                      : 0}
                    {" / "}
                    {summary
                      ? safe(summary.byDifficulty.moderate.maxScore)
                      : loading
                      ? "…"
                      : 0}
                  </span>
                </div>
                <div>
                  <strong>Hard</strong>
                  <span>
                    Runs:{" "}
                    {summary
                      ? safe(summary.byDifficulty.hard.runs)
                      : loading
                      ? "…"
                      : 0}
                  </span>
                  <span>
                    <br></br>
                    Score:{" "}
                    {summary
                      ? safe(summary.byDifficulty.hard.score)
                      : loading
                      ? "…"
                      : 0}
                    {" / "}
                    {summary
                      ? safe(summary.byDifficulty.hard.maxScore)
                      : loading
                      ? "…"
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: event feed */}
          <div className="sim-card">
            <div className="card-head">
              <span className="chip">Event Feed</span>
            </div>
            <div
              className="sim-body"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="http-log" style={{ maxHeight: "260px" }}>
                <div className="line head">
                  <span>Time</span>
                  <span>Challenge</span>
                  <span>Score</span>
                </div>
                {events.map((e) => (
                  <div key={e.id} className="line">
                    <span>{fmtTime(e.created_at)}</span>
                    <span>
                      {String(e.difficulty || "").toUpperCase()} ·{" "}
                      {e.finding || e.status}
                    </span>
                    <span>
                      {e.score}/{e.max_score}
                    </span>
                  </div>
                ))}
                {!events.length && !loading && (
                  <div className="muted" style={{ padding: "10px" }}>
                    No runs yet. Execute an attack to see results here.
                  </div>
                )}
                {loading && (
                  <div className="muted" style={{ padding: "10px" }}>
                    Loading…
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
