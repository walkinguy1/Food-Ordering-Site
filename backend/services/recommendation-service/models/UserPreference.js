const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  preferences: {
    cuisineTypes: [{ type: String, weight: Number }], // [{ type: 'Italian', weight: 0.8 }]
    priceRange: { min: Number, max: Number },
    avgRating: { type: Number, min: 0, max: 5 },
    dietaryRestrictions: [String], // ['vegetarian', 'gluten-free']
    favoriteVendors: [{ vendorId: String, orders: { type: Number, default: 0 } }],
    itemCategories: [{ type: String, weight: Number }] // [{ type: 'Appetizer', weight: 0.6 }]
  },
  totalOrders: { type: Number, default: 0 },
  lastOrderedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserPreferenceSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
