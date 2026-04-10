const pool = require('../config/db');

// Tienda pública: registrar pedido
exports.registrarPedido = async (req, res) => {
  const { nombre_cliente, telefono, notas, items } = req.body;

  if (!nombre_cliente || typeof nombre_cliente !== 'string' || nombre_cliente.trim().length < 2 || nombre_cliente.trim().length > 100)
    return res.status(400).json({ error: 'Nombre inválido (2-100 caracteres)' });
  if (!telefono || typeof telefono !== 'string' || !/^\d{7,20}$/.test(telefono.trim()))
    return res.status(400).json({ error: 'Teléfono inválido (solo dígitos, 7-20 caracteres)' });
  if (!Array.isArray(items) || items.length === 0 || items.length > 50)
    return res.status(400).json({ error: 'Items inválidos' });
  for (const item of items) {
    if (!item.id || !Number.isInteger(item.id) || item.id <= 0)
      return res.status(400).json({ error: 'ID de producto inválido en items' });
    if (!item.cant || !Number.isInteger(item.cant) || item.cant <= 0 || item.cant > 999)
      return res.status(400).json({ error: 'Cantidad inválida en items' });
  }
  if (notas !== undefined && notas !== null && (typeof notas !== 'string' || notas.length > 500))
    return res.status(400).json({ error: 'Notas demasiado largas (máx. 500 caracteres)' });

  try {
    const itemsJson = JSON.stringify(items);
    const [rows] = await pool.query('CALL sp_tienda_registrar_pedido(?,?,?,?)',
      [nombre_cliente.trim(), telefono.trim(), notas?.trim() || null, itemsJson]);
    const pedidoId = rows[0][0].pedido_generado;
    res.status(201).json({ mensaje: 'Pedido registrado', pedido_id: pedidoId });
  } catch (err) {
    console.error('Error registrarPedido:', err.message);
    // SQLSTATE 45000 = error de negocio definido en el SP (ej: stock insuficiente, producto inexistente)
    const esBizError = err.sqlState === '45000';
    res.status(esBizError ? 400 : 500).json({
      error: esBizError ? (err.sqlMessage || 'Error al registrar pedido') : 'Error al registrar pedido'
    });
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
  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ error: 'ID inválido' });

  try {
    const [rows] = await pool.query('SELECT estado FROM pedidos WHERE id = ?', [parseInt(id)]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Pedido no encontrado' });

    const estadoActual = rows[0].estado;

    if (estadoActual === 'cancelado')
      return res.status(400).json({ error: 'No se puede modificar un pedido cancelado' });

    if (estadoActual === 'entregado' && estado === 'cancelado')
      return res.status(400).json({ error: 'No se puede cancelar un pedido que ya fue entregado' });

    if (estado === 'cancelado') {
      await pool.query('CALL sp_admin_cancelar_pedido_con_stock(?)', [parseInt(id)]);
    } else {
      await pool.query('CALL sp_admin_cambiar_estado_pedido(?,?,?)', [parseInt(id), estado, req.admin.id]);
    }

    res.json({ mensaje: `Estado actualizado a: ${estado}` });
  } catch (err) {
    console.error('Error cambiarEstado:', err.message);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

exports.editarPedido = async (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;
  if (!id || isNaN(parseInt(id)))
    return res.status(400).json({ error: 'ID inválido' });
  if (notas !== undefined && notas !== null && (typeof notas !== 'string' || notas.length > 500))
    return res.status(400).json({ error: 'Notas demasiado largas (máx. 500 caracteres)' });
  try {
    await pool.query('CALL sp_admin_editar_pedido(?,?)', [parseInt(id), notas?.trim() || null]);
    res.json({ mensaje: 'Pedido actualizado' });
  } catch (err) {
    console.error('Error editarPedido:', err.message);
    res.status(500).json({ error: 'Error al editar pedido' });
  }
};

exports.validarCupon = async (req, res) => {
  const { codigo, total } = req.body;
  if (!codigo || typeof codigo !== 'string' || codigo.trim().length === 0 || codigo.trim().length > 50)
    return res.status(400).json({ error: 'Código de cupón inválido' });
  if (total === undefined || isNaN(parseFloat(total)) || parseFloat(total) < 0)
    return res.status(400).json({ error: 'Total inválido' });
  try {
    const [rows] = await pool.query('CALL sp_tienda_validar_descuento(?,?)', [codigo.trim().toUpperCase(), parseFloat(total)]);
    const resultado = rows[0][0];
    if (!resultado) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json(resultado);
  } catch (err) {
    console.error('Error validarCupon:', err.message);
    res.status(400).json({ error: 'Error al validar cupón' });
  }
};