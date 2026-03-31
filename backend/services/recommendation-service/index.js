const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const recommendationRoutes = require('./routes/recommendationRoutes');
const { connectRabbitMQ, consumeOrderEvents, consumeInteractionEvents } = require('./utils/rabbitmq');
const UserPreference = require('./models/UserPreference');
const UserInteraction = require('./models/UserInteraction');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/recommendations', recommendationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Recommendation Service Running' });
});

const PORT = process.env.PORT || 4008;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/food_app_recommendations?authSource=admin';

// Event handler for order creation
const handleOrderEvent = async (event) => {
  console.log('Processing order event for recommendations:', event.orderId);

  try {
    // Create user interactions for each item in order
    if (event.items && Array.isArray(event.items)) {
      for (const item of event.items) {
        await UserInteraction.create({
          userId: event.customerId,
          menuItemId: item.menuItemId,
          vendorId: event.vendorId,
          interactionType: 'purchase',
          quantity: item.quantity || 1,
          timestamp: new Date()
        });
      }
    }

    // Update user preference
    let userPref = await UserPreference.findOne({ userId: event.customerId });
    if (!userPref) {
      userPref = new UserPreference({
        userId: event.customerId,
        preferences: { cuisineTypes: [], favoriteVendors: [] },
        totalOrders: 0
      });
    }

    userPref.totalOrders += 1;
    userPref.lastOrderedAt = new Date();

    // Track vendor
    const vendorIdx = userPref.preferences.favoriteVendors.findIndex(v => v.vendorId === event.vendorId);
    if (vendorIdx > -1) {
      userPref.preferences.favoriteVendors[vendorIdx].orders += 1;
    } else {
      userPref.preferences.favoriteVendors.push({ vendorId: event.vendorId, orders: 1 });
    }

    await userPref.save();
    console.log(`Updated preferences for user: ${event.customerId}`);
  } catch (err) {
    console.error('Error processing order event:', err);
  }
};

// Event handler for user interactions (view, rate, etc.)
const handleInteractionEvent = async (event) => {
  console.log('Processing interaction event:', event.type);

  try {
    const interaction = new UserInteraction({
      userId: event.userId,
      menuItemId: event.menuItemId,
      vendorId: event.vendorId,
      interactionType: event.type,
      rating: event.rating,
      sessionId: event.sessionId
    });

    await interaction.save();
    console.log(`Logged ${event.type} interaction for user ${event.userId}`);
  } catch (err) {
    console.error('Error processing interaction event:', err);
  }
};

// Initialize connections
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB (Recommendations)');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Setup event consumers
    await consumeOrderEvents(handleOrderEvent);
    await consumeInteractionEvents(handleInteractionEvent);

    // Start server
    app.listen(PORT, () => {
      console.log(`Recommendation Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Recommendation Service:', err);
    process.exit(1);
  }
};

startServer();
