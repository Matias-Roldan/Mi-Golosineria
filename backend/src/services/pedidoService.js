const AppError = require('../errors/AppError');
const pedidoRepo = require('../repositories/pedidoRepository');

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'entregado', 'cancelado'];

const _validarDatosCliente = (nombre_cliente, telefono) => {
  if (!nombre_cliente || typeof nombre_cliente !== 'string' || nombre_cliente.trim().length < 2 || nombre_cliente.trim().length > 100)
    throw new AppError('Nombre inválido (2-100 caracteres)', 400);
  if (!telefono || typeof telefono !== 'string' || !/^\d{7,20}$/.test(telefono.trim()))
    throw new AppError('Teléfono inválido (solo dígitos, 7-20 caracteres)', 400);
};

const registrar = async ({ nombre_cliente, telefono, notas, items, cupon }) => {
  _validarDatosCliente(nombre_cliente, telefono);

  if (!Array.isArray(items) || items.length === 0 || items.length > 50)
    throw new AppError('Items inválidos', 400);
  for (const item of items) {
    if (!item.id || !Number.isInteger(item.id) || item.id <= 0)
      throw new AppError('ID de producto inválido en items', 400);
    if (!item.cant || !Number.isInteger(item.cant) || item.cant <= 0 || item.cant > 999)
      throw new AppError('Cantidad inválida en items', 400);
  }
  if (notas !== undefined && notas !== null && (typeof notas !== 'string' || notas.length > 500))
    throw new AppError('Notas demasiado largas (máx. 500 caracteres)', 400);

  try {
    return await pedidoRepo.registrar({
      nombre_cliente: nombre_cliente.trim(),
      telefono: telefono.trim(),
      notas: notas?.trim() || null,
      itemsJson: JSON.stringify(items),
      cupon: cupon?.trim() || null,
    });
  } catch (err) {
    if (err.sqlState === '45000')
      throw new AppError(err.sqlMessage || 'Error al registrar pedido', 400);
    throw err;
  }
};

const validarCupon = async (codigo, total) => {
  if (!codigo || typeof codigo !== 'string' || codigo.trim().length === 0 || codigo.trim().length > 50)
    throw new AppError('Código de cupón inválido', 400);
  if (total === undefined || isNaN(parseFloat(total)) || parseFloat(total) < 0)
    throw new AppError('Total inválido', 400);

  const resultado = await pedidoRepo.validarCupon(codigo.trim().toUpperCase(), parseFloat(total));
  if (!resultado) throw new AppError('Cupón no encontrado', 404);
  return resultado;
};

const getAdmin = () => pedidoRepo.findAdmin();

const getDetalle = (id) => pedidoRepo.findDetalle(id);

const cambiarEstado = async (id, estado, adminId) => {
  const parsedId = parseInt(id);
  if (!ESTADOS_VALIDOS.includes(estado)) throw new AppError('Estado inválido', 400);
  if (isNaN(parsedId)) throw new AppError('ID inválido', 400);

  const pedido = await pedidoRepo.findEstado(parsedId);
  if (!pedido) throw new AppError('Pedido no encontrado', 404);

  if (pedido.estado === 'cancelado')
    throw new AppError('No se puede modificar un pedido cancelado', 400);
  if (pedido.estado === 'entregado' && estado === 'cancelado')
    throw new AppError('No se puede cancelar un pedido que ya fue entregado', 400);

  if (estado === 'cancelado') {
    await pedidoRepo.cancelarConStock(parsedId);
  } else {
    await pedidoRepo.cambiarEstado(parsedId, estado, adminId);
  }
};

const editar = async (id, notas) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) throw new AppError('ID inválido', 400);
  if (notas !== undefined && notas !== null && (typeof notas !== 'string' || notas.length > 500))
    throw new AppError('Notas demasiado largas (máx. 500 caracteres)', 400);
  await pedidoRepo.editar(parsedId, notas?.trim() || null);
};

module.exports = { registrar, validarCupon, getAdmin, getDetalle, cambiarEstado, editar };
