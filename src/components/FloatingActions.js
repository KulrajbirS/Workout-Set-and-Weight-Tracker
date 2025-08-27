import React, { useState } from 'react';

const FloatingActions = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'workout-form',
      label: 'Log Workout',
      icon: '◇',
      color: 'primary'
    },
    {
      id: 'weight-form',
      label: 'Track Weight',
      icon: '○',
      color: 'secondary'
    }
  ];

  const handleAction = (actionId) => {
    onAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className="floating-actions">
      {/* Action buttons */}
      <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            className={`fab-item ${action.color}`}
            onClick={() => handleAction(action.id)}
            style={{
              transitionDelay: `${index * 50}ms`
            }}
          >
            <span className="fab-icon">{action.icon}</span>
            <span className="fab-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        className={`fab-main ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick actions"
      >
        <span className="fab-icon">
          {isOpen ? '×' : '+'}
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fab-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActions;