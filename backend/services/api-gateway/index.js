const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const {
  initializeRedis,
  generalLimiter,
  authLimiter,
  paymentLimiter,
  orderLimiter,
  statusCodeMonitor
} = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(statusCodeMonitor);

// Initialize rate limiting with Redis
const initGateway = async () => {
  try {
    await initializeRedis();
  } catch (err) {
    console.warn('Rate limiting initialized in memory mode:', err.message);
  }
};

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Proxy configuration
const services = {
  auth: process.env.AUTH_URL || 'http://localhost:4001',
  inventory: process.env.INVENTORY_URL || 'http://localhost:4002',
  orders: process.env.ORDERS_URL || 'http://localhost:4003',
  logistics: process.env.LOGISTICS_URL || 'http://localhost:4004',
  payment: process.env.PAYMENT_URL || 'http://localhost:4005',
  notification: process.env.NOTIFICATION_URL || 'http://localhost:4006',
  recommendations: process.env.RECOMMENDATIONS_URL || 'http://localhost:4008',
  analytics: process.env.ANALYTICS_URL || 'http://localhost:4007'
};

// Auth routes with strict rate limiting
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Auth service unavailable' });
  }
}));

// Inventory routes
app.use('/api/v1/inventory', createProxyMiddleware({
  target: services.inventory,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Inventory service unavailable' });
  }
}));

// Order routes with moderate rate limiting
app.use('/api/v1/orders', orderLimiter);
app.use('/api/v1/orders', createProxyMiddleware({
  target: services.orders,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Order service unavailable' });
  }
}));

// Payment routes with moderate rate limiting
app.use('/api/v1/payments', paymentLimiter);
app.use('/api/v1/payments', createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Payment service unavailable' });
  }
}));

// Notification routes
app.use('/api/v1/notifications', createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Notification service unavailable' });
  }
}));

// Logistics routes
app.use('/api/v1/logistics', createProxyMiddleware({
  target: services.logistics,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Logistics service unavailable' });
  }
}));

// Recommendation routes
app.use('/api/v1/recommendations', createProxyMiddleware({
  target: services.recommendations,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Recommendation service unavailable' });
  }
}));

// Analytics routes
app.use('/api/v1/analytics', createProxyMiddleware({
  target: services.analytics,
  changeOrigin: true,
  onError: (err, req, res) => {
    res.status(503).json({ success: false, message: 'Analytics service unavailable' });
  }
}));

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway Running' });
});

// Service health check
app.get('/health/services', async (req, res) => {
  const serviceHealth = {};

  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 2000 });
      serviceHealth[name] = { status: 'up', message: response.data.status };
    } catch (err) {
      serviceHealth[name] = { status: 'down', message: err.message };
    }
  }

  res.status(200).json(serviceHealth);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal gateway error'
  });
});

const PORT = process.env.PORT || 4000;

// Start server
const start = async () => {
  try {
    await initGateway();
    app.listen(PORT, () => {
      console.log(`API Gateway listening on port ${PORT}`);
      console.log('Rate limiting: ENABLED');
    });
  } catch (err) {
    console.error('Failed to start gateway:', err);
    process.exit(1);
  }
};

start();
