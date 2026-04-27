const pool = require('../config/db');
const logger = require('../config/logger');
const { sanitizeDbError } = require('../utils/sanitizeDbError');

const getKpis = async () => {
  try {
    const [rows] = await pool.query('CALL sp_get_kpis_mensuales()');
    return rows[0][0];
  } catch (err) { logger.error('adminRepository.getKpis', { message: err.message }); sanitizeDbError(err); }
};

const getVentasDiarias = async () => {
  try {
    const [rows] = await pool.query('CALL sp_chart_ventas_diarias()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getVentasDiarias', { message: err.message }); sanitizeDbError(err); }
};

const getTopProductos = async () => {
  try {
    const [rows] = await pool.query('CALL sp_chart_top_productos()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getTopProductos', { message: err.message }); sanitizeDbError(err); }
};

const getHeatmapHorarios = async () => {
  try {
    const [rows] = await pool.query('CALL sp_chart_heatmap_horarios()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getHeatmapHorarios', { message: err.message }); sanitizeDbError(err); }
};

const getCategorias = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY nombre ASC'
    );
    return rows;
  } catch (err) { logger.error('adminRepository.getCategorias', { message: err.message }); sanitizeDbError(err); }
};

const getPareto = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_pareto_productos()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getPareto', { message: err.message }); sanitizeDbError(err); }
};

const getRFM = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_rfm_clientes()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getRFM', { message: err.message }); sanitizeDbError(err); }
};

const getSaludStock = async () => {
  try {
    const [rows] = await pool.query('CALL sp_reporte_salud_stock()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getSaludStock', { message: err.message }); sanitizeDbError(err); }
};

const getElasticidadPrecio = async (productoId) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_elasticidad_precio(?)', [productoId]);
    return rows[0][0] || null;
  } catch (err) { logger.error('adminRepository.getElasticidadPrecio', { productoId, message: err.message }); sanitizeDbError(err); }
};

const getCrossSelling = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_cross_selling()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getCrossSelling', { message: err.message }); sanitizeDbError(err); }
};

const getPuntoEquilibrio = async (costosFijos) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_punto_equilibrio(?)', [costosFijos]);
    return rows[0][0] || null;
  } catch (err) { logger.error('adminRepository.getPuntoEquilibrio', { costosFijos, message: err.message }); sanitizeDbError(err); }
};

const getEstacionalidad = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_estacionalidad_categorias()');
    return rows[0];
  } catch (err) { logger.error('adminRepository.getEstacionalidad', { message: err.message }); sanitizeDbError(err); }
};

const getEstadoResultados = async () => {
  try {
    const [rows] = await pool.query('CALL sp_estado_resultados()');
    return rows[0][0];
  } catch (err) { logger.error('adminRepository.getEstadoResultados', { message: err.message }); sanitizeDbError(err); }
};

module.exports = {
  getKpis, getVentasDiarias, getTopProductos, getHeatmapHorarios,
  getCategorias, getPareto, getRFM, getSaludStock,
  getElasticidadPrecio, getCrossSelling, getPuntoEquilibrio, getEstacionalidad,
  getEstadoResultados,
};
