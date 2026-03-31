/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { ownerService } from '../../services/ownerService';

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, restaurantData] = await Promise.all([
        ownerService.getMyOrders(),
        ownerService.getMyRestaurant()
      ]);
      setOrders(ordersData);
      setRestaurant(restaurantData);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ownerService.updateOrderStatus(orderId, newStatus);
      fetchData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      preparing: '#9c27b0',
      ready: '#4caf50',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="owner-restaurant-name">{restaurant?.name}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="admin-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({orders.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({orders.filter(o => o.status === 'confirmed').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`}
          onClick={() => setFilter('preparing')}
        >
          Preparing ({orders.filter(o => o.status === 'preparing').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'ready' ? 'active' : ''}`}
          onClick={() => setFilter('ready')}
        >
          Ready ({orders.filter(o => o.status === 'ready').length})
        </button>
      </div>

      <div className="owner-orders-grid">
        {filteredOrders.map(order => (
          <div key={order.id} className="owner-order-card">
            <div className="owner-order-header">
              <div className="owner-order-id">
                <h3>Order #{order.id}</h3>
                <span className="order-time">
                  {new Date(order.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status}
              </span>
            </div>

            <div className="owner-order-customer">
              <div className="customer-details">
                <span className="customer-label">Customer:</span>
                <span className="customer-name">{order.user_name || 'N/A'}</span>
              </div>
              <div className="customer-details">
                <span className="customer-label">Contact:</span>
                <span className="customer-email">{order.user_email}</span>
              </div>
            </div>

            <div className="owner-order-address">
              <strong>Delivery Address:</strong>
              <p>{order.delivery_address}</p>
            </div>

            {order.special_instructions && (
              <div className="owner-order-instructions">
                <strong>Special Instructions:</strong>
                <p>{order.special_instructions}</p>
              </div>
            )}

            <div className="owner-order-items-summary">
              <button 
                className="view-items-btn"
                onClick={() => toggleExpand(order.id)}
              >
                {expandedOrder === order.id ? '▼' : '▶'} {order.items_count} items - ${order.total_amount.toFixed(2)}
              </button>
            </div>

            {expandedOrder === order.id && (
              <div className="owner-order-items-detail">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-detail">
                    <span className="item-detail-name">
                      {item.item_name} <span className="item-qty">×{item.quantity}</span>
                    </span>
                    <span className="item-detail-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="owner-order-actions">
              <label className="status-update-label">Update Status:</label>
              <select
                className="status-select"
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready for Pickup</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
}