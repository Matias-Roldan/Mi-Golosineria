const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM v_admin_clientes');
  return rows;
};

const findPerfil = async (id) => {
  const [rows] = await pool.query('CALL sp_admin_perfil_cliente(?)', [id]);
  return rows[0];
};

const editar = async (id, { nombre, telefono, direccion, email }) => {
  await pool.query('CALL sp_admin_editar_cliente(?,?,?,?,?)',
    [id, nombre, telefono, direccion, email]);
};

const crear = async ({ nombre, telefono, direccion, email }) => {
  const [rows] = await pool.query('CALL sp_admin_crear_cliente(?, ?, ?, ?)',
    [nombre, telefono, direccion, email]);
  return rows[0][0].id_generado;
};

module.exports = { findAll, findPerfil, editar, crear };
