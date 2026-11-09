const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Get all clubs
// @route   GET /api/clubs
exports.getClubs = async (req, res) => {
  try {
    const { search, category, status, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status && status !== 'all') query.status = status;
    else if (!status) query.status = 'active';

    let sortObj = { createdAt: -1 };
    if (sort === 'name') sortObj = { name: 1 };
    if (sort === 'members') sortObj = { 'members.length': -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };

    const total = await Club.countDocuments(query);
    const clubs = await Club.find(query)
      .populate('admin', 'name email')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get upcoming event counts for each club
    const clubIds = clubs.map(c => c._id);
    const eventCounts = await Event.aggregate([
      { $match: { club: { $in: clubIds }, status: 'upcoming' } },
      { $group: { _id: '$club', count: { $sum: 1 } } }
    ]);
    const eventCountMap = {};
    eventCounts.forEach(ec => { eventCountMap[ec._id.toString()] = ec.count; });

    const clubsWithCounts = clubs.map(club => {
      const clubObj = club.toJSON();
      clubObj.upcomingEventCount = eventCountMap[club._id.toString()] || 0;
      return clubObj;
    });

    res.json({
      success: true,
      clubs: clubsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clubs.' });
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
exports.getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    // Get club events
    const events = await Event.find({ club: club._id })
      .sort({ date: -1 })
      .limit(20);

    const clubObj = club.toJSON();
    clubObj.events = events;

    res.json({ success: true, club: clubObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch club.' });
  }
};

// @desc    Create club
// @route   POST /api/clubs
exports.createClub = async (req, res) => {
  try {
    const { name, description, shortDescription, category, logo, coverImage, tags, contactEmail } = req.body;

    const club = await Club.create({
      name,
      description,
      shortDescription,
      category,
      logo,
      coverImage,
      tags,
      contactEmail,
      admin: req.user._id,
      members: [{ user: req.user._id }]
    });

    // Update user role if student
    if (req.user.role === 'student' || req.user.role === 'superAdmin') {
      await User.findByIdAndUpdate(req.user._id, {
        managedClub: club._id,
        $addToSet: { joinedClubs: club._id },
        ...(req.user.role === 'student' ? { role: 'clubAdmin' } : {})
      });
    }

    res.status(201).json({ success: true, club, message: 'Club created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create club.' });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
exports.updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    // Check ownership
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this club.' });
    }

    const updatedClub = await Club.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, club: updatedClub, message: 'Club updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update club.' });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this club.' });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Club deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete club.' });
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
exports.joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    if (club.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This club is not currently active.' });
    }

    // Check if already a member
    const isMember = club.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this club.' });
    }

    club.members.push({ user: req.user._id });
    await club.save();

    // Add club to user's joined clubs
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedClubs: club._id }
    });

    // Create notification
    await Notification.create({
      recipient: req.user._id,
      type: 'club_joined',
      title: `Joined ${club.name}`,
      message: `You are now a member of ${club.name}. Stay tuned for events and announcements!`,
      relatedClub: club._id
    });

    res.json({ success: true, message: `Successfully joined ${club.name}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to join club.' });
  }
};

// @desc    Leave club
// @route   DELETE /api/clubs/:id/join
exports.leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    // Cannot leave if admin
    if (club.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Club admin cannot leave the club.' });
    }

    club.members = club.members.filter(m => m.user.toString() !== req.user._id.toString());
    await club.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedClubs: club._id }
    });

    res.json({ success: true, message: `Successfully left ${club.name}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to leave club.' });
  }
};

// @desc    Get club members
// @route   GET /api/clubs/:id/members
exports.getMembers = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('members.user', 'name email avatar createdAt');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    res.json({ success: true, members: club.members, total: club.members.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch members.' });
  }
};

// @desc    Remove member from club
// @route   DELETE /api/clubs/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (req.params.userId === club.admin.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the club admin.' });
    }

    club.members = club.members.filter(m => m.user.toString() !== req.params.userId);
    await club.save();

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { joinedClubs: club._id }
    });

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove member.' });
  }
};
