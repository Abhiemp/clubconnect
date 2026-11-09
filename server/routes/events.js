const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getClubEvents
} = require('../controllers/eventController');
const {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
  getRegistrationStatus
} = require('../controllers/registrationController');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('clubAdmin', 'superAdmin'), createEvent);
router.put('/:id', protect, authorize('clubAdmin', 'superAdmin'), updateEvent);
router.delete('/:id', protect, authorize('clubAdmin', 'superAdmin'), deleteEvent);
router.get('/club/:clubId', protect, getClubEvents);

// Registration routes on events
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);
router.get('/:id/registrations', protect, authorize('clubAdmin', 'superAdmin'), getEventRegistrations);
router.get('/:id/registration-status', protect, getRegistrationStatus);

module.exports = router;
