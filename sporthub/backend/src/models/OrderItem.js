  const pool = require('../config/db');

  async function createOrderItem({ orderId, productId, quantity, unitPrice }) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)`,
      [orderId, productId, quantity, unitPrice]
    );
  }

  async function getItemsByOrder(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.*, p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  }

  module.exports = {
    createOrderItem,
    getItemsByOrder,
  };
