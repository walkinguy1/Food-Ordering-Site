import { useCart } from "../context/useCart";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.items.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Your cart is empty</h2>
        <Link to="/restaurants">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Cart</h1>

      {cart.items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10
          }}
        >
          <h4>{item.name}</h4>
          <p>
            ${item.price} × {item.quantity}
          </p>
          <p>
            <strong>Subtotal:</strong> ${item.price * item.quantity}
          </p>

          <button onClick={() => removeFromCart(item.id)}>
            Remove
          </button>
        </div>
      ))}

      <hr />

      <h2>Total: ${totalPrice}</h2>

      <button
        onClick={() => navigate("/checkout")}
        style={{ marginRight: 10 }}
      >
        Checkout
      </button>

      <button onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}
