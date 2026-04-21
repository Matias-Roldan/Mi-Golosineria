const productoService = require('../services/productoService');

exports.getProductosDisponibles = async (req, res, next) => {
  try {
    res.json(await productoService.getDisponibles());
  } catch (err) { next(err); }
};

exports.filtrarPorCategoria = async (req, res, next) => {
  try {
    res.json(await productoService.filtrarPorCategoria(req.params.id));
  } catch (err) { next(err); }
};

exports.getProductosAdmin = async (req, res, next) => {
  try {
    res.json(await productoService.getAdmin());
  } catch (err) { next(err); }
};

exports.crearProducto = async (req, res, next) => {
  try {
    await productoService.crear(req.body);
    res.status(201).json({ mensaje: 'Producto creado exitosamente' });
  } catch (err) { next(err); }
};

exports.editarProducto = async (req, res, next) => {
  try {
    await productoService.editar(req.params.id, req.body);
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) { next(err); }
};

exports.eliminarProducto = async (req, res, next) => {
  try {
    await productoService.eliminar(req.params.id);
    res.json({ mensaje: 'Producto eliminado (soft delete)' });
  } catch (err) { next(err); }
};

exports.toggleVisibilidad = async (req, res, next) => {
  try {
    await productoService.toggleVisibilidad(req.params.id);
    res.json({ mensaje: 'Visibilidad actualizada' });
  } catch (err) { next(err); }
};
