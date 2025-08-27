const mongoose = require('mongoose');

const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection unavailable. Please try again in a moment.',
      status: 'disconnected'
    });
  }
  next();
};

module.exports = checkDatabaseConnection;