import { useCart } from "../context/useCart";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="paper">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-text">
              Looks like you haven't added anything yet.
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide">
      <h1 className="page-title">🛒 Your Cart</h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items-section">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-info">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-unit-price">
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              <div className="cart-item-controls">
                {updateQuantity && (
                  <div className="qty-stepper">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeFromCart(item.id)
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                )}

                <span className="cart-item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="btn btn-danger btn-sm cart-clear-btn">
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="cart-summary-section">
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              {cart.items.map((item) => (
                <div key={item.id} className="cart-summary-row">
                  <span>
                    {item.name}{" "}
                    <span className="cart-summary-qty">×{item.quantity}</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span className="cart-total-amount">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn btn-primary btn-full"
            >
              Proceed to Checkout
            </button>

            <Link to="/restaurants" className="cart-continue-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
