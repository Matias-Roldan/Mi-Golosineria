const AppError = require('../errors/AppError');
const adminRepo = require('../repositories/adminRepository');

const getKpis = () => adminRepo.getKpis();
const getVentasDiarias = () => adminRepo.getVentasDiarias();
const getTopProductos = () => adminRepo.getTopProductos();
const getHeatmapHorarios = () => adminRepo.getHeatmapHorarios();
const getCategorias = () => adminRepo.getCategorias();
const getPareto = () => adminRepo.getPareto();
const getRFM = () => adminRepo.getRFM();
const getSaludStock = () => adminRepo.getSaludStock();
const getCrossSelling = () => adminRepo.getCrossSelling();
const getEstacionalidad = () => adminRepo.getEstacionalidad();
const getEstadoResultados = () => adminRepo.getEstadoResultados();

const getElasticidadPrecio = (productoId) => {
  if (!productoId || isNaN(productoId))
    throw new AppError('producto_id inválido', 400);
  return adminRepo.getElasticidadPrecio(Number(productoId));
};

const getPuntoEquilibrio = (costosFijos) => {
  if (!costosFijos || isNaN(costosFijos))
    throw new AppError('costos_fijos es requerido y debe ser un número', 400);
  return adminRepo.getPuntoEquilibrio(Number(costosFijos));
};

module.exports = {
  getKpis, getVentasDiarias, getTopProductos, getHeatmapHorarios,
  getCategorias, getPareto, getRFM, getSaludStock,
  getElasticidadPrecio, getCrossSelling, getPuntoEquilibrio, getEstacionalidad,
  getEstadoResultados,
};
