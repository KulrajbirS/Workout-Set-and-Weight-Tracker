const express = require('express');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');
const checkDatabaseConnection = require('../middleware/dbCheck');

const router = express.Router();

router.use(auth);
router.use(checkDatabaseConnection);

router.post('/', async (req, res) => {
  try {
    const { date, exercises, notes } = req.body;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        message: 'At least one exercise is required'
      });
    }

    for (const exercise of exercises) {
      if (!exercise.name || !exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
        return res.status(400).json({
          message: 'Each exercise must have a name and at least one set'
        });
      }

      for (const set of exercise.sets) {
        if (typeof set.reps !== 'number' || typeof set.weight !== 'number' || set.reps < 1 || set.weight < 0) {
          return res.status(400).json({
            message: 'Each set must have valid reps (>= 1) and weight (>= 0)'
          });
        }
      }
    }

    const workout = new Workout({
      user: req.user._id,
      date: date || new Date(),
      exercises,
      notes: notes?.trim() || ''
    });

    await workout.save();

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error while creating workout'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalWorkouts = await Workout.countDocuments(query);

    res.json({
      workouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalWorkouts / parseInt(limit)),
        totalWorkouts,
        hasNext: parseInt(page) < Math.ceil(totalWorkouts / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      message: 'Server error while fetching workouts'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalWorkouts = await Workout.countDocuments({ user: req.user._id });
    
    const recentWorkouts = await Workout.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workoutsThisMonth = await Workout.countDocuments({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo }
    });

    let totalVolumeThisMonth = 0;
    const workoutsWithVolume = await Workout.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo }
    });

    workoutsWithVolume.forEach(workout => {
      totalVolumeThisMonth += workout.totalVolume;
    });

    res.json({
      totalWorkouts,
      workoutsThisMonth,
      totalVolumeThisMonth,
      recentWorkouts
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching workout statistics'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        message: 'Workout not found'
      });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      message: 'Server error while fetching workout'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { date, exercises, notes } = req.body;

    if (exercises && (!Array.isArray(exercises) || exercises.length === 0)) {
      return res.status(400).json({
        message: 'At least one exercise is required'
      });
    }

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        message: 'Workout not found'
      });
    }

    if (date) workout.date = date;
    if (exercises) workout.exercises = exercises;
    if (notes !== undefined) workout.notes = notes.trim();

    await workout.save();

    res.json({
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error while updating workout'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        message: 'Workout not found'
      });
    }

    res.json({
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      message: 'Server error while deleting workout'
    });
  }
});

module.exports = router;