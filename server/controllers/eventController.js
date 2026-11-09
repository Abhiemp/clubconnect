const Event = require('../models/Event');
const Club = require('../models/Club');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const {
      search, category, club, status, date,
      availability, sort, page = 1, limit = 12
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (club) query.club = club;
    if (status) query.status = status;
    if (date === 'upcoming') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    } else if (date === 'past') {
      query.$or = [
        { date: { $lt: new Date() } },
        { status: { $in: ['completed', 'cancelled'] } }
      ];
    }
    if (availability === 'available') {
      query.$expr = { $lt: ['$registeredCount', '$capacity'] };
    }

    let sortObj = { date: 1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'date') sortObj = { date: 1 };
    if (sort === 'popular') sortObj = { registeredCount: -1 };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('club', 'name logo category')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logo category description admin');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const {
      title, description, category, tags, date, startTime,
      endTime, venue, capacity, registrationDeadline, image, eligibility, club
    } = req.body;

    // Verify the user is admin of the club
    const clubDoc = await Club.findById(club);
    if (!clubDoc) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    if (clubDoc.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create events for this club.' });
    }

    const event = await Event.create({
      title, description, category,
      tags: tags || [],
      date, startTime, endTime, venue,
      capacity, registrationDeadline,
      image, eligibility, club
    });

    // Notify club members about new event
    const memberIds = clubDoc.members.map(m => m.user).filter(id => id.toString() !== req.user._id.toString());
    if (memberIds.length > 0) {
      const notifications = memberIds.map(memberId => ({
        recipient: memberId,
        type: 'event_created',
        title: `New Event: ${title}`,
        message: `${clubDoc.name} has posted a new event: "${title}" on ${new Date(date).toLocaleDateString()}.`,
        relatedEvent: event._id,
        relatedClub: club
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, event, message: 'Event created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create event.' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const club = await Club.findById(event.club);
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('club', 'name logo category');

    // Notify registered students about update
    const registrations = await Registration.find({ event: event._id });
    if (registrations.length > 0) {
      const notifications = registrations.map(reg => ({
        recipient: reg.student,
        type: 'event_update',
        title: `Event Updated: ${updatedEvent.title}`,
        message: `The event "${updatedEvent.title}" has been updated. Please review the changes.`,
        relatedEvent: event._id,
        relatedClub: event.club
      }));
      await Notification.insertMany(notifications);
    }

    res.json({ success: true, event: updatedEvent, message: 'Event updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

// @desc    Delete/Cancel event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const club = await Club.findById(event.club);
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event.' });
    }

    // Notify registered students about cancellation
    const registrations = await Registration.find({ event: event._id });
    if (registrations.length > 0) {
      const notifications = registrations.map(reg => ({
        recipient: reg.student,
        type: 'event_cancelled',
        title: `Event Cancelled: ${event.title}`,
        message: `The event "${event.title}" has been cancelled.`,
        relatedEvent: event._id,
        relatedClub: event.club
      }));
      await Notification.insertMany(notifications);
    }

    // Delete related registrations
    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};

// @desc    Get events by club (for club admin)
// @route   GET /api/events/club/:clubId
exports.getClubEvents = async (req, res) => {
  try {
    const events = await Event.find({ club: req.params.clubId })
      .populate('club', 'name logo')
      .sort({ date: -1 });

    // Get registration counts
    const eventIds = events.map(e => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);
    const regMap = {};
    regCounts.forEach(r => { regMap[r._id.toString()] = r.count; });

    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch club events.' });
  }
};
