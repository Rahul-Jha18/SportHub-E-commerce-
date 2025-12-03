  const pool = require('../config/db');

  async function createOrder({ userId, totalAmount, status = 'PENDING' }) {
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, NOW())',
      [userId, totalAmount, status]
    );
    return { id: result.insertId, user_id: userId, total_amount: totalAmount, status };
  }

  async function getOrdersByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async function getAllOrders() {
    const [rows] = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC`
    );
    return rows;
  }

  module.exports = {
    createOrder,
    getOrdersByUser,
    getAllOrders,
  };
