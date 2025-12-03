const pool = require('../config/db');

// GET /api/cart – current user's active cart
async function getCart(req, res, next) {
  const userId = req.user.id;

  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'CART']
    );

    if (!orders.length) {
      return res.json({ order: null, items: [] });
    }

    const order = orders[0];

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    return res.json({ order, items });
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/add  – add product to cart (and store in orders/order_items)
async function addToCart(req, res, next) {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid product or quantity' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) Ensure product exists and get price
    const [prodRows] = await conn.query(
      'SELECT id, price FROM products WHERE id = ?',
      [product_id]
    );
    if (!prodRows.length) {
      throw new Error('Product not found');
    }
    const product = prodRows[0];

    // 2) Find or create CART order for this user
    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'CART']
    );

    let orderId;
    if (!orders.length) {
      const [orderResult] = await conn.query(
        'INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, NOW())',
        [userId, 0, 'CART']
      );
      orderId = orderResult.insertId;
    } else {
      orderId = orders[0].id;
    }

    // 3) Insert or update order_items
    const [itemRows] = await conn.query(
      'SELECT * FROM order_items WHERE order_id = ? AND product_id = ?',
      [orderId, product_id]
    );

    if (itemRows.length) {
      const newQty = itemRows[0].quantity + quantity;
      await conn.query(
        'UPDATE order_items SET quantity = ? WHERE id = ?',
        [newQty, itemRows[0].id]
      );
    } else {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, product_id, quantity, product.price]
      );
    }

    // 4) Recalculate total
    const [sumRows] = await conn.query(
      'SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?',
      [orderId]
    );
    const total = sumRows[0].total || 0;

    await conn.query(
      'UPDATE orders SET total_amount = ? WHERE id = ?',
      [total, orderId]
    );

    await conn.commit();

    const [items] = await conn.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return res.status(201).json({
      order: { id: orderId, total_amount: total, status: 'CART' },
      items,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
}

// PATCH /api/cart/item/:productId  – update quantity (+/-)
async function updateCartItem(req, res, next) {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // find CART order
    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'CART']
    );

    if (!orders.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'No active cart' });
    }

    const orderId = orders[0].id;

    if (quantity === 0) {
      // remove item
      await conn.query(
        'DELETE FROM order_items WHERE order_id = ? AND product_id = ?',
        [orderId, productId]
      );
    } else {
      await conn.query(
        'UPDATE order_items SET quantity = ? WHERE order_id = ? AND product_id = ?',
        [quantity, orderId, productId]
      );
    }

    // recalc total
    const [sumRows] = await conn.query(
      'SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?',
      [orderId]
    );
    const total = sumRows[0].total || 0;

    await conn.query(
      'UPDATE orders SET total_amount = ? WHERE id = ?',
      [total, orderId]
    );

    await conn.commit();

    return res.json({ orderId, total });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
}

// DELETE /api/cart/:productId – remove item from cart
async function removeFromCart(req, res, next) {
  const userId = req.user.id;
  const { productId } = req.params;

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
      return res.status(400).json({ message: 'No active cart' });
    }

    const orderId = orders[0].id;

    await conn.query(
      'DELETE FROM order_items WHERE order_id = ? AND product_id = ?',
      [orderId, productId]
    );

    const [sumRows] = await conn.query(
      'SELECT SUM(quantity * unit_price) AS total FROM order_items WHERE order_id = ?',
      [orderId]
    );
    const total = sumRows[0].total || 0;

    await conn.query(
      'UPDATE orders SET total_amount = ? WHERE id = ?',
      [total, orderId]
    );

    await conn.commit();
    return res.json({ orderId, total });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
