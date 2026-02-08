import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

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
              {!isAdmin && (
                <>
                  <Link to="/restaurants" className="navbar-link">
                    Restaurants
                  </Link>
                  <Link to="/orders" className="navbar-link">
                    My Orders
                  </Link>
                  <Link to="/cart" className="navbar-link">
                    Cart
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
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}