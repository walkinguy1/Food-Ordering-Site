import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
  const loadUser = async () => {
    if (isAuthenticated) {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch {
          navigate('/login');
        }
      }
    }
    setLoading(false);
  };

  loadUser();
}, [isAuthenticated, navigate]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container-wide">
        <div className="home-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="home-content">
        <h1 className="home-title">🍕 Food Ordering App</h1>

        {isAuthenticated && user ? (
          <div>
            <p className="home-subtitle">
              Welcome back, <strong>{user.full_name || user.email}</strong>! ✅
            </p>
            <p className="text-muted mb-3">
              You're logged in as: {user.email}
            </p>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="home-subtitle">
              Order delicious food from your favorite restaurants
            </p>
            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}