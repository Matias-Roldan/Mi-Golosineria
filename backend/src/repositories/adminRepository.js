const pool = require('../config/db');
const AppError = require('../errors/AppError');

const handleDbError = (err) => {
  if (err.sqlState === '45000') throw new AppError(err.message, 400);
  throw new AppError('Error de base de datos', 500);
};

const getKpis = async () => {
  try {
    const [rows] = await pool.query('CALL sp_get_kpis_mensuales()');
    return rows[0][0];
  } catch (err) { handleDbError(err); }
};

const getVentasDiarias = async () => {
  try {
    const [rows] = await pool.query('CALL sp_chart_ventas_diarias()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getTopProductos = async () => {
  try {
    const [rows] = await pool.query('CALL sp_chart_top_productos()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getHeatmapHorarios = async () => {
  try {
    const [rows] = await pool.query('CALL sp_chart_heatmap_horarios()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getCategorias = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY nombre ASC'
    );
    return rows;
  } catch (err) { handleDbError(err); }
};

const getPareto = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_pareto_productos()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getRFM = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_rfm_clientes()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getSaludStock = async () => {
  try {
    const [rows] = await pool.query('CALL sp_reporte_salud_stock()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getElasticidadPrecio = async (productoId) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_elasticidad_precio(?)', [productoId]);
    return rows[0][0] || null;
  } catch (err) { handleDbError(err); }
};

const getCrossSelling = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_cross_selling()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

const getPuntoEquilibrio = async (costosFijos) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_punto_equilibrio(?)', [costosFijos]);
    return rows[0][0] || null;
  } catch (err) { handleDbError(err); }
};

const getEstacionalidad = async () => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_estacionalidad_categorias()');
    return rows[0];
  } catch (err) { handleDbError(err); }
};

module.exports = {
  getKpis, getVentasDiarias, getTopProductos, getHeatmapHorarios,
  getCategorias, getPareto, getRFM, getSaludStock,
  getElasticidadPrecio, getCrossSelling, getPuntoEquilibrio, getEstacionalidad,
};
