import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useCart } from '../context/useCart';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const isAdmin = user?.role === 'admin';
  const { cart } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🍕 FoodieExpress
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link">
                Home
              </Link>
              {!isAdmin && (
                <>
                  <Link to="/restaurants" className="navbar-link">
                    Restaurants
                  </Link>
                  <Link to="/orders" className="navbar-link">
                    My Orders
                  </Link>
                  <Link to="/cart" className="navbar-link navbar-cart-link">
                    Cart
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin" className="navbar-link navbar-link-admin">
                    Dashboard
                  </Link>
                  <Link to="/admin/restaurants" className="navbar-link navbar-link-admin">
                    Restaurants
                  </Link>
                  <Link to="/admin/menu" className="navbar-link navbar-link-admin">
                    Menu
                  </Link>
                  <Link to="/admin/orders" className="navbar-link navbar-link-admin">
                    Orders
                  </Link>
                  <Link to="/admin/users" className="navbar-link navbar-link-admin">
                    Users
                  </Link>
                </>
              )}
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              <span className="navbar-user">
                👤 {user?.full_name || user?.email}
                {isAdmin && <span className="admin-badge">ADMIN</span>}
              </span>
              <button 
                onClick={toggleTheme} 
                className="btn btn-secondary btn-sm"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/restaurants" className="navbar-link">
                Restaurants
              </Link>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <button 
                onClick={toggleTheme} 
                className="btn btn-secondary btn-sm"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
