const mongoose = require('mongoose');

const PaymentMetricSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  vendorId: { type: String, required: true },
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
    required: true
  },
  initiatedAt: { type: Date, required: true },
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  processingTime: Number // in seconds
}, { timestamps: true });

PaymentMetricSchema.index({ createdAt: -1 });
PaymentMetricSchema.index({ paymentMethod: 1, status: 1 });
PaymentMetricSchema.index({ vendorId: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentMetric', PaymentMetricSchema);
