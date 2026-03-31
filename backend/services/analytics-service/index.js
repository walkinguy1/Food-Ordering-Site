const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { connectRabbitMQ, consumeOrderEvents, consumePaymentEvents } = require('./utils/rabbitmq');
const OrderMetric = require('./models/OrderMetric');
const PaymentMetric = require('./models/PaymentMetric');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Analytics Service Running' });
});

const PORT = process.env.PORT || 4007;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/food_app_analytics?authSource=admin';

// Event handlers
const handleOrderEvent = async (event) => {
  console.log('Processing order event:', event.type || event.orderId);

  try {
    let metric = await OrderMetric.findOne({ orderId: event.orderId });

    if (!metric && event.status !== 'cancelled') {
      // Create new metric for order.created
      metric = new OrderMetric({
        orderId: event.orderId,
        customerId: event.customerId,
        vendorId: event.vendorId,
        amount: event.totalAmount,
        status: event.status || 'pending',
        paymentMethod: event.paymentMethod,
        createdAt: new Date(event.createdAt || Date.now())
      });
    }

    if (metric) {
      // Update status
      if (event.status) {
        metric.status = event.status;
      }

      // Track timing
      if (event.previousStatus && event.status) {
        const now = new Date();
        if (event.previousStatus === 'pending' && event.status === 'accepted') {
          metric.acceptedAt = now;
        } else if (event.status === 'delivered') {
          metric.deliveredAt = now;
          if (metric.createdAt) {
            metric.totalDuration = Math.round((now - metric.createdAt) / 60000); // minutes
          }
        }
      }

      await metric.save();
    }
  } catch (err) {
    console.error('Error processing order event:', err);
  }
};

const handlePaymentEvent = async (event) => {
  console.log('Processing payment event:', event.status || event.orderId);

  try {
    let metric = await PaymentMetric.findOne({ orderId: event.orderId });

    if (!metric) {
      metric = new PaymentMetric({
        orderId: event.orderId,
        customerId: event.customerId,
        vendorId: event.vendorId,
        amount: event.amount,
        currency: event.currency || 'USD',
        paymentMethod: event.paymentMethod,
        status: event.status || 'pending',
        initiatedAt: new Date()
      });
    } else {
      metric.status = event.status;
      if (event.status === 'completed') {
        metric.completedAt = new Date();
        if (metric.initiatedAt) {
          metric.processingTime = Math.round((metric.completedAt - metric.initiatedAt) / 1000); // seconds
        }
      } else if (event.status === 'failed') {
        metric.failedAt = new Date();
      } else if (event.status === 'refunded') {
        metric.refundedAt = new Date();
        metric.refundAmount = event.amount;
      }
    }

    await metric.save();
  } catch (err) {
    console.error('Error processing payment event:', err);
  }
};

// Initialize connections
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Analytics)');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Setup event consumers
    await consumeOrderEvents(handleOrderEvent);
    await consumePaymentEvents(handlePaymentEvent);

    // Start server
    app.listen(PORT, () => {
      console.log(`Analytics Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Analytics Service:', err);
    process.exit(1);
  }
};

startServer();
