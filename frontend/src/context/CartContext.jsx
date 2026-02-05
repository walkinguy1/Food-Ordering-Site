import { createContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart
      ? JSON.parse(savedCart)
      : { restaurantId: null, items: [] };
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (restaurantId, item) => {
    setCart((prev) => {
      if (!prev.restaurantId) {
        return {
          restaurantId,
          items: [{ ...item, quantity: 1 }]
        };
      }

      if (prev.restaurantId !== restaurantId) {
        alert("You can only order from one restaurant at a time.");
        return prev;
      }

      const existingItem = prev.items.find(i => i.id === item.id);

      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }

      return {
        ...prev,
        items: [...prev.items, { ...item, quantity: 1 }]
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const clearCart = () => {
    setCart({ restaurantId: null, items: [] });
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartContext };
