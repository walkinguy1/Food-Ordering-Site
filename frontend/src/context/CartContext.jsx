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
      if (!prev.restaurantId || prev.items.length === 0) {
        return {
          restaurantId,
          items: [{ ...item, quantity: 1 }]
        };
      }
      // If trying to add from a different restaurant, show alert and do not change cart
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
    setCart((prev) => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      
      // If no items left, reset restaurant too
      if (newItems.length === 0) {
        return { restaurantId: null, items: [] };
      }
      
      return {
        ...prev,
        items: newItems
      };
    });
  };
  
  const clearCart = () => {
    setCart({ restaurantId: null, items: [] });
    localStorage.removeItem('cart');  //clears local storage then the cart is clean hence removing the bug of alert showing up when it shouldn't 
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
