const pedidoService = require('../services/pedidoService');
const { success, created } = require('../utils/response');

exports.registrarPedido = async (req, res, next) => {
  try {
    const pedidoId = await pedidoService.registrar(req.body);
    created(res, { mensaje: 'Pedido registrado', pedido_id: pedidoId });
  } catch (err) { next(err); }
};

exports.getPedidosAdmin = async (req, res, next) => {
  try {
    const { page, limit, search, estado } = req.query;
    success(res, await pedidoService.getAdmin({ page, limit, search, estado }));
  } catch (err) { next(err); }
};

exports.getDetallePedido = async (req, res, next) => {
  try {
    success(res, await pedidoService.getDetalle(req.params.id));
  } catch (err) { next(err); }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    await pedidoService.cambiarEstado(req.params.id, req.body.estado, req.admin.id);
    success(res, { mensaje: `Estado actualizado a: ${req.body.estado}` });
  } catch (err) { next(err); }
};

exports.editarPedido = async (req, res, next) => {
  try {
    await pedidoService.editar(req.params.id, req.body.notas);
    success(res, { mensaje: 'Pedido actualizado' });
  } catch (err) { next(err); }
};

exports.validarCupon = async (req, res, next) => {
  try {
    success(res, await pedidoService.validarCupon(req.body.codigo, req.body.total));
  } catch (err) { next(err); }
};
