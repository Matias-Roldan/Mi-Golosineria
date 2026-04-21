const AppError = require('../errors/AppError');
const productoRepo = require('../repositories/productoRepository');

const getDisponibles = () => productoRepo.findDisponibles();

const filtrarPorCategoria = (categoriaId) => {
  const id = parseInt(categoriaId);
  if (isNaN(id)) throw new AppError('ID de categoría inválido', 400);
  return productoRepo.findPorCategoria(id);
};

const getAdmin = () => productoRepo.findAdmin();

const _validarCamposProducto = ({ nombre, precio, precio_costo, categoria, stock }) => {
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 150)
    throw new AppError('Nombre inválido (2-150 caracteres)', 400);
  if (precio === undefined || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0)
    throw new AppError('El precio de venta debe ser mayor a 0', 400);
  if (precio_costo === undefined || isNaN(parseFloat(precio_costo)) || parseFloat(precio_costo) < 0)
    throw new AppError('El precio de costo no puede ser negativo', 400);
  if (!categoria || typeof categoria !== 'string')
    throw new AppError('Categoría requerida', 400);
  if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0)
    throw new AppError('Stock inválido', 400);
};

const crear = async ({ nombre, descripcion, precio, precio_costo, categoria, stock, imagen_url }) => {
  _validarCamposProducto({ nombre, precio, precio_costo, categoria, stock });
  await productoRepo.crear({
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || null,
    precio: parseFloat(precio),
    precio_costo: parseFloat(precio_costo),
    categoria,
    stock: parseInt(stock),
    imagen_url: imagen_url || null,
  });
};

const editar = async (id, { nombre, precio, precio_costo, categoria, stock, imagen_url }) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) throw new AppError('ID inválido', 400);

  if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 150))
    throw new AppError('Nombre inválido (2-150 caracteres)', 400);
  if (precio !== undefined && (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0))
    throw new AppError('El precio de venta debe ser mayor a 0', 400);
  if (precio_costo !== undefined && (isNaN(parseFloat(precio_costo)) || parseFloat(precio_costo) < 0))
    throw new AppError('El precio de costo no puede ser negativo', 400);
  if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0))
    throw new AppError('Stock inválido', 400);

  await productoRepo.editar(parsedId, {
    nombre: nombre?.trim(),
    precio: parseFloat(precio),
    precio_costo: parseFloat(precio_costo),
    categoria,
    stock: parseInt(stock),
    imagen_url: imagen_url || null,
  });
};

const eliminar = (id) => productoRepo.eliminar(id);

const toggleVisibilidad = (id) => productoRepo.toggleVisibilidad(id);

module.exports = { getDisponibles, filtrarPorCategoria, getAdmin, crear, editar, eliminar, toggleVisibilidad };
