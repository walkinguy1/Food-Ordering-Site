const Payment = require('../models/Payment');
const { createPaymentIntent, confirmPaymentIntent, refundPayment: stripeRefund } = require('../utils/stripe');
const { publishEvent } = require('../utils/rabbitmq');
const axios = require('axios');

// @desc    Initiate payment for an order
// @route   POST /api/v1/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  try {
    const { orderId, customerId, amount, paymentMethod, vendorId } = req.body;

    // Create payment record
    const payment = new Payment({
      orderId,
      customerId,
      amount,
      paymentMethod,
      metadata: { vendorId },
      status: 'pending'
    });

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const stripeResult = await createPaymentIntent(orderId, amount, customerId, { vendorId });
      
      if (stripeResult.success) {
        payment.stripePaymentIntentId = stripeResult.paymentIntentId;
        payment.status = 'processing';
        await payment.save();

        return res.status(200).json({
          success: true,
          paymentId: payment._id.toString(),
          clientSecret: stripeResult.clientSecret,
          status: 'processing'
        });
      } else {
        payment.status = 'failed';
        payment.errorMessage = stripeResult.error;
        await payment.save();
        return res.status(400).json({ success: false, error: stripeResult.error });
      }
    }

    if (paymentMethod === 'khalti') {
      // Khalti payment payload (requires frontend integration)
      payment.status = 'processing';
      await payment.save();

      return res.status(200).json({
        success: true,
        paymentId: payment._id.toString(),
        status: 'processing',
        publicKey: process.env.KHALTI_PUBLIC_KEY,
        message: 'Use Khalti public key for frontend integration'
      });
    }

    if (paymentMethod === 'esewa') {
      // eSewa payment payload
      payment.status = 'processing';
      await payment.save();

      return res.status(200).json({
        success: true,
        paymentId: payment._id.toString(),
        status: 'processing',
        merchantCode: process.env.ESEWA_MERCHANT_CODE,
        message: 'Use eSewa merchant code for frontend integration'
      });
    }

    if (paymentMethod === 'cod') {
      // Cash on Delivery - no payment processing needed
      payment.status = 'completed';
      await payment.save();

      // Publish payment.completed event
      publishEvent('payment.completed', {
        orderId,
        customerId,
        amount,
        paymentMethod: 'cod',
        status: 'completed'
      });

      return res.status(200).json({
        success: true,
        paymentId: payment._id.toString(),
        status: 'completed',
        message: 'Cash on Delivery order confirmed'
      });
    }

    res.status(400).json({ success: false, error: 'Invalid payment method' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Verify Stripe payment
// @route   POST /api/v1/payments/verify-stripe
// @access  Private
const verifyStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Verify with Stripe
    const result = await confirmPaymentIntent(paymentIntentId);

    if (result.success) {
      // Update payment record
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      if (payment) {
        payment.status = 'completed';
        payment.transactionId = paymentIntentId;
        await payment.save();

        // Publish payment.completed event
        publishEvent('payment.completed', {
          orderId: payment.orderId,
          customerId: payment.customerId,
          amount: payment.amount,
          paymentMethod: 'stripe',
          status: 'completed',
          transactionId: paymentIntentId
        });

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          payment
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Payment verification failed'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get payment status
// @route   GET /api/v1/payments/:orderId
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ orderId });

    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Refund payment
// @route   POST /api/v1/payments/:orderId/refund
// @access  Private (Admin/Vendor)
const refundPaymentForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount = null } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentMethod === 'stripe' && payment.stripePaymentIntentId) {
      const result = await stripeRefund(payment.stripePaymentIntentId, amount);
      
      if (result.success) {
        payment.status = 'refunded';
        await payment.save();

        // Publish payment.refunded event
        publishEvent('payment.refunded', {
          orderId,
          customerId: payment.customerId,
          amount: amount || payment.amount,
          paymentMethod: 'stripe',
          refundId: result.refundId
        });

        return res.json({
          success: true,
          message: 'Refund processed successfully',
          refundId: result.refundId
        });
      } else {
        return res.status(400).json({ success: false, error: result.error });
      }
    }

    if (payment.paymentMethod === 'cod') {
      payment.status = 'refunded';
      await payment.save();
      
      publishEvent('payment.refunded', {
        orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        paymentMethod: 'cod'
      });

      return res.json({
        success: true,
        message: 'COD refund recorded'
      });
    }

    res.status(400).json({ success: false, error: 'Refund not supported for this payment method' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  initiatePayment,
  verifyStripePayment,
  getPaymentStatus,
  refundPaymentForOrder
};
