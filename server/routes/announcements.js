const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('clubAdmin', 'superAdmin'), createAnnouncement);
router.put('/:id', protect, authorize('clubAdmin', 'superAdmin'), updateAnnouncement);
router.delete('/:id', protect, authorize('clubAdmin', 'superAdmin'), deleteAnnouncement);

module.exports = router;
