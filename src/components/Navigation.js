import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workout-form', label: 'Log Workout' },
    { id: 'workout-history', label: 'Workout History' },
    { id: 'weight-tracker', label: 'Track Weight' },
    { id: 'weight-history', label: 'Weight History' }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1>Fitness Tracker</h1>
        <div className="user-info">
          <span className="user-name">Welcome, {user?.name}</span>
          <button 
            onClick={handleLogout}
            className="btn-logout"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;