const pool = require('../config/db');
const AppError = require('../errors/AppError');

const handleDbError = (err) => {
  if (err.sqlState === '45000') throw new AppError(err.message, 400);
  throw new AppError('Error de base de datos', 500);
};

const findDisponibles = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_tienda_productos_disponibles');
    return rows;
  } catch (err) { handleDbError(err); }
};

const findPorCategoria = async (categoriaId) => {
  const id = parseInt(categoriaId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('categoriaId debe ser un entero positivo');
  }
  try {
    const [rows] = await pool.query('CALL sp_tienda_filtrar_categoria(?)', [id]);
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const findAdmin = async ({ page = 1, limit = 20, search = '', categoria = '' } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';

  if (search) { where += ' AND nombre LIKE ?'; params.push(`%${search}%`); }
  if (categoria) { where += ' AND categoria = ?'; params.push(categoria); }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM v_admin_productos WHERE 1=1${where} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return rows;
  } catch (err) { handleDbError(err); }
};

const countAdmin = async ({ search = '', categoria = '' } = {}) => {
  const params = [];
  let where = '';

  if (search) { where += ' AND nombre LIKE ?'; params.push(`%${search}%`); }
  if (categoria) { where += ' AND categoria = ?'; params.push(categoria); }

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM v_admin_productos WHERE 1=1${where}`,
      params
    );
    return total;
  } catch (err) { handleDbError(err); }
};

const crear = async ({ nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url }) => {
  try {
    await pool.query('CALL sp_admin_crear_producto(?,?,?,?,?,?,?)',
      [nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url]);
  } catch (err) { handleDbError(err); }
};

const editar = async (id, { nombre, precio, precio_costo, categoria, stock, imagen_url }) => {
  try {
    await pool.query('CALL sp_admin_editar_producto(?,?,?,?,?,?,?)',
      [id, nombre, precio, precio_costo, categoria, stock, imagen_url]);
  } catch (err) { handleDbError(err); }
};

const eliminar = async (id) => {
  try {
    await pool.query('CALL sp_admin_eliminar_producto(?)', [id]);
  } catch (err) { handleDbError(err); }
};

const toggleVisibilidad = async (id) => {
  try {
    await pool.query('CALL sp_admin_toggle_visibilidad(?)', [id]);
  } catch (err) { handleDbError(err); }
};

module.exports = { findDisponibles, findPorCategoria, findAdmin, countAdmin, crear, editar, eliminar, toggleVisibilidad };
