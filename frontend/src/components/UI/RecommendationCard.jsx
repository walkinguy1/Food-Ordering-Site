/* eslint-disable no-unused-vars */
import React from 'react';
import { Card, CardBody } from './Card';
import './RecommendationCard.css';

/**
 * RecommendationCard - Display personalized menu item recommendation
 * Used in Home and Menu pages to show AI-powered suggestions
 */
export const RecommendationCard = ({
  item,
  vendor,
  reason = 'Recommended for you',
  method = 'hybrid',
  score = 0.85,
  onAddToCart,
  onView,
}) => {
  const methodLabels = {
    collaborative: '👥 Others liked this',
    content: '✨ Matches your taste',
    'item-based': '🎯 Similar to recent purchases',
    trending: '🔥 Trending now',
    hybrid: '⭐ Recommended for you',
  };

  return (
    <Card hoverable className="recommendation-card">
      <div className="recommendation-badge">{methodLabels[method] || reason}</div>
      
      <CardBody>
        <div className="recommendation-image">
          <img src={item.image || '/default-food.png'} alt={item.name} />
        </div>

        <h3 className="recommendation-title">{item.name}</h3>
        <p className="recommendation-vendor">{vendor?.name}</p>
        <p className="recommendation-description">{item.description}</p>

        <div className="recommendation-footer">
          <div className="recommendation-score">
            <span className="score-stars">{'⭐'.repeat(Math.round(item.rating || 4))}</span>
            <span className="score-value">{item.rating?.toFixed(1) || 'N/A'}</span>
          </div>

          <div className="recommendation-price">
            <span className="price">${item.price?.toFixed(2)}</span>
            {item.discount && (
              <span className="discount">-{Math.round(item.discount * 100)}%</span>
            )}
          </div>
        </div>

        <div className="recommendation-actions">
          <button onClick={onView} className="btn btn-ghost btn-sm">
            View Details
          </button>
          <button onClick={onAddToCart} className="btn btn-primary btn-sm">
            Add to Cart
          </button>
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * RecommendationCarousel - Display multiple recommendations in a scrollable list
 */
export const RecommendationCarousel = ({
  recommendations = [],
  loading = false,
  onAddToCart,
  onView,
}) => {
  if (loading) {
    return (
      <div className="recommendation-carousel">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="skeleton skeleton-card"></div>
          ))}
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="recommendation-empty">
        <p>No recommendations available yet.</p>
        <small>Browse items to get personalized suggestions</small>
      </div>
    );
  }

  return (
    <div className="recommendation-carousel">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.menuItemId}
          item={{ ...rec.item, id: rec.menuItemId }}
          vendor={rec.vendor}
          method={rec.method}
          score={rec.score}
          reason={rec.reason}
          onAddToCart={() => onAddToCart(rec.menuItemId)}
          onView={() => onView(rec.menuItemId)}
        />
      ))}
    </div>
  );
};

/**
 * RecommendationRow - Single row display for recommendations
 */
export const RecommendationRow = ({
  recommendation,
  onAddToCart,
  onView,
}) => {
  const methodIcons = {
    collaborative: '👥',
    content: '✨',
    'item-based': '🎯',
    trending: '🔥',
  };

  return (
    <div className="recommendation-row">
      <img src={recommendation.item?.image} alt={recommendation.item?.name} />
      
      <div className="recommendation-info">
        <h4>{recommendation.item?.name}</h4>
        <p>{recommendation.vendor?.name}</p>
        <div className="recommendation-confidence">
          <span className="badge badge-primary">
            {methodIcons[recommendation.method]} {Math.round(recommendation.score * 100)}% match
          </span>
        </div>
      </div>

      <div className="recommendation-price">
        <span className="price">${recommendation.item?.price?.toFixed(2)}</span>
      </div>

      <div className="recommendation-quick-actions">
        <button onClick={onView} className="btn-icon">
          👁️
        </button>
        <button onClick={onAddToCart} className="btn btn-primary btn-sm">
          Add
        </button>
      </div>
    </div>
  );
};
