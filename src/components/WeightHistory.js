import React, { useState, useEffect } from 'react';
import { weightAPI } from '../services/api';

const WeightHistory = () => {
  const [weightEntries, setWeightEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeightEntries();
  }, []);

  const fetchWeightEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await weightAPI.getAll({ limit: 100 });
      setWeightEntries(response.data.weightEntries || []);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
      setError('Failed to load weight history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }

    try {
      await weightAPI.delete(entryId);
      setWeightEntries(prev => prev.filter(entry => entry._id !== entryId));
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      setError('Failed to delete weight entry');
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getWeightChange = (currentWeight, previousWeight) => {
    if (!previousWeight) return null;
    const change = currentWeight - previousWeight;
    return change;
  };

  if (loading) {
    return (
      <div className="weight-history">
        <h2>Weight History</h2>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading weight history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weight-history">
        <h2>Weight History</h2>
        <div className="error-message">
          {error}
          <button onClick={fetchWeightEntries} className="btn-primary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sortedEntries = weightEntries && Array.isArray(weightEntries) ? 
    [...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

  if (sortedEntries.length === 0) {
    return (
      <div className="weight-history">
        <h2>Weight History</h2>
        <p>No weight entries yet. Start tracking your weight!</p>
      </div>
    );
  }

  const currentWeight = sortedEntries[0]?.weight;
  const previousWeight = sortedEntries[1]?.weight;
  const recentChange = getWeightChange(currentWeight, previousWeight);

  return (
    <div className="weight-history">
      <h2>Weight History</h2>
      
      <div className="weight-summary">
        <div className="current-weight">
          <h3>Current Weight: {currentWeight} lbs</h3>
          {recentChange !== null && (
            <p className={`weight-change ${recentChange >= 0 ? 'positive' : 'negative'}`}>
              {recentChange >= 0 ? '+' : ''}{recentChange.toFixed(1)} lbs from last entry
            </p>
          )}
        </div>
      </div>

      <div className="weight-entries">
        {sortedEntries.map((entry, index) => {
          const previousEntry = sortedEntries[index + 1];
          const change = previousEntry ? getWeightChange(entry.weight, previousEntry.weight) : null;
          
          return (
            <div key={entry._id || entry.id} className="weight-entry">
              <div className="entry-header">
                <div className="entry-info">
                  <h4>{formatDate(entry.date)}</h4>
                  <span className="weight-value">{entry.weight} lbs</span>
                  {change !== null && (
                    <span className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
                      ({change >= 0 ? '+' : ''}{change.toFixed(1)})
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => handleDeleteEntry(entry._id || entry.id)} 
                  className="btn-remove"
                >
                  Delete
                </button>
              </div>
              
              {entry.notes && (
                <div className="entry-notes">
                  <p>{entry.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedEntries.length > 1 && (
        <div className="weight-stats">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Highest:</span>
              <span className="stat-value">
                {Math.max(...sortedEntries.map(entry => entry.weight))} lbs
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lowest:</span>
              <span className="stat-value">
                {Math.min(...sortedEntries.map(entry => entry.weight))} lbs
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Change:</span>
              <span className={`stat-value ${(currentWeight - sortedEntries[sortedEntries.length - 1].weight) >= 0 ? 'positive' : 'negative'}`}>
                {(currentWeight - sortedEntries[sortedEntries.length - 1].weight >= 0 ? '+' : '')}
                {(currentWeight - sortedEntries[sortedEntries.length - 1].weight).toFixed(1)} lbs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightHistory;