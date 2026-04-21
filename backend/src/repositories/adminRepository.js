const pool = require('../config/db');

const getKpis = async () => {
  const [rows] = await pool.query('CALL sp_get_kpis_mensuales()');
  return rows[0][0];
};

const getVentasDiarias = async () => {
  const [rows] = await pool.query('CALL sp_chart_ventas_diarias()');
  return rows[0];
};

const getTopProductos = async () => {
  const [rows] = await pool.query('CALL sp_chart_top_productos()');
  return rows[0];
};

const getHeatmapHorarios = async () => {
  const [rows] = await pool.query('CALL sp_chart_heatmap_horarios()');
  return rows[0];
};

const getCategorias = async () => {
  const [rows] = await pool.query(
    'SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY nombre ASC'
  );
  return rows;
};

const getPareto = async () => {
  const [rows] = await pool.query('CALL sp_analisis_pareto_productos()');
  return rows[0];
};

const getRFM = async () => {
  const [rows] = await pool.query('CALL sp_analisis_rfm_clientes()');
  return rows[0];
};

const getSaludStock = async () => {
  const [rows] = await pool.query('CALL sp_reporte_salud_stock()');
  return rows[0];
};

const getElasticidadPrecio = async (productoId) => {
  const [rows] = await pool.query('CALL sp_analisis_elasticidad_precio(?)', [productoId]);
  return rows[0][0] || null;
};

const getCrossSelling = async () => {
  const [rows] = await pool.query('CALL sp_analisis_cross_selling()');
  return rows[0];
};

const getPuntoEquilibrio = async (costosFijos) => {
  const [rows] = await pool.query('CALL sp_analisis_punto_equilibrio(?)', [costosFijos]);
  return rows[0][0] || null;
};

const getEstacionalidad = async () => {
  const [rows] = await pool.query('CALL sp_analisis_estacionalidad_categorias()');
  return rows[0];
};

module.exports = {
  getKpis, getVentasDiarias, getTopProductos, getHeatmapHorarios,
  getCategorias, getPareto, getRFM, getSaludStock,
  getElasticidadPrecio, getCrossSelling, getPuntoEquilibrio, getEstacionalidad,
};
