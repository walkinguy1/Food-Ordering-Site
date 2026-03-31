const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  vendorId: { type: String, required: true }, // Referencing from Auth Service user ID
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  cuisine: { type: String },
  image: { type: String }, // URL or path
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 15 }, // in minutes
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  options: [{
    name: String,
    choices: [{
      name: String,
      additionalPrice: Number
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
