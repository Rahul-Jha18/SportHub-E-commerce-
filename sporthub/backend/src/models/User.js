// models/User.js
const pool = require('../config/db');

async function createUser({ name, email, passwordHash, role = 'user' }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
    [name, email, passwordHash, role]
  );

  return { id: result.insertId, name, email, role };
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
