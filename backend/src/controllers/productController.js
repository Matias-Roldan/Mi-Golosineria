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
  const categoriaId = parseInt(req.params.id);
  if (isNaN(categoriaId))
    return res.status(400).json({ error: 'ID de categoría inválido' });
  try {
    const [rows] = await pool.query('CALL sp_tienda_filtrar_categoria(?)', [categoriaId]);
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

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 150)
    return res.status(400).json({ error: 'Nombre inválido (2-150 caracteres)' });
  if (precio === undefined || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0)
    return res.status(400).json({ error: 'El precio de venta debe ser mayor a 0' });
  if (precio_costo === undefined || isNaN(parseFloat(precio_costo)) || parseFloat(precio_costo) < 0)
    return res.status(400).json({ error: 'El precio de costo no puede ser negativo' });
  if (!categoria || typeof categoria !== 'string')
    return res.status(400).json({ error: 'Categoría requerida' });
  if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0)
    return res.status(400).json({ error: 'Stock inválido' });

  try {
    await pool.query('CALL sp_admin_crear_producto(?,?,?,?,?,?,?)',
      [nombre.trim(), descripcion?.trim() || null, parseFloat(precio), parseFloat(precio_costo), categoria, parseInt(stock), imagen_url || null]);
    res.status(201).json({ mensaje: 'Producto creado exitosamente' });
  } catch (err) {
    console.error('Error crearProducto:', err.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

exports.editarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, precio_costo, categoria, stock, imagen_url } = req.body;

  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ error: 'ID inválido' });
  if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 150))
    return res.status(400).json({ error: 'Nombre inválido (2-150 caracteres)' });
  if (precio !== undefined && (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0))
    return res.status(400).json({ error: 'El precio de venta debe ser mayor a 0' });
  if (precio_costo !== undefined && (isNaN(parseFloat(precio_costo)) || parseFloat(precio_costo) < 0))
    return res.status(400).json({ error: 'El precio de costo no puede ser negativo' });
  if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0))
    return res.status(400).json({ error: 'Stock inválido' });

  try {
    await pool.query(
      'CALL sp_admin_editar_producto(?,?,?,?,?,?,?)',
      [parseInt(id), nombre?.trim(), parseFloat(precio), parseFloat(precio_costo), categoria, parseInt(stock), imagen_url || null]
    );
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    console.error('Error editarProducto:', err.message);
    res.status(500).json({ error: 'Error al editar producto' });
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