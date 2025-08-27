const mongoose = require('mongoose');

const weightEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight must be a positive number'],
    max: [1000, 'Weight seems unrealistic']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
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

weightEntrySchema.index({ user: 1, date: -1 });

weightEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WeightEntry', weightEntrySchema);