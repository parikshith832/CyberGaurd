import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AttackPage from "./components/AttackPage";
import DefensePage from "./components/DefensePage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import HomePage from "./pages/HomePage";
import AttackSolutionPage from "./components/AttackSolutionPage";

import CyberHeader from "./components/CyberHeader";

// Simple helper: is the user logged in?
const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <CyberHeader />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes – require login */}
          <Route
            path="/attack"
            element={
              isLoggedIn() ? <AttackPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/attack/solution"
            element={
              isLoggedIn() ? (
                <AttackSolutionPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/defense"
            element={
              isLoggedIn() ? <DefensePage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn() ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
