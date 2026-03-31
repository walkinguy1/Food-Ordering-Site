const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  getSimilarItems,
  getTrendingItems,
  logInteraction,
  getUserPreferences,
  getByCategory
} = require('../controllers/recommendationController');

// Personalized recommendations
router.route('/user/:userId').get(getPersonalizedRecommendations);

// User preferences
router.route('/user/:userId/preferences').get(getUserPreferences);

// Similar items
router.route('/similar/:menuItemId').get(getSimilarItems);

// Trending items
router.route('/trending').get(getTrendingItems);

// Category-based recommendations
router.route('/category/:category').get(getByCategory);

// Log interactions
router.route('/interactions').post(logInteraction);

module.exports = router;
