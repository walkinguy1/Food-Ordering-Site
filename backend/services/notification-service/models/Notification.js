const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ['email', 'sms', 'in_app', 'push'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedOrderId: { type: String },
  relatedPaymentId: { type: String },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'read'],
    default: 'pending'
  },
  recipient: { type: String }, // Email or phone number
  eventType: { type: String }, // order.created, payment.completed, etc.
  metadata: mongoose.Schema.Types.Mixed,
  errorMessage: { type: String },
  sentAt: { type: Date },
  readAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
