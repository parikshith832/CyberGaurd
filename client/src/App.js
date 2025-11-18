import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import AttackPage from './components/AttackPage';
import DefensePage from './components/DefensePage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import HomePage from './pages/HomePage';

// New animated header
import CyberHeader from './components/CyberHeader';

const App = () => (
  <Router>
    <div className="App">
      <CyberHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/attack" element={<AttackPage />} />
        <Route path="/defense" element={<DefensePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  </Router>
);

export default App;
