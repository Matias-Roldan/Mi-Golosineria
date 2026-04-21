const pool = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios_admin WHERE email = ?', [email]);
  return rows[0] || null;
};

module.exports = { findByEmail };
