const express = require('express');
const WeightEntry = require('../models/WeightEntry');
const auth = require('../middleware/auth');
const checkDatabaseConnection = require('../middleware/dbCheck');

const router = express.Router();

router.use(auth);
router.use(checkDatabaseConnection);

router.post('/', async (req, res) => {
  try {
    const { weight, date, notes } = req.body;

    if (!weight || typeof weight !== 'number') {
      return res.status(400).json({
        message: 'Valid weight is required'
      });
    }

    if (weight <= 0 || weight > 1000) {
      return res.status(400).json({
        message: 'Weight must be between 0 and 1000'
      });
    }

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    const existingEntry = await WeightEntry.findOne({
      user: req.user._id,
      date: entryDate
    });

    if (existingEntry) {
      existingEntry.weight = weight;
      existingEntry.notes = notes?.trim() || '';
      await existingEntry.save();

      return res.json({
        message: 'Weight entry updated successfully',
        weightEntry: existingEntry
      });
    }

    const weightEntry = new WeightEntry({
      user: req.user._id,
      weight,
      date: entryDate,
      notes: notes?.trim() || ''
    });

    await weightEntry.save();

    res.status(201).json({
      message: 'Weight entry created successfully',
      weightEntry
    });
  } catch (error) {
    console.error('Create weight entry error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error while creating weight entry'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const weightEntries = await WeightEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalEntries = await WeightEntry.countDocuments(query);

    res.json({
      weightEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        hasNext: parseInt(page) < Math.ceil(totalEntries / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get weight entries error:', error);
    res.status(500).json({
      message: 'Server error while fetching weight entries'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalEntries = await WeightEntry.countDocuments({ user: req.user._id });
    
    if (totalEntries === 0) {
      return res.json({
        totalEntries: 0,
        currentWeight: null,
        previousWeight: null,
        weightChange: null,
        highestWeight: null,
        lowestWeight: null,
        totalChange: null,
        recentEntries: []
      });
    }

    const recentEntries = await WeightEntry.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    const allEntries = await WeightEntry.find({ user: req.user._id })
      .sort({ date: 1 });

    const currentWeight = recentEntries[0]?.weight || null;
    const previousWeight = recentEntries[1]?.weight || null;
    const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null;
    
    const weights = allEntries.map(entry => entry.weight);
    const highestWeight = Math.max(...weights);
    const lowestWeight = Math.min(...weights);
    const totalChange = allEntries.length > 1 ? currentWeight - allEntries[0].weight : null;

    res.json({
      totalEntries,
      currentWeight,
      previousWeight,
      weightChange,
      highestWeight,
      lowestWeight,
      totalChange,
      recentEntries
    });
  } catch (error) {
    console.error('Get weight stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching weight statistics'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const weightEntry = await WeightEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!weightEntry) {
      return res.status(404).json({
        message: 'Weight entry not found'
      });
    }

    res.json({ weightEntry });
  } catch (error) {
    console.error('Get weight entry error:', error);
    res.status(500).json({
      message: 'Server error while fetching weight entry'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { weight, date, notes } = req.body;

    const weightEntry = await WeightEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!weightEntry) {
      return res.status(404).json({
        message: 'Weight entry not found'
      });
    }

    if (weight !== undefined) {
      if (typeof weight !== 'number' || weight <= 0 || weight > 1000) {
        return res.status(400).json({
          message: 'Weight must be a number between 0 and 1000'
        });
      }
      weightEntry.weight = weight;
    }

    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      weightEntry.date = newDate;
    }

    if (notes !== undefined) {
      weightEntry.notes = notes.trim();
    }

    await weightEntry.save();

    res.json({
      message: 'Weight entry updated successfully',
      weightEntry
    });
  } catch (error) {
    console.error('Update weight entry error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error while updating weight entry'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const weightEntry = await WeightEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!weightEntry) {
      return res.status(404).json({
        message: 'Weight entry not found'
      });
    }

    res.json({
      message: 'Weight entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete weight entry error:', error);
    res.status(500).json({
      message: 'Server error while deleting weight entry'
    });
  }
});

module.exports = router;