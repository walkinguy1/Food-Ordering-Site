const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orderRoutes');
const { connectRabbitMQ } = require('./utils/rabbitmq');
const { startSagaProcessor } = require('./controllers/orderController');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Order Service Running' });
});

const PORT = process.env.PORT || 4003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/food_app_orders?authSource=admin';

// Initialize connections
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Orders)');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Initialize Order Saga processor
    await startSagaProcessor();

    // Start server
    app.listen(PORT, () => {
      console.log(`Order Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Order Service:', err);
    process.exit(1);
  }
};

startServer();
