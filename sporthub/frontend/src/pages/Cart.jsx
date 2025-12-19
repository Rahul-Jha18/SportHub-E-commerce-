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

  const [placing, setPlacing] = useState(false);
  const [notice, setNotice] = useState("");

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
    if (newQty <= 0) removeFromCart(item.id);
    else updateQuantity(item.id, newQty);
  };

  const loadOrders = async () => {
    if (!auth) return;
    setLoadingOrders(true);
    try {
      const url = auth.user?.role === "admin" ? "/orders" : "/orders/my";
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
    setShowForm(true);
    setNotice("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (placing) return;

    setPlacing(true);
    setNotice("");

    try {
      const payload = {
        payment_method: form.paymentMethod,
        address: form.address,
        delivery_location: form.deliveryLocation,
        delivery_charge: Number(form.deliveryCharge) || 0, // backend ignores it anyway
      };

      const res = await api.post("/orders/checkout", payload);

      // ✅ Khalti flow: redirect
      if (form.paymentMethod === "KHALTI") {
        const { payment_url } = res.data;

        if (!payment_url) {
          alert("Payment URL missing. Check backend /orders/checkout response.");
          setPlacing(false);
          return;
        }

        setNotice("Redirecting to Khalti payment...");
        window.location.href = payment_url;
        return;
      }

      // ✅ COD flow
      alert(`Order placed! ID: ${res.data.orderId}, Total: Rs. ${res.data.total}`);
      setShowForm(false);
      await clearCart();
      await loadOrders();
   } catch (err) {
    console.error("Checkout failed full:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url,
    });

    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      JSON.stringify(err.response?.data) ||
      "Checkout failed.";

    alert(msg);
  }finally {
        setPlacing(false);
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
      <h1 className="section-title">Your Cart</h1>

      {notice ? <div className="empty">{notice}</div> : null}

      {cart.length === 0 ? (
        <div className="empty">Your cart is empty.</div>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              {item.image_url && <img src={item.image_url} alt={item.name} />}
              <div className="cart-item-info">
                <h3 style={{ marginBottom: 6 }}>{item.name}</h3>
                <div className="chip" style={{ display: "inline-flex" }}>
                  Rs. {item.price}
                </div>

                <div className="qty-controls">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => handleDec(item)}
                  >
                    -
                  </button>
                  <span className="qty-chip">Qty: {item.quantity}</span>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => handleInc(item)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="btn btn-danger"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h2 style={{ marginBottom: 10 }}>
              Items Total: Rs. {totalItemsAmount.toFixed(2)}
            </h2>
            <button className="btn btn-primary" onClick={handleProceed}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {showForm && (
        <div className="auth-form" style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 10 }}>Order Details</h2>
          <form onSubmit={submitOrder}>
            <input
              className="input"
              type="text"
              name="address"
              placeholder="Full Address"
              required
              value={form.address}
              onChange={handleFormChange}
            />
            <input
              className="input"
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
              <option value="KHALTI">Khalti (Online)</option>
            </select>

            <input
              hidden
              type="number"
              name="deliveryCharge"
              value={form.deliveryCharge}
              onChange={handleFormChange}
            />

            <button className="btn btn-primary" type="submit" disabled={placing}>
              {placing ? "Processing..." : "Confirm Order"}
            </button>
          </form>
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: 22 }}>
        Your Orders
      </h2>

      {loadingOrders ? (
        <div className="empty">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="empty">No orders yet.</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="admin-item">
            <div className="admin-item-info">
              <strong>
                Order #{order.id} –{" "}
                <span style={{ textTransform: "capitalize" }}>{order.status}</span>
              </strong>

              <p style={{ marginTop: 6, color: "rgba(234,240,255,0.72)" }}>
                Total: Rs. {order.total_amount} | Placed on:{" "}
                {order.created_at?.slice(0, 19).replace("T", " ")}
              </p>

              {/* ✅ Optional payment status display (if column exists) */}
              {order.payment_status ? (
                <p style={{ marginTop: 6 }}>
                  Payment Status: <strong>{order.payment_status}</strong>
                </p>
              ) : null}

              {order.address && <p style={{ marginTop: 6 }}>Address: {order.address}</p>}
              {order.delivery_location && <p>Delivery: {order.delivery_location}</p>}
              {order.payment_method && <p>Payment: {order.payment_method}</p>}
              {typeof order.delivery_charge !== "undefined" && (
                <p>Delivery Charge: Rs. {order.delivery_charge}</p>
              )}

              {order.items?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <strong>Items:</strong>
                  <ul style={{ marginLeft: 18, marginTop: 6, color: "rgba(234,240,255,0.78)" }}>
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
                  className="btn btn-danger"
                  style={{ marginTop: 12 }}
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
