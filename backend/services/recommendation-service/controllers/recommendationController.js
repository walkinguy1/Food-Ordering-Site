const UserPreference = require('../models/UserPreference');
const UserInteraction = require('../models/UserInteraction');
const ItemSimilarity = require('../models/ItemSimilarity');
const { getCollaborativeRecommendations, getItemBasedRecommendations } = require('../utils/collaborativeFiltering');
const { getContentBasedRecommendations, getTrendingRecommendations, getCategoryRecommendations } = require('../utils/contentBasedFiltering');

// @desc    Get personalized recommendations for a user
// @route   GET /api/v1/recommendations/user/:userId
// @access  Private
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, method = 'hybrid' } = req.query;

    let recommendations = [];

    if (method === 'collaborative' || method === 'hybrid') {
      // Collaborative filtering
      const collab = await getCollaborativeRecommendations(userId, limit);
      recommendations.push(...collab);
    }

    if (method === 'content' || method === 'hybrid') {
      // Content-based filtering
      const content = await getContentBasedRecommendations(userId, limit);
      recommendations.push(...content);
    }

    if (method === 'item-based' || method === 'hybrid') {
      // Item-based collaborative filtering
      const itemBased = await getItemBasedRecommendations(userId, limit);
      recommendations.push(...itemBased);
    }

    // For hybrid, merge and deduplicate while maintaining scores
    if (method === 'hybrid') {
      const uniqueItems = {};
      recommendations.forEach(rec => {
        if (!uniqueItems[rec.menuItemId]) {
          uniqueItems[rec.menuItemId] = rec;
        } else {
          // Average the scores from different methods
          uniqueItems[rec.menuItemId].score = 
            (uniqueItems[rec.menuItemId].score + rec.score) / 2;
        }
      });

      recommendations = Object.values(uniqueItems)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    res.json({
      success: true,
      userId,
      method,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get recommendations similar to a specific menu item
// @route   GET /api/v1/recommendations/similar/:menuItemId
// @access  Public
const getSimilarItems = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { limit = 5 } = req.query;

    const itemSimilarity = await ItemSimilarity.findOne({ itemId: menuItemId });

    if (!itemSimilarity) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const similarItems = itemSimilarity.similarItems
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    res.json({
      success: true,
      itemId: menuItemId,
      count: similarItems.length,
      similarItems
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get trending/popular items
// @route   GET /api/v1/recommendations/trending
// @access  Public
const getTrendingItems = async (req, res) => {
  try {
    const { vendorId, limit = 10, category } = req.query;

    const query = {};
    if (vendorId) query.vendorId = vendorId;
    if (category) query.category = category;

    const trendingItems = await ItemSimilarity.find(query)
      .sort({ popularityScore: -1 })
      .limit(limit)
      .select('itemId popularityScore vendorId category itemAttributes');

    res.json({
      success: true,
      count: trendingItems.length,
      items: trendingItems.map(item => ({
        menuItemId: item.itemId,
        score: item.popularityScore,
        vendorId: item.vendorId,
        category: item.category,
        attributes: item.itemAttributes
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Log user interaction (view, purchase, rate)
// @route   POST /api/v1/recommendations/interactions
// @access  Private
const logInteraction = async (req, res) => {
  try {
    const { userId, menuItemId, vendorId, interactionType, rating, quantity, sessionId } = req.body;

    // Validate required fields
    if (!userId || !menuItemId || !vendorId || !interactionType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, menuItemId, vendorId, interactionType'
      });
    }

    // Create interaction record
    const interaction = new UserInteraction({
      userId,
      menuItemId,
      vendorId,
      interactionType,
      rating,
      quantity,
      sessionId
    });

    await interaction.save();

    // Update user preference if purchase
    if (interactionType === 'purchase') {
      await updateUserPreference(userId, menuItemId, vendorId);
    }

    // Update item popularity if purchase or rate
    if (interactionType === 'purchase' || interactionType === 'rate') {
      await updateItemPopularity(menuItemId);
    }

    res.json({
      success: true,
      message: 'Interaction logged successfully',
      interaction
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user preferences/profile
// @route   GET /api/v1/recommendations/user/:userId/preferences
// @access  Private
const getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    const userPref = await UserPreference.findOne({ userId });

    if (!userPref) {
      return res.status(404).json({ success: false, message: 'User preferences not found' });
    }

    res.json({
      success: true,
      userId,
      preferences: userPref
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get category-based recommendations
// @route   GET /api/v1/recommendations/category/:category
// @access  Public
const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const items = await ItemSimilarity.find({ category })
      .sort({ popularityScore: -1 })
      .limit(limit)
      .select('itemId popularityScore itemAttributes');

    res.json({
      success: true,
      category,
      count: items.length,
      items: items.map(item => ({
        menuItemId: item.itemId,
        score: item.popularityScore,
        attributes: item.itemAttributes
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function: Update user preference after purchase
const updateUserPreference = async (userId, menuItemId, vendorId) => {
  try {
    let userPref = await UserPreference.findOne({ userId });

    if (!userPref) {
      userPref = new UserPreference({
        userId,
        preferences: {
          cuisineTypes: [],
          favoriteVendors: []
        },
        totalOrders: 0
      });
    }

    userPref.totalOrders += 1;
    userPref.lastOrderedAt = new Date();

    // Track favorite vendors
    const vendorIdx = userPref.preferences.favoriteVendors.findIndex(v => v.vendorId === vendorId);
    if (vendorIdx > -1) {
      userPref.preferences.favoriteVendors[vendorIdx].orders += 1;
    } else {
      userPref.preferences.favoriteVendors.push({ vendorId, orders: 1 });
    }

    // Sort favorite vendors
    userPref.preferences.favoriteVendors.sort((a, b) => b.orders - a.orders);

    await userPref.save();
  } catch (err) {
    console.error('Error updating user preference:', err);
  }
};

// Helper function: Update item popularity
const updateItemPopularity = async (menuItemId) => {
  try {
    const purchaseCount = await UserInteraction.countDocuments({
      menuItemId,
      interactionType: 'purchase'
    });

    const ratingData = await UserInteraction.aggregate([
      {
        $match: {
          menuItemId,
          interactionType: 'rate',
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const avgRating = ratingData[0]?.avgRating || 0;

    // Combine purchase count and rating for popularity score
    const popularityScore = (purchaseCount * 0.7) + (avgRating * 10 * 0.3);

    await ItemSimilarity.findOneAndUpdate(
      { itemId: menuItemId },
      { popularityScore, 'itemAttributes.rating': avgRating },
      { upsert: true }
    );
  } catch (err) {
    console.error('Error updating item popularity:', err);
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getSimilarItems,
  getTrendingItems,
  logInteraction,
  getUserPreferences,
  getByCategory
};
