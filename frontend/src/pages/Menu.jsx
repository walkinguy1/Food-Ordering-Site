import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import { useCart } from '../context/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Leaf, Check } from 'lucide-react';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function Menu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await restaurantService.getRestaurant(id);
        setRestaurant(restaurantData);
        setMenuItems(restaurantData.menu_items || []);
      } catch (err) {
        setError('Failed to load menu. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = (item) => {
    addToCart(parseInt(id), item);
    setAddedItems(prev => new Set([...prev, item.id]));
    
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ display: 'inline-block' }}
        >
          <div style={{ fontSize: '3rem' }}>🍽️</div>
        </motion.div>
        <p style={{ marginTop: '20px', fontSize: '1.125rem', fontWeight: 600 }}>
          Loading menu...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          color: '#991b1b',
          marginBottom: '20px',
        }}>
          {error}
        </div>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
          Back to Restaurants
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          color: '#991b1b',
          marginBottom: '20px',
        }}>
          Restaurant not found
        </div>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
          Back to Restaurants
        </button>
      </div>
    );
  }

  // Group menu items by category
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <button
          onClick={() => navigate('/restaurants')}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={18} />
          Back to Restaurants
        </button>
      </motion.div>

      {/* Restaurant Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          color: 'white',
          padding: '40px 20px',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '30px',
            flexWrap: 'wrap',
          }}>
            {restaurant.image && (
              <motion.img
                src={restaurant.image}
                alt={restaurant.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  marginBottom: '12px',
                }}
              >
                {restaurant.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  fontSize: '1.125rem',
                  opacity: 0.95,
                  marginBottom: '16px',
                }}
              >
                {restaurant.cuisine_type}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={20} fill="currentColor" />
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {restaurant.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} />
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {restaurant.address}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu Items */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 60px' }}>
        {menuItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '16px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              No menu items available
            </h3>
            <p style={{ color: '#6b7280' }}>
              This restaurant doesn't have any items available right now
            </p>
          </motion.div>
        ) : (
          categories.map((category, categoryIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIdx * 0.1 }}
              style={{ marginBottom: '60px' }}
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: categoryIdx * 0.1 + 0.1 }}
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  marginBottom: '24px',
                  paddingBottom: '12px',
                  borderBottom: '3px solid var(--primary)',
                  display: 'inline-block',
                }}
              >
                {category}
              </motion.h2>
              <motion.div
                className="menu-items-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ y: -6 }}
                      className="menu-item-card"
                    >
                      <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <motion.img
                          src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={item.name}
                          className="menu-item-image"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.3 }}
                        />
                        {item.is_vegetarian === 1 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'rgba(16, 185, 129, 0.9)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            <Leaf size={14} />
                            Vegetarian
                          </motion.div>
                        )}
                        {item.is_available !== 1 && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0, 0, 0, 0.5)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '1.125rem',
                              fontWeight: 700,
                            }}
                          >
                            Unavailable
                          </div>
                        )}
                      </div>
                      
                      <div className="menu-item-info">
                        <h3 className="menu-item-name">{item.name}</h3>
                        <p className="menu-item-desc">{item.description}</p>
                        
                        <div className="menu-item-footer">
                          <span className="menu-item-price">
                            Rs. {item.price?.toFixed(2) || '0.00'}
                          </span>
                          
                          <AnimatePresence mode="wait">
                            {item.is_available === 1 ? (
                              <motion.button
                                key="add-btn"
                                onClick={() => handleAddToCart(item)}
                                className={`btn ${addedItems.has(item.id) ? 'btn-success' : 'btn-primary'}`}
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {addedItems.has(item.id) ? (
                                  <>
                                    <Check size={16} />
                                    Added!
                                  </>
                                ) : (
                                  'Add to Cart'
                                )}
                              </motion.button>
                            ) : (
                              <motion.span
                                key="unavail-badge"
                                style={{
                                  color: '#ef4444',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                Out of Stock
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
