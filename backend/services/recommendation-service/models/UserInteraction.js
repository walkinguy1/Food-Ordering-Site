const mongoose = require('mongoose');

const UserInteractionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  menuItemId: { type: String, required: true },
  vendorId: { type: String, required: true },
  interactionType: {
    type: String,
    enum: ['view', 'add_to_cart', 'purchase', 'rate'],
    required: true
  },
  rating: { type: Number, min: 1, max: 5 }, // Only for 'rate' interactions
  quantity: { type: Number, default: 1 }, // For 'purchase' interactions
  timestamp: { type: Date, default: Date.now },
  sessionId: String // To group interactions in a session
}, { timestamps: true });

UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ menuItemId: 1 });
UserInteractionSchema.index({ vendorId: 1 });
UserInteractionSchema.index({ interactionType: 1 });

module.exports = mongoose.model('UserInteraction', UserInteractionSchema);
