const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('joinedClubs', 'name logo category memberCount')
      .populate('savedEvents', 'title date image club status')
      .populate('managedClub', 'name logo');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, user, message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// @desc    Update user interests
// @route   PUT /api/users/interests
exports.updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: 'Interests must be an array.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interests },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user,
      message: 'Interests updated successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update interests.' });
  }
};

// @desc    Save/unsave event
// @route   PUT /api/users/saved-events/:eventId
exports.toggleSaveEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.eventId;

    const index = user.savedEvents.indexOf(eventId);
    if (index > -1) {
      user.savedEvents.splice(index, 1);
      await user.save();
      res.json({ success: true, saved: false, message: 'Event removed from saved events.' });
    } else {
      user.savedEvents.push(eventId);
      await user.save();
      res.json({ success: true, saved: true, message: 'Event saved successfully.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update saved events.' });
  }
};

// @desc    Get saved events
// @route   GET /api/users/saved-events
exports.getSavedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedEvents',
        populate: { path: 'club', select: 'name logo' }
      });

    res.json({ success: true, events: user.savedEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch saved events.' });
  }
};
