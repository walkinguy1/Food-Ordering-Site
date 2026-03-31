const UserInteraction = require('../models/UserInteraction');
const ItemSimilarity = require('../models/ItemSimilarity');

/**
 * Collaborative Filtering: Find similar users and their preferences
 * Users who bought X are likely to buy what similar users bought
 */
const getCollaborativeRecommendations = async (userId, limit = 5) => {
  try {
    // Get user's purchase history
    const userPurchases = await UserInteraction.find({
      userId,
      interactionType: 'purchase'
    }).distinct('menuItemId');

    if (userPurchases.length === 0) {
      return []; // No purchase history for cold start
    }

    // Find similar users (users who bought same items)
    const similarUsers = await UserInteraction.find({
      menuItemId: { $in: userPurchases },
      userId: { $ne: userId },
      interactionType: 'purchase'
    });

    // Count item frequency for similar users
    const itemScores = {};
    similarUsers.forEach(interaction => {
      if (!userPurchases.includes(interaction.menuItemId)) {
        itemScores[interaction.menuItemId] = (itemScores[interaction.menuItemId] || 0) + 1;
      }
    });

    // Sort by score and return top items
    const recommendations = Object.entries(itemScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([itemId, score]) => ({
        menuItemId: itemId,
        score,
        method: 'collaborative_filtering'
      }));

    return recommendations;
  } catch (err) {
    console.error('Collaborative filtering error:', err);
    return [];
  }
};

/**
 * Item-to-Item Collaborative Filtering
 * Find similar items to what user has purchased
 */
const getItemBasedRecommendations = async (userId, limit = 5) => {
  try {
    // Get user's recent purchases
    const userPurchases = await UserInteraction.find({
      userId,
      interactionType: 'purchase'
    })
      .sort({ timestamp: -1 })
      .limit(10);

    if (userPurchases.length === 0) {
      return [];
    }

    const similarItemsMap = {};

    // For each purchased item, find similar items
    for (const purchase of userPurchases) {
      const itemSimilarities = await ItemSimilarity.findOne({
        itemId: purchase.menuItemId
      });

      if (itemSimilarities && itemSimilarities.similarItems) {
        itemSimilarities.similarItems.forEach(similarItem => {
          if (!userPurchases.map(p => p.menuItemId).includes(similarItem.itemId)) {
            similarItemsMap[similarItem.itemId] = 
              (similarItemsMap[similarItem.itemId] || 0) + similarItem.similarity;
          }
        });
      }
    }

    // Sort and return top recommendations
    const recommendations = Object.entries(similarItemsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([itemId, score]) => ({
        menuItemId: itemId,
        score: Number(score.toFixed(2)),
        method: 'item_based_collab'
      }));

    return recommendations;
  } catch (err) {
    console.error('Item-based collaborative filtering error:', err);
    return [];
  }
};

/**
 * Calculate item similarity based on co-purchase patterns
 * Items frequently bought together have high similarity
 */
const calculateItemSimilarity = async (itemId1, itemId2) => {
  try {
    // Find orders containing both items
    const ordersWithBoth = await UserInteraction.aggregate([
      { $match: { menuItemId: itemId1, interactionType: 'purchase' } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      { $lookup: {
          from: 'userinteractions',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] }, menuItemId: itemId2, interactionType: 'purchase' } },
            { $count: 'count' }
          ],
          as: 'cooccurrence'
        }
      },
      { $match: { cooccurrence: { $ne: [] } } },
      { $count: 'total' }
    ]);

    const cooccurrenceCount = ordersWithBoth[0]?.total || 0;

    // Normalize similarity score (0-1)
    const similarity = Math.min(cooccurrenceCount / 50, 1); // Normalize based on threshold

    return similarity;
  } catch (err) {
    console.error('Item similarity calculation error:', err);
    return 0;
  }
};

module.exports = {
  getCollaborativeRecommendations,
  getItemBasedRecommendations,
  calculateItemSimilarity
};
