const pool = require('../config/db');

const registrar = async ({ nombre_cliente, telefono, notas, itemsJson, cupon }) => {
  const [rows] = await pool.query('CALL sp_tienda_registrar_pedido(?,?,?,?,?)',
    [nombre_cliente, telefono, notas, itemsJson, cupon]);
  return rows[0][0].pedido_generado;
};

const validarCupon = async (codigo, total) => {
  const [rows] = await pool.query('CALL sp_tienda_validar_descuento(?,?)', [codigo, total]);
  return rows[0][0] || null;
};

const findAdmin = async () => {
  const [rows] = await pool.query('SELECT * FROM v_admin_pedidos');
  return rows;
};

const findDetalle = async (id) => {
  const [rows] = await pool.query('CALL sp_admin_detalle_pedido(?)', [id]);
  return rows[0];
};

const findEstado = async (id) => {
  const [rows] = await pool.query('SELECT estado FROM pedidos WHERE id = ?', [id]);
  return rows[0] || null;
};

const cambiarEstado = async (id, estado, adminId) => {
  await pool.query('CALL sp_admin_cambiar_estado_pedido(?,?,?)', [id, estado, adminId]);
};

const cancelarConStock = async (id) => {
  await pool.query('CALL sp_admin_cancelar_pedido_con_stock(?)', [id]);
};

const editar = async (id, notas) => {
  await pool.query('CALL sp_admin_editar_pedido(?,?)', [id, notas]);
};

module.exports = { registrar, validarCupon, findAdmin, findDetalle, findEstado, cambiarEstado, cancelarConStock, editar };
