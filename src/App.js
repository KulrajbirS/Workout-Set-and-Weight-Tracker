import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import ModernNavigation from './components/ModernNavigation';
import ModernDashboard from './components/ModernDashboard';
import WorkoutsView from './components/WorkoutsView';
import ProgressView from './components/ProgressView';
import HistoryView from './components/HistoryView';
import FloatingActions from './components/FloatingActions';
import QuickActionModal from './components/QuickActionModal';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [quickAction, setQuickAction] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ModernDashboard setActiveView={setActiveView} setQuickAction={setQuickAction} />;
      case 'workouts':
        return <WorkoutsView />;
      case 'progress':
        return <ProgressView />;
      case 'history':
        return <HistoryView />;
      default:
        return <ModernDashboard setActiveView={setActiveView} setQuickAction={setQuickAction} />;
    }
  };

  const handleQuickActionSuccess = () => {
    // Refresh dashboard if we're on it
    if (activeView === 'dashboard') {
      window.location.reload(); // Simple refresh for now
    }
  };

  return (
    <div className="App modern-layout">
      <ModernNavigation 
        activeView={activeView} 
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {renderView()}
      </main>

      <FloatingActions onAction={setQuickAction} />

      <QuickActionModal 
        action={quickAction}
        onClose={() => setQuickAction(null)}
        onSuccess={handleQuickActionSuccess}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
