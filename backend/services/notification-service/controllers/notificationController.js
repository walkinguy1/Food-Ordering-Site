const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/mailer');

// @desc    Create and send a notification
// @route   POST /api/v1/notifications/send
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, recipient, relatedOrderId } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      recipient,
      relatedOrderId,
      status: 'pending'
    });

    // If email type, attempt to send immediately
    if (type === 'email' && recipient) {
      const emailResult = await sendEmail(recipient, title, message);
      
      if (emailResult.success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
      } else {
        notification.status = 'failed';
        notification.errorMessage = emailResult.error;
      }
    }

    // In-app notifications are stored as pending for user to retrieve
    if (type === 'in_app') {
      notification.status = 'pending';
    }

    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get notifications for a user
// @route   GET /api/v1/notifications/user/:userId
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.status = { $in: ['pending', 'sent'] };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date();
      const updatedNotification = await notification.save();
      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Process order.created event and send notifications
const handleOrderCreated = async (orderEvent) => {
  console.log('Processing order.created event:', orderEvent.orderId);

  // Create in-app notification for customer
  const inAppNotification = new Notification({
    userId: orderEvent.customerId,
    type: 'in_app',
    title: 'Order Confirmed',
    message: `Your order #${orderEvent.orderId} has been successfully placed. Total: $${orderEvent.totalAmount}`,
    relatedOrderId: orderEvent.orderId,
    eventType: 'order.created',
    status: 'pending',
    metadata: orderEvent
  });

  await inAppNotification.save();
};

// @desc    Process order.status_updated event and send notifications
const handleOrderStatusUpdated = async (orderEvent) => {
  console.log('Processing order.status_updated event:', orderEvent.orderId);

  let title = 'Order Status Updated';
  let message = `Your order #${orderEvent.orderId} status: ${orderEvent.status}`;

  const statusMessages = {
    accepted: `Your order has been accepted and is being prepared!`,
    preparing: `Your food is being prepared...`,
    ready: `Your order is ready for pickup/delivery!`,
    delivering: `Your order is on the way!`,
    delivered: `Your order has been delivered. Thank you!`,
    cancelled: `Your order has been cancelled.`
  };

  if (statusMessages[orderEvent.status]) {
    message = statusMessages[orderEvent.status];
  }

  const notification = new Notification({
    userId: orderEvent.customerId,
    type: 'in_app',
    title,
    message,
    relatedOrderId: orderEvent.orderId,
    eventType: 'order.status_updated',
    status: 'pending',
    metadata: orderEvent
  });

  await notification.save();
};

// @desc    Process payment.completed event
const handlePaymentCompleted = async (paymentEvent) => {
  console.log('Processing payment.completed event:', paymentEvent.orderId);

  const notification = new Notification({
    userId: paymentEvent.customerId,
    type: 'in_app',
    title: 'Payment Successful',
    message: `Payment of $${paymentEvent.amount} for order #${paymentEvent.orderId} has been confirmed.`,
    relatedOrderId: paymentEvent.orderId,
    eventType: 'payment.completed',
    status: 'pending',
    metadata: paymentEvent
  });

  await notification.save();
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  handleOrderCreated,
  handleOrderStatusUpdated,
  handlePaymentCompleted
};
