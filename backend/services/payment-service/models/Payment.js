const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'khalti', 'esewa', 'cod'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: { type: String }, // Stripe Payment Intent ID, Khalti token, etc.
  stripePaymentIntentId: { type: String },
  khaltiToken: { type: String },
  esewaToken: { type: String },
  errorMessage: { type: String },
  metadata: {
    vendorId: String,
    paymentGatewayResponse: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
