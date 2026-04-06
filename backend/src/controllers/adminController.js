const pool = require('../config/db');

exports.getKpis = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_get_kpis_mensuales()');
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener KPIs' });
  }
};

exports.getVentasDiarias = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_chart_ventas_diarias()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ventas diarias' });
  }
};

exports.getTopProductos = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_chart_top_productos()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener top productos' });
  }
};

exports.getHeatmapHorarios = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_chart_heatmap_horarios()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener heatmap' });
  }
};