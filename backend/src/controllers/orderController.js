const pool = require('../config/db');

// Tienda pública: registrar pedido
exports.registrarPedido = async (req, res) => {
  const { nombre_cliente, telefono, notas, items } = req.body;
  if (!nombre_cliente || !telefono || !items?.length)
    return res.status(400).json({ error: 'Datos del pedido incompletos' });

  try {
    const itemsJson = JSON.stringify(items); // [{id, cant}]
    const [rows] = await pool.query('CALL sp_tienda_registrar_pedido(?,?,?,?)',
      [nombre_cliente, telefono, notas || null, itemsJson]);
    const pedidoId = rows[0][0].pedido_generado;
    res.status(201).json({ mensaje: 'Pedido registrado', pedido_id: pedidoId });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al registrar pedido' });
  }
};

// Admin
exports.getPedidosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_admin_pedidos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

exports.getDetallePedido = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('CALL sp_admin_detalle_pedido(?)', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
};

exports.cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'confirmado', 'entregado', 'cancelado'];
  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: 'Estado inválido' });

  try {
    if (estado === 'cancelado') {
      await pool.query('CALL sp_admin_cancelar_pedido_con_stock(?)', [id]);
    } else {
      await pool.query('CALL sp_admin_cambiar_estado_pedido(?,?)', [id, estado]);
    }
    res.json({ mensaje: `Estado actualizado a: ${estado}` });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al cambiar estado' });
  }
};