const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecommendedEvents } = require('../controllers/recommendationController');

router.get('/events', protect, getRecommendedEvents);

module.exports = router;
