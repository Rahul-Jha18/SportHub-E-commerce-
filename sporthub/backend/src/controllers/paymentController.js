const axios = require("axios");
const pool = require("../config/db");

// POST /api/payments/khalti/verify
async function khaltiVerify(req, res, next) {
  const { orderId, pidx } = req.body;

  if (!orderId || !pidx) {
    return res.status(400).json({ message: "orderId and pidx required" });
  }

  try {
    // ✅ Safety: ensure order exists and pidx matches stored pidx (if stored)
    const [rows] = await pool.query(
      "SELECT id, khalti_pidx, payment_status FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = rows[0];

    if (order.khalti_pidx && order.khalti_pidx !== pidx) {
      return res.status(400).json({ message: "Invalid payment reference (pidx mismatch)" });
    }

    // ✅ Verify via Khalti lookup
    const lookup = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = lookup.data;

    if (data.status === "Completed") {
      await pool.query(
        `UPDATE orders
         SET payment_method='KHALTI',
             payment_status='PAID',
             status='PENDING',
             khalti_pidx=?,
             khalti_txn_id=?
         WHERE id=?`,
        [data.pidx, data.transaction_id || null, orderId]
      );

      return res.json({ ok: true, status: "PAID", khalti: data });
    }

    if (data.status === "Pending" || data.status === "Initiated") {
      await pool.query(
        `UPDATE orders
         SET payment_method='KHALTI',
             payment_status='PENDING',
             khalti_pidx=?
         WHERE id=?`,
        [pidx, orderId]
      );

      return res.json({ ok: true, status: "PENDING", khalti: data });
    }

    // Expired / User canceled / Failed
    await pool.query(
      `UPDATE orders
       SET payment_method='KHALTI',
           payment_status='FAILED',
           khalti_pidx=?
       WHERE id=?`,
      [pidx, orderId]
    );

    return res.json({ ok: false, status: "FAILED", khalti: data });
  } catch (err) {
    console.error("Khalti verify error:", err?.response?.data || err.message);
    next(err);
  }
}

module.exports = { khaltiVerify };
