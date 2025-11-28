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
import DashboardNew from "./components/DashboardNew";
import HomePage from "./pages/HomePage"; // ← Make sure this is imported
import AttackSolutionPage from "./components/AttackSolutionPage";
import CyberHeader from "./components/CyberHeader";

import { ToastProvider } from "./components/ui/ToastContainer";
import "./styles/theme.css";

const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

const App = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <CyberHeader />
          <Routes>
            {/* PUBLIC ROUTES - No login required */}
            <Route path="/" element={<HomePage />} />{" "}
            {/* ← This should be public */}
            <Route path="/login" element={<LoginPage />} />
            {/* PROTECTED ROUTES - Login required */}
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
                isLoggedIn() ? (
                  <DefensePage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isLoggedIn() ? (
                  <DashboardNew />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Fallback - redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
