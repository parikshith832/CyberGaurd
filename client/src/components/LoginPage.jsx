import React, { useState } from "react";
import "./login-cyber.css";

const LoginPage = () => {
  const [team, setTeam] = useState("blue");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Logged in as ${form.email} (${team} team)`);
      // navigate to dashboard if using react-router's useNavigate
    }, 1200);
  };

  return (
    <main className="lg-viewport">
      <div className="lg-beams" />
      <div className="lg-grid" />
      <div className="lg-grain" />

      <section className="lg-wrap">
        <div className="lg-card">
          <div className="lg-head">
            <div className="lg-logo">
              <span className="orb" />
              <span className="ring ring1" />
              <span className="ring ring2" />
            </div>
            <div className="lg-title">
              <h1>Access Console</h1>
              <p>Authenticate to enter the simulation</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="lg-form">
            <label className="lg-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={onChange}
                required
              />
            </label>

            <label className="lg-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
              />
            </label>

            <label className="lg-field">
              <span>Team</span>
              <div className="lg-radio">
                <label className={`pill ${team==="blue"?"active":""}`}>
                  <input
                    type="radio"
                    name="team"
                    value="blue"
                    checked={team==="blue"}
                    onChange={() => setTeam("blue")}
                  />
                  🛡️ Blue
                </label>
                <label className={`pill ${team==="red"?"active":""}`}>
                  <input
                    type="radio"
                    name="team"
                    value="red"
                    checked={team==="red"}
                    onChange={() => setTeam("red")}
                  />
                  🗡️ Red
                </label>
              </div>
            </label>

            <button className="lg-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Enter Simulation"}
            </button>

            <div className="lg-meta">
              <a href="#forgot">Forgot password?</a>
              <a href="#signup">Create account</a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
