import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Lightning Fast Delivery',
    description: 'Get your favourite meals delivered to your door in under 30 minutes.',
  },
  {
    icon: '🍽️',
    title: 'Hundreds of Restaurants',
    description: 'Explore a huge variety of cuisines from top-rated local restaurants.',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure',
    description: 'Your orders and payments are always protected end-to-end.',
  },
  {
    icon: '💸',
    title: 'Best Prices',
    description: 'Exclusive deals and discounts available every day, just for you.',
  },
];

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
          <p className="loading-text">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-eyebrow">🍕 Welcome to FoodieExpress</span>
          <h1 className="hero-title">
            Delicious Food,<br />Delivered Fast
          </h1>
          <p className="hero-subtitle">
            Order from hundreds of restaurants and get your meal at your door
            in minutes.
          </p>

          {isAuthenticated && user ? (
            <div className="hero-cta-group">
              <p className="hero-welcome">
                Welcome back, <strong>{user.full_name || user.email}</strong>! 👋
              </p>
              <Link to="/restaurants" className="btn btn-hero-primary">
                Browse Restaurants
              </Link>
              <Link to="/orders" className="btn btn-hero-secondary">
                My Orders
              </Link>
            </div>
          ) : (
            <div className="hero-cta-group">
              <Link to="/restaurants" className="btn btn-hero-primary">
                Order Now
              </Link>
              <Link to="/register" className="btn btn-hero-secondary">
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="container-wide">
          <h2 className="features-heading">Why Choose FoodieExpress?</h2>
          <p className="features-subheading">
            We make ordering food as simple and enjoyable as eating it.
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section">
        <div className="container-wide">
          <h2 className="features-heading how-heading">How It Works</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-number">1</div>
              <h3 className="how-step-title">Browse Restaurants</h3>
              <p className="how-step-desc">
                Pick from hundreds of top-rated restaurants near you.
              </p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-number">2</div>
              <h3 className="how-step-title">Choose Your Meal</h3>
              <p className="how-step-desc">
                Add items to your cart and customise to your taste.
              </p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-number">3</div>
              <h3 className="how-step-title">Fast Delivery</h3>
              <p className="how-step-desc">
                Sit back — your food arrives hot and fresh at your door.
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="how-cta">
              <Link to="/register" className="btn btn-primary">
                Get Started — It's Free
              </Link>
              <Link to="/restaurants" className="btn btn-secondary">
                Browse Menu
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
