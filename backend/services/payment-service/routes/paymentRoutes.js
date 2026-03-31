const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyStripePayment,
  getPaymentStatus,
  refundPaymentForOrder
} = require('../controllers/paymentController');

// Initiate payment
router.route('/initiate').post(initiatePayment);

// Verify Stripe payment
router.route('/verify-stripe').post(verifyStripePayment);

// Get payment status for an order
router.route('/:orderId').get(getPaymentStatus);

// Refund payment
router.route('/:orderId/refund').post(refundPaymentForOrder);

module.exports = router;
