/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { ownerService } from '../../services/ownerService';

export default function OwnerRestaurant() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    address: '',
    cuisine_type: ''
  });

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const data = await ownerService.getMyRestaurant();
      setRestaurant(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        image: data.image || '',
        address: data.address || '',
        cuisine_type: data.cuisine_type || ''
      });
    } catch (err) {
      setError('Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await ownerService.updateRestaurant(formData);
      setSuccess('Restaurant information updated successfully!');
      setEditing(false);
      fetchRestaurant();
    } catch (err) {
      setError('Failed to update restaurant information');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: restaurant.name,
      description: restaurant.description || '',
      image: restaurant.image || '',
      address: restaurant.address || '',
      cuisine_type: restaurant.cuisine_type || ''
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="admin-header">
        <h1 className="page-title">Restaurant Information</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            Edit Information
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!editing ? (
        <div className="owner-restaurant-view">
          <div className="restaurant-banner">
            {restaurant.image && (
              <img src={restaurant.image} alt={restaurant.name} className="restaurant-banner-image" />
            )}
          </div>
          <div className="restaurant-details-container">
            <div className="restaurant-info-section">
              <h2>{restaurant.name}</h2>
              <p className="cuisine-type-large">{restaurant.cuisine_type}</p>
              <p className="rating-large">⭐ {restaurant.rating.toFixed(1)} Rating</p>
              <p className="address-large">📍 {restaurant.address}</p>
              <p className="description-large">{restaurant.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-form-container">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Restaurant Name *</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cuisine Type *</label>
                <input
                  className="form-input"
                  type="text"
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                className="form-input"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                className="form-input"
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}