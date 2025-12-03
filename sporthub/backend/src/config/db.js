const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sporthub',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test DB connection
pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL Connected Successfully");
    conn.release();
  })
  .catch(err => {
    console.error("❌ MySQL Connection Failed:", err);
  });

module.exports = pool;
