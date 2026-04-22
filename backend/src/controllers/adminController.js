const adminService = require('../services/adminService');

const wrap = (fn) => async (req, res, next) => {
  try { res.json(await fn(req)); } catch (err) { next(err); }
};

exports.getKpis = wrap(adminService.getKpis);
exports.getVentasDiarias = wrap(adminService.getVentasDiarias);
exports.getTopProductos = wrap(adminService.getTopProductos);
exports.getHeatmapHorarios = wrap(adminService.getHeatmapHorarios);
exports.getCategorias = wrap(adminService.getCategorias);
exports.getAnalisisPareto = wrap(adminService.getPareto);
exports.getAnalisisRFM = wrap(adminService.getRFM);
exports.getSaludStock = wrap(adminService.getSaludStock);
exports.getCrossSelling = wrap(adminService.getCrossSelling);
exports.getEstacionalidadCategorias = wrap(adminService.getEstacionalidad);

exports.getElasticidadPrecio = wrap((req) => adminService.getElasticidadPrecio(req.params.producto_id));
exports.getPuntoEquilibrio = wrap((req) => adminService.getPuntoEquilibrio(req.query.costos_fijos));
