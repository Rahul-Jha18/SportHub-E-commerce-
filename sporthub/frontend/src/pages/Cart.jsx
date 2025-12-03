// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { auth } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [form, setForm] = useState({
    address: "",
    deliveryLocation: "",
    paymentMethod: "COD",
    deliveryCharge: 0,
  });

  if (!auth) {
    return (
      <div className="page-wrapper">
        <h2>Please login to view your cart.</h2>
      </div>
    );
  }

  const totalItemsAmount = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleInc = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDec = (item) => {
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQty);
    }
  };

  const loadOrders = async () => {
    if (!auth) return;
    setLoadingOrders(true);
    try {
      const url =
        auth.user?.role === "admin" ? "/orders" : "/orders/my";
      const res = await api.get(url);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [auth]);

  const handleProceed = () => {
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }
    setShowForm(true); // 👉 just show the form, do NOT call backend yet
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitOrder = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      payment_method: form.paymentMethod,
      address: form.address,
      delivery_location: form.deliveryLocation,
      delivery_charge: Number(form.deliveryCharge) || 0,
    };
    const res = await api.post("/orders/checkout", payload);
    alert(
      `Order placed! ID: ${res.data.orderId}, Total: Rs. ${res.data.total}`
    );
    setShowForm(false);
    await clearCart();
    await loadOrders();
  } catch (err) {
    console.error("Checkout failed", err);
    const msg = err.response?.data?.message || "Checkout failed.";
    alert(msg);           // 🔥 show backend message
  }
    };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      await loadOrders();
    } catch (err) {
      console.error("Failed to delete order", err);
      alert("Could not delete order.");
    }
  };

  return (
    <div className="page-wrapper">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} />
              )}
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>Rs. {item.price}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button type="button" onClick={() => handleDec(item)}>
                    -
                  </button>
                  <span>Qty: {item.quantity}</span>
                  <button type="button" onClick={() => handleInc(item)}>
                    +
                  </button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}

          <div className="cart-summary">
            <h2>Items Total: Rs. {totalItemsAmount.toFixed(2)}</h2>
            <button style={{ marginTop: 10 }} onClick={handleProceed}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {/* Checkout form appears ONLY after clicking Proceed */}
      {showForm && (
        <div className="auth-form" style={{ marginTop: 30 }}>
          <h2>Order Details</h2>
          <form onSubmit={submitOrder}>
            <input
              type="text"
              name="address"
              placeholder="Full Address"
              required
              value={form.address}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="deliveryLocation"
              placeholder="Delivery Location / City"
              required
              value={form.deliveryLocation}
              onChange={handleFormChange}
            />
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleFormChange}
            >
              <option value="COD">Cash on Delivery</option>
              <option value="CARD">Card Payment</option>
              <option value="WALLET">Wallet / Online</option>
            </select>
            <input hidden 
              type="number"
              name="deliveryCharge"
              placeholder="Delivery Charge"
              value={form.deliveryCharge}
              onChange={handleFormChange}
            />
            <button type="submit" style={{ marginTop: 8 }}>
              Confirm Order
            </button>
          </form>
        </div>
      )}

      {/* Orders list (user sees their own; admin sees all) */}
      <h2 className="section-title" style={{ marginTop: 30 }}>
        Your Orders
      </h2>

      {loadingOrders ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="admin-item">
            <div className="admin-item-info">
              <strong>
                Order #{order.id} –{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {order.status}
                </span>
              </strong>
              <p>
                Total: Rs. {order.total_amount} | Placed on:{" "}
                {order.created_at?.slice(0, 19).replace("T", " ")}
              </p>
              {order.address && <p>Address: {order.address}</p>}
              {order.delivery_location && (
                <p>Delivery: {order.delivery_location}</p>
              )}
              {order.payment_method && (
                <p>Payment: {order.payment_method}</p>
              )}
              {typeof order.delivery_charge !== "undefined" && (
                <p>Delivery Charge: Rs. {order.delivery_charge}</p>
              )}

              {order.items && order.items.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <strong>Items:</strong>
                  <ul style={{ marginLeft: 16, marginTop: 4 }}>
                    {order.items.map((it) => (
                      <li key={it.id}>
                        {it.product_name} x {it.quantity} (Rs. {it.unit_price})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {auth.user?.role === "admin" && (
                <button
                  style={{ marginTop: 10, background: "#ff3333" }}
                  onClick={() => deleteOrder(order.id)}
                >
                  Delete Order
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Cart;
