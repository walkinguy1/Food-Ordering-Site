# Food Ordering Platform Instruction Manual

Last updated: 2026-03-31

## 1) What this project contains

This repository is a full-stack food ordering platform with:
- A React + Vite frontend
- A Node.js microservices backend
- API Gateway + rate limiting
- RabbitMQ event-driven workflows
- MongoDB, Redis, PostgreSQL, RabbitMQ via Docker
- Recommendation and analytics services

Note: The deprecated Python backend folder (`backend-python-deprecated`) has been removed.

## 2) Architecture at a glance

- API Gateway: port 4000
- Auth Service: port 4001
- Inventory Service: port 4002
- Order Service: port 4003
- Logistics Service: port 4004
- Payment Service: port 4005
- Notification Service: port 4006
- Analytics Service: port 4007
- Recommendation Service: port 4008
- Frontend (Vite): port 5173

Core infra:
- MongoDB: 27017
- Redis: 6379
- RabbitMQ: 5672 (management UI: 15672)
- PostgreSQL: 5432

## 3) Prerequisites

Install these on your machine:
- Node.js 18+ (recommended)
- npm 9+
- Docker Desktop with Docker Compose
- Git

## 4) First-time setup

From repository root:

### 4.1 Install backend dependencies

```powershell
cd backend
npm install
```

### 4.2 Install frontend dependencies

```powershell
cd ../frontend
npm install
```

### 4.3 Environment variables

Create a `.env` file in repository root from `.env.example`.

Important values to review:
- JWT secret
- Stripe keys
- Khalti/eSewa keys
- SMTP credentials
- Service URLs and ports

## 5) Start the platform

Quick one-command option (from repository root):

```powershell
npm run dev:up
```

## 5.1 Start infrastructure (Docker)

From `backend`:

```powershell
docker compose up -d
```

Verify containers:

```powershell
docker ps
```

## 5.2 Start backend services

Open one terminal in `backend` and run each service in separate terminals, or run one at a time for testing.

```powershell
npm run start:gateway
npm run start:auth
npm run start:inventory
npm run start:order
npm run start:logistics
npm run start:payment
npm run start:notification
npm run start:analytics
npm run start:recommendations
```

Recommended startup order:
1. `start:auth`
2. `start:inventory`
3. `start:order`
4. `start:logistics`
5. `start:payment`
6. `start:notification`
7. `start:analytics`
8. `start:recommendations`
9. `start:gateway`

## 5.3 Start frontend

From `frontend`:

```powershell
npm run dev
```

Open:
- Frontend: http://localhost:5173
- API Gateway health: http://localhost:4000/health
- Service health map: http://localhost:4000/health/services
- RabbitMQ UI: http://localhost:15672 (admin/password)

## 6) How to use the app

## 6.1 Customer flow

1. Register/login from auth pages.
2. Browse home and menu pages.
3. Add items to cart.
4. Go through checkout:
- Delivery details
- Payment method (Card/Khalti/eSewa/COD)
- Review and place order
5. Track order updates.

## 6.2 Admin flow

1. Open admin dashboard pages.
2. Review analytics metrics and trends.
3. Manage users, menus, restaurants, and orders from admin pages.

## 6.3 Recommendation features

Recommendations are available in:
- Home page (carousel/cards)
- Menu page (recommendation rows)

## 7) Main API routes (via API Gateway)

Base URL:
- `http://localhost:4000`

Routed prefixes:
- `/api/v1/auth`
- `/api/v1/inventory`
- `/api/v1/orders`
- `/api/v1/payments`
- `/api/v1/notifications`
- `/api/v1/logistics`
- `/api/v1/analytics`
- `/api/v1/recommendations`

Health endpoints:
- `GET /health`
- `GET /health/services`

## 8) Event-driven behavior

RabbitMQ exchange:
- `food_app_events` (topic)

Important event examples:
- `order.created`
- `order.status_updated`
- `order.cancelled`
- `payment.completed`
- `payment.failed`

What happens automatically:
- Order creation triggers downstream workflows
- Payment results update order and notifications
- Analytics and recommendations consume relevant events

## 9) Known current status

Implemented and active:
- Event bus and consumers
- Payment service
- Notification service
- Saga pattern in order service
- API gateway rate limiting
- Analytics service
- Recommendation engine
- Frontend design system and component library

Still pending:
- Full migration from MongoDB usage to PostgreSQL for all services

## 10) Common developer tasks

## 10.1 Stop everything

```powershell
# Stop frontend/backend terminal processes with Ctrl + C
cd backend
docker compose down
```

Or use the one-command shutdown from repository root:

```powershell
npm run dev:down
```

## 10.2 Restart clean infrastructure

```powershell
cd backend
docker compose down -v
docker compose up -d
```

## 10.3 Reinstall dependencies

```powershell
cd backend
npm install
cd ../frontend
npm install
```

## 10.4 Build frontend for production

```powershell
cd frontend
npm run build
npm run preview
```

## 11) Troubleshooting quick guide

Issue: Gateway is up but services are down
- Check each backend service terminal for startup errors.
- Confirm MongoDB, Redis, and RabbitMQ containers are running.

Issue: RabbitMQ connection errors
- Confirm RabbitMQ container status.
- Validate `RABBITMQ_URL` and credentials.

Issue: Payment errors
- Validate Stripe/Khalti/eSewa keys in `.env`.
- Check payment service logs on port 4005.

Issue: Emails not sent
- Check SMTP credentials in `.env`.
- Verify notification service logs on port 4006.

Issue: Frontend API failures
- Confirm gateway is running on 4000.
- Confirm frontend uses correct base URL in API client config.

## 12) Recommended daily workflow

1. `docker compose up -d` in `backend`
2. Start backend services with npm scripts
3. Start frontend with `npm run dev`
4. Verify `GET /health/services`
5. Develop features
6. Shut down with Ctrl + C and `docker compose down`

## 13) Useful project docs

- `ARCHITECTURE_REVIEW.md`
- `PHASE_1_COMPLETION_SUMMARY.md`
- `PHASE_2_COMPLETION_SUMMARY.md`
- `PHASE_3_COMPLETION_SUMMARY.md`
- `PHASE_4_COMPLETION_SUMMARY.md`
- `PHASE_4_FINAL_SUMMARY.md`
- `UI_IMPROVEMENTS_DOCUMENTATION.md`
- `COMPONENT_QUICK_REFERENCE.md`

Documentation policy:
- `INSTRUCTION_MANUAL.md` is the single source of truth for setup and operation.
- Older phase and implementation documents are archived context and may not be fully up to date.

## 14) Optional next hardening steps

- Add one-command orchestration script to boot all Node services in parallel
- Add healthcheck script that blocks frontend start until backend is healthy
- Add seed script for demo data
- Add automated test runner and CI pipeline
