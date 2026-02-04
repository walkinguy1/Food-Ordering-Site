import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginBottom: 12 }}>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.description}</p>
      <p>⭐ {restaurant.rating}</p>

      <Link to={`/restaurants/${restaurant.id}`}>
        View Menu
      </Link>
    </div>
  );
}
