const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updateInterests,
  toggleSaveEvent,
  getSavedEvents
} = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/interests', protect, updateInterests);
router.put('/saved-events/:eventId', protect, toggleSaveEvent);
router.get('/saved-events', protect, getSavedEvents);

module.exports = router;
