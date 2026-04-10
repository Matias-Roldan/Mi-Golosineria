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
  const { nombre, telefono, direccion, email } = req.body;
  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ error: 'ID inválido' });
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100)
    return res.status(400).json({ error: 'Nombre inválido (2-100 caracteres)' });
  if (!telefono || typeof telefono !== 'string' || !/^\d{7,20}$/.test(telefono.trim()))
    return res.status(400).json({ error: 'Teléfono inválido (solo dígitos, 7-20 caracteres)' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Email inválido' });
  try {
    await pool.query('CALL sp_admin_editar_cliente(?,?,?,?,?)',
      [parseInt(id), nombre.trim(), telefono.trim(), direccion?.trim() || null, email?.trim() || null]);
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (err) {
    console.error('Error editarCliente:', err.message);
    res.status(500).json({ error: 'Error al editar cliente' });
  }
};

exports.crearCliente = async (req, res) => {
  const { nombre, telefono, direccion, email } = req.body;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100)
    return res.status(400).json({ error: 'Nombre inválido (2-100 caracteres)' });
  if (!telefono || typeof telefono !== 'string' || !/^\d{7,20}$/.test(telefono.trim()))
    return res.status(400).json({ error: 'Teléfono inválido (solo dígitos, 7-20 caracteres)' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Email inválido' });
  try {
    const [rows] = await pool.query(
      'CALL sp_admin_crear_cliente(?, ?, ?, ?)',
      [nombre.trim(), telefono.trim(), direccion?.trim() || null, email?.trim() || null]
    );
    res.status(201).json({ mensaje: 'Cliente creado', id: rows[0][0].id_generado });
  } catch (err) {
    console.error('Error crearCliente:', err.message);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};