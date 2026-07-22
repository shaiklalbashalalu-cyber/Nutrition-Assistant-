import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ChefHat, Dumbbell, User, BarChart3, LogOut, CheckCircle, XCircle } from 'lucide-react';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MealLogger from './components/MealLogger';
import DietPlanManager from './components/DietPlanManager';
import UserProfile from './components/UserProfile';
import Analytics from './components/Analytics';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [alert, setAlert] = useState(null);

  // Check auth on load
  useEffect(() => {
    const token = localStorage.getItem('nutrition_token');
    const storedUser = localStorage.getItem('nutrition_user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Clear alert after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    const storedUser = localStorage.getItem('nutrition_user');
    setUser(JSON.parse(storedUser));
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('nutrition_token');
    localStorage.removeItem('nutrition_user');
    setIsAuthenticated(false);
    setUser(null);
    setAlert({ type: 'success', message: 'Logged out successfully!' });
  };

  const handleAuthFailure = () => {
    localStorage.removeItem('nutrition_token');
    localStorage.removeItem('nutrition_user');
    setIsAuthenticated(false);
    setUser(null);
    setAlert({ type: 'error', message: 'Session expired or invalid. Please log in again.' });
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            setActivePage={setActivePage}
            setAlert={setAlert}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAuthFailure={handleAuthFailure}
          />
        );
      case 'meals':
        return (
          <MealLogger
            selectedDate={selectedDate}
            setAlert={setAlert}
            onAuthFailure={handleAuthFailure}
          />
        );
      case 'plans':
        return (
          <DietPlanManager
            user={user}
            setAlert={setAlert}
            onAuthFailure={handleAuthFailure}
          />
        );
      case 'profile':
        return (
          <UserProfile
            user={user}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
            setAlert={setAlert}
            onAuthFailure={handleAuthFailure}
          />
        );
      case 'analytics':
        return (
          <Analytics
            setAlert={setAlert}
            onAuthFailure={handleAuthFailure}
          />
        );
      default:
        return (
          <Dashboard
            user={user}
            setActivePage={setActivePage}
            setAlert={setAlert}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAuthFailure={handleAuthFailure}
          />
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} setAlert={setAlert} />
        {alert && (
          <div className={`alert-toast ${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Side Navigation Bar */}
      <aside className="sidebar">
        <div>
          {/* Logo brand */}
          <div className="brand" onClick={() => setActivePage('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="brand-logo">
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>N</span>
            </div>
            <span className="brand-name text-gradient">NUTRITION</span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-menu">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActivePage('meals')}
              className={`nav-item ${activePage === 'meals' ? 'active' : ''}`}
            >
              <ChefHat size={18} /> Daily Food Log
            </button>
            <button
              onClick={() => setActivePage('plans')}
              className={`nav-item ${activePage === 'plans' ? 'active' : ''}`}
            >
              <Dumbbell size={18} /> Diet Plans
            </button>
            <button
              onClick={() => setActivePage('analytics')}
              className={`nav-item ${activePage === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 size={18} /> Analytics & Reports
            </button>
            <button
              onClick={() => setActivePage('profile')}
              className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
            >
              <User size={18} /> Profile Settings
            </button>
          </nav>
        </div>

        {/* User Card & Logout option */}
        <div>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none', marginBottom: '20px' }}
          >
            <LogOut size={18} /> Sign Out
          </button>
          <div className="user-card">
            <div className="avatar">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Container */}
      <main className="main-content">
        {renderActivePage()}
      </main>

      {/* Floating Alert Banners */}
      {alert && (
        <div className={`alert-toast ${alert.type}`}>
          {alert.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
