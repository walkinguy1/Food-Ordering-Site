import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
        });
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await api.put('/api/v1/users/me', formData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    try {
      await api.put('/api/v1/users/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setPasswordMessage('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      // Close the form after 2 seconds
      setTimeout(() => {
        setChangingPassword(false);
        setPasswordMessage('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || '',
      phone: user.phone || '',
    });
    setEditing(false);
    setMessage('');
    setError('');
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setChangingPassword(false);
    setPasswordMessage('');
    setPasswordError('');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="paper">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="paper">
        <h1 className="title">My Profile</h1>

        {/* Profile Information Section */}
        <div className="profile-section">
          <h2 className="profile-section-title">Profile Information</h2>
          
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="profile-view">
              <div className="profile-field">
                <label className="profile-label">Email</label>
                <p className="profile-value">{user.email}</p>
              </div>

              <div className="profile-field">
                <label className="profile-label">Full Name</label>
                <p className="profile-value">{user.full_name || 'Not set'}</p>
              </div>

              <div className="profile-field">
                <label className="profile-label">Phone</label>
                <p className="profile-value">{user.phone || 'Not set'}</p>
              </div>

              <div className="profile-field">
                <label className="profile-label">Role</label>
                <p className="profile-value profile-badge">{user.role}</p>
              </div>

              <div className="profile-field">
                <label className="profile-label">Member Since</label>
                <p className="profile-value">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary btn-full mt-3"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={user.email}
                  disabled
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <small className="text-muted">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Password Section */}
        <div className="profile-section">
          <h2 className="profile-section-title">Security</h2>

          {passwordMessage && (
            <div className="alert alert-success">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="alert alert-error">
              {passwordError}
            </div>
          )}

          {!changingPassword ? (
            <div className="profile-view">
              <div className="profile-field">
                <label className="profile-label">Password</label>
                <p className="profile-value">••••••••</p>
              </div>

              <button
                onClick={() => setChangingPassword(true)}
                className="btn btn-secondary btn-full"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="current_password"
                  placeholder="Enter current password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="new_password"
                  placeholder="Enter new password (min 8 characters)"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="confirm_password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={handlePasswordCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Stats Section */}
        <div className="profile-section">
          <h2 className="profile-section-title">Account Statistics</h2>
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="stat-label">Days Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">$0.00</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}