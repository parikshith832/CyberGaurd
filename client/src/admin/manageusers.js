// AdminPanel.jsx  (now just a User Management page for logged‑in users)

import React, { useState, useEffect } from "react";
import "./login-cyber.css";

const API_BASE = "http://localhost:3001";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Use the normal auth token saved by LoginPage
  const token = localStorage.getItem("token");

  // Fetch users once on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Please log in first.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to fetch users");
        }
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response format");
        }

        setUsers(data);
      } catch (err) {
        setError(err.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Delete user handler (optional – keep or remove)
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete user? This cannot be undone!")) return;
    if (!token) {
      setError("Please log in first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Delete failed");
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMessage("User deleted.");
    } catch (err) {
      setError(err.message || "Delete failed");
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
              <h1>User Console</h1>
              <p>View and manage registered users</p>
            </div>
          </div>

          {/* Status messages */}
          {loading && <div className="lg-message">Loading...</div>}
          {error && <div className="lg-error">{error}</div>}
          {message && <div className="lg-message">{message}</div>}

          {/* Users table */}
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
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ padding: "8px", textAlign: "center" }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
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
                      {u.created_at
                        ? u.created_at.slice(0, 19).replace("T", " ")
                        : ""}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminPanel;
