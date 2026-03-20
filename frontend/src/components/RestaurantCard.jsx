import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="restaurant-card"
    >
      <div className="restaurant-image-container">
        <img
          src={
            restaurant.image ||
            "https://via.placeholder.com/400x200?text=No+Image"
          }
          alt={restaurant.name}
          className="restaurant-image"
        />
        <div className="restaurant-rating">
          ⭐ {Number(restaurant.rating).toFixed(1)}
        </div>
      </div>

      <div className="restaurant-info">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p className="restaurant-cuisine">{restaurant.cuisine_type}</p>
        <p className="restaurant-description">{restaurant.description}</p>
        <p className="restaurant-address">📍 {restaurant.address}</p>
      </div>
    </Link>
  );
}
