import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <h1 className="page-title">My Orders</h1>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/restaurants')} className="btn btn-primary mt-3">
            Start Ordering
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-card-header-left">
                  <h3 className="order-id">Order #{order.id}</h3>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-items">
                  {order.order_items.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span className="order-item-name-qty">
                        {item.item_name} <span className="qty">×{item.quantity}</span>
                      </span>
                      <span className="order-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">${order.total_amount.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}