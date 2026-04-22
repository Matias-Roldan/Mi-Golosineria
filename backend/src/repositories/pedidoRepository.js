const pool = require('../config/db');
const AppError = require('../errors/AppError');

const handleDbError = (err) => {
  if (err.sqlState === '45000') throw new AppError(err.message, 400);
  throw new AppError('Error de base de datos', 500);
};

const registrar = async ({ nombre_cliente, telefono, notas, itemsJson, cupon }) => {
  try {
    const [rows] = await pool.query('CALL sp_tienda_registrar_pedido(?,?,?,?,?)',
      [nombre_cliente, telefono, notas, itemsJson, cupon]);
    return rows[0][0].pedido_generado;
  } catch (err) { handleDbError(err); }
};

const validarCupon = async (codigo, total) => {
  try {
    const [rows] = await pool.query('CALL sp_tienda_validar_descuento(?,?)', [codigo, total]);
    return rows[0][0] || null;
  } catch (err) { handleDbError(err); }
};

const findAdmin = async ({ page = 1, limit = 20, search = '', estado = 'todos' } = {}) => {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM v_admin_pedidos
       WHERE (? = 'todos' OR estado = ?)
         AND (? = '' OR cliente_nombre LIKE ? OR CAST(id AS CHAR) LIKE ?)
       ORDER BY id DESC LIMIT ?, ?`,
      [estado, estado, search, like, like, offset, limit]
    );
    return rows;
  } catch (err) { handleDbError(err); }
};

const countAdmin = async ({ search = '', estado = 'todos' } = {}) => {
  const like = `%${search}%`;
  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM v_admin_pedidos
       WHERE (? = 'todos' OR estado = ?)
         AND (? = '' OR cliente_nombre LIKE ? OR CAST(id AS CHAR) LIKE ?)`,
      [estado, estado, search, like, like]
    );
    return total;
  } catch (err) { handleDbError(err); }
};

const findDetalle = async (id) => {
  try {
    const [rows] = await pool.query('CALL sp_admin_detalle_pedido(?)', [id]);
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const findEstado = async (id) => {
  try {
    const [rows] = await pool.query('SELECT estado FROM pedidos WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (err) { handleDbError(err); }
};

const cambiarEstado = async (id, estado, adminId) => {
  try {
    await pool.query('CALL sp_admin_cambiar_estado_pedido(?,?,?)', [id, estado, adminId]);
  } catch (err) { handleDbError(err); }
};

const cancelarConStock = async (id) => {
  try {
    await pool.query('CALL sp_admin_cancelar_pedido_con_stock(?)', [id]);
  } catch (err) { handleDbError(err); }
};

const editar = async (id, notas) => {
  try {
    await pool.query('CALL sp_admin_editar_pedido(?,?)', [id, notas]);
  } catch (err) { handleDbError(err); }
};

module.exports = { registrar, validarCupon, findAdmin, countAdmin, findDetalle, findEstado, cambiarEstado, cancelarConStock, editar };
