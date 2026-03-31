const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-test-key');

// Create a payment intent for Stripe
const createPaymentIntent = async (orderId, amount, customerId, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId,
        customerId,
        ...metadata
      },
      description: `Payment for order ${orderId}`
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

// Confirm payment intent (after client-side confirmation)
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

// Refund payment
const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  refundPayment
};
