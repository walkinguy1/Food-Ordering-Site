import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="container-wide">
      <div className="home-content">
        <h1 className="home-title">🍕 Food Ordering App</h1>

        {isAuthenticated ? (
          <div>
            <p className="home-subtitle">
              Welcome back! You're logged in ✅
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