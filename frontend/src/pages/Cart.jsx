import { useCart } from "../context/useCart";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 },
  },
};

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '4rem', marginBottom: '24px' }}
        >
          🛒
        </motion.div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>
          Your cart is empty
        </h2>
        <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '32px' }}>
          Looks like you haven't added anything yet. Start exploring!
        </p>
        <Link to="/restaurants" className="btn btn-primary btn-lg">
          Browse Restaurants
        </Link>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <ShoppingBag size={32} />
          Your Cart
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '30px',
      }}>
        {/* Cart Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                exit={{ opacity: 0, x: 20 }}
                layout
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  alignItems: 'center',
                }}
              >
                {/* Item Image */}
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    flexShrink: 0,
                  }}
                >
                  🍽️
                </div>

                {/* Item Details */}
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}>
                    {item.name}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '8px',
                  }}>
                    Rs. {item.price.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '4px',
                }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      item.quantity > 1
                        ? updateQuantity(item.id, item.quantity - 1)
                        : removeFromCart(item.id)
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                    }}
                  >
                    <Minus size={16} />
                  </motion.button>
                  <span style={{
                    minWidth: '24px',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}>
                    {item.quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                    }}
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>

                {/* Subtotal */}
                <div style={{
                  textAlign: 'right',
                  minWidth: '80px',
                }}>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#f97316',
                    marginBottom: '8px',
                  }}>
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear Cart Button */}
          <motion.button
            onClick={clearCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
            }}
          >
            Clear Cart
          </motion.button>
        </motion.div>

        {/* Order Summary */}
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

          <div style={{ marginBottom: '24px' }}>
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
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </motion.div>
            ))}
          </div>

          <div style={{
            borderTop: '2px solid #e5e7eb',
            paddingTop: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}>
            <span>Total</span>
            <span style={{ color: '#f97316' }}>
              Rs. {totalPrice.toFixed(2)}
            </span>
          </div>

          <motion.button
            onClick={() => navigate("/checkout")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </motion.button>

          <Link
            to="/restaurants"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '12px',
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'color var(--transition)',
            }}
            onMouseEnter={(e) => e.target.style.color = '#f97316'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            ← Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
