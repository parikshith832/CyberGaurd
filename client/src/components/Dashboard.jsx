import React, { useMemo } from "react";
import "./dashboard-cyber.css";

const Metric = ({ label, value, accent }) => (
  <div className={`met ${accent}`}>
    <div className="met-glow" />
    <span className="met-label">{label}</span>
    <strong className="met-value">{value}</strong>
  </div>
);

const UserList = ({ title, users, accent }) => (
  <div className={`panel ${accent}`}>
    <div className="panel-glow" />
    <h3>{title}</h3>
    <ul className="list">
      {users.length ? users.map(u => (
        <li key={u.id}>
          <span className="dot" />
          <span className="name">{u.name}</span>
          <span className="role">{u.role||"Agent"}</span>
        </li>
      )) : <li className="empty">No active players</li>}
    </ul>
  </div>
);

const Feed = ({ items }) => (
  <div className="panel feed">
    <div className="panel-glow" />
    <h3>Event Feed</h3>
    <ul className="feed-list">
      {items.map((e, i) => (
        <li key={i}>
          <span className={`badge ${e.type}`}>{e.type}</span>
          <span className="msg">{e.msg}</span>
          <time>{e.time}</time>
        </li>
      ))}
    </ul>
  </div>
);

const Dashboard = ({ gameState, user }) => {
  const {
    blueTeam = { score: 0, actions: [], players: [] },
    redTeam  = { score: 0, actions: [], players: [] },
    round    = 1,
    isActive = true,
    events   = [],
    activeUsers = 0
  } = gameState || {};

  const metrics = useMemo(() => ([
    { label: "Round", value: round, accent: "m-blue" },
    { label: "Status", value: isActive ? "ACTIVE" : "PAUSED", accent: isActive ? "m-green" : "m-red" },
    { label: "Active Users", value: activeUsers || (blueTeam.players.length + redTeam.players.length), accent: "m-purple" },
    { label: "Blue Score", value: blueTeam.score, accent: "m-blue" },
    { label: "Red Score", value: redTeam.score, accent: "m-red" },
    { label: "Events", value: events.length, accent: "m-cyan" },
  ]), [round,isActive,activeUsers,blueTeam,redTeam,events]);

  return (
    <main className="db-viewport">
      <div className="db-beams" />
      <div className="db-grid" />
      <div className="db-grain" />

      <section className="db-wrap">
        <header className="db-head">
          <div className="head-left">
            <h1>Operations Center</h1>
            <p>Welcome {user?.name || "Operator"} — Maintain resilience and visibility.</p>
          </div>
          <div className={`state ${isActive?"on":"off"}`}>
            <span className="pulse" />
            {isActive ? "Live" : "Paused"}
          </div>
        </header>

        {/* Metrics */}
        <section className="met-grid">
          {metrics.map((m,i) => (
            <div className="met-cell fade-in" style={{animationDelay:`${i*0.08}s`}} key={m.label}>
              <Metric {...m} />
            </div>
          ))}
        </section>

        {/* Main grid */}
        <section className="panels">
          <div className="col">
            <UserList title="Blue Team" users={blueTeam.players} accent="p-blue" />
            <UserList title="Red Team"  users={redTeam.players}  accent="p-red" />
          </div>
          <div className="col">
            <Feed items={events.length ? events : [
              { type:"info", msg:"Sensors calibrated", time:"now" },
              { type:"attack", msg:"Phishing campaign detected", time:"1m" },
              { type:"defense", msg:"Rule deployed to WAF", time:"2m" },
              { type:"info", msg:"Honeypot tripped by bot", time:"5m" },
            ]} />
          </div>
        </section>

        {/* Ticker */}
        <section className="db-ticker">
          <div className="track">
            <span>Blue score {blueTeam.score}</span>
            <span>Red score {redTeam.score}</span>
            <span>Round {round}</span>
            <span>Agents online {blueTeam.players.length + redTeam.players.length}</span>
            <span>Latency stable</span>
            <span>IDS signatures updated</span>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Dashboard;
