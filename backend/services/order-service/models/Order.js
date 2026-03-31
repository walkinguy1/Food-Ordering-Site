const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true }, // from auth-service
  vendorId: { type: String, required: true },   // from auth-service
  items: [{
    menuItemId: { type: String, required: true }, // from inventory-service
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'stripe', 'khalti', 'esewa'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  assignedAgentId: { type: String }, // from auth-service / logistics-service
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
