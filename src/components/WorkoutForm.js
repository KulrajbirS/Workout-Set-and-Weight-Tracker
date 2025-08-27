import React, { useState } from 'react';
import { workoutAPI } from '../services/api';

const WorkoutForm = () => {
  const [workout, setWorkout] = useState({
    date: new Date().toISOString().split('T')[0],
    exercises: []
  });

  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: []
  });

  const [currentSet, setCurrentSet] = useState({
    reps: '',
    weight: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addSet = () => {
    const reps = parseInt(currentSet.reps);
    const weight = parseFloat(currentSet.weight);
    
    if (isNaN(reps) || reps < 1) {
      setError('Reps must be a number greater than 0');
      return;
    }
    
    if (isNaN(weight) || weight < 0) {
      setError('Weight must be a number 0 or greater');
      return;
    }
    
    setError(null); // Clear any previous errors
    setCurrentExercise(prev => ({
      ...prev,
      sets: [...prev.sets, { reps, weight, id: Date.now() }]
    }));
    setCurrentSet({ reps: '', weight: '' });
  };

  const removeSet = (setId) => {
    setCurrentExercise(prev => ({
      ...prev,
      sets: prev.sets.filter(set => set.id !== setId)
    }));
  };

  const addExercise = () => {
    if (!currentExercise.name.trim()) {
      setError('Exercise name is required');
      return;
    }
    
    if (currentExercise.sets.length === 0) {
      setError('At least one set is required for the exercise');
      return;
    }
    
    setError(null); // Clear any previous errors
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...currentExercise, id: Date.now() }]
    }));
    setCurrentExercise({ name: '', sets: [] });
  };

  const removeExercise = (exerciseId) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
  };

  const saveWorkout = async () => {
    if (workout.exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean and format the data for backend
      const cleanedExercises = workout.exercises.map(exercise => ({
        name: exercise.name.trim(),
        sets: exercise.sets.map(set => ({
          reps: parseInt(set.reps),
          weight: parseFloat(set.weight)
        }))
      }));

      // Debug logging
      console.log('Saving workout:', {
        date: workout.date,
        exercises: cleanedExercises
      });

      const response = await workoutAPI.create({
        date: workout.date,
        exercises: cleanedExercises
      });

      console.log('Workout saved successfully:', response.data);

      setSuccess(true);
      setWorkout({
        date: new Date().toISOString().split('T')[0],
        exercises: []
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving workout:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save workout';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workout-form">
      <h2>Log Workout</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Workout saved successfully!
        </div>
      )}
      
      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          value={workout.date}
          onChange={(e) => setWorkout(prev => ({ ...prev, date: e.target.value }))}
        />
      </div>

      <div className="exercise-form">
        <h3>Add Exercise</h3>
        <div className="form-group">
          <label>Exercise Name:</label>
          <input
            type="text"
            value={currentExercise.name}
            onChange={(e) => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Bench Press"
          />
        </div>

        <div className="set-form">
          <h4>Add Set</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Reps:</label>
              <input
                type="number"
                value={currentSet.reps}
                onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: e.target.value }))}
                placeholder="12"
              />
            </div>
            <div className="form-group">
              <label>Weight (lbs):</label>
              <input
                type="number"
                step="0.5"
                value={currentSet.weight}
                onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="135"
              />
            </div>
            <button type="button" onClick={addSet} className="btn-add">Add Set</button>
          </div>
        </div>

        {currentExercise.sets.length > 0 && (
          <div className="sets-list">
            <h4>Sets:</h4>
            {currentExercise.sets.map(set => (
              <div key={set.id} className="set-item">
                <span>{set.reps} reps @ {set.weight} lbs</span>
                <button onClick={() => removeSet(set.id)} className="btn-remove">Remove</button>
              </div>
            ))}
          </div>
        )}

        <button 
          type="button" 
          onClick={addExercise} 
          className="btn-primary"
          disabled={!currentExercise.name || currentExercise.sets.length === 0}
        >
          Add Exercise
        </button>
      </div>

      {workout.exercises.length > 0 && (
        <div className="workout-summary">
          <h3>Workout Summary</h3>
          {workout.exercises.map(exercise => (
            <div key={exercise.id} className="exercise-summary">
              <div className="exercise-header">
                <h4>{exercise.name}</h4>
                <button onClick={() => removeExercise(exercise.id)} className="btn-remove">Remove</button>
              </div>
              <div className="sets-summary">
                {exercise.sets.map(set => (
                  <span key={set.id} className="set-summary">
                    {set.reps}x{set.weight}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button 
            onClick={saveWorkout} 
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutForm;