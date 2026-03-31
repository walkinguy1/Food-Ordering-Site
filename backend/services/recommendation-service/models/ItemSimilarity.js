const mongoose = require('mongoose');

const ItemSimilaritySchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  similarItems: [{
    itemId: { type: String, required: true },
    similarity: { type: Number, min: 0, max: 1 }, // Similarity score (0-1)
    reason: String // 'same_vendor', 'same_cuisine', 'co_purchased', etc.
  }],
  vendorId: { type: String, required: true },
  category: String,
  cuisine: String,
  itemAttributes: {
    price: Number,
    rating: Number,
    vegetarian: Boolean,
    vegan: Boolean,
    glutenFree: Boolean,
    spicyLevel: Number
  },
  popularityScore: { type: Number, default: 0 }, // Based on purchase frequency
  cosineSimilarityCache: Map, // Cache for collaborative filtering
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

ItemSimilaritySchema.index({ itemId: 1 });
ItemSimilaritySchema.index({ vendorId: 1 });
ItemSimilaritySchema.index({ 'similarItems.similarity': -1 });

module.exports = mongoose.model('ItemSimilarity', ItemSimilaritySchema);
