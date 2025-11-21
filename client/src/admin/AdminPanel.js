import React, { useEffect, useState } from "react";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Fetch the list of users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Toggle admin status of a user
  const toggleAdmin = async (id, currentState) => {
    setError("");
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_admin: !currentState }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      await fetchUsers(); // Refresh user list
    } catch (e) {
      setError(e.message);
    }
  };

  // Delete a user
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setError("");
    try {
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers(); // Refresh list after deletion
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Admin Panel - User Management</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table border="1" width="100%" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Admin</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.is_admin === 1 ? "Yes" : "No"}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => toggleAdmin(user.id, user.is_admin === 1)}
                  >
                    {user.is_admin === 1 ? "Revoke Admin" : "Make Admin"}
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    style={{ marginLeft: "0.5rem", color: "red" }}
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
  );
};

export default AdminPanel;
