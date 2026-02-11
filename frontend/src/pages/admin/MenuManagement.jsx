/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { restaurantService } from '../../services/restaurantService';
import { adminService } from '../../services/adminService';

export default function MenuManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    is_vegetarian: 0,
    is_available: 1
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurant(data[0].id);
      }
    } catch (err) {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const data = await restaurantService.getMenu(restaurantId);
      setMenuItems(data);
    } catch (err) {
      setError('Failed to load menu items');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' 
      ? parseFloat(e.target.value) 
      : e.target.type === 'checkbox'
      ? e.target.checked ? 1 : 0
      : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const dataToSend = {
        ...formData,
        restaurant_id: selectedRestaurant
      };

      if (editingItem) {
        await adminService.updateMenuItem(editingItem.id, dataToSend);
      } else {
        await adminService.createMenuItem(dataToSend);
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchMenuItems(selectedRestaurant);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      restaurant_id: item.restaurant_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || '',
      image: item.image || '',
      is_vegetarian: item.is_vegetarian,
      is_available: item.is_available
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await adminService.deleteMenuItem(id);
      fetchMenuItems(selectedRestaurant);
    } catch (err) {
      setError('Failed to delete menu item');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    resetForm();
    setError('');
  };

  const resetForm = () => {
    setFormData({
      restaurant_id: selectedRestaurant,
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      is_vegetarian: 0,
      is_available: 1
    });
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
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

  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurant);

  return (
    <div className="container-wide">
      <div className="admin-header">
        <h1 className="page-title">Menu Management</h1>
        {!showForm && (
          <button onClick={handleAddNew} className="btn btn-primary">
            + Add Menu Item
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Restaurant Selector */}
      <div className="restaurant-selector">
        <label className="selector-label">Select Restaurant:</label>
        <select
          className="restaurant-select"
          value={selectedRestaurant || ''}
          onChange={(e) => setSelectedRestaurant(parseInt(e.target.value))}
        >
          {restaurants.map(restaurant => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} - {restaurant.cuisine_type}
            </option>
          ))}
        </select>
        {currentRestaurant && (
          <span className="restaurant-info">
            📍 {currentRestaurant.address} | ⭐ {currentRestaurant.rating}
          </span>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="admin-form-container">
          <h2 className="form-title">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="e.g., Margherita Pizza"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  className="form-input"
                  type="text"
                  name="category"
                  placeholder="e.g., Pizza, Appetizer, Dessert"
                  value={formData.category}
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
                placeholder="Describe the menu item..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  className="form-input"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  placeholder="9.99"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

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
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian === 1}
                    onChange={handleChange}
                  />
                  <span>Vegetarian</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available === 1}
                    onChange={handleChange}
                  />
                  <span>Available</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items Table */}
      <div className="admin-table-container">
        <h2 className="table-header">
          Menu Items ({menuItems.length})
        </h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="table-name-cell">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="table-image" />
                    )}
                    <div>
                      <div className="item-name">{item.name}</div>
                      {item.is_vegetarian === 1 && (
                        <span className="veg-indicator">🌱 Veg</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>{item.category}</td>
                <td className="price-cell">${item.price.toFixed(2)}</td>
                <td>
                  {item.is_available === 1 ? (
                    <span className="status-available">Available</span>
                  ) : (
                    <span className="status-unavailable">Unavailable</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(item)} className="btn-action btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-action btn-delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {menuItems.length === 0 && (
          <div className="empty-state">
            <p>No menu items found for this restaurant.</p>
            <button onClick={handleAddNew} className="btn btn-primary mt-3">
              Add First Menu Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}