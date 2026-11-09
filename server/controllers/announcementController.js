const Announcement = require('../models/Announcement');
const Club = require('../models/Club');
const Notification = require('../models/Notification');

// @desc    Get announcements
// @route   GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { club, page = 1, limit = 20 } = req.query;
    const query = {};

    if (club) {
      query.club = club;
    } else if (req.user) {
      // Get announcements from joined clubs and global
      const joinedClubIds = req.user.joinedClubs || [];
      query.$or = [
        { isGlobal: true },
        { club: { $in: joinedClubIds } }
      ];
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('club', 'name logo')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      announcements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { club, title, content, priority, isGlobal } = req.body;

    if (isGlobal || !club) {
      if (req.user.role !== 'superAdmin') {
        return res.status(403).json({ success: false, message: 'Only Super Admin can post global announcements.' });
      }

      const announcement = await Announcement.create({
        club: null,
        isGlobal: true,
        title,
        content,
        priority: priority || 'normal',
        author: req.user._id
      });

      const populated = await Announcement.findById(announcement._id)
        .populate('author', 'name');

      return res.status(201).json({
        success: true,
        announcement: populated,
        message: 'Global announcement published successfully.'
      });
    }

    const clubDoc = await Club.findById(club);
    if (!clubDoc) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    if (clubDoc.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create announcements for this club.' });
    }

    const announcement = await Announcement.create({
      club,
      title,
      content,
      priority: priority || 'normal',
      author: req.user._id
    });

    // Notify club members
    const memberIds = clubDoc.members
      .map(m => m.user)
      .filter(id => id.toString() !== req.user._id.toString());

    if (memberIds.length > 0) {
      const notifications = memberIds.map(memberId => ({
        recipient: memberId,
        type: 'club_announcement',
        title: `📢 ${clubDoc.name}: ${title}`,
        message: content.substring(0, 200),
        relatedClub: club
      }));
      await Notification.insertMany(notifications);
    }

    const populated = await Announcement.findById(announcement._id)
      .populate('club', 'name logo')
      .populate('author', 'name');

    res.status(201).json({
      success: true,
      announcement: populated,
      message: 'Announcement published successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (announcement.isGlobal || !announcement.club) {
      if (req.user.role !== 'superAdmin') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    } else {
      const club = await Club.findById(announcement.club);
      if (club && club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('club', 'name logo')
      .populate('author', 'name');

    res.json({ success: true, announcement: updated, message: 'Announcement updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update announcement.' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (announcement.isGlobal || !announcement.club) {
      if (req.user.role !== 'superAdmin') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    } else {
      const club = await Club.findById(announcement.club);
      if (club && club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
};
