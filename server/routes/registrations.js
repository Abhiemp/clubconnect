const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { markAttendance, getMyRegistrations } = require('../controllers/registrationController');

router.get('/my-events', protect, getMyRegistrations);
router.put('/:id/attendance', protect, markAttendance);

module.exports = router;
