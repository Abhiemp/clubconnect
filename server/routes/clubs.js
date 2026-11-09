const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  getMembers,
  removeMember
} = require('../controllers/clubController');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', protect, authorize('superAdmin'), createClub);
router.put('/:id', protect, authorize('clubAdmin', 'superAdmin'), updateClub);
router.delete('/:id', protect, authorize('clubAdmin', 'superAdmin'), deleteClub);
router.post('/:id/join', protect, joinClub);
router.delete('/:id/join', protect, leaveClub);
router.get('/:id/members', protect, getMembers);
router.delete('/:id/members/:userId', protect, authorize('clubAdmin', 'superAdmin'), removeMember);

module.exports = router;
