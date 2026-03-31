import { useState, useEffect } from 'react';
import { ownerService } from '../../services/ownerService';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, restaurantData] = await Promise.all([
          ownerService.getDashboardStats(),
          ownerService.getMyRestaurant()
        ]);
        setStats(statsData);
        setRestaurant(restaurantData);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="owner-header">
        <div>
          <h1 className="page-title">Restaurant Dashboard</h1>
          <p className="owner-restaurant-name">
            {restaurant?.name} - {restaurant?.cuisine_type}
          </p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card admin-stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total_menu_items}</div>
            <div className="stat-label">Menu Items</div>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total_orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending_orders}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">${stats.total_revenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-value">{stats.restaurant_rating.toFixed(1)}</div>
            <div className="stat-label">Restaurant Rating</div>
          </div>
        </div>
      </div>

      <div className="admin-quick-links">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          <a href="/owner/menu" className="quick-link-card">
            <span className="quick-link-icon">🍽️</span>
            <span className="quick-link-text">Manage Menu</span>
          </a>
          <a href="/owner/orders" className="quick-link-card">
            <span className="quick-link-icon">📦</span>
            <span className="quick-link-text">View Orders</span>
          </a>
          <a href="/owner/restaurant" className="quick-link-card">
            <span className="quick-link-icon">🏪</span>
            <span className="quick-link-text">Restaurant Info</span>
          </a>
        </div>
      </div>

      {restaurant && (
        <div className="owner-restaurant-info">
          <h2 className="section-title">Restaurant Information</h2>
          <div className="restaurant-info-card">
            <div className="restaurant-info-header">
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="restaurant-info-image"
              />
              <div className="restaurant-info-details">
                <h3>{restaurant.name}</h3>
                <p className="cuisine-badge">{restaurant.cuisine_type}</p>
                <p className="rating-display">⭐ {restaurant.rating.toFixed(1)} Rating</p>
                <p className="address-display">📍 {restaurant.address}</p>
              </div>
            </div>
            <p className="restaurant-description">{restaurant.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}