const pool = require('../config/db');
const logger = require('../config/logger');
const { sanitizeDbError } = require('../utils/sanitizeDbError');

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
  } catch (err) { logger.error('clienteRepository.findAll', { page, message: err.message }); sanitizeDbError(err); }
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
  } catch (err) { logger.error('clienteRepository.count', { message: err.message }); sanitizeDbError(err); }
};

const findPerfil = async (id) => {
  try {
    const [rows] = await pool.query('CALL sp_admin_perfil_cliente(?)', [id]);
    return rows[0];
  } catch (err) { logger.error('clienteRepository.findPerfil', { id, message: err.message }); sanitizeDbError(err); }
};

const editar = async (id, { nombre, telefono, direccion, email }) => {
  try {
    await pool.query('CALL sp_admin_editar_cliente(?,?,?,?,?)',
      [id, nombre, telefono, direccion, email]);
  } catch (err) { logger.error('clienteRepository.editar', { id, message: err.message }); sanitizeDbError(err); }
};

const crear = async ({ nombre, telefono, direccion, email }) => {
  try {
    const [rows] = await pool.query('CALL sp_admin_crear_cliente(?, ?, ?, ?)',
      [nombre, telefono, direccion, email]);
    return rows[0][0].id_generado;
  } catch (err) { logger.error('clienteRepository.crear', { nombre, message: err.message }); sanitizeDbError(err); }
};

module.exports = { findAll, count, findPerfil, editar, crear };
