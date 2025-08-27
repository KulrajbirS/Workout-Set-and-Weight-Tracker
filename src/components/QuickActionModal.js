import React from 'react';
import WorkoutForm from './WorkoutForm';
import WeightTracker from './WeightTracker';

const QuickActionModal = ({ action, onClose, onSuccess }) => {
  if (!action) return null;

  const handleSuccess = () => {
    onSuccess && onSuccess();
    onClose();
  };

  const modalConfig = {
    'workout-form': {
      title: 'Log Workout',
      icon: '◇',
      component: WorkoutForm
    },
    'weight-form': {
      title: 'Track Weight',
      icon: '○',
      component: WeightTracker
    }
  };

  const config = modalConfig[action];
  if (!config) return null;

  const Component = config.component;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">{config.icon}</span>
            <h2>{config.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <Component onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default QuickActionModal;