const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/paymentRoutes');
const { connectRabbitMQ, consumeOrderEvents, publishEvent } = require('./utils/rabbitmq');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Payment Service Running' });
});

const PORT = process.env.PORT || 4005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/food_app_payments?authSource=admin';

// Event handler for order.created
const handleOrderCreated = async (orderEvent) => {
  console.log('Payment Service: Order created event received', orderEvent.orderId);
  // In a real system, you might auto-initiate payment processing here
  // or send notification to customer to proceed with payment
};

// Initialize connections
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Payments)');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Setup event consumers
    await consumeOrderEvents(handleOrderCreated);

    // Start server
    app.listen(PORT, () => {
      console.log(`Payment Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Payment Service:', err);
    process.exit(1);
  }
};

startServer();
