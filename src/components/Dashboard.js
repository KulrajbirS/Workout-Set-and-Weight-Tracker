import React, { useState, useEffect } from 'react';
import { workoutAPI, weightAPI } from '../services/api';

const Dashboard = ({ setActiveTab }) => {
  const [workouts, setWorkouts] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [workoutsResponse, weightResponse] = await Promise.all([
        workoutAPI.getAll({ limit: 5 }).catch(() => ({ data: { workouts: [] } })),
        weightAPI.getAll({ limit: 5 }).catch(() => ({ data: { weightEntries: [] } }))
      ]);

      setWorkouts(workoutsResponse.data.workouts || []);
      setWeightEntries(weightResponse.data.weightEntries || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRecentWorkouts = () => {
    if (!workouts || !Array.isArray(workouts)) return [];
    return workouts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const getRecentWeightEntries = () => {
    if (!weightEntries || !Array.isArray(weightEntries)) return [];
    return weightEntries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const getTotalWorkouts = () => (workouts && Array.isArray(workouts)) ? workouts.length : 0;

  const getWeightProgress = () => {
    if (!weightEntries || !Array.isArray(weightEntries) || weightEntries.length < 2) return null;
    const sorted = [...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const current = sorted[0].weight;
    const previous = sorted[1].weight;
    return current - previous;
  };

  const getCurrentWeight = () => {
    if (!weightEntries || !Array.isArray(weightEntries) || weightEntries.length === 0) return null;
    const sorted = [...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].weight;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <div className="error-message">
          {error}
          <button onClick={fetchDashboardData} className="btn-primary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const recentWorkouts = getRecentWorkouts();
  const recentWeightEntries = getRecentWeightEntries();
  const totalWorkouts = getTotalWorkouts();
  const weightProgress = getWeightProgress();
  const currentWeight = getCurrentWeight();

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Workouts</h3>
          <div className="stat-value">{totalWorkouts}</div>
        </div>
        
        <div className="stat-card">
          <h3>Current Weight</h3>
          <div className="stat-value">
            {currentWeight ? `${currentWeight} lbs` : 'Not tracked'}
          </div>
          {weightProgress !== null && (
            <div className={`stat-change ${weightProgress >= 0 ? 'positive' : 'negative'}`}>
              {weightProgress >= 0 ? '+' : ''}{weightProgress.toFixed(1)} lbs
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Workouts</h3>
            <button 
              className="btn-link" 
              onClick={() => setActiveTab('workout-history')}
            >
              View All
            </button>
          </div>
          
          {recentWorkouts.length === 0 ? (
            <div className="empty-state">
              <p>No workouts logged yet.</p>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('workout-form')}
              >
                Log Your First Workout
              </button>
            </div>
          ) : (
            <div className="recent-items">
              {recentWorkouts.map(workout => (
                <div key={workout._id || workout.id} className="recent-item">
                  <div className="item-date">{formatDate(workout.date)}</div>
                  <div className="item-details">
                    {workout.exercises?.length || 0} exercise{(workout.exercises?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Weight Entries</h3>
            <button 
              className="btn-link" 
              onClick={() => setActiveTab('weight-history')}
            >
              View All
            </button>
          </div>
          
          {recentWeightEntries.length === 0 ? (
            <div className="empty-state">
              <p>No weight entries yet.</p>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('weight-tracker')}
              >
                Track Your Weight
              </button>
            </div>
          ) : (
            <div className="recent-items">
              {recentWeightEntries.map(entry => (
                <div key={entry._id || entry.id} className="recent-item">
                  <div className="item-date">{formatDate(entry.date)}</div>
                  <div className="item-details">{entry.weight} lbs</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;