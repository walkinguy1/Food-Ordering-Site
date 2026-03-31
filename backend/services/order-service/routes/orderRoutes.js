const express = require('express');
const router = express.Router();
const {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getMyOrders,
  getAllOrders,
  getOrderSagaHistory,
  cancelOrder
} = require('../controllers/orderController');

// Get all orders (admin/vendor)
router.route('/').get(getAllOrders);

// Create new order
router.route('/').post(createOrder);

// Get my orders
router.route('/my-orders').get(getMyOrders);

// Get order by ID
router.route('/:id').get(getOrderById);

// Update order status
router.route('/:id/status').put(updateOrderStatus);

// Get saga execution history
router.route('/:id/saga-history').get(getOrderSagaHistory);

// Cancel order
router.route('/:id/cancel').post(cancelOrder);

module.exports = router;
