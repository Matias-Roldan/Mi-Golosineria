const pool = require('../config/db');
const logger = require('../config/logger');
const { sanitizeDbError } = require('../utils/sanitizeDbError');

const findDisponibles = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_tienda_productos_disponibles');
    return rows;
  } catch (err) { logger.error('productoRepository.findDisponibles', { message: err.message }); sanitizeDbError(err); }
};

const findPorCategoria = async (categoriaId) => {
  const id = parseInt(categoriaId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('categoriaId debe ser un entero positivo');
  }
  try {
    const [rows] = await pool.query('CALL sp_tienda_filtrar_categoria(?)', [id]);
    return rows[0];
  } catch (err) { logger.error('productoRepository.findPorCategoria', { categoriaId, message: err.message }); sanitizeDbError(err); }
};

const buildWhereClause = ({ search = '', categoria = '' } = {}) => {
  const params = [];
  let sql = '';
  if (search) { sql += ' AND nombre LIKE ?'; params.push(`%${search}%`); }
  if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
  return { sql, params };
};

const findAdmin = async ({ page = 1, limit = 20, search = '', categoria = '' } = {}) => {
  const offset = (page - 1) * limit;
  const { sql: where, params } = buildWhereClause({ search, categoria });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM v_admin_productos WHERE 1=1${where} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return rows;
  } catch (err) { logger.error('productoRepository.findAdmin', { page, search, categoria, message: err.message }); sanitizeDbError(err); }
};

const countAdmin = async ({ search = '', categoria = '' } = {}) => {
  const { sql: where, params } = buildWhereClause({ search, categoria });

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM v_admin_productos WHERE 1=1${where}`,
      params
    );
    return total;
  } catch (err) { logger.error('productoRepository.countAdmin', { search, categoria, message: err.message }); sanitizeDbError(err); }
};

const crear = async ({ nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url }) => {
  try {
    await pool.query('CALL sp_admin_crear_producto(?,?,?,?,?,?,?)',
      [nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url]);
  } catch (err) { logger.error('productoRepository.crear', { nombre, message: err.message }); sanitizeDbError(err); }
};

const editar = async (id, { nombre, precio, precio_costo, categoria, stock, imagen_url }) => {
  try {
    await pool.query('CALL sp_admin_editar_producto(?,?,?,?,?,?,?)',
      [id, nombre, precio, precio_costo, categoria, stock, imagen_url]);
  } catch (err) { logger.error('productoRepository.editar', { id, message: err.message }); sanitizeDbError(err); }
};

const eliminar = async (id) => {
  try {
    await pool.query('CALL sp_admin_eliminar_producto(?)', [id]);
  } catch (err) { logger.error('productoRepository.eliminar', { id, message: err.message }); sanitizeDbError(err); }
};

const toggleVisibilidad = async (id) => {
  try {
    await pool.query('CALL sp_admin_toggle_visibilidad(?)', [id]);
  } catch (err) { logger.error('productoRepository.toggleVisibilidad', { id, message: err.message }); sanitizeDbError(err); }
};

module.exports = { findDisponibles, findPorCategoria, findAdmin, countAdmin, crear, editar, eliminar, toggleVisibilidad };
