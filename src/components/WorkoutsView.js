import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';

const WorkoutsView = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, volume, exercises
  const [filterBy, setFilterBy] = useState('all'); // all, thisWeek, thisMonth
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workoutAPI.getAll({ limit: 100 });
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    try {
      await workoutAPI.delete(workoutId);
      setWorkouts(prev => prev.filter(workout => workout._id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
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

  const getWorkoutDuration = (workout) => {
    // Mock duration for now - could be added to workout data
    return Math.floor(Math.random() * 60) + 30; // 30-90 minutes
  };

  const getFilteredWorkouts = () => {
    let filtered = [...workouts];

    // Filter by time period
    if (filterBy !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      if (filterBy === 'thisWeek') {
        cutoff.setDate(now.getDate() - 7);
      } else if (filterBy === 'thisMonth') {
        cutoff.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(workout => new Date(workout.date) >= cutoff);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(workout => 
        workout.exercises?.some(exercise => 
          exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return getTotalVolume(b) - getTotalVolume(a);
        case 'exercises':
          return (b.exercises?.length || 0) - (a.exercises?.length || 0);
        default: // date
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  };

  const getWorkoutStats = () => {
    if (workouts.length === 0) return {};
    
    const totalVolume = workouts.reduce((sum, workout) => sum + getTotalVolume(workout), 0);
    const avgVolume = totalVolume / workouts.length;
    
    const thisWeek = workouts.filter(w => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(w.date) >= weekAgo;
    });

    return {
      totalWorkouts: workouts.length,
      thisWeek: thisWeek.length,
      avgVolume: avgVolume,
      totalVolume: totalVolume
    };
  };

  const filteredWorkouts = getFilteredWorkouts();
  const stats = getWorkoutStats();

  if (loading) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Workouts</h1>
          <p>Loading your exercise sessions...</p>
        </div>
        <div className="workouts-loading">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="loading-workout-card"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Workouts</h1>
          <p>Unable to load your workouts</p>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchWorkouts} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Workouts</h1>
          <p>Track and review your exercise sessions</p>
        </div>
        <div className="empty-workouts">
          <div className="empty-illustration">
            <div className="empty-barbell"></div>
          </div>
          <h3>No workouts yet</h3>
          <p>Start your fitness journey by logging your first workout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Workouts</h1>
            <p>Your exercise sessions and training progress</p>
          </div>
          <div className="workout-stats-header">
            <div className="stat-item">
              <span className="stat-number">{stats.totalWorkouts}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.thisWeek}</span>
              <span className="stat-label">This Week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="view-content">
        {/* Controls */}
        <div className="workout-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Latest First</option>
              <option value="volume">Highest Volume</option>
              <option value="exercises">Most Exercises</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {filteredWorkouts.length !== workouts.length && (
          <div className="results-info">
            Showing {filteredWorkouts.length} of {workouts.length} workouts
          </div>
        )}

        {/* Workout List */}
        <div className="workouts-grid">
          {filteredWorkouts.map(workout => (
            <div key={workout._id} className="workout-card-modern">
              <div className="workout-card-header">
                <div className="workout-date">
                  {new Date(workout.date).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="workout-actions">
                  <button 
                    onClick={() => handleDeleteWorkout(workout._id)}
                    className="delete-btn"
                    aria-label="Delete workout"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="workout-summary">
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-value">{workout.exercises?.length || 0}</span>
                    <span className="stat-unit">exercises</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{getTotalVolume(workout).toLocaleString()}</span>
                    <span className="stat-unit">lbs total</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{getWorkoutDuration(workout)}</span>
                    <span className="stat-unit">mins</span>
                  </div>
                </div>
              </div>

              <div className="exercises-preview">
                {workout.exercises && workout.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={exercise._id || index} className="exercise-preview">
                    <div className="exercise-name">{exercise.name}</div>
                    <div className="exercise-sets">
                      {exercise.sets?.length || 0} set{(exercise.sets?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
                {workout.exercises && workout.exercises.length > 3 && (
                  <div className="more-exercises">
                    +{workout.exercises.length - 3} more
                  </div>
                )}
              </div>

              {workout.notes && (
                <div className="workout-notes">{workout.notes}</div>
              )}
            </div>
          ))}
        </div>

        {filteredWorkouts.length === 0 && (
          <div className="no-results">
            <h3>No workouts found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutsView;