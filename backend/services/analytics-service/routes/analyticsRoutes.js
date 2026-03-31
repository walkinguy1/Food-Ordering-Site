const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getRevenueMetrics,
  getVendorMetrics,
  getPaymentAnalytics,
  getOrderStatusDistribution
} = require('../controllers/analyticsController');

// Dashboard
router.route('/dashboard').get(getDashboard);

// Revenue metrics
router.route('/revenue').get(getRevenueMetrics);

// Vendor metrics
router.route('/vendors').get(getVendorMetrics);

// Payment analytics
router.route('/payments').get(getPaymentAnalytics);

// Order status distribution
router.route('/orders/status').get(getOrderStatusDistribution);

module.exports = router;
