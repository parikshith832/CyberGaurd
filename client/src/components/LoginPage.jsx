// src/components/LoginPage.jsx (or wherever you keep it)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login-cyber.css";

const API_BASE = "http://localhost:3001"; // change if your backend runs on another port

const LoginPage = () => {
  // "login" or "register"
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        // Create account
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setMessage("Account created successfully. You can now log in.");
        setMode("login");
      } else {
        // Login
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.token) {
          throw new Error(data.error || "Login failed");
        }

        // Save token for later API calls
        localStorage.setItem("token", data.token);

        // Optional: decode to inspect payload or roles
        // const payload = JSON.parse(
        //   atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        // );
        // console.log("JWT payload:", payload);

        setMessage(`Logged in as ${form.username}`);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
              <h1>{mode === "login" ? "Access Console" : "Create Account"}</h1>
              <p>
                {mode === "login"
                  ? "Authenticate to enter the simulation"
                  : "Register a new account for the simulation"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg-form">
            {error && <div className="lg-error">{error}</div>}
            {message && <div className="lg-message">{message}</div>}

            <label className="lg-field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                placeholder="your_username"
                value={form.username}
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

            <button className="lg-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </button>

            <div className="lg-meta">
              {mode === "login" ? (
                <>
                  <a href="#forgot">Forgot password?</a>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setError("");
                      setMessage("");
                      setMode("register");
                    }}
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  <span />
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setError("");
                      setMessage("");
                      setMode("login");
                    }}
                  >
                    Back to login
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
