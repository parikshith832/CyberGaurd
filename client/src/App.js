import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import AttackPage from "./components/AttackPage";
import DefensePage from "./components/DefensePage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import HomePage from "./pages/HomePage";
import AdminPanel from "./admin/AdminPanel";

import CyberHeader from "./components/CyberHeader";

// Helper to decode token and check admin status
const isAdmin = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.isAdmin === true;
  } catch {
    return false;
  }
};

const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    // Optional: check expiry here if needed
    return true;
  } catch {
    return false;
  }
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <CyberHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/attack" element={<AttackPage />} />
          <Route path="/defense" element={<DefensePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin route */}
          <Route
            path="/admin"
            element={
              isAdmin() ? <AdminPanel /> : <Navigate to="/login" replace />
            }
          />

          {/* Protected dashboard route */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn() ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
