const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalClubAdmins, totalClubs, totalEvents, totalRegistrations, activeClubs, upcomingEvents] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'clubAdmin' }),
        Club.countDocuments(),
        Event.countDocuments(),
        Registration.countDocuments(),
        Club.countDocuments({ status: 'active' }),
        Event.countDocuments({ status: 'upcoming', date: { $gte: new Date() } })
      ]);

    const inactiveClubs = Math.max(0, totalClubs - activeClubs);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalClubAdmins,
        totalClubs,
        totalEvents,
        totalRegistrations,
        activeClubs,
        inactiveClubs,
        upcomingEvents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('managedClub', 'name logo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// @desc    Update user role/status (admin)
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, managedClub } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (managedClub !== undefined) updateData.managedClub = managedClub || null;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select('-password')
      .populate('managedClub', 'name logo');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user, message: 'User updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Clean up user's registrations
    await Registration.deleteMany({ student: req.params.id });
    await Notification.deleteMany({ recipient: req.params.id });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

// @desc    Update club status (admin)
// @route   PUT /api/admin/clubs/:id
exports.updateClubStatus = async (req, res) => {
  try {
    const { status, featured } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (typeof featured === 'boolean') updateData.featured = featured;

    const club = await Club.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    res.json({ success: true, club, message: 'Club updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update club.' });
  }
};

// @desc    Get all registrations (admin)
// @route   GET /api/admin/registrations
exports.getAllRegistrations = async (req, res) => {
  try {
    const { event, page = 1, limit = 50 } = req.query;
    const query = {};
    if (event) query.event = event;

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .populate('student', 'name email')
      .populate({
        path: 'event',
        select: 'title date club',
        populate: { path: 'club', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      registrations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
  }
};

// @desc    Get all announcements (admin)
// @route   GET /api/admin/announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Announcement.countDocuments();
    const announcements = await Announcement.find()
      .populate('club', 'name logo')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      announcements,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
};
