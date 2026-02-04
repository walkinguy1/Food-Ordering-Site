import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

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
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              <Link to="/restaurants" className="navbar-link">
                Restaurants
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