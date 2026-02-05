import { useCart } from "../context/useCart";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    // Mock order placement
    console.log("Order placed:", cart);

    clearCart();
    navigate("/profile");
  };

  if (cart.items.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>

      {cart.items.map(item => (
        <p key={item.id}>
          {item.name} × {item.quantity}
        </p>
      ))}

      <button onClick={handlePlaceOrder}>
        Place Order
      </button>
    </div>
  );
}
