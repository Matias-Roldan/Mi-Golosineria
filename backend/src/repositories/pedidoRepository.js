const pool = require('../config/db');
const logger = require('../config/logger');
const { sanitizeDbError } = require('../utils/sanitizeDbError');

const registrar = async ({ nombre_cliente, telefono, notas, itemsJson, cupon }) => {
  try {
    const [rows] = await pool.query('CALL sp_tienda_registrar_pedido(?,?,?,?,?)',
      [nombre_cliente, telefono, notas, itemsJson, cupon]);
    return rows[0][0].pedido_generado;
  } catch (err) { logger.error('pedidoRepository.registrar', { nombre_cliente, message: err.message }); sanitizeDbError(err); }
};

const validarCupon = async (codigo, total) => {
  try {
    const [rows] = await pool.query('CALL sp_tienda_validar_descuento(?,?)', [codigo, total]);
    return rows[0][0] || null;
  } catch (err) { logger.error('pedidoRepository.validarCupon', { codigo, message: err.message }); sanitizeDbError(err); }
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
  } catch (err) { logger.error('pedidoRepository.findAdmin', { page, estado, message: err.message }); sanitizeDbError(err); }
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
  } catch (err) { logger.error('pedidoRepository.countAdmin', { estado, message: err.message }); sanitizeDbError(err); }
};

const findDetalle = async (id) => {
  try {
    const [rows] = await pool.query('CALL sp_admin_detalle_pedido(?)', [id]);
    return rows[0];
  } catch (err) { logger.error('pedidoRepository.findDetalle', { id, message: err.message }); sanitizeDbError(err); }
};

const findEstado = async (id) => {
  try {
    const [rows] = await pool.query('SELECT estado FROM pedidos WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (err) { logger.error('pedidoRepository.findEstado', { id, message: err.message }); sanitizeDbError(err); }
};

const cambiarEstado = async (id, estado, adminId) => {
  try {
    await pool.query('CALL sp_admin_cambiar_estado_pedido(?,?,?)', [id, estado, adminId]);
  } catch (err) { logger.error('pedidoRepository.cambiarEstado', { id, estado, message: err.message }); sanitizeDbError(err); }
};

const cancelarConStock = async (id) => {
  try {
    await pool.query('CALL sp_admin_cancelar_pedido_con_stock(?)', [id]);
  } catch (err) { logger.error('pedidoRepository.cancelarConStock', { id, message: err.message }); sanitizeDbError(err); }
};

const editar = async (id, notas) => {
  try {
    await pool.query('CALL sp_admin_editar_pedido(?,?)', [id, notas]);
  } catch (err) { logger.error('pedidoRepository.editar', { id, message: err.message }); sanitizeDbError(err); }
};

module.exports = { registrar, validarCupon, findAdmin, countAdmin, findDetalle, findEstado, cambiarEstado, cancelarConStock, editar };
