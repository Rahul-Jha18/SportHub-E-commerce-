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
// POST /api/orders/checkout – convert CART to real order + save form data
async function checkoutCart(req, res, next) {
  const userId = req.user.id;
  const {
    payment_method = 'COD',
    address = '',
    delivery_location = '',
    // we IGNORE any delivery_charge from body now
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

    // 1) items total
    const [sumRows] = await conn.query(
      'SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?',
      [cartOrder.id]
    );
    const itemsTotal = sumRows[0].total || 0;

    // 2) delivery charge slabs
    let delivery_charge = 0;
    if (itemsTotal < 1000) {
      delivery_charge = 100;
    } else if (itemsTotal < 5000) {
      delivery_charge = 150;
    } else if (itemsTotal < 10000) {
      delivery_charge = 200;
    } else {
      delivery_charge = 250;
    }

    // 3) grand total
    const total = itemsTotal + delivery_charge;

    // 4) update order as PENDING with all info
    await conn.query(
      `UPDATE orders
       SET status = ?, total_amount = ?, payment_method = ?, address = ?,
           delivery_location = ?, delivery_charge = ?
       WHERE id = ?`,
      [
        'PENDING',
        total,
        payment_method,
        address,
        delivery_location,
        delivery_charge,
        cartOrder.id,
      ]
    );

    await conn.commit();

    return res.json({ orderId: cartOrder.id, itemsTotal, delivery_charge, total });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
}

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
