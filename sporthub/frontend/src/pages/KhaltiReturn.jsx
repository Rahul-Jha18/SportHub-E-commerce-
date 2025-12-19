import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";

function KhaltiReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [msg, setMsg] = useState("Verifying payment...");

  useEffect(() => {
    const run = async () => {
      const pidx = params.get("pidx");
      const purchase_order_id = params.get("purchase_order_id"); // we set this = orderId
      const status = params.get("status");

      if (!pidx || !purchase_order_id) {
        setMsg("Missing payment info. Please contact support.");
        return;
      }

      try {
        // verify from backend (lookup)
        const res = await api.post("/payments/khalti/verify", {
          orderId: Number(purchase_order_id),
          pidx,
        });

        if (res.data?.status === "PAID") {
          setMsg("✅ Payment successful! Your order is confirmed.");
          await fetchCart(); // cart may be cleared by backend logic
          setTimeout(() => navigate("/cart"), 1200);
        } else if (res.data?.status === "PENDING") {
          setMsg("⏳ Payment pending. Please wait and refresh later.");
        } else {
          setMsg(`❌ Payment failed (${status || "unknown"}).`);
        }
      } catch (e) {
        console.error(e);
        setMsg("Verification failed. Please try again.");
      }
    };

    run();
  }, [params, navigate, fetchCart]);

  return (
    <div className="page-wrapper">
      <h2 className="section-title">Khalti Payment</h2>
      <div className="empty">{msg}</div>
      <button style={{ marginTop: 14 }} onClick={() => navigate("/cart")}>
        Back to Cart
      </button>
    </div>
  );
}

export default KhaltiReturn;
