import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';
import { Zap, UtensilsCrossed, Lock, Percent, Star, TrendingUp } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast Delivery',
    description: 'Get your favourite meals delivered to your door in under 30 minutes.',
    color: '#f97316',
  },
  {
    icon: UtensilsCrossed,
    title: 'Hundreds of Restaurants',
    description: 'Explore a huge variety of cuisines from top-rated local restaurants.',
    color: '#8b5cf6',
  },
  {
    icon: Lock,
    title: 'Safe & Secure',
    description: 'Your orders and payments are always protected end-to-end.',
    color: '#06b6d4',
  },
  {
    icon: Percent,
    title: 'Best Prices',
    description: 'Exclusive deals and discounts available every day, just for you.',
    color: '#10b981',
  },
];

const TRENDING_ITEMS = [
  {
    id: 1,
    icon: '🔥',
    name: 'Spicy Chicken Momo',
    restaurant: 'Kathmandu Momo Center',
    price: 'Rs. 250',
    rating: 4.8,
    link: '/restaurants/1',
  },
  {
    id: 2,
    icon: '🍕',
    name: 'Margherita Pizza',
    restaurant: 'Fire And Ice Pizzeria',
    price: 'Rs. 850',
    rating: 4.9,
    link: '/restaurants/2',
  },
  {
    id: 3,
    icon: '🍜',
    name: 'Pork Thukpa',
    restaurant: 'Himalayan Kitchen',
    price: 'Rs. 320',
    rating: 4.7,
    link: '/restaurants/3',
  },
];

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
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (isAuthenticated) {
        const storedUser = authService.getUser();
        if (storedUser) {
          if (!cancelled) setUser(storedUser);
        } else {
          try {
            const userData = await authService.getCurrentUser();
            if (!cancelled) setUser(userData);
          } catch {
            if (!cancelled) navigate('/login');
          }
        }
      }
      if (!cancelled) setLoading(false);
    }

    loadUser();

    return () => { cancelled = true; };
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="hero-section">
        <div className="hero-overlay" />
        <div className="loading-container">
          <motion.p 
            className="loading-text"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading…
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="hero-eyebrow" variants={itemVariants}>
            🍕 Welcome to FoodieExpress
          </motion.span>
          <motion.h1 className="hero-title" variants={itemVariants}>
            Delicious Food,<br />Delivered Fast
          </motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>
            Order from hundreds of restaurants and get your meal at your door
            in minutes.
          </motion.p>

          {isAuthenticated && user ? (
            <motion.div className="hero-cta-group" variants={itemVariants}>
              <p className="hero-welcome">
                Welcome back, <strong>{user.full_name || user.email}</strong>! 👋
              </p>
              <Link to="/restaurants" className="btn btn-hero-primary">
                Browse Restaurants
              </Link>
              <Link to="/orders" className="btn btn-hero-secondary">
                My Orders
              </Link>
            </motion.div>
          ) : (
            <motion.div className="hero-cta-group" variants={itemVariants}>
              <Link to="/restaurants" className="btn btn-hero-primary">
                Order Now
              </Link>
              <Link to="/register" className="btn btn-hero-secondary">
                Create Free Account
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Trending Section ── */}
      <section className="recommendations-section">
        <div className="container-wide">
          <motion.h2 
            className="features-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <TrendingUp style={{ display: 'inline', marginRight: '10px' }} />
            Trending Near You
          </motion.h2>
          <motion.p 
            className="features-subheading"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            AI-powered recommendations based on popular orders and time of day.
          </motion.p>
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {TRENDING_ITEMS.map((item) => (
              <motion.div 
                key={item.id}
                className="feature-card"
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700 }}>
                  {item.name}
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                  {item.restaurant}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
                  <Star size={16} fill="currentColor" style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {item.rating}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#f97316' }}>
                    {item.price}
                  </span>
                  <Link to={item.link} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Order Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="features-section">
        <div className="container-wide">
          <motion.h2 
            className="features-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose FoodieExpress?
          </motion.h2>
          <motion.p 
            className="features-subheading"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            We make ordering food as simple and enjoyable as eating it.
          </motion.p>
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {FEATURES.map((f) => {
              const IconComponent = f.icon;
              return (
                <motion.div 
                  key={f.title} 
                  className="feature-card"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <div 
                    className="feature-icon"
                    style={{ color: f.color }}
                  >
                    <IconComponent size={48} />
                  </div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section">
        <div className="container-wide">
          <motion.h2 
            className="features-heading how-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.div 
            className="how-steps"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: '1', title: 'Browse Restaurants', desc: 'Pick from hundreds of top-rated restaurants near you.' },
              { number: '2', title: 'Choose Your Meal', desc: 'Add items to your cart and customise to your taste.' },
              { number: '3', title: 'Fast Delivery', desc: 'Sit back — your food arrives hot and fresh at your door.' },
            ].map((step, idx) => (
              <div key={idx}>
                <motion.div 
                  className="how-step"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="how-step-number">{step.number}</div>
                  <h3 className="how-step-title">{step.title}</h3>
                  <p className="how-step-desc">{step.desc}</p>
                </motion.div>
                {idx < 2 && <div className="how-step-arrow">→</div>}
              </div>
            ))}
          </motion.div>

          {!isAuthenticated && (
            <motion.div 
              className="how-cta"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started — It's Free
              </Link>
              <Link to="/restaurants" className="btn btn-secondary btn-lg">
                Browse Menu
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
