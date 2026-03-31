const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const notificationRoutes = require('./routes/notificationRoutes');
const { connectRabbitMQ, consumeOrderEvents, consumePaymentEvents } = require('./utils/rabbitmq');
const {
  handleOrderCreated,
  handleOrderStatusUpdated,
  handlePaymentCompleted
} = require('./controllers/notificationController');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service Running' });
});

const PORT = process.env.PORT || 4006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/food_app_notifications?authSource=admin';

// Initialize connections
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Notifications)');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Setup event consumers
    await consumeOrderEvents(async (event) => {
      if (event.type === 'order.created' || event.orderId) {
        // Determine event type based on event structure
        if (event.previousStatus !== undefined) {
          await handleOrderStatusUpdated(event);
        } else {
          await handleOrderCreated(event);
        }
      }
    });

    await consumePaymentEvents(async (event) => {
      if (event.type === 'payment.completed' || event.status === 'completed') {
        await handlePaymentCompleted(event);
      }
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Notification Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Notification Service:', err);
    process.exit(1);
  }
};

startServer();
