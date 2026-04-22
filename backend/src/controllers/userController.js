const clienteService = require('../services/clienteService');

exports.getClientes = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    res.json(await clienteService.getAll({ page, limit, search }));
  } catch (err) { next(err); }
};

exports.getPerfilCliente = async (req, res, next) => {
  try {
    res.json(await clienteService.getPerfil(req.params.id));
  } catch (err) { next(err); }
};

exports.editarCliente = async (req, res, next) => {
  try {
    await clienteService.editar(req.params.id, req.body);
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (err) { next(err); }
};

exports.crearCliente = async (req, res, next) => {
  try {
    const id = await clienteService.crear(req.body);
    res.status(201).json({ mensaje: 'Cliente creado', id });
  } catch (err) { next(err); }
};
