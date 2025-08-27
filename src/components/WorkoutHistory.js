import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await workoutAPI.getAll({ limit: 50 });
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to load workout history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutAPI.delete(workoutId);
      setWorkouts(prev => prev.filter(workout => workout._id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
      setError('Failed to delete workout');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  if (loading) {
    return (
      <div className="workout-history">
        <h2>Workout History</h2>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading workout history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-history">
        <h2>Workout History</h2>
        <div className="error-message">
          {error}
          <button onClick={fetchWorkouts} className="btn-primary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="workout-history">
        <h2>Workout History</h2>
        <p>No workouts logged yet. Start by adding your first workout!</p>
      </div>
    );
  }

  return (
    <div className="workout-history">
      <h2>Workout History</h2>
      <div className="workouts-list">
        {workouts.map(workout => (
          <div key={workout._id || workout.id} className="workout-card">
            <div className="workout-header">
              <h3>{formatDate(workout.date)}</h3>
              <div className="workout-stats">
                <span>Total Volume: {getTotalVolume(workout).toLocaleString()} lbs</span>
                <button 
                  onClick={() => handleDeleteWorkout(workout._id || workout.id)} 
                  className="btn-remove"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="exercises-list">
              {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.map((exercise, exerciseIndex) => (
                <div key={exercise._id || exercise.id || exerciseIndex} className="exercise-item">
                  <h4>{exercise.name}</h4>
                  <div className="sets-grid">
                    {exercise.sets && Array.isArray(exercise.sets) && exercise.sets.map((set, index) => (
                      <div key={set._id || set.id || index} className="set-display">
                        <span className="set-number">Set {index + 1}:</span>
                        <span className="set-details">{set.reps} reps @ {set.weight} lbs</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutHistory;