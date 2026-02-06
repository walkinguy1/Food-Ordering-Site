import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import { useCart } from '../context/useCart';

export default function Menu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await restaurantService.getRestaurant(id);
        setRestaurant(restaurantData);
        setMenuItems(restaurantData.menu_items || []);
      } catch (err) {
        setError('Failed to load menu. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = (item) => {
    addToCart(parseInt(id), item);
    setAddedItems(prev => new Set([...prev, item.id]));
    
    // Remove the "Added!" indicator after 2 seconds
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide">
        <div className="alert alert-error">
          {error}
        </div>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
          Back to Restaurants
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container-wide">
        <div className="alert alert-error">
          Restaurant not found
        </div>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
          Back to Restaurants
        </button>
      </div>
    );
  }

  // Group menu items by category
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="container-wide">
      {/* Restaurant Header */}
      <div className="menu-header">
        <button onClick={() => navigate('/restaurants')} className="back-button">
          ← Back to Restaurants
        </button>
        
        <div className="restaurant-header">
          <img
            src={restaurant.image || 'https://via.placeholder.com/1200x300?text=Restaurant'}
            alt={restaurant.name}
            className="restaurant-header-image"
          />
          <div className="restaurant-header-overlay">
            <h1 className="restaurant-header-name">{restaurant.name}</h1>
            <p className="restaurant-header-cuisine">{restaurant.cuisine_type}</p>
            <div className="restaurant-header-info">
              <span className="restaurant-header-rating">⭐ {restaurant.rating.toFixed(1)}</span>
              <span className="restaurant-header-address">📍 {restaurant.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-content">
        {menuItems.length === 0 ? (
          <div className="empty-state">
            <p>No menu items available for this restaurant.</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} className="menu-category">
              <h2 className="menu-category-title">{category}</h2>
              <div className="menu-items-grid">
                {menuItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <div key={item.id} className="menu-item-card">
                      <div className="menu-item-image-container">
                        <img
                          src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={item.name}
                          className="menu-item-image"
                        />
                        {item.is_vegetarian === 1 && (
                          <span className="vegetarian-badge">🌱 Vegetarian</span>
                        )}
                      </div>
                      
                      <div className="menu-item-info">
                        <h3 className="menu-item-name">{item.name}</h3>
                        <p className="menu-item-description">{item.description}</p>
                        
                        <div className="menu-item-footer">
                          <span className="menu-item-price">${item.price.toFixed(2)}</span>
                          
                          {item.is_available === 1 ? (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className={`btn ${addedItems.has(item.id) ? 'btn-success' : 'btn-primary'} btn-sm`}
                            >
                              {addedItems.has(item.id) ? '✓ Added!' : 'Add to Cart'}
                            </button>
                          ) : (
                            <span className="unavailable-badge">Unavailable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}