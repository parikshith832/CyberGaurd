// AdminPanel.jsx

import React, { useState, useEffect } from "react";
import "./login-cyber.css";

const API_BASE = "http://localhost:3001";

function AdminPanel() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);

  // Login handler for admin
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || "Login failed");

      // Decode token payload to check admin status
      const payload = JSON.parse(
        atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      if (!payload.is_admin) throw new Error("You are not an admin!");

      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setIsAdmin(true);
      setMessage("Logged in as Admin");
      setMode("dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users if logged in as admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin || !token) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!Array.isArray(data))
          throw new Error(data.error || "Unable to fetch users");
        setUsers(data);
      } catch (err) {
        setError(err.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isAdmin, token, mode]);

  // Delete user handler
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete user? This cannot be undone!")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");
      setUsers(users.filter((u) => u.id !== id));
      setMessage("User deleted.");
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    setIsAdmin(false);
    setUsers([]);
    setMode("login");
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
              <h1>Admin Console</h1>
              <p>Manage users and settings</p>
            </div>
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="lg-form">
              {error && <div className="lg-error">{error}</div>}
              {message && <div className="lg-message">{message}</div>}

              <label className="lg-field">
                <span>Admin Username</span>
                <input
                  type="text"
                  name="username"
                  placeholder="admin"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </label>

              <button className="lg-submit" disabled={loading}>
                {loading ? <span className="spinner" /> : "Admin Login"}
              </button>
            </form>
          )}

          {mode === "dashboard" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h2 style={{ margin: 0 }}>User Management</h2>
                <button className="link-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              {error && <div className="lg-error">{error}</div>}
              {message && <div className="lg-message">{message}</div>}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                  background: "#101223",
                  borderRadius: "10px",
                }}
              >
                <thead>
                  <tr style={{ background: "#15192b", color: "#8ac7ff" }}>
                    <th style={{ padding: "8px" }}>ID</th>
                    <th style={{ padding: "8px" }}>Username</th>
                    <th style={{ padding: "8px" }}>Admin?</th>
                    <th style={{ padding: "8px" }}>Created</th>
                    <th style={{ padding: "8px" }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        color: "#bdcdee",
                        borderBottom: "1px solid #212340",
                      }}
                    >
                      <td style={{ padding: "8px" }}>{u.id}</td>
                      <td style={{ padding: "8px" }}>{u.username}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        {u.is_admin ? "✅" : ""}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {u.created_at.slice(0, 19).replace("T", " ")}
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <button
                          className="link-button"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default AdminPanel;
