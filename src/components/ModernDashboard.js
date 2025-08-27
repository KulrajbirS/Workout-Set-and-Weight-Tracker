import React, { useState, useEffect } from 'react';
import { workoutAPI, weightAPI } from '../services/api';

const ModernDashboard = ({ setActiveView, setQuickAction }) => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentWeight: null,
    weightChange: null,
    weeklyWorkouts: 0,
    recentActivity: [],
    allWorkouts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [workoutsResponse, weightResponse] = await Promise.all([
        workoutAPI.getAll({ limit: 30 }).catch(() => ({ data: { workouts: [] } })), // Get more workouts for charts
        weightAPI.getAll({ limit: 10 }).catch(() => ({ data: { weightEntries: [] } }))
      ]);

      const workouts = workoutsResponse.data.workouts || [];
      const weights = weightResponse.data.weightEntries || [];

      // Calculate stats
      const sortedWeights = weights.sort((a, b) => new Date(b.date) - new Date(a.date));
      const currentWeight = sortedWeights[0]?.weight || null;
      const previousWeight = sortedWeights[1]?.weight || null;
      const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null;

      // Weekly workouts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;

      setStats({
        totalWorkouts: workouts.length,
        currentWeight,
        weightChange,
        weeklyWorkouts,
        recentActivity: workouts.slice(0, 3),
        allWorkouts: workouts // Add all workouts for chart calculations
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const actionCards = [
    {
      id: 'log-workout',
      title: 'Log Workout',
      subtitle: 'Track your exercises',
      icon: '◇',
      color: 'primary',
      action: () => setQuickAction('workout-form')
    },
    {
      id: 'track-weight',
      title: 'Track Weight',
      subtitle: 'Record your progress',
      icon: '○',
      color: 'secondary',
      action: () => setQuickAction('weight-form')
    },
    {
      id: 'view-progress',
      title: 'View Progress',
      subtitle: 'See your journey',
      icon: '△',
      color: 'success',
      action: () => setActiveView('progress')
    },
    {
      id: 'workout-history',
      title: 'Workout History',
      subtitle: 'Past sessions',
      icon: '◻',
      color: 'warm',
      action: () => setActiveView('history')
    }
  ];

  const StatCard = ({ title, value, subtitle, icon, trend }) => (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && (
        <div className={`stat-subtitle ${trend || ''}`}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const ActionCard = ({ card }) => (
    <button 
      className={`action-card ${card.color}`}
      onClick={card.action}
    >
      <div className="action-card-icon">{card.icon}</div>
      <div className="action-card-content">
        <h3 className="action-card-title">{card.title}</h3>
        <p className="action-card-subtitle">{card.subtitle}</p>
      </div>
      <div className="action-card-arrow">→</div>
    </button>
  );

  if (loading) {
    return (
      <div className="modern-dashboard">
        <div className="dashboard-header">
          <h1>Welcome Back!</h1>
          <p>Loading your fitness journey...</p>
        </div>
        <div className="loading-stats">
          <div className="loading-card"></div>
          <div className="loading-card"></div>
          <div className="loading-card"></div>
          <div className="loading-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back</h1>
        <p>Ready to achieve your fitness goals today?</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Workouts"
          value={stats.totalWorkouts}
          icon="◇"
        />
        <StatCard
          title="This Week"
          value={stats.weeklyWorkouts}
          subtitle="workouts completed"
          icon="◻"
        />
        <StatCard
          title="Current Weight"
          value={stats.currentWeight ? `${stats.currentWeight} lbs` : 'Not tracked'}
          subtitle={stats.weightChange ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} lbs` : ''}
          trend={stats.weightChange > 0 ? 'positive' : stats.weightChange < 0 ? 'negative' : ''}
          icon="○"
        />
        <StatCard
          title="Streak"
          value={stats.weeklyWorkouts > 0 ? stats.weeklyWorkouts : 0}
          subtitle="Keep it going!"
          icon="△"
        />
      </div>

      {/* Data Visualizations */}
      <div className="section">
        <h2>Your Progress</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Weekly Activity</h3>
            <div className="bar-chart">
              {Array.from({ length: 7 }, (_, i) => {
                const day = new Date();
                day.setDate(day.getDate() - (6 - i));
                const dayStart = new Date(day);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);
                
                const dayWorkouts = stats.allWorkouts?.filter(workout => {
                  const workoutDate = new Date(workout.date);
                  return workoutDate >= dayStart && workoutDate <= dayEnd;
                }).length || 0;
                
                const maxWorkouts = Math.max(3, Math.max(...Array.from({ length: 7 }, (_, j) => {
                  const checkDay = new Date();
                  checkDay.setDate(checkDay.getDate() - (6 - j));
                  const checkDayStart = new Date(checkDay);
                  checkDayStart.setHours(0, 0, 0, 0);
                  const checkDayEnd = new Date(checkDay);
                  checkDayEnd.setHours(23, 59, 59, 999);
                  return stats.allWorkouts?.filter(w => {
                    const wd = new Date(w.date);
                    return wd >= checkDayStart && wd <= checkDayEnd;
                  }).length || 0;
                })));
                
                return (
                  <div key={i} className="bar-item">
                    <div 
                      className="bar" 
                      style={{ height: `${maxWorkouts > 0 ? (dayWorkouts / maxWorkouts) * 100 : 0}%` }}
                    ></div>
                    <span className="bar-label">
                      {day.toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="chart-card">
            <h3>Weight Progress</h3>
            <div className="progress-chart">
              <div className="trend-line">
                {stats.weightChange !== null && (
                  <div className={`trend-indicator ${stats.weightChange >= 0 ? 'up' : 'down'}`}>
                    <span className="trend-arrow">{stats.weightChange >= 0 ? '↗' : '↘'}</span>
                    <span className="trend-value">
                      {Math.abs(stats.weightChange).toFixed(1)} lbs
                    </span>
                  </div>
                )}
              </div>
              <div className="current-weight">
                <span className="weight-value">
                  {stats.currentWeight || 'Not tracked'}
                </span>
                <span className="weight-label">Current Weight</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="section">
          <h2>Recent Activity</h2>
          <div className="recent-activity">
            {stats.recentActivity.map(workout => (
              <div key={workout._id} className="activity-item">
                <div className="activity-icon">◇</div>
                <div className="activity-content">
                  <div className="activity-title">
                    {workout.exercises?.length || 0} exercise{(workout.exercises?.length || 0) !== 1 ? 's' : ''}
                  </div>
                  <div className="activity-date">
                    {new Date(workout.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="activity-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDashboard;