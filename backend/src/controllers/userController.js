const pool = require('../config/db');

exports.getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_admin_clientes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

exports.getPerfilCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('CALL sp_admin_perfil_cliente(?)', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

exports.editarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion } = req.body;
  try {
    await pool.query('CALL sp_admin_editar_cliente(?,?,?,?)', [id, nombre, telefono, direccion]);
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al editar cliente' });
  }
};

exports.crearCliente = async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  if (!nombre || !telefono)
    return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
  try {
    const [rows] = await pool.query(
      'CALL sp_admin_crear_cliente(?, ?, ?)',
      [nombre, telefono, direccion || null]
    );
    res.status(201).json({ mensaje: 'Cliente creado', id: rows[0][0].id_generado });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al crear cliente' });
  }
};