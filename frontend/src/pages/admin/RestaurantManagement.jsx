import { useState, useEffect } from 'react';
import { restaurantService } from '../../services/restaurantService';
import { adminService } from '../../services/adminService';

export default function RestaurantManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    rating: 0,
    address: '',
    cuisine_type: ''
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.name === 'rating' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingRestaurant) {
        await adminService.updateRestaurant(editingRestaurant.id, formData);
      } else {
        await adminService.createRestaurant(formData);
      }
      
      setShowForm(false);
      setEditingRestaurant(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        rating: 0,
        address: '',
        cuisine_type: ''
      });
      fetchRestaurants();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || '',
      image: restaurant.image || '',
      rating: restaurant.rating,
      address: restaurant.address || '',
      cuisine_type: restaurant.cuisine_type || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will also delete all menu items.')) {
      return;
    }

    try {
      await adminService.deleteRestaurant(id);
      fetchRestaurants();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to delete restaurant');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRestaurant(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      rating: 0,
      address: '',
      cuisine_type: ''
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="admin-header">
        <h1 className="page-title">Restaurant Management</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Add Restaurant
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {showForm && (
        <div className="admin-form-container">
          <h2 className="form-title">
            {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h2>
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
                  placeholder="e.g., Italian, Japanese"
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
                rows={3}
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  type="url"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating (0-5)</label>
                <input
                  className="form-input"
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Cuisine</th>
              <th>Rating</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map(restaurant => (
              <tr key={restaurant.id}>
                <td>{restaurant.id}</td>
                <td>
                  <div className="table-name-cell">
                    {restaurant.image && (
                      <img src={restaurant.image} alt={restaurant.name} className="table-image" />
                    )}
                    <span>{restaurant.name}</span>
                  </div>
                </td>
                <td>{restaurant.cuisine_type}</td>
                <td>⭐ {restaurant.rating.toFixed(1)}</td>
                <td>{restaurant.address}</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(restaurant)} className="btn-action btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(restaurant.id)} className="btn-action btn-delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}