import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrder(orderId);
        setOrder(data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container">
        <div className="paper">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container">
        <div className="paper">
          <div className="alert alert-error">
            {error || 'Order not found'}
          </div>
          <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="paper">
        <div className="order-confirmation-success">
          <div className="success-icon">✓</div>
          <h1 className="title">Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your order. We've received it and will start preparing it soon.
          </p>
        </div>

        <div className="order-details">
          <h2 className="order-details-title">Order Details</h2>
          
          <div className="order-info-grid">
            <div className="order-info-item">
              <span className="order-info-label">Order ID</span>
              <span className="order-info-value">#{order.id}</span>
            </div>
            
            <div className="order-info-item">
              <span className="order-info-label">Status</span>
              <span className="order-status-badge">{order.status}</span>
            </div>
            
            <div className="order-info-item">
              <span className="order-info-label">Total Amount</span>
              <span className="order-info-value">${order.total_amount.toFixed(2)}</span>
            </div>
            
            <div className="order-info-item">
              <span className="order-info-label">Delivery Address</span>
              <span className="order-info-value">{order.delivery_address}</span>
            </div>
          </div>

          <h3 className="order-items-title">Order Items</h3>
          <div className="order-items-list">
            {order.order_items.map(item => (
              <div key={item.id} className="order-item">
                <span className="order-item-name">
                  {item.item_name} <span className="order-item-qty">x{item.quantity}</span>
                </span>
                <span className="order-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-actions">
          <button onClick={() => navigate('/orders')} className="btn btn-primary">
            View All Orders
          </button>
          <button onClick={() => navigate('/restaurants')} className="btn btn-secondary">
            Order More Food
          </button>
        </div>
      </div>
    </div>
  );
}