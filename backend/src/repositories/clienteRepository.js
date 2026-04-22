const pool = require('../config/db');
const AppError = require('../errors/AppError');

const handleDbError = (err) => {
  if (err.sqlState === '45000') throw new AppError(err.message, 400);
  throw new AppError('Error de base de datos', 500);
};

const findAll = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM v_admin_clientes
       WHERE (? = '' OR nombre LIKE ? OR telefono LIKE ?)
       ORDER BY id DESC LIMIT ?, ?`,
      [search, like, like, offset, limit]
    );
    return rows;
  } catch (err) { handleDbError(err); }
};

const count = async ({ search = '' } = {}) => {
  const like = `%${search}%`;
  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM v_admin_clientes
       WHERE (? = '' OR nombre LIKE ? OR telefono LIKE ?)`,
      [search, like, like]
    );
    return total;
  } catch (err) { handleDbError(err); }
};

const findPerfil = async (id) => {
  try {
    const [rows] = await pool.query('CALL sp_admin_perfil_cliente(?)', [id]);
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const editar = async (id, { nombre, telefono, direccion, email }) => {
  try {
    await pool.query('CALL sp_admin_editar_cliente(?,?,?,?,?)',
      [id, nombre, telefono, direccion, email]);
  } catch (err) { handleDbError(err); }
};

const crear = async ({ nombre, telefono, direccion, email }) => {
  try {
    const [rows] = await pool.query('CALL sp_admin_crear_cliente(?, ?, ?, ?)',
      [nombre, telefono, direccion, email]);
    return rows[0][0].id_generado;
  } catch (err) { handleDbError(err); }
};

module.exports = { findAll, count, findPerfil, editar, crear };
