// src/context/CartContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { auth } = useAuth();
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    if (!auth) {
      setCart([]);
      return;
    }
    try {
      const res = await api.get("/cart");
      const items = res.data.items || [];
      const mapped = items.map((i) => ({
        id: i.product_id,
        name: i.product_name,
        price: i.unit_price,
        quantity: i.quantity,
        image_url: i.image_url,
      }));
      setCart(mapped);
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  };

  useEffect(() => {
    if (auth) fetchCart();
    else setCart([]);
  }, [auth]);

  const addToCart = async (product) => {
    if (!auth) {
      alert("Please login to add items to cart.");
      return;
    }

    // 👉 Immediately update local state (so navbar updates)
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Then sync to backend (if this fails, UI is still responsive)
    try {
      await api.post("/cart/add", {
        product_id: product.id,
        quantity: 1,
      });
      // Optionally refresh from backend to be 100% in sync:
      // await fetchCart();
    } catch (err) {
      console.error("Failed to add to cart on server", err);
      // You could revert local change here if you want strict sync
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!auth) {
      alert("Please login to manage your cart.");
      return;
    }

    // Local update
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((p) => p.id !== productId);
      }
      return prev.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      );
    });

    try {
      await api.patch(`/cart/item/${productId}`, { quantity });
    } catch (err) {
      console.error("Failed to update quantity on server", err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!auth) {
      alert("Please login to manage your cart.");
      return;
    }

    setCart((prev) => prev.filter((p) => p.id !== productId));

    try {
      await api.delete(`/cart/${productId}`);
    } catch (err) {
      console.error("Failed to remove from server cart", err);
    }
  };

  const clearCart = async () => {
    // After checkout, backend CART → PENDING; /cart will be empty
    setCart([]);
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
