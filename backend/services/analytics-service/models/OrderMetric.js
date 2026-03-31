const mongoose = require('mongoose');

const OrderMetricSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  vendorId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  paymentMethod: { type: String },
  paymentStatus: { type: String },
  createdAt: { type: Date, required: true },
  acceptedAt: Date,
  deliveredAt: Date,
  totalDuration: Number, // in minutes
  preparationDuration: Number, // from created to delivering
  deliveryDuration: Number // from ready to delivered
}, { timestamps: true });

// Index for efficient querying
OrderMetricSchema.index({ createdAt: -1 });
OrderMetricSchema.index({ vendorId: 1, createdAt: -1 });
OrderMetricSchema.index({ customerId: 1, createdAt: -1 });
OrderMetricSchema.index({ status: 1 });

module.exports = mongoose.model('OrderMetric', OrderMetricSchema);
