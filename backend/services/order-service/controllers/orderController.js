const Order = require('../models/Order');
const { publishEvent } = require('../utils/rabbitmq');
const OrderSaga = require('../utils/order-saga');

// Initialize saga instance
let saga = null;

const initializeSaga = async () => {
  saga = new OrderSaga();
  await saga.init(process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672');
};

// Call this during server startup
const startSagaProcessor = async () => {
  try {
    await initializeSaga();
    console.log('Order Saga processor initialized');
  } catch (err) {
    console.error('Failed to initialize Order Saga:', err);
  }
};

// @desc    Create new order with Saga Pattern
// @route   POST /api/v1/orders
// @access  Private/Customer
const createOrder = async (req, res) => {
  try {
    const { customerId, vendorId, items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    const order = new Order({
      customerId,
      vendorId,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const createdOrder = await order.save();
    const orderData = {
      orderId: createdOrder._id.toString(),
      customerId,
      vendorId,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      createdAt: createdOrder.createdAt,
      status: createdOrder.status
    };

    // Publish initial order.created event
    publishEvent('order.created', orderData);

    // Start the saga workflow asynchronously
    if (saga) {
      saga.executeOrderSaga(orderData).catch(err => {
        console.error(`Saga failed for order ${createdOrder._id}:`, err);
      });
    }

    // Immediately return response to client
    res.status(201).json({
      success: true,
      order: createdOrder,
      message: 'Order created successfully. Processing...'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Vendor / Agent)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      const previousStatus = order.status;
      order.status = status;
      const updatedOrder = await order.save();

      // Publish order.status_updated event to RabbitMQ
      publishEvent('order.status_updated', {
        orderId: updatedOrder._id.toString(),
        customerId: updatedOrder.customerId,
        vendorId: updatedOrder.vendorId,
        previousStatus,
        status: updatedOrder.status,
        totalAmount: updatedOrder.totalAmount,
        updatedAt: updatedOrder.updatedAt
      });

      res.json({
        success: true,
        order: updatedOrder
      });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json({
        success: true,
        order
      });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private Customer
const getMyOrders = async (req, res) => {
  try {
    // In production, this would use authenticated user ID from middleware
    const customerId = req.user?.id || req.body.customerId || 'dummy_user_id';
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders (Admin/Vendor dashboard)
// @route   GET /api/v1/orders
// @access  Private Admin/Vendor
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get saga execution history for an order
// @route   GET /api/v1/orders/:id/saga-history
// @access  Private Admin
const getOrderSagaHistory = async (req, res) => {
  try {
    // In a production system, you'd store this in a separate audit log
    // For now, return a placeholder
    res.json({
      success: true,
      message: 'Saga execution history endpoint',
      orderId: req.params.id,
      note: 'Full history would be stored in audit service'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel an order (triggers compensation)
// @route   POST /api/v1/orders/:id/cancel
// @access  Private Customer/Admin
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    const previousStatus = order.status;
    order.status = 'cancelled';
    const cancelledOrder = await order.save();

    // Publish order cancellation event
    publishEvent('order.cancelled', {
      orderId: cancelledOrder._id.toString(),
      customerId: cancelledOrder.customerId,
      vendorId: cancelledOrder.vendorId,
      previousStatus,
      totalAmount: cancelledOrder.totalAmount,
      reason: req.body.reason || 'customer_requested',
      cancelledAt: new Date()
    });

    // This will trigger compensation transactions in the saga
    if (saga) {
      await saga.compensateOrder({
        orderId: cancelledOrder._id.toString(),
        ...cancelledOrder.toObject()
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: cancelledOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderById,
  getMyOrders,
  getAllOrders,
  getOrderSagaHistory,
  cancelOrder,
  startSagaProcessor
};
