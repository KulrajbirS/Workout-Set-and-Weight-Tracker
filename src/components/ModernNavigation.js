import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ModernNavigation = ({ activeView, setActiveView, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: '●', label: 'Home', description: 'Overview' },
    { id: 'workouts', icon: '◇', label: 'Workouts', description: 'Exercise tracking' },
    { id: 'progress', icon: '△', label: 'Progress', description: 'Weight & stats' },
    { id: 'history', icon: '◻', label: 'History', description: 'Past activities' }
  ];

  return (
    <>
      {/* Hamburger Menu Button - All Devices */}
      <button 
        className="hamburger-menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`}></span>
      </button>

      {/* Sidebar Overlay - Mobile Only */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && (
            <button 
              className="app-logo-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <span className="logo-icon">●</span>
              <span className="logo-text">FitTracker</span>
            </button>
          )}
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <div className="nav-items">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-text">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={logout} title={sidebarOpen ? 'Logout' : 'Logout'}>
            <span>→</span>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default ModernNavigation;