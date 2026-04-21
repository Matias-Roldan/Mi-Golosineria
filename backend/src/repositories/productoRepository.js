const pool = require('../config/db');

const findDisponibles = async () => {
  const [rows] = await pool.query('SELECT * FROM v_tienda_productos_disponibles');
  return rows;
};

const findPorCategoria = async (categoriaId) => {
  const [rows] = await pool.query('CALL sp_tienda_filtrar_categoria(?)', [categoriaId]);
  return rows[0];
};

const findAdmin = async () => {
  const [rows] = await pool.query('SELECT * FROM v_admin_productos');
  return rows;
};

const crear = async ({ nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url }) => {
  await pool.query('CALL sp_admin_crear_producto(?,?,?,?,?,?,?)',
    [nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url]);
};

const editar = async (id, { nombre, precio, precio_costo, categoria, stock, imagen_url }) => {
  await pool.query('CALL sp_admin_editar_producto(?,?,?,?,?,?,?)',
    [id, nombre, precio, precio_costo, categoria, stock, imagen_url]);
};

const eliminar = async (id) => {
  await pool.query('CALL sp_admin_eliminar_producto(?)', [id]);
};

const toggleVisibilidad = async (id) => {
  await pool.query('CALL sp_admin_toggle_visibilidad(?)', [id]);
};

module.exports = { findDisponibles, findPorCategoria, findAdmin, crear, editar, eliminar, toggleVisibilidad };
