const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get recommended events
// @route   GET /api/recommendations/events
exports.getRecommendedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userInterests = user.interests.map(i => i.toLowerCase().trim());

    if (userInterests.length === 0) {
      return res.json({
        success: true,
        events: [],
        message: 'Update your interests to get personalized event recommendations.'
      });
    }

    // Get upcoming events
    const events = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() }
    }).populate('club', 'name logo category');

    // Calculate match scores using content-based filtering
    const scoredEvents = events.map(event => {
      const eventTags = (event.tags || []).map(t => t.toLowerCase().trim());
      const eventCategory = event.category.toLowerCase().trim();

      // Collect all event keywords
      const eventKeywords = [...eventTags, eventCategory];

      // Find matching interests
      const matchingInterests = [];
      let matchScore = 0;

      userInterests.forEach(interest => {
        const interestLower = interest.toLowerCase();

        // Direct match with tags
        if (eventTags.some(tag => tag.includes(interestLower) || interestLower.includes(tag))) {
          matchingInterests.push(interest);
          matchScore += 2;
        }

        // Match with category
        if (eventCategory.includes(interestLower) || interestLower.includes(eventCategory)) {
          if (!matchingInterests.includes(interest)) {
            matchingInterests.push(interest);
          }
          matchScore += 3; // Category match weighs more
        }

        // Partial keyword matching (e.g., "AI" matches "AI & Machine Learning")
        eventKeywords.forEach(keyword => {
          const words = keyword.split(/[\s&,]+/).map(w => w.toLowerCase().trim());
          if (words.some(w => w === interestLower || interestLower === w)) {
            if (!matchingInterests.includes(interest)) {
              matchingInterests.push(interest);
            }
            matchScore += 1;
          }
        });
      });

      // Calculate percentage (normalize to 0-100)
      const maxPossibleScore = userInterests.length * 5; // Max per interest
      const matchPercentage = Math.min(100, Math.round((matchScore / maxPossibleScore) * 100));

      return {
        event: event.toJSON(),
        matchPercentage,
        matchingInterests: [...new Set(matchingInterests)],
        reason: matchingInterests.length > 0
          ? `Recommended because this matches your interests in ${matchingInterests.join(' and ')}.`
          : null
      };
    });

    // Filter events with at least some match and sort by score
    const recommended = scoredEvents
      .filter(e => e.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 20);

    res.json({ success: true, events: recommended });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get recommendations.' });
  }
};
