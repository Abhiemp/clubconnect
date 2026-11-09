const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get public platform statistics
// @route   GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [totalClubs, totalEvents, totalStudents, totalRegistrations] = await Promise.all([
      Club.countDocuments({ status: 'active' }),
      Event.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Registration.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        totalClubs,
        totalEvents,
        totalStudents,
        totalRegistrations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

module.exports = router;
