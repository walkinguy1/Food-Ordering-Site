/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { ownerService } from '../../services/ownerService';

export default function OwnerMenu() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    restaurant_id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    is_vegetarian: 0,
    is_available: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [restaurantData, menuData] = await Promise.all([
        ownerService.getMyRestaurant(),
        ownerService.getMyMenu()
      ]);
      setRestaurant(restaurantData);
      setMenuItems(menuData);
      setFormData(prev => ({ ...prev, restaurant_id: restaurantData.id }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
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
      if (editingItem) {
        await ownerService.updateMenuItem(editingItem.id, formData);
      } else {
        await ownerService.createMenuItem(formData);
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchData();
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
      await ownerService.deleteMenuItem(id);
      fetchData();
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
      restaurant_id: restaurant?.id || 0,
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

  // Group items by category
  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Manage Menu</h1>
          <p className="owner-restaurant-name">{restaurant?.name}</p>
        </div>
        {!showForm && (
          <button onClick={handleAddNew} className="btn btn-primary">
            + Add Menu Item
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

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

      {/* Menu Items by Category */}
      {!showForm && (
        <div className="menu-categories">
          {categories.map(category => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category} ({menuItems.filter(i => i.category === category).length})</h2>
              <div className="menu-items-grid-owner">
                {menuItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <div key={item.id} className="owner-menu-card">
                      <div className="owner-menu-image-container">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="owner-menu-image" />
                        ) : (
                          <div className="owner-menu-placeholder">No Image</div>
                        )}
                        {item.is_vegetarian === 1 && (
                          <span className="veg-badge">🌱</span>
                        )}
                        {item.is_available === 0 && (
                          <span className="unavailable-overlay">Unavailable</span>
                        )}
                      </div>
                      <div className="owner-menu-info">
                        <h3 className="owner-menu-name">{item.name}</h3>
                        <p className="owner-menu-description">{item.description}</p>
                        <div className="owner-menu-footer">
                          <span className="owner-menu-price">${item.price.toFixed(2)}</span>
                          <div className="owner-menu-actions">
                            <button onClick={() => handleEdit(item)} className="btn-action btn-edit">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn-action btn-delete">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {menuItems.length === 0 && (
            <div className="empty-state">
              <p>No menu items yet. Add your first item!</p>
              <button onClick={handleAddNew} className="btn btn-primary mt-3">
                Add First Menu Item
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}