import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');

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

  // Derive unique cuisine types for filter tabs
  const cuisines = useMemo(
    () => ['All', ...new Set(restaurants.map((r) => r.cuisine_type).filter(Boolean))],
    [restaurants]
  );

  // Filter restaurants by search query and selected cuisine
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return restaurants.filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.cuisine_type && r.cuisine_type.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q));
      const matchesCuisine =
        activeCuisine === 'All' || r.cuisine_type === activeCuisine;
      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, search, activeCuisine]);

  if (loading) {
    return (
      <div className="container-wide">
        <div className="loading-container">
          <p className="loading-text">Loading restaurants…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <h1 className="page-title">Restaurants</h1>

      {/* Search bar */}
      <div className="restaurants-search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="restaurants-search-input"
          placeholder="Search by name, cuisine or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-clear-btn"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Cuisine filter tabs */}
      {cuisines.length > 1 && (
        <div className="admin-filters cuisine-filters">
          {cuisines.map((c) => (
            <button
              key={c}
              className={`filter-btn${activeCuisine === c ? ' active' : ''}`}
              onClick={() => setActiveCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No restaurants match your search.</p>
          <button
            className="btn btn-secondary mt-2"
            onClick={() => { setSearch(''); setActiveCuisine('All'); }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="restaurant-grid">
          {filtered.map((restaurant) => (
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