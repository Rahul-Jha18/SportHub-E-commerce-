const axios = require("axios");
const pool = require('../config/db');


// GET /api/orders/my  – current user's orders
async function getMyOrders(req, res, next) {
  const userId = req.user.id;

  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name AS product_name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders – admin only: all orders
async function getAllOrdersAdmin(req, res, next) {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name AS product_name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// POST /api/orders/checkout – convert CART to real order + save form data
async function checkoutCart(req, res, next) {
  const userId = req.user.id;
  const {
    payment_method = 'COD',
    address = '',
    delivery_location = '',
  } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'CART']
    );

    if (!orders.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'No active cart to checkout' });
    }

    const cartOrder = orders[0];

    const [items] = await conn.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [cartOrder.id]
    );

    if (!items.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const [sumRows] = await conn.query(
      'SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?',
      [cartOrder.id]
    );
    const itemsTotal = sumRows[0].total || 0;

    let delivery_charge = 0;
    if (itemsTotal < 1000) delivery_charge = 100;
    else if (itemsTotal < 5000) delivery_charge = 150;
    else if (itemsTotal < 10000) delivery_charge = 200;
    else delivery_charge = 250;

    const total = itemsTotal + delivery_charge;

    // ✅ update order first
    await conn.query(
      `UPDATE orders
       SET status = ?, total_amount = ?, payment_method = ?, address = ?,
           delivery_location = ?, delivery_charge = ?, payment_status = ?
       WHERE id = ?`,
      [
        payment_method === "KHALTI" ? "PENDING_PAYMENT" : "PENDING",
        total,
        payment_method,
        address,
        delivery_location,
        delivery_charge,
        payment_method === "KHALTI" ? "PENDING" : "UNPAID",
        cartOrder.id,
      ]
    );

    // ✅ COD normal flow
    if (payment_method !== "KHALTI") {
      await conn.commit();
      return res.json({ orderId: cartOrder.id, itemsTotal, delivery_charge, total });
    }

    // ✅ Khalti initiate
    const amountPaisa = Math.round(Number(total) * 100);

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/khalti`,
      website_url: process.env.WEBSITE_URL,
      amount: amountPaisa,
      purchase_order_id: String(cartOrder.id),
      purchase_order_name: "SportHub Order",
      customer_info: {
        name: req.user.name || "Customer",
        email: req.user.email || "customer@sporthub.com",
        phone: req.user.phone || "9800000000",
      },
    };

    const resp = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const { pidx, payment_url } = resp.data;

    await conn.query(
      `UPDATE orders SET khalti_pidx = ? WHERE id = ?`,
      [pidx, cartOrder.id]
    );

    await conn.commit();

    return res.json({
      orderId: cartOrder.id,
      itemsTotal,
      delivery_charge,
      total,
      payment_method: "KHALTI",
      pidx,
      payment_url,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Checkout error:", err?.response?.data || err.message);
    next(err);
  } finally {
    if (conn) conn.release();
  }
}


module.exports = {
  getMyOrders,
  getAllOrdersAdmin,
  checkoutCart,
  deleteOrder,
};

// DELETE /api/orders/:id – admin only: remove order + items
async function deleteOrder(req, res, next) {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyOrders,
  getAllOrdersAdmin,
  checkoutCart,
  deleteOrder,
};
