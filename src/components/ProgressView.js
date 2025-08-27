import React, { useState, useEffect } from 'react';
import { weightAPI } from '../services/api';

const ProgressView = () => {
  const [weightEntries, setWeightEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('3m'); // 1m, 3m, 6m, all

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
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await weightAPI.delete(entryId);
      setWeightEntries(prev => prev.filter(entry => entry._id !== entryId));
    } catch (error) {
      console.error('Error deleting weight entry:', error);
    }
  };

  const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const getFilteredEntries = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      default:
        return sortedEntries;
    }
    
    return sortedEntries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const filteredEntries = getFilteredEntries();
  const currentWeight = sortedEntries[sortedEntries.length - 1]?.weight;
  const startWeight = filteredEntries[0]?.weight;
  const totalChange = currentWeight && startWeight ? currentWeight - startWeight : 0;

  const getInsights = () => {
    if (filteredEntries.length < 2) return [];
    
    const recentEntries = filteredEntries.slice(-4);
    const trend = recentEntries[recentEntries.length - 1].weight - recentEntries[0].weight;
    const avgChange = filteredEntries.length > 1 ? totalChange / filteredEntries.length : 0;
    
    return [
      {
        label: 'Trend',
        value: trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable',
        change: trend,
        type: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
      },
      {
        label: 'Average Change',
        value: `${Math.abs(avgChange).toFixed(1)} lbs`,
        change: avgChange,
        type: avgChange > 0 ? 'up' : avgChange < 0 ? 'down' : 'stable'
      }
    ];
  };

  if (loading) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Progress</h1>
          <p>Loading your fitness journey...</p>
        </div>
        <div className="progress-loading">
          <div className="loading-chart"></div>
          <div className="loading-stats"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Progress</h1>
          <p>Unable to load your progress data</p>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchWeightEntries} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Progress</h1>
          <p>Track your weight and monitor your fitness journey</p>
        </div>
        <div className="empty-progress">
          <div className="empty-illustration">
            <div className="empty-chart"></div>
          </div>
          <h3>Start tracking your progress</h3>
          <p>Add your first weight entry to see insights and trends</p>
        </div>
      </div>
    );
  }

  const insights = getInsights();

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Progress</h1>
            <p>Your weight tracking insights and trends</p>
          </div>
          <div className="header-stats">
            <div className="current-weight-display">
              <span className="weight-number">{currentWeight}</span>
              <span className="weight-unit">lbs</span>
            </div>
            {totalChange !== 0 && (
              <div className={`total-change ${totalChange > 0 ? 'positive' : 'negative'}`}>
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} lbs
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="view-content">
        {/* Time Period Selector */}
        <div className="period-selector">
          {[
            { key: '1m', label: '1 Month' },
            { key: '3m', label: '3 Months' },
            { key: '6m', label: '6 Months' },
            { key: 'all', label: 'All Time' }
          ].map(period => (
            <button
              key={period.key}
              className={`period-btn ${selectedPeriod === period.key ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period.key)}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="insights-section">
            <h3>Key Insights</h3>
            <div className="insights-grid">
              {insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-header">
                    <span className="insight-label">{insight.label}</span>
                    <span className={`insight-indicator ${insight.type}`}>
                      {insight.type === 'up' && '↗'}
                      {insight.type === 'down' && '↘'}
                      {insight.type === 'stable' && '→'}
                    </span>
                  </div>
                  <div className="insight-value">{insight.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weight Chart */}
        <div className="progress-chart-section">
          <h3>Weight Trend</h3>
          <div className="weight-chart">
            <div className="chart-container">
              <div className="chart-grid">
                {filteredEntries.map((entry, index) => {
                  const maxWeight = Math.max(...filteredEntries.map(e => e.weight));
                  const minWeight = Math.min(...filteredEntries.map(e => e.weight));
                  const range = maxWeight - minWeight || 10;
                  const height = ((entry.weight - minWeight) / range) * 100;
                  
                  return (
                    <div key={entry._id} className="chart-point" style={{ left: `${(index / (filteredEntries.length - 1)) * 100}%` }}>
                      <div 
                        className="point" 
                        style={{ bottom: `${height}%` }}
                        data-weight={entry.weight}
                        data-date={new Date(entry.date).toLocaleDateString()}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Weight History */}
        <div className="weight-history-section">
          <div className="section-header">
            <h3>Weight History</h3>
            <span className="entry-count">{sortedEntries.length} entries</span>
          </div>
          
          <div className="weight-entries-modern">
            {sortedEntries.slice().reverse().slice(0, 10).map((entry, index) => {
              const previousEntry = sortedEntries.slice().reverse()[index + 1];
              const change = previousEntry ? entry.weight - previousEntry.weight : 0;
              
              return (
                <div key={entry._id} className="weight-entry-modern">
                  <div className="entry-main">
                    <div className="entry-date">
                      {new Date(entry.date).toLocaleDateString('en', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="entry-weight">
                      <span className="weight-value">{entry.weight}</span>
                      <span className="weight-unit">lbs</span>
                    </div>
                    {change !== 0 && (
                      <div className={`entry-change ${change > 0 ? 'positive' : 'negative'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  {entry.notes && (
                    <div className="entry-notes">{entry.notes}</div>
                  )}
                  
                  <div className="entry-actions">
                    <button 
                      onClick={() => handleDeleteEntry(entry._id)}
                      className="delete-btn"
                      aria-label="Delete entry"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;