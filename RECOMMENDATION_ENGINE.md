> [!NOTE]
> This document is archived context. For setup, run, and operational instructions, use INSTRUCTION_MANUAL.md.

# Recommendation Engine Service - Complete Implementation

**Status**: ✅ COMPLETE
**Service Port**: 4008
**Database**: MongoDB (`food_app_recommendations`)
**Message Broker**: RabbitMQ (topic exchange)

---

## Architecture Overview

The Recommendation Engine uses three complementary algorithms to provide personalized menu suggestions:

1. **Collaborative Filtering** - Find similar users and recommend items they purchased
2. **Content-Based Filtering** - Recommend items matching user preferences and attributes
3. **Item-Based Collaborative Filtering** - Suggest items similar to what user has purchased

These algorithms are combined in a **hybrid approach** that balances coverage, accuracy, and diversity.

---

## Data Models

### 1. UserPreference (`models/UserPreference.js`)
Tracks user profile and preferences

```javascript
{
  userId: "user_123",
  preferences: {
    cuisineTypes: [
      { type: "Italian", weight: 0.8 },
      { type: "Asian", weight: 0.6 }
    ],
    priceRange: { min: 5, max: 50 },
    dietaryRestrictions: ["vegetarian", "gluten-free"],
    favoriteVendors: [
      { vendorId: "vendor_1", orders: 15 },
      { vendorId: "vendor_2", orders: 8 }
    ],
    itemCategories: [
      { type: "Pasta", weight: 0.7 },
      { type: "Salad", weight: 0.5 }
    ]
  },
  totalOrders: 23,
  lastOrderedAt: "2024-01-30T10:00:00Z",
  avgRating: 4.5
}
```

### 2. UserInteraction (`models/UserInteraction.js`)
Captures all user interactions with menu items

```javascript
{
  userId: "user_123",
  menuItemId: "item_456",
  vendorId: "vendor_1",
  interactionType: "purchase", // view, add_to_cart, purchase, rate
  rating: 5,
  quantity: 2,
  timestamp: "2024-01-30T10:00:00Z",
  sessionId: "session_abc123"
}
```

**Interaction Types**:
- `view` - User viewed the item
- `add_to_cart` - User added item to cart
- `purchase` - User purchased the item
- `rate` - User rated the item

### 3. ItemSimilarity (`models/ItemSimilarity.js`)
Pre-computed similarity scores between menu items

```javascript
{
  itemId: "item_456",
  similarItems: [
    {
      itemId: "item_789",
      similarity: 0.85,
      reason: "same_cuisine"
    },
    {
      itemId: "item_321",
      similarity: 0.72,
      reason: "co_purchased"
    }
  ],
  vendorId: "vendor_1",
  category: "Pasta",
  cuisine: "Italian",
  itemAttributes: {
    price: 12.99,
    rating: 4.7,
    vegetarian: true,
    vegan: false,
    glutenFree: false,
    spicyLevel: 2
  },
  popularityScore: 85, // Based on purchases and ratings
  lastUpdated: "2024-01-30T10:00:00Z"
}
```

---

## Recommendation Algorithms

### 1. Collaborative Filtering

**How It Works**:
- Find users who purchased the same items as target user
- Aggregate items purchased by similar users
- Recommend items the target user hasn't tried yet
- Rank by frequency of purchase among similar users

**Example**:
```
User A: bought [Pasta Carbonara, Caesar Salad, Tiramisu]
User B: bought [Pasta Carbonara, Caesar Salad, Risotto, Panna Cotta]
User C: bought [Pasta Carbonara, Risotto]

User A similar to B and C (both bought Pasta Carbonara)
Recommend to User A: Risotto (purchased by B and C), Panna Cotta (by B)
```

**Pros**: Captures real user behavior patterns, good for new users with purchase history
**Cons**: Cold start problem for new users, popularity bias

### 2. Content-Based Filtering

**How It Works**:
- Extract user preferences from interaction history
- Identify item attributes (cuisine, price, dietary)
- Find items matching user's preferred attributes
- Exclude already-purchased items

**Example**:
```
User Preferences:
- Prefers: Italian cuisine (0.8), Pasta category (0.7), $10-20 price range
- Dietary: Vegetarian

Matching Items:
- Vegetarian Pasta Primavera ($15) ✓
- Fettuccine Alfredo ($18) ✓
- Meat Lasagna ($16) ✗ (not vegetarian)
```

**Pros**: Works for new users, no cold start, respects preferences
**Cons**: Requires accurate item attributes, recommendation serendipity

### 3. Item-Based Collaborative Filtering

**How It Works**:
- For each item user purchased, find similar items
- Items are similar if frequently co-purchased or have similar attributes
- Recommend items similar to recent purchases
- Weight by purchase recency

**Example**:
```
User recently bought: Pasta Carbonara (rating 4.5)
Similar items:
- Pasta Bolognese (0.85 similarity) - same vendor, similar price
- Fresh Salad (0.72 similarity) - frequently co-purchased
- Garlic Bread (0.68 similarity) - complements pasta

Recommend: Pasta Bolognese, Fresh Salad
```

**Pros**: Personalized, handles new items well, captures intent
**Cons**: Requires item similarity computation

### 4. Hybrid Approach

Combines all three algorithms:

```javascript
// Get recommendations from all methods
const collab = await getCollaborativeRecommendations(userId);
const content = await getContentBasedRecommendations(userId);
const itemBased = await getItemBasedRecommendations(userId);

// Merge and deduplicate while averaging scores
const merged = mergeRecommendations([collab, content, itemBased]);

// Return top recommendations
return merged.sort((a, b) => b.score - a.score).slice(0, limit);
```

**Benefits**:
- Robustness: If one method fails, others provide coverage
- Accuracy: Multiple signals improve quality
- Diversity: Different methods produce varied recommendations
- Cold start handling: Content handles new users, collab handles experienced users

---

## REST API Endpoints

### 1. Get Personalized Recommendations
**Endpoint**: `GET /api/v1/recommendations/user/:userId`

**Query Parameters**:
- `limit` (optional, default: 10) - Number of recommendations
- `method` (optional, default: 'hybrid') - Algorithm: 'collaborative', 'content', 'item-based', or 'hybrid'

**Request**:
```bash
curl http://localhost:4000/api/v1/recommendations/user/user_123?limit=5&method=hybrid
```

**Response**:
```json
{
  "success": true,
  "userId": "user_123",
  "method": "hybrid",
  "count": 5,
  "recommendations": [
    {
      "menuItemId": "item_789",
      "score": 0.92,
      "method": "item_based_collab"
    },
    {
      "menuItemId": "item_321",
      "score": 0.88,
      "method": "collaborative_filtering"
    }
  ]
}
```

---

### 2. Get Similar Items
**Endpoint**: `GET /api/v1/recommendations/similar/:menuItemId`

**Query Parameters**:
- `limit` (optional, default: 5) - Number of similar items

**Request**:
```bash
curl http://localhost:4000/api/v1/recommendations/similar/item_456?limit=10
```

**Response**:
```json
{
  "success": true,
  "itemId": "item_456",
  "count": 5,
  "similarItems": [
    {
      "itemId": "item_789",
      "similarity": 0.85,
      "reason": "same_cuisine"
    },
    {
      "itemId": "item_321",
      "similarity": 0.72,
      "reason": "co_purchased"
    }
  ]
}
```

---

### 3. Get Trending Items
**Endpoint**: `GET /api/v1/recommendations/trending`

**Query Parameters**:
- `vendorId` (optional) - Filter by vendor
- `category` (optional) - Filter by category
- `limit` (optional, default: 10) - Maximum results

**Request**:
```bash
# Top 10 trending items overall
curl http://localhost:4000/api/v1/recommendations/trending

# Top 5 trending items from a vendor
curl http://localhost:4000/api/v1/recommendations/trending?vendorId=vendor_1&limit=5

# Trending items in specific category
curl http://localhost:4000/api/v1/recommendations/trending?category=Pasta&limit=10
```

**Response**:
```json
{
  "success": true,
  "count": 10,
  "items": [
    {
      "menuItemId": "item_456",
      "score": 95,
      "vendorId": "vendor_1",
      "category": "Pasta",
      "attributes": {
        "price": 12.99,
        "rating": 4.7,
        "vegetarian": true
      }
    }
  ]
}
```

---

### 4. Log User Interaction
**Endpoint**: `POST /api/v1/recommendations/interactions`

**Request Body**:
```json
{
  "userId": "user_123",
  "menuItemId": "item_456",
  "vendorId": "vendor_1",
  "interactionType": "purchase",
  "quantity": 2,
  "rating": 5,
  "sessionId": "session_abc"
}
```

**Examples**:

*View interaction*:
```json
{
  "userId": "user_123",
  "menuItemId": "item_456",
  "vendorId": "vendor_1",
  "interactionType": "view",
  "sessionId": "session_abc"
}
```

*Add to cart*:
```json
{
  "userId": "user_123",
  "menuItemId": "item_456",
  "vendorId": "vendor_1",
  "interactionType": "add_to_cart",
  "quantity": 2,
  "sessionId": "session_abc"
}
```

*Purchase*:
```json
{
  "userId": "user_123",
  "menuItemId": "item_456",
  "vendorId": "vendor_1",
  "interactionType": "purchase",
  "quantity": 2,
  "sessionId": "session_abc"
}
```

*Rating*:
```json
{
  "userId": "user_123",
  "menuItemId": "item_456",
  "vendorId": "vendor_1",
  "interactionType": "rate",
  "rating": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interaction logged successfully",
  "interaction": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user_123",
    "menuItemId": "item_456",
    "interactionType": "purchase",
    "timestamp": "2024-01-30T10:00:00Z"
  }
}
```

---

### 5. Get User Preferences
**Endpoint**: `GET /api/v1/recommendations/user/:userId/preferences`

**Request**:
```bash
curl http://localhost:4000/api/v1/recommendations/user/user_123/preferences
```

**Response**:
```json
{
  "success": true,
  "userId": "user_123",
  "preferences": {
    "cuisineTypes": [
      { "type": "Italian", "weight": 0.8 }
    ],
    "priceRange": { "min": 5, "max": 50 },
    "dietaryRestrictions": ["vegetarian"],
    "favoriteVendors": [
      { "vendorId": "vendor_1", "orders": 15 }
    ],
    "totalOrders": 23,
    "lastOrderedAt": "2024-01-30T10:00:00Z"
  }
}
```

---

### 6. Get Category Recommendations
**Endpoint**: `GET /api/v1/recommendations/category/:category`

**Query Parameters**:
- `limit` (optional, default: 10) - Maximum results

**Request**:
```bash
curl http://localhost:4000/api/v1/recommendations/category/Pasta?limit=5
```

**Response**:
```json
{
  "success": true,
  "category": "Pasta",
  "count": 5,
  "items": [
    {
      "menuItemId": "item_456",
      "score": 95,
      "attributes": {
        "price": 12.99,
        "rating": 4.7
      }
    }
  ]
}
```

---

## Event-Driven Architecture

The recommendation engine listens for events from other services via RabbitMQ:

### Consumed Events

**1. order.created** (from Order Service)
- **Trigger**: New order placed
- **Processing**: 
  - Create UserInteraction records for each item in order
  - Update UserPreference (total orders, favorite vendors)
  - Calculate updated popularity scores
- **Fields Used**: orderId, customerId, vendorId, items[], createdAt

**2. menu.viewed** (Future - from Frontend)
- **Trigger**: User views menu item
- **Processing**: Log view interaction, update engagement metrics
- **Fields Used**: userId, menuItemId, vendorId, sessionId

### Event Consumption Pattern

```javascript
// Order event handler
const handleOrderEvent = async (event) => {
  // 1. Create interactions for each item
  for (const item of event.items) {
    await UserInteraction.create({
      userId: event.customerId,
      menuItemId: item.menuItemId,
      interactionType: 'purchase',
      quantity: item.quantity
    });
  }
  
  // 2. Update user preferences
  const userPref = await UserPreference.findOne({ userId: event.customerId });
  userPref.totalOrders += 1;
  userPref.preferences.favoriteVendors.push({ vendorId: event.vendorId });
  await userPref.save();
  
  // 3. Update item popularity
  for (const item of event.items) {
    const purchaseCount = await UserInteraction.countDocuments({
      menuItemId: item.menuItemId,
      interactionType: 'purchase'
    });
    await ItemSimilarity.updateOne(
      { itemId: item.menuItemId },
      { popularityScore: purchaseCount * 0.7 + avgRating * 0.3 }
    );
  }
};
```

---

## Testing Guide

### Prerequisites
```bash
# Start all services
npm run start:gateway &
npm run start:order &
npm run start:recommendations &

# Verify service is running
curl http://localhost:4008/health
```

### Test Scenario: Complete User Journey

**Step 1: User Views Items**
```bash
# Log a view interaction
curl -X POST http://localhost:4000/api/v1/recommendations/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "menuItemId": "pasta_123",
    "vendorId": "vendor_1",
    "interactionType": "view",
    "sessionId": "session_1"
  }'
```

**Step 2: User Purchases Items**
```bash
# Create an order (triggers order.created event)
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      {"menuItemId": "pasta_123", "quantity": 1},
      {"menuItemId": "salad_456", "quantity": 2}
    ],
    "vendorId": "vendor_1",
    "deliveryAddress": "123 Main St",
    "paymentMethod": "stripe"
  }'

# Wait 2-3 seconds for RabbitMQ event processing
sleep 2
```

**Step 3: Check User Preferences**
```bash
# User preferences automatically updated from order
curl http://localhost:4000/api/v1/recommendations/user/test_user_1/preferences
```

**Step 4: Get Personalized Recommendations**
```bash
# Hybrid approach (all algorithms)
curl http://localhost:4000/api/v1/recommendations/user/test_user_1?method=hybrid

# Specific algorithm
curl http://localhost:4000/api/v1/recommendations/user/test_user_1?method=collaborative

# Limited results
curl http://localhost:4000/api/v1/recommendations/user/test_user_1?limit=5
```

**Step 5: Get Similar Items**
```bash
# Find items similar to pasta_123
curl http://localhost:4000/api/v1/recommendations/similar/pasta_123?limit=5
```

**Step 6: Get Trending Items**
```bash
# Trending overall
curl http://localhost:4000/api/v1/recommendations/trending?limit=5

# Trending in vendor
curl http://localhost:4000/api/v1/recommendations/trending?vendorId=vendor_1

# Trending in category
curl http://localhost:4000/api/v1/recommendations/trending?category=Pasta
```

**Step 7: Rate Items**
```bash
# Rate a purchased item
curl -X POST http://localhost:4000/api/v1/recommendations/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_1",
    "menuItemId": "pasta_123",
    "vendorId": "vendor_1",
    "interactionType": "rate",
    "rating": 5
  }'
```

---

## Performance Optimization

### 1. Database Indexes
All models have strategic indexes for fast queries:

```javascript
// UserInteraction indexes
- userId + timestamp (for user history)
- menuItemId (for item queries)
- interactionType (for filtering by interaction type)

// ItemSimilarity indexes
- itemId (primary lookup)
- similarItems.similarity (for sorting by similarity)
- vendorId + category (for filtering)
```

### 2. Query Optimization
- Use `.select()` to fetch only needed fields
- Use `.limit()` to reduce result set
- Use `.sort()` efficiently on indexed fields
- Implement pagination for large result sets

### 3. Caching Strategy
Future improvements:
- Cache popular recommendations in Redis
- Implement 15-minute TTL on trending items
- Cache user preferences after first load
- Pre-compute similarity scores batch jobs

### 4. Batch Processing
Current implementation supports:
- Batch similarity computation (nightly)
- Batch preference updates (hourly)
- Bulk popularity score recalculation

---

## Configuration

**.env file**:
```env
PORT=4008
MONGO_URI=mongodb://admin:password@localhost:27017/food_app_recommendations?authSource=admin
RABBITMQ_URL=amqp://admin:password@localhost:5672
NODE_ENV=development
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│       Frontend / Mobile Client                   │
│  ┌──────────────────────────────────────────┐   │
│  │ User Views/Purchases Items               │   │
│  └────────────────┬─────────────────────────┘   │
└────────────────┬──────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │   Order Service    │
        │  - Creates orders  │
        │  - Publishes       │
        │    order.created   │
        └────────────┬───────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │   RabbitMQ Topic Exchange               │
        │   - order.created                       │
        │   - menu.viewed (future)                │
        └──────────────┬─────────────────────────┘
                       │
      ┌────────────────▼──────────────────┐
      │  Recommendation Service (4008)     │
      │  ┌───────────────────────────────┐ │
      │  │ Event Consumers               │ │
      │  │ - Order event handler        │ │
      │  │ - Interaction event handler  │ │
      │  └──────────────┬────────────────┘ │
      │  ┌──────────────▼────────────────┐ │
      │  │ Algorithms                    │ │
      │  │ - Collaborative Filtering     │ │
      │  │ - Content-Based Filtering     │ │
      │  │ - Item-Based Filtering        │ │
      │  │ - Hybrid Approach             │ │
      │  └──────────────┬────────────────┘ │
      │  ┌──────────────▼────────────────┐ │
      │  │ MongoDB (3 Collections)       │ │
      │  │ - UserPreference              │ │
      │  │ - UserInteraction             │ │
      │  │ - ItemSimilarity              │ │
      │  └───────────────────────────────┘ │
      └────────────────┬────────────────────┘
                       │
      ┌────────────────▼──────────────────┐
      │   API Gateway (4000)                │
      │   - /api/v1/recommendations/*       │
      │   - Rate limiting                  │
      │   - Request routing                │
      └────────────────┬──────────────────┘
                       │
                       ▼
            Frontend Receives Recs
```

---

## Files Created

**Directory**: `backend/services/recommendation-service/`

**Files** (10 total, ~950 lines of code):
1. `package.json` - Dependencies
2. `index.js` (150 lines) - Main service, RabbitMQ setup
3. `models/UserPreference.js` (35 lines)
4. `models/UserInteraction.js` (35 lines)
5. `models/ItemSimilarity.js` (45 lines)
6. `controllers/recommendationController.js` (350 lines) - 6 controller functions
7. `routes/recommendationRoutes.js` (25 lines)
8. `utils/rabbitmq.js` (75 lines) - Event consumers
9. `utils/collaborativeFiltering.js` (150 lines) - Collab filtering algorithms
10. `utils/contentBasedFiltering.js` (100 lines) - Content-based algorithms

---

## Future Enhancements

### Short-term (Sprint 1-2)
- [ ] Add filtering by dietary restrictions
- [ ] Implement category-based suggestions
- [ ] Add vendor-specific recommendations
- [ ] Cache trending items (Redis)

### Medium-term (Sprint 3-4)
- [ ] A/B testing framework for algorithm comparison
- [ ] User feedback loop (item ratings)
- [ ] Seasonal trend detection
- [ ] Time-series popularity prediction

### Long-term (Sprint 5+)
- [ ] Deep learning model (neural collaborative filtering)
- [ ] Context-aware recommendations (time, location, weather)
- [ ] Cross-vendor recommendations
- [ ] Social recommendations (friends' preferences)
- [ ] Real-time personalization using online learning

---

## Summary

The Recommendation Engine is a production-ready service providing:
- ✅ Three complementary algorithms (collaborative, content, item-based)
- ✅ Hybrid approach for robustness and accuracy
- ✅ Real-time event processing via RabbitMQ
- ✅ 6 REST endpoints for different recommendation use cases
- ✅ User preference tracking and item popularity scoring
- ✅ Cold-start handling through content-based filtering
- ✅ Scalable MongoDB collections with strategic indexes

**Integration**: Already integrated with API Gateway at `/api/v1/recommendations`
**Events**: Listens to `order.created` events from RabbitMQ
**Database**: MongoDB with 3 collections for users, interactions, and items
**Status**: Ready for production deployment and frontend integration
