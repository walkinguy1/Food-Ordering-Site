import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import { motion } from 'framer-motion';
import { Search, Star, Clock, DollarSign } from 'lucide-react';

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
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError('Failed to load restaurants. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Derive unique cuisine types for filter tabs
  const cuisines = useMemo(
    () => ['All', ...new Set(restaurants.map((r) => r.cuisine_type).filter(Boolean))],
    [restaurants]
  );

  // Filter restaurants by search query and selected cuisine
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return restaurants.filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.cuisine_type && r.cuisine_type.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q));
      const matchesCuisine =
        activeCuisine === 'All' || r.cuisine_type === activeCuisine;
      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, search, activeCuisine]);

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
          Loading restaurants...
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
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
          Discover Restaurants
        </h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.95 }}>
          Find your favorite food from top-rated restaurants near you
        </p>
      </motion.div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            marginBottom: '40px',
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '44px',
                fontSize: '1rem',
              }}
            />
          </div>
        </motion.div>

        {/* Cuisine Filter */}
        {cuisines.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginBottom: '40px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {cuisines.map((cuisine) => (
              <motion.button
                key={cuisine}
                onClick={() => setActiveCuisine(cuisine)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`btn ${
                  activeCuisine === cuisine ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {cuisine}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            marginBottom: '30px',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#6b7280',
          }}
        >
          Showing <strong>{filtered.length}</strong> restaurant{filtered.length !== 1 ? 's' : ''}
        </motion.p>

        {/* Restaurants Grid */}
        {filtered.length > 0 ? (
          <motion.div
            className="restaurant-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <Link
                  to={`/restaurants/${restaurant.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="restaurant-card">
                    <div
                      className="restaurant-image"
                      style={{
                        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        position: 'relative',
                      }}
                    >
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        restaurant.name?.charAt(0).toUpperCase() || '🍽️'
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(0, 0, 0, 0.6)',
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
                        <Star size={14} fill="currentColor" />
                        {restaurant.rating?.toFixed(1) || '4.5'}
                      </div>
                    </div>
                    <div className="restaurant-info">
                      <h3 className="restaurant-name">{restaurant.name}</h3>
                      <p className="restaurant-cuisine">
                        {restaurant.cuisine_type || 'Multi-cuisine'}
                      </p>
                      <p className="restaurant-description" style={{ marginBottom: '12px' }}>
                        {restaurant.description}
                      </p>
                      <div className="restaurant-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          <span>{restaurant.delivery_time || '30'} min</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign size={14} />
                          <span>{restaurant.price_range || '$$'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
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
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              No restaurants found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Try adjusting your search or filters
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => { setSearch(''); setActiveCuisine('All'); }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
