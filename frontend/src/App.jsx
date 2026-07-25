import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import PublicLeadForm from './components/PublicLeadForm';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

export default function App() {
  const appState = import.meta.env.VITE_API_REACT_ENV;
  const apiServerUrl = appState === 'development' ? 'http://localhost:5000' : import.meta.env.VITE_API_SERVER_URL;

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
          <Link className="navbar-brand fw-bold" to="/">Lead Platform</Link>
          <div className="ms-auto">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-light btn-sm" to="/dashboard">Dashboard</Link>
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                  Logout ({user.name})
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<PublicLeadForm apiServerUrl={apiServerUrl} />} />

            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login setAuth={setUser} apiServerUrl={apiServerUrl} />
                )
              }
            />

            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Register setAuth={setUser} apiServerUrl={apiServerUrl} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}