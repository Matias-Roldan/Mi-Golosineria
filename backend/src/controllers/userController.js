const clienteService = require('../services/clienteService');
const { success, created } = require('../utils/response');

exports.getClientes = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    success(res, await clienteService.getAll({ page, limit, search }));
  } catch (err) { next(err); }
};

exports.getPerfilCliente = async (req, res, next) => {
  try {
    success(res, await clienteService.getPerfil(req.params.id));
  } catch (err) { next(err); }
};

exports.editarCliente = async (req, res, next) => {
  try {
    await clienteService.editar(req.params.id, req.body);
    success(res, { mensaje: 'Cliente actualizado' });
  } catch (err) { next(err); }
};

exports.crearCliente = async (req, res, next) => {
  try {
    const id = await clienteService.crear(req.body);
    created(res, { mensaje: 'Cliente creado', id });
  } catch (err) { next(err); }
};
