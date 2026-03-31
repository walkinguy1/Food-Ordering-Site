const mongoose = require('mongoose');

const DailyMetricSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  // Order metrics
  totalOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  failedOrders: { type: Number, default: 0 },
  totalOrderValue: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  
  // Payment metrics
  totalPayments: { type: Number, default: 0 },
  successfulPayments: { type: Number, default: 0 },
  failedPayments: { type: Number, default: 0 },
  totalPaymentAmount: { type: Number, default: 0 },
  paymentSuccessRate: { type: Number, default: 0 }, // percentage
  
  // Payment method breakdown
  paymentMethodBreakdown: {
    stripe: { count: Number, amount: Number },
    khalti: { count: Number, amount: Number },
    esewa: { count: Number, amount: Number },
    cod: { count: Number, amount: Number }
  },
  
  // Performance metrics
  averageOrderDuration: { type: Number, default: 0 }, // in minutes
  averageDeliveryTime: { type: Number, default: 0 },
  
  // User metrics
  activeCustomers: { type: Number, default: 0 },
  activeVendors: { type: Number, default: 0 },
  activeDeliveryAgents: { type: Number, default: 0 },
  
  // System health
  notificationsSent: { type: Number, default: 0 },
  emailsSent: { type: Number, default: 0 }
}, { timestamps: true });

DailyMetricSchema.index({ date: -1 });

module.exports = mongoose.model('DailyMetric', DailyMetricSchema);
