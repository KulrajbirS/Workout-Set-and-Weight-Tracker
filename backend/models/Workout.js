const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: [true, 'Reps are required'],
    min: [1, 'Reps must be at least 1']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  }
});

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
    minlength: [1, 'Exercise name is required'],
    maxlength: [100, 'Exercise name cannot exceed 100 characters']
  },
  sets: {
    type: [setSchema],
    required: [true, 'At least one set is required'],
    validate: {
      validator: function(sets) {
        return sets && sets.length > 0;
      },
      message: 'At least one set is required'
    }
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  exercises: {
    type: [exerciseSchema],
    required: [true, 'At least one exercise is required'],
    validate: {
      validator: function(exercises) {
        return exercises && exercises.length > 0;
      },
      message: 'At least one exercise is required'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

workoutSchema.index({ user: 1, date: -1 });

workoutSchema.virtual('totalVolume').get(function() {
  return this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exerciseTotal, set) => {
      return exerciseTotal + (set.weight * set.reps);
    }, 0);
  }, 0);
});

workoutSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Workout', workoutSchema);