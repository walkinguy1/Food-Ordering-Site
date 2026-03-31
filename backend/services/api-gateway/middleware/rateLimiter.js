const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Create Redis client for distributed rate limiting
let redisClient = null;

const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });
    
    await redisClient.connect();
    console.log('Connected to Redis for rate limiting');
    return redisClient;
  } catch (err) {
    console.warn('Redis not available, using in-memory store for rate limiting', err.message);
    return null;
  }
};

// General API rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:general:'
    })
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/health/services';
  }
});

// Strict limiter for authentication endpoints: 5 requests per 15 minutes
const authLimiter = rateLimit({
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:auth:'
    })
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email + IP for login attempts
    return `${req.body?.email || 'unknown'}-${req.ip}`;
  }
});

// Moderate limiter for payment endpoints: 20 requests per 15 minutes
const paymentLimiter = rateLimit({
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:payment:'
    })
  }),
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Moderate limiter for order endpoints: 30 requests per 15 minutes
const orderLimiter = rateLimit({
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:order:'
    })
  }),
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many order requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Status code monitoring middleware
const statusCodeMonitor = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Log rate limit status
    if (res.getHeader('RateLimit-Limit')) {
      console.log(
        `[${req.method}] ${req.path} - Limit: ${res.getHeader('RateLimit-Limit')}, ` +
        `Remaining: ${res.getHeader('RateLimit-Remaining')}, ` +
        `Reset: ${res.getHeader('RateLimit-Reset')}`
      );
    }
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  initializeRedis,
  generalLimiter,
  authLimiter,
  paymentLimiter,
  orderLimiter,
  statusCodeMonitor
};
