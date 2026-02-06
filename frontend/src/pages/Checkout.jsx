import { useState } from 'react';
import { useCart } from "../context/useCart";
import { useNavigate } from "react-router-dom";
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const user = authService.getUser();

  const [formData, setFormData] = useState({
    delivery_address: '',
    special_instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total
  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        restaurant_id: cart.restaurantId,
        items: cart.items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
          item_name: item.name
        })),
        delivery_address: formData.delivery_address,
        special_instructions: formData.special_instructions || null
      };

      const order = await orderService.createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="paper">
          <h1 className="title">Checkout</h1>
          <div className="empty-state">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/restaurants')} className="btn btn-primary mt-3">
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="paper">
        <h1 className="title">Checkout</h1>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="checkout-container">
          {/* Order Summary */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Order Summary</h2>
            <div className="order-summary">
              {cart.items.map(item => (
                <div key={item.id} className="order-summary-item">
                  <div className="order-summary-item-info">
                    <span className="order-summary-item-name">{item.name}</span>
                    <span className="order-summary-item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="order-summary-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="order-summary-total">
                <span>Total</span>
                <span className="total-amount">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">Delivery Information</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={user?.full_name || user?.email}
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <textarea
                  className="form-input"
                  name="delivery_address"
                  placeholder="Enter your complete delivery address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  required
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions (Optional)</label>
                <textarea
                  className="form-input"
                  name="special_instructions"
                  placeholder="Any special requests? (e.g., extra spicy, no onions)"
                  value={formData.special_instructions}
                  onChange={handleChange}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="btn btn-secondary btn-full mt-2"
              >
                Back to Cart
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
