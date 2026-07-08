import { useState } from 'react';
import { useCart } from "../context/useCart";
import { useNavigate } from "react-router-dom";
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';
import { MapPin, MessageSquare, User, Lock, ArrowLeft } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛒</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>
          Your cart is empty
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '32px' }}>
          Add items to your cart before checking out
        </p>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary btn-lg">
          Browse Restaurants
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate('/cart')}
        className="btn btn-secondary"
        style={{
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ArrowLeft size={18} />
        Back to Cart
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          Checkout
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Complete your order in a few simple steps
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            color: '#991b1b',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          {error}
        </motion.div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '30px',
      }}>
        {/* Form Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Customer Name */}
            <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <User size={18} />
                Customer Name
              </label>
              <input
                className="form-input"
                type="text"
                value={user?.full_name || user?.email}
                disabled
                style={{
                  background: '#f3f4f6',
                  cursor: 'not-allowed',
                }}
              />
            </motion.div>

            {/* Delivery Address */}
            <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin size={18} />
                Delivery Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                name="delivery_address"
                placeholder="Enter your complete delivery address (Street, Building, Landmark, etc.)"
                value={formData.delivery_address}
                onChange={handleChange}
                required
                style={{
                  minHeight: '120px',
                  fontFamily: 'inherit',
                }}
              />
            </motion.div>

            {/* Special Instructions */}
            <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MessageSquare size={18} />
                Special Instructions (Optional)
              </label>
              <textarea
                className="form-textarea"
                name="special_instructions"
                placeholder="Any special requests? (e.g., extra spicy, no onions, allergies, etc.)"
                value={formData.special_instructions}
                onChange={handleChange}
                style={{
                  minHeight: '100px',
                  fontFamily: 'inherit',
                }}
              />
            </motion.div>

            {/* Security Note */}
            <motion.div
              variants={itemVariants}
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                fontSize: '0.875rem',
                color: '#059669',
              }}
            >
              <Lock size={16} />
              Your payment information is secure and encrypted
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Placing Order...
                </motion.span>
              ) : (
                `Place Order - Rs. ${total.toFixed(2)}`
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Order Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            height: 'fit-content',
            position: 'sticky',
            top: '90px',
          }}
        >
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            Order Summary
          </h2>

          {/* Items */}
          <div style={{ marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '0.95rem',
                  color: '#6b7280',
                }}
              >
                <span>
                  {item.name}
                  <span style={{
                    marginLeft: '8px',
                    fontWeight: 600,
                    color: '#f97316',
                  }}>
                    ×{item.quantity}
                  </span>
                </span>
                <span style={{ fontWeight: 600 }}>
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '2px solid #e5e7eb',
            paddingTop: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.125rem',
              fontWeight: 700,
            }}>
              <span>Subtotal</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              color: '#6b7280',
              marginTop: '8px',
            }}>
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>
          </div>

          {/* Total */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '16px',
          }}>
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>

          {/* Info */}
          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            Secure payment processing
          </p>
        </motion.div>
      </div>
    </div>
  );
}
