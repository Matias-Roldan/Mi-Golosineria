const productoService = require('../services/productoService');
const { success, created } = require('../utils/response');

exports.getProductosDisponibles = async (req, res, next) => {
  try {
    success(res, await productoService.getDisponibles());
  } catch (err) { next(err); }
};

exports.filtrarPorCategoria = async (req, res, next) => {
  try {
    success(res, await productoService.filtrarPorCategoria(req.params.id));
  } catch (err) { next(err); }
};

exports.getProductosAdmin = async (req, res, next) => {
  try {
    const { page, limit, search, categoria } = req.query;
    success(res, await productoService.getAdmin({ page, limit, search, categoria }));
  } catch (err) { next(err); }
};

exports.crearProducto = async (req, res, next) => {
  try {
    await productoService.crear(req.body);
    created(res, { mensaje: 'Producto creado exitosamente' });
  } catch (err) { next(err); }
};

exports.editarProducto = async (req, res, next) => {
  try {
    await productoService.editar(req.params.id, req.body);
    success(res, { mensaje: 'Producto actualizado' });
  } catch (err) { next(err); }
};

exports.eliminarProducto = async (req, res, next) => {
  try {
    await productoService.eliminar(req.params.id);
    success(res, { mensaje: 'Producto eliminado (soft delete)' });
  } catch (err) { next(err); }
};

exports.toggleVisibilidad = async (req, res, next) => {
  try {
    await productoService.toggleVisibilidad(req.params.id);
    success(res, { mensaje: 'Visibilidad actualizada' });
  } catch (err) { next(err); }
};
