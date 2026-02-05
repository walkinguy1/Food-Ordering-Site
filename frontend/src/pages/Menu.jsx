import { useParams } from "react-router-dom";
import { menuItems } from "../mock/menu";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../context/useCart";

export default function Menu() {
  const { id } = useParams();
  const items = menuItems[id] || [];
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(Number(id), item);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Menu</h1>

      {items.length === 0 && <p>No items available.</p>}

      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onAdd={handleAddToCart}
        />
      ))}
    </div>
  );
}
