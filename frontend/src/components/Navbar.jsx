import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useCart } from "../context/useCart";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const { cart } = useCart();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const totalItems = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🍕 Food Ordering
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link">
                Home
              </Link>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              <Link to="/restaurants" className="navbar-link">
                Restaurants
              </Link>
              <Link to="/cart" className="navbar-link">
                  Cart ({totalItems})
              </Link>
              <span className="navbar-user">
                👤 {user?.full_name || user?.email}
              </span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
              <Link to="/restaurants" className="navbar-link">
                Restaurants
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}