import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError('Failed to load restaurants. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading restaurants...</p>
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
      </div>
    );
  }

  return (
    <div className="container-wide">
      <h1 className="page-title">Restaurants</h1>
      
      {restaurants.length === 0 ? (
        <div className="empty-state">
          <p>No restaurants available at the moment.</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <Link
              to={`/restaurants/${restaurant.id}`}
              key={restaurant.id}
              className="restaurant-card"
            >
              <div className="restaurant-image-container">
                <img
                  src={restaurant.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={restaurant.name}
                  className="restaurant-image"
                />
                <div className="restaurant-rating">
                  ⭐ {restaurant.rating.toFixed(1)}
                </div>
              </div>
              
              <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-cuisine">{restaurant.cuisine_type}</p>
                <p className="restaurant-description">
                  {restaurant.description}
                </p>
                <p className="restaurant-address">
                  📍 {restaurant.address}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}