const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

// Create notification
router.route('/send').post(createNotification);

// Get user notifications
router.route('/user/:userId').get(getUserNotifications);

// Mark notification as read
router.route('/:notificationId/read').put(markAsRead);

module.exports = router;
