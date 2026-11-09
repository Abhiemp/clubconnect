const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Club = require('../models/Club');
const Notification = require('../models/Notification');

// @desc    Register for event
// @route   POST /api/events/:id/register
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club', 'name');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Check event status
    if (event.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'This event is no longer accepting registrations.' });
    }

    // Check registration deadline
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed.' });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'This event is full. No seats remaining.' });
    }

    // Check duplicate registration
    const existing = await Registration.findOne({
      student: req.user._id,
      event: event._id
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }

    // Create registration
    const registration = await Registration.create({
      student: req.user._id,
      event: event._id
    });

    // Update registered count
    await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: 'event_registration',
      title: 'Registration Confirmed! ✅',
      message: `You are registered for "${event.title}" by ${event.club.name} on ${new Date(event.date).toLocaleDateString()}.`,
      relatedEvent: event._id,
      relatedClub: event.club._id
    });

    res.status(201).json({
      success: true,
      registration,
      message: 'Successfully registered for the event!'
    });
  } catch (error) {
    // Handle duplicate key error from compound index
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/events/:id/register
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({
      student: req.user._id,
      event: req.params.id
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // Decrement registered count
    await Event.findByIdAndUpdate(req.params.id, { $inc: { registeredCount: -1 } });

    res.json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
};

// @desc    Get event registrations (for club admin)
// @route   GET /api/events/:id/registrations
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Verify club admin or super admin
    const club = await Club.findById(event.club);
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view registrations.' });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 });

    const totalRegistered = registrations.length;
    const totalPresent = registrations.filter(r => r.attendanceStatus === 'present').length;
    const totalAbsent = registrations.filter(r => r.attendanceStatus === 'absent').length;

    res.json({
      success: true,
      registrations,
      stats: {
        totalRegistered,
        totalPresent,
        totalAbsent,
        attendanceRate: totalRegistered > 0 ? Math.round((totalPresent / totalRegistered) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
  }
};

// @desc    Mark attendance
// @route   PUT /api/registrations/:id/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['present', 'absent', 'registered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance status.' });
    }

    const registration = await Registration.findById(req.params.id)
      .populate('event');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // Verify club admin
    const club = await Club.findById(registration.event.club);
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance.' });
    }

    registration.attendanceStatus = status;
    await registration.save();

    res.json({ success: true, registration, message: 'Attendance updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update attendance.' });
  }
};

// @desc    Check if user is registered for event
// @route   GET /api/events/:id/registration-status
exports.getRegistrationStatus = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      student: req.user._id,
      event: req.params.id
    });

    res.json({
      success: true,
      isRegistered: !!registration,
      registration
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check registration status.' });
  }
};

// @desc    Get user's registered events
// @route   GET /api/registrations/my-events
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'club', select: 'name logo' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
  }
};
