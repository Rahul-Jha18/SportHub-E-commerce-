// src/pages/Checkout.jsx
import api from "../api/api";
import { useCart } from "../context/CartContext";

function Checkout() {
  const { cart, clearCart } = useCart();

  const placeOrder = async () => {
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const res = await api.post("/orders/checkout");
      alert(
        `Order placed! ID: ${res.data.orderId} | Total: Rs. ${res.data.total}`
      );
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Order failed. Please login.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>
      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}

export default Checkout;
