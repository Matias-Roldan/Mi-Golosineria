const pedidoService = require('../services/pedidoService');

exports.registrarPedido = async (req, res, next) => {
  try {
    const pedidoId = await pedidoService.registrar(req.body);
    res.status(201).json({ mensaje: 'Pedido registrado', pedido_id: pedidoId });
  } catch (err) { next(err); }
};

exports.getPedidosAdmin = async (req, res, next) => {
  try {
    const { page, limit, search, estado } = req.query;
    res.json(await pedidoService.getAdmin({ page, limit, search, estado }));
  } catch (err) { next(err); }
};

exports.getDetallePedido = async (req, res, next) => {
  try {
    res.json(await pedidoService.getDetalle(req.params.id));
  } catch (err) { next(err); }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    await pedidoService.cambiarEstado(req.params.id, req.body.estado, req.admin.id);
    res.json({ mensaje: `Estado actualizado a: ${req.body.estado}` });
  } catch (err) { next(err); }
};

exports.editarPedido = async (req, res, next) => {
  try {
    await pedidoService.editar(req.params.id, req.body.notas);
    res.json({ mensaje: 'Pedido actualizado' });
  } catch (err) { next(err); }
};

exports.validarCupon = async (req, res, next) => {
  try {
    res.json(await pedidoService.validarCupon(req.body.codigo, req.body.total));
  } catch (err) { next(err); }
};
