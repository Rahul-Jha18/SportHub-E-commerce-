const pool = require('../config/db');

async function getProducts({ categorySlug, sportType, search } = {}) {
  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (categorySlug) {
    sql += ' AND c.slug = ?';
    params.push(categorySlug);
  }

  if (sportType) {
    sql += ' AND p.sport_type = ?';
    params.push(sportType);
  }

  if (search) {
    sql += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY p.created_at DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query(
    `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
    `,
    [id]
  );
  return rows[0] || null;
}

async function createProduct(data) {
  const {
    name,
    description,
    price,
    stock,
    image_url,
    category_id,
    sport_type,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO products
     (name, description, price, stock, image_url, category_id, sport_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [name, description, price, stock, image_url, category_id, sport_type]
  );

  return { id: result.insertId, ...data };
}

async function updateProduct(id, data) {
  const {
    name,
    description,
    price,
    stock,
    image_url,
    category_id,
    sport_type,
  } = data;

  await pool.query(
    `UPDATE products
     SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category_id = ?, sport_type = ?
     WHERE id = ?`,
    [name, description, price, stock, image_url, category_id, sport_type, id]
  );
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
