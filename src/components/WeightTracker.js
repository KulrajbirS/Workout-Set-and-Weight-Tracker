import React, { useState } from 'react';
import { weightAPI } from '../services/api';

const WeightTracker = () => {
  const [weightEntry, setWeightEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!weightEntry.weight || !weightEntry.date) {
      setError('Please enter both weight and date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await weightAPI.create({
        weight: parseFloat(weightEntry.weight),
        date: weightEntry.date,
        notes: weightEntry.notes
      });

      setSuccess(true);
      setWeightEntry({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        notes: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving weight entry:', error);
      setError(error.response?.data?.message || 'Failed to save weight entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weight-tracker">
      <h2>Track Weight</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Weight entry saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="weight-form">
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={weightEntry.date}
            onChange={(e) => setWeightEntry(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label>Weight (lbs):</label>
          <input
            type="number"
            step="0.1"
            value={weightEntry.weight}
            onChange={(e) => setWeightEntry(prev => ({ ...prev, weight: e.target.value }))}
            placeholder="Enter your weight"
            required
          />
        </div>

        <div className="form-group">
          <label>Notes (optional):</label>
          <textarea
            value={weightEntry.notes}
            onChange={(e) => setWeightEntry(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any notes about your weight..."
            rows="3"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Add Weight Entry'}
        </button>
      </form>
    </div>
  );
};

export default WeightTracker;