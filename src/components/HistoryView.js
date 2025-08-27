import React, { useState, useEffect } from 'react';
import { workoutAPI, weightAPI } from '../services/api';

const HistoryView = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('date'); // date, type
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      const [workoutsResponse, weightResponse] = await Promise.all([
        workoutAPI.getAll({ limit: 50 }).catch(() => ({ data: { workouts: [] } })),
        weightAPI.getAll({ limit: 50 }).catch(() => ({ data: { weightEntries: [] } }))
      ]);

      const workouts = (workoutsResponse.data.workouts || []).map(w => ({
        ...w,
        type: 'workout',
        title: `${w.exercises?.length || 0} exercise${(w.exercises?.length || 0) !== 1 ? 's' : ''}`,
        subtitle: w.exercises?.slice(0, 2).map(e => e.name).join(', ') || 'No exercises',
        value: getTotalVolume(w)
      }));

      const weights = (weightResponse.data.weightEntries || []).map(w => ({
        ...w,
        type: 'weight',
        title: `${w.weight} lbs`,
        subtitle: 'Weight entry',
        value: w.weight
      }));

      const combined = [...workouts, ...weights]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setActivities(combined);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalVolume = (workout) => {
    if (!workout.exercises || !Array.isArray(workout.exercises)) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!exercise.sets || !Array.isArray(exercise.sets)) return total;
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (parseFloat(set.weight || 0) * parseInt(set.reps || 0));
      }, 0);
    }, 0);
  };

  const getFilteredActivities = () => {
    let filtered = [...activities];

    // Type filter
    if (filter !== 'all') {
      if (filter === 'workouts') filtered = filtered.filter(a => a.type === 'workout');
      if (filter === 'weight') filtered = filtered.filter(a => a.type === 'weight');
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          displayDate: formatGroupDate(date),
          activities: []
        };
      }
      
      groups[dateKey].activities.push(activity);
    });

    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const groupActivitiesByType = (activities) => {
    const workoutGroup = {
      type: 'workout',
      title: 'Workouts',
      activities: activities.filter(a => a.type === 'workout')
    };
    
    const weightGroup = {
      type: 'weight',
      title: 'Weight Tracking',
      activities: activities.filter(a => a.type === 'weight')
    };

    return [workoutGroup, weightGroup].filter(group => group.activities.length > 0);
  };

  const formatGroupDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    const diffTime = today - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en', { 
      month: 'long', 
      day: 'numeric', 
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getActivityStats = () => {
    const total = activities.length;
    const workouts = activities.filter(a => a.type === 'workout').length;
    const weights = activities.filter(a => a.type === 'weight').length;
    
    const thisWeek = activities.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.date) >= weekAgo;
    }).length;

    return { total, workouts, weights, thisWeek };
  };

  const filteredActivities = getFilteredActivities();
  const groupedData = groupBy === 'date' 
    ? groupActivitiesByDate(filteredActivities)
    : groupActivitiesByType(filteredActivities);
  const stats = getActivityStats();

  if (loading) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>History</h1>
          <p>Loading your activity timeline...</p>
        </div>
        <div className="history-loading">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="loading-history-item"></div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>History</h1>
          <p>Your complete fitness activity timeline</p>
        </div>
        <div className="empty-history">
          <div className="empty-timeline-illustration">
            <div className="timeline-line"></div>
            <div className="timeline-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
          <h3>No activity history yet</h3>
          <p>Start logging workouts and weight entries to see your progress timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="header-content">
          <div className="header-text">
            <h1>History</h1>
            <p>Your complete fitness activity timeline</p>
          </div>
          <div className="history-stats">
            <div className="stat-pill">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Activities</span>
            </div>
            <div className="stat-pill">
              <span className="stat-number">{stats.thisWeek}</span>
              <span className="stat-label">This Week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="view-content">
        {/* Controls */}
        <div className="history-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-section">
            <div className="filter-tabs">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'workouts', label: 'Workouts', count: stats.workouts },
                { key: 'weight', label: 'Weight', count: stats.weights }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                  onClick={() => setFilter(tab.key)}
                >
                  <span className="tab-label">{tab.label}</span>
                  <span className="tab-count">{tab.count}</span>
                </button>
              ))}
            </div>
            
            <div className="view-options">
              <button
                className={`view-option ${groupBy === 'date' ? 'active' : ''}`}
                onClick={() => setGroupBy('date')}
                title="Group by date"
              >
                ◳
              </button>
              <button
                className={`view-option ${groupBy === 'type' ? 'active' : ''}`}
                onClick={() => setGroupBy('type')}
                title="Group by type"
              >
                ≡
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredActivities.length !== activities.length && (
          <div className="results-info">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        )}

        {/* Timeline */}
        {filteredActivities.length === 0 ? (
          <div className="no-results">
            <h3>No activities found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="modern-timeline">
            {groupedData.map((group, groupIndex) => (
              <div key={group.date || group.type} className="timeline-group">
                <div className="group-header">
                  <h3 className="group-title">
                    {group.displayDate || group.title}
                  </h3>
                  <span className="group-count">
                    {group.activities.length} activit{group.activities.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
                
                <div className="activities-list">
                  {group.activities.map((activity, index) => (
                    <div key={`${activity.type}-${activity._id || activity.id}`} className="activity-card">
                      <div className="activity-indicator">
                        <div className={`activity-dot ${activity.type}`}></div>
                        {groupBy === 'date' && (
                          <div className="activity-time">
                            {formatActivityTime(activity.date)}
                          </div>
                        )}
                      </div>
                      
                      <div className="activity-content">
                        <div className="activity-main">
                          <div className="activity-header">
                            <h4 className="activity-title">{activity.title}</h4>
                            <div className="activity-meta">
                              <span className={`activity-type ${activity.type}`}>
                                {activity.type === 'workout' ? 'Workout' : 'Weight'}
                              </span>
                              {groupBy === 'type' && (
                                <span className="activity-date">
                                  {new Date(activity.date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="activity-subtitle">
                            {activity.subtitle}
                          </div>
                          
                          {activity.type === 'workout' && (
                            <div className="activity-stats">
                              <span className="stat-item">
                                {activity.value.toLocaleString()} lbs total
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {activity.notes && (
                          <div className="activity-notes">
                            {activity.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;