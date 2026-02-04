import RestaurantCard from "../components/RestaurantCard";
import { restaurants } from "../mock/restaurants";

export default function Restaurants() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Restaurants</h1>

      {restaurants.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  );
}
