const UserPreference = require('../models/UserPreference');
const ItemSimilarity = require('../models/ItemSimilarity');
const UserInteraction = require('../models/UserInteraction');

/**
 * Content-Based Filtering: Recommend items similar to what user likes
 * Based on item attributes (cuisine, category, price, etc.)
 */
const getContentBasedRecommendations = async (userId, limit = 5) => {
  try {
    // Get user preferences
    const userPref = await UserPreference.findOne({ userId });
    if (!userPref) {
      return [];
    }

    // Get all menu items matching user preferences
    const query = {};

    // Match cuisine preferences
    if (userPref.preferences.cuisineTypes && userPref.preferences.cuisineTypes.length > 0) {
      const cuisines = userPref.preferences.cuisineTypes.map(c => c.type);
      query.cuisine = { $in: cuisines };
    }

    // Match price range
    if (userPref.preferences.priceRange) {
      query['itemAttributes.price'] = {
        $gte: userPref.preferences.priceRange.min,
        $lte: userPref.preferences.priceRange.max
      };
    }

    // Match dietary restrictions
    if (userPref.preferences.dietaryRestrictions && userPref.preferences.dietaryRestrictions.length > 0) {
      const restrictions = userPref.preferences.dietaryRestrictions;
      if (restrictions.includes('vegetarian')) {
        query['itemAttributes.vegetarian'] = true;
      }
      if (restrictions.includes('vegan')) {
        query['itemAttributes.vegan'] = true;
      }
      if (restrictions.includes('gluten-free')) {
        query['itemAttributes.glutenFree'] = true;
      }
    }

    // Get user's purchased items to exclude
    const userPurchases = await UserInteraction.find({
      userId,
      interactionType: 'purchase'
    }).distinct('menuItemId');

    query.itemId = { $nin: userPurchases };

    // Find matching items
    const recommendations = await ItemSimilarity.find(query)
      .sort({ popularityScore: -1 })
      .limit(limit)
      .select('itemId popularityScore itemAttributes');

    return recommendations.map(item => ({
      menuItemId: item.itemId,
      score: item.popularityScore || 0,
      method: 'content_based',
      attributes: item.itemAttributes
    }));
  } catch (err) {
    console.error('Content-based filtering error:', err);
    return [];
  }
};

/**
 * Trending items: Items popular in user's favorite vendors or categories
 */
const getTrendingRecommendations = async (userId, vendorId, limit = 5) => {
  try {
    // Get trending items from user's favorite vendor or category
    const trendingItems = await ItemSimilarity.find({
      vendorId,
      itemId: { $nin: await UserInteraction.find({ userId }).distinct('menuItemId') }
    })
      .sort({ popularityScore: -1 })
      .limit(limit)
      .select('itemId popularityScore itemAttributes');

    return trendingItems.map(item => ({
      menuItemId: item.itemId,
      score: item.popularityScore || 0,
      method: 'trending',
      attributes: item.itemAttributes
    }));
  } catch (err) {
    console.error('Trending recommendations error:', err);
    return [];
  }
};

/**
 * Category-based recommendations
 */
const getCategoryRecommendations = async (userId, category, limit = 5) => {
  try {
    const userPurchases = await UserInteraction.find({ userId }).distinct('menuItemId');

    const categoryItems = await ItemSimilarity.find({
      category,
      itemId: { $nin: userPurchases }
    })
      .sort({ popularityScore: -1 })
      .limit(limit)
      .select('itemId popularityScore itemAttributes');

    return categoryItems.map(item => ({
      menuItemId: item.itemId,
      score: item.popularityScore || 0,
      method: 'category_based',
      attributes: item.itemAttributes
    }));
  } catch (err) {
    console.error('Category recommendations error:', err);
    return [];
  }
};

module.exports = {
  getContentBasedRecommendations,
  getTrendingRecommendations,
  getCategoryRecommendations
};
