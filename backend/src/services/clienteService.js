const AppError = require('../errors/AppError');
const clienteRepo = require('../repositories/clienteRepository');

const _validarDatosCliente = (nombre, telefono, email) => {
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100)
    throw new AppError('Nombre inválido (2-100 caracteres)', 400);
  if (!telefono || typeof telefono !== 'string' || !/^\d{7,20}$/.test(telefono.trim()))
    throw new AppError('Teléfono inválido (solo dígitos, 7-20 caracteres)', 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AppError('Email inválido', 400);
};

const getAll = async ({ page, limit, search } = {}) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const [data, total] = await Promise.all([
    clienteRepo.findAll({ page: parsedPage, limit: parsedLimit, search }),
    clienteRepo.count({ search }),
  ]);
  return { data, total, page: parsedPage, limit: parsedLimit };
};

const getPerfil = (id) => clienteRepo.findPerfil(id);

const editar = async (id, { nombre, telefono, direccion, email }) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) throw new AppError('ID inválido', 400);
  _validarDatosCliente(nombre, telefono, email);
  await clienteRepo.editar(parsedId, {
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    direccion: direccion?.trim() || null,
    email: email?.trim() || null,
  });
};

const crear = async ({ nombre, telefono, direccion, email }) => {
  _validarDatosCliente(nombre, telefono, email);
  return clienteRepo.crear({
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    direccion: direccion?.trim() || null,
    email: email?.trim() || null,
  });
};

module.exports = { getAll, getPerfil, editar, crear };
