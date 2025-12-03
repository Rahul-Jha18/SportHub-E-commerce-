const pool = require('../config/db');

async function getAllCategories() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

async function createCategory({ name, slug }) {
  const [result] = await pool.query(
    'INSERT INTO categories (name, slug) VALUES (?, ?)',
    [name, slug]
  );
  return { id: result.insertId, name, slug };
}

async function findCategoryById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

module.exports = {
  getAllCategories,
  createCategory,
  findCategoryById,
};
