import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="admin-stats-grid">
        <div className="stat-card admin-stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total_restaurants}</div>
            <div className="stat-label">Total Restaurants</div>
          </div>
        </div>

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
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card admin-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">${stats.total_revenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="admin-quick-links">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          <a href="/admin/restaurants" className="quick-link-card">
            <span className="quick-link-icon">🏪</span>
            <span className="quick-link-text">Manage Restaurants</span>
          </a>
          <a href="/admin/orders" className="quick-link-card">
            <span className="quick-link-icon">📦</span>
            <span className="quick-link-text">Manage Orders</span>
          </a>
          <a href="/admin/users" className="quick-link-card">
            <span className="quick-link-icon">👥</span>
            <span className="quick-link-text">View Users</span>
          </a>
        </div>
      </div>
    </div>
  );
}