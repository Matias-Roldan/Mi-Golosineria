const pool = require('../config/db');

// Tienda pública
exports.getProductosDisponibles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_tienda_productos_disponibles');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.filtrarPorCategoria = async (req, res) => {
  const { categoria } = req.params;
  try {
    const [rows] = await pool.query('CALL sp_tienda_filtrar_categoria(?)', [categoria]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al filtrar productos' });
  }
};

// Admin
exports.getProductosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_admin_productos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url } = req.body;
  try {
    await pool.query('CALL sp_admin_crear_producto(?,?,?,?,?,?,?)',
      [nombre, descripcion || null, parseFloat(precio), parseFloat(precio_costo), categoria, parseInt(stock), imagen_url || null]);
    res.status(201).json({ mensaje: 'Producto creado exitosamente' });
  } catch (err) {
    console.error('❌ Error crearProducto:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.editarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, precio_costo, categoria, stock, imagen_url } = req.body;
  try {
    await pool.query(
      'CALL sp_admin_editar_producto(?,?,?,?,?,?,?)',
      [id, nombre, parseFloat(precio), parseFloat(precio_costo), categoria, parseInt(stock), imagen_url || null]
    );
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    console.error('Error editarProducto:', err.message);
    res.status(500).json({ error: err.message || 'Error al editar producto' });
  }
};

exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('CALL sp_admin_eliminar_producto(?)', [id]);
    res.json({ mensaje: 'Producto eliminado (soft delete)' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

exports.toggleVisibilidad = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('CALL sp_admin_toggle_visibilidad(?)', [id]);
    res.json({ mensaje: 'Visibilidad actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar visibilidad' });
  }
};