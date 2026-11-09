const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  updateClubStatus,
  getAllRegistrations,
  getAllAnnouncements
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('superAdmin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/clubs/:id', updateClubStatus);
router.get('/registrations', getAllRegistrations);
router.get('/announcements', getAllAnnouncements);

module.exports = router;
