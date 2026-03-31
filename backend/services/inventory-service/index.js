const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const inventoryRoutes = require('./routes/inventoryRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/inventory', inventoryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Inventory Service Running' });
});

const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/food_app_inventory?authSource=admin';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB (Inventory)');
    app.listen(PORT, () => {
      console.log(`Inventory Service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
