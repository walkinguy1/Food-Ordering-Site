> [!NOTE]
> This document is archived context. For setup, run, and operational instructions, use INSTRUCTION_MANUAL.md.

# ID-FLARE Implementation Guide - Phase 1 Complete

## Overview

This guide documents the implementation progress of the ID-FLARE (Intelligent Distributed Food Logistics and Recommendation Ecosystem) platform. Phase 1 of the development has focused on establishing the event-driven microservices foundation.

## ✅ Phase 1 Implementation Status (COMPLETE)

### 1.1 RabbitMQ Event-Driven Architecture
**Status**: ✅ **IMPLEMENTED**

#### What's Done:
- RabbitMQ connection utilities in each service
- Event exchange setup: `food_app_events` (topic exchange)
- Event publishing from Order Service
- Event consuming setup in Payment and Notification services

#### Key Files:
- `backend/services/order-service/utils/rabbitmq.js` - Order service broker integration
- `backend/services/payment-service/utils/rabbitmq.js` - Payment service listener
- `backend/services/notification-service/utils/rabbitmq.js` - Notification service listener

#### Events Generated:
```
order.created              - When customer places order
order.status_updated       - When order status changes
order.cancelled            - When order is cancelled
payment.completed          - When payment succeeds
payment.failed             - When payment fails
payment.refunded           - When payment is refunded
delivery.assign            - When delivery is assigned
inventory.reserved         - When items are reserved
inventory.release          - When items are released
```

### 1.2 Payment Service (New)
**Status**: ✅ **IMPLEMENTED**

#### Features:
- **Stripe Integration**: Full payment intent workflow
- **Multiple Payment Methods**: Stripe, Khalti, eSewa, Cash on Delivery
- **Payment Status Tracking**: pending → processing → completed/failed
- **Refund Processing**: Full and partial refunds
- **Order Event Consumption**: Listens to order.created events

#### API Endpoints:
```
POST   /api/v1/payments/initiate              - Initiate payment
POST   /api/v1/payments/verify-stripe         - Verify Stripe payment
GET    /api/v1/payments/:orderId              - Get payment status
POST   /api/v1/payments/:orderId/refund       - Process refund
```

#### Database Schema:
- Payment model with transaction IDs for each gateway
- Status tracking: pending, processing, completed, failed, refunded
- Metadata storage for gateway responses

#### How to Use:
```javascript
// Frontend
const response = await api.post('/api/v1/payments/initiate', {
  orderId: 'order123',
  customerId: 'cust456',
  amount: 99.99,
  paymentMethod: 'stripe',
  vendorId: 'vendor789'
});

// Get client secret for Stripe
const { clientSecret } = response.data;
// Use with Stripe.js on frontend

// After payment is confirmed by customer
await api.post('/api/v1/payments/verify-stripe', {
  paymentIntentId: 'pi_xxx'
});
```

### 1.3 Notification Service (New)
**Status**: ✅ **IMPLEMENTED**

#### Features:
- **Multiple Notification Types**: Email, SMS, In-App, Push
- **Email Templates**: Pre-built templates for order stages
- **Event-Driven**: Consumes order and payment events
- **In-App Notifications**: Stored in database for user retrieval
- **Notification History**: Full audit trail

#### API Endpoints:
```
POST   /api/v1/notifications/send             - Create notification
GET    /api/v1/notifications/user/:userId     - Get user notifications
PUT    /api/v1/notifications/:notificationId/read - Mark as read
```

#### Event Handlers:
- `order.created` → Order Confirmation email
- `order.status_updated` → Status Update email/in-app
- `payment.completed` → Payment Confirmation
- `payment.failed` → Payment Failure Alert
- `order.cancelled` → Cancellation Confirmation

#### Database Schema:
- Notification model with type, status, recipient
- Full event metadata storage
- Read/delivery tracking

### 1.4 Order Saga Pattern Implementation
**Status**: ✅ **IMPLEMENTED**

#### Architecture:
The Order Saga ensures distributed transaction consistency across multiple services:

1. **Order Creation** (Order Service)
   - Creates order record
   - Emits `order.created` event

2. **Inventory Reservation** (Inventory Service)
   - Listens to `order.created`
   - Reserves items
   - Emits `inventory.reserved`

3. **Payment Initiation** (Payment Service)
   - Listens to `order.created`
   - Initiates payment processing
   - Emits `payment.initiated`

4. **Payment Completion**
   - Customer completes payment
   - Gateway confirms
   - Emits `payment.completed`

5. **Order Confirmation** (Order Service)
   - Updates order status → accepted
   - Emits `order.status_updated`

6. **Delivery Assignment** (Logistics Service)
   - Listens to `order.status_updated`
   - Assigns delivery agent
   - Emits `delivery.assigned`

#### Compensation Transactions:
If any step fails, the saga triggers rollback:
- **Inventory Compensation**: Release reserved items
- **Payment Compensation**: Cancel payment authorization
- **Order Compensation**: Update order status to cancelled

#### Files:
- `backend/services/order-service/utils/order-saga.js` - Saga orchestrator
- `backend/services/order-service/controllers/orderController.js` - Enhanced with saga

#### New Order Endpoints:
```
POST   /api/v1/orders/:id/cancel              - Cancel order (triggers compensation)
GET    /api/v1/orders/:id/saga-history        - View saga execution history
```

### 1.5 Input Validation Schemas (New)
**Status**: ✅ **IMPLEMENTED**

#### Services with Validation:
- **Order Service**: Order creation, status updates, cancellation
- **Payment Service**: Payment initiation, verification, refunds
- **Auth Service**: Registration, login, profile updates, password changes

#### Validation Framework:
- Using `joi` for schema validation
- Request body validation middleware
- Detailed error messages with field-level information

#### Files:
- `backend/services/order-service/utils/validators.js`
- `backend/services/payment-service/utils/validators.js`
- `backend/services/auth-service/utils/validators.js`
- `backend/services/api-gateway/utils/validationMiddleware.js`

#### Usage Example:
```javascript
const { validateRequest } = require('./utils/validationMiddleware');
const { createOrderSchema } = require('./utils/validators');

router.post('/', validateRequest(createOrderSchema), createOrder);
```

### 1.6 Updated API Gateway
**Status**: ✅ **IMPLEMENTED**

#### New Routes:
- `/api/v1/payments/*` → Payment Service (4005)
- `/api/v1/notifications/*` → Notification Service (4006)

#### New Endpoint:
- `GET /health/services` - Returns health status of all backend services

#### Features:
- Service discovery health checks
- Timeout handling
- Error response propagation

### 1.7 Docker Integration
**Status**: ✅ **COMPLETED (Existing)**

#### Services Running:
- PostgreSQL 15 (Primary database - ready to use)
- MongoDB 6 (Currently used, to be migrated)
- Redis 7 (Cache layer)
- RabbitMQ 3 (Message broker - now active)

#### Updated docker-compose.yml:
- All services still configured
- RabbitMQ now actively used
- Ready for additional services

---

## 🔄 Current Data Flow Example

### Customer Places Order Flow:
```
1. Customer calls: POST /api/v1/orders
   └─ Order Service creates order

2. Order Service publishes: order.created event
   └─ RabbitMQ broadcasts event

3. Multiple services consume the event:
   ├─ Inventory Service: Reserves items
   ├─ Payment Service: Initiates payment processing
   └─ Notification Service: Sends confirmation email

4. Customer completes payment (frontend)
   └─ Frontend calls: POST /api/v1/payments/verify-stripe

5. Payment Service confirms and publishes: payment.completed

6. Notification Service receives payment.completed
   └─ Sends payment confirmation email

7. Order status updates to "accepted"
   └─ Logistics Service receives order.status_updated
   └─ Assigns delivery agent

8. Delivery Agent receives order assignment
   └─ Starts real-time location tracking
```

---

## ⚙️ Setup Instructions

### Prerequisites:
- Node.js 16+
- Docker & Docker Compose
- npm

### Installation:

1. **Clone Repository**
```bash
cd food-ordering-app
```

2. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Start Infrastructure**
```bash
# From backend directory
docker-compose up -d
# Starts: PostgreSQL, MongoDB, Redis, RabbitMQ
```

5. **Start Services**
```bash
# Terminal 1: API Gateway
npm run start:gateway

# Terminal 2: Auth Service
npm run start:auth

# Terminal 3: Order Service
npm run start:order

# Terminal 4: Inventory Service
npm run start:inventory

# Terminal 5: Payment Service
npm run start:payment

# Terminal 6: Notification Service
npm run start:notification

# Terminal 7: Logistics Service
npm run start:logistics

# Terminal 8: Frontend (from frontend directory)
npm run dev
```

6. **Verify Services**
```bash
curl http://localhost:4000/health/services
```

Expected response:
```json
{
  "auth": { "status": "up", "message": "Auth Service Running" },
  "inventory": { "status": "up", "message": "Inventory Service Running" },
  "orders": { "status": "up", "message": "Order Service Running" },
  "logistics": { "status": "up", "message": "Logistics Service Running" },
  "payment": { "status": "up", "message": "Payment Service Running" },
  "notification": { "status": "up", "message": "Notification Service Running" }
}
```

---

## 📋 Testing the Implementation

### Test Case 1: Place an Order
```bash
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust123",
    "vendorId": "vendor456",
    "items": [
      {
        "menuItemId": "item1",
        "name": "Burger",
        "quantity": 2,
        "price": 9.99
      }
    ],
    "totalAmount": 19.98,
    "deliveryAddress": {
      "lat": 27.7172,
      "lng": 85.3240,
      "address": "Kathmandu, Nepal"
    },
    "paymentMethod": "cod"
  }'
```

### Test Case 2: Initiate Stripe Payment
```bash
curl -X POST http://localhost:4000/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "<returned_order_id>",
    "customerId": "cust123",
    "vendorId": "vendor456",
    "amount": 19.98,
    "paymentMethod": "stripe"
  }'
```

### Test Case 3: Get User Notifications
```bash
curl http://localhost:4000/api/v1/notifications/user/cust123
```

### Test Case 4: Update Order Status
```bash
curl -X PUT http://localhost:4000/api/v1/orders/<order_id>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

---

## 🚀 What's Next (Phase 2)

### 2.1 Analytics Service (Not Started)
- Consume events from all services
- Real-time dashboard metrics
- Revenue tracking
- Peak hour analysis

### 2.2 Recommendation Engine (Not Started)
- Collaborative filtering
- Content-based recommendations
- Context-aware suggestions (time of day)
- Similar item recommendations

### 2.3 Demand Prediction System (Not Started)
- Time-series forecasting (ARIMA/LSTM)
- Vendor insights
- Inventory optimization

### 2.4 Enhanced Logistics (Not Started)
- Route optimization
- Multi-order batching
- Real-time ETA calculation
- Geospatial queries

### 2.5 Rate Limiting & Security (In Progress)
- API Gateway rate limiting
- Request signing for webhooks
- CORS configuration refinement

### 2.6 PostgreSQL Migration (Not Started)
- Migrate from MongoDB
- Establishing referential integrity
- Setting up transaction support
- Event sourcing table

---

## 📚 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                            │
│                      (Vite + Material-UI)                            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API Gateway (Port 4000)                         │
│                                                                         │
│  - Route /api/v1/auth     → Auth Service (4001)                       │
│  - Route /api/v1/orders   → Order Service (4003)                      │
│  - Route /api/v1/inventory → Inventory Service (4002)                │
│  - Route /api/v1/payments → Payment Service (4005)                   │
│  - Route /api/v1/notifications → Notification Service (4006)        │
│  - Route /api/v1/logistics → Logistics Service (4004)               │
│  - Health checks for all services                                    │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────────────────┐
        │              │                          │
        ▼              ▼                          ▼
   ┌─────────┐   ┌─────────┐           ┌──────────────────┐
   │  Auth   │   │  Order  │           │  Event Broker    │
   │ Service │   │ Service │           │   (RabbitMQ)     │
   │ (4001)  │   │ (4003)  │ ◄────────► │                  │
   └────┬────┘   └────┬────┘           │ Exchanges:       │
        │             │                │ - food_app_events│
        │             ▼                └──────┬───────────┘
        │        ┌──────────┐                 │
        │        │  Saga    │                 │
        │        │ Pattern  │                 │
        │        └──────────┘                 │
        │                                     │
        └─────────────────────┬───────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
          ┌─────────┐   ┌───────────┐  ┌──────────┐
          │ Payment │   │Inventory  │  │Notif.    │
          │ Service │   │ Service   │  │ Service  │
          │ (4005)  │   │ (4002)    │  │ (4006)   │
          └─────────┘   └───────────┘  └──────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
          ┌───────────────┐          ┌─────────────┐
          │   MongoDB     │          │    Redis    │
          │  (6 databases)│          │   (Cache)   │
          └───────────────┘          └─────────────┘
```

---

## 🔧 Configuration Reference

### Service Ports:
- API Gateway: 4000
- Auth Service: 4001
- Inventory Service: 4002
- Order Service: 4003 ✨ *Enhanced with Saga Pattern*
- Logistics Service: 4004
- Payment Service: 4005 ✨ *NEW*
- Notification Service: 4006 ✨ *NEW*

### Database Ports:
- PostgreSQL: 5432
- MongoDB: 27017
- Redis: 6379
- RabbitMQ: 5672 (AMQP), 15672 (Management)

### Environment Variables:
See `.env.example` for complete configuration

---

## 📞 Troubleshooting

### RabbitMQ Connection Issues:
```
Error: Failed to connect to RabbitMQ

Solution:
1. Check if RabbitMQ container is running: docker ps
2. Verify connection string in .env
3. Check RabbitMQ logs: docker logs food_app_rabbitmq
```

### Payment Service Not Starting:
```
Error: Stripe secret key not found

Solution:
1. Add STRIPE_SECRET_KEY to .env
2. Use test key: your-stripe-secret-test-key
3. Restart service
```

### Events Not Being Consumed:
```
Debug Steps:
1. Check RabbitMQ management UI: http://localhost:15672
2. Verify exchanges and queues are created
3. Check service logs for consumer initialization
4. Ensure event routing keys match exactly
```

---

## 📝 Next Steps for Developers

1. **Implement Rate Limiting** on API Gateway
2. **Add comprehensive logging** across services
3. **Setup automated testing** (unit + integration)
4. **Create subscription-based event consumers** for reliability
5. **Implement dead-letter queues** for failed events
6. **Add API documentation** with Swagger/OpenAPI
7. **Setup monitoring** with Prometheus/Grafana
8. **Implement service-to-service authentication**

---

## 📞 Support & Questions

For issues or questions:
1. Check the Architecture Review document
2. Review this implementation guide
3. Check service logs: `docker logs <service_name>`
4. Verify RabbitMQ Management UI for event flow

---

**Last Updated**: March 31, 2026
**Phase 1 Status**: ✅ Complete
**Next Phase**: Q2 2026
