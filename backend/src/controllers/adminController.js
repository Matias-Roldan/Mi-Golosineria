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

exports.getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY nombre ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

exports.getAnalisisPareto = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_pareto_productos()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener análisis Pareto' });
  }
};

exports.getAnalisisRFM = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_rfm_clientes()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener análisis RFM de clientes' });
  }
};

exports.getSaludStock = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_reporte_salud_stock()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reporte de salud de stock' });
  }
};

exports.getElasticidadPrecio = async (req, res) => {
  try {
    const { producto_id } = req.params;

    if (!producto_id || isNaN(producto_id)) {
      return res.status(400).json({ error: 'producto_id inválido' });
    }

    const [rows] = await pool.query('CALL sp_analisis_elasticidad_precio(?)', [
      Number(producto_id),
    ]);
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener elasticidad de precio' });
  }
};

exports.getCrossSelling = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_cross_selling()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener análisis de cross-selling' });
  }
};

exports.getPuntoEquilibrio = async (req, res) => {
  try {
    const { costos_fijos } = req.query;

    if (!costos_fijos || isNaN(costos_fijos)) {
      return res.status(400).json({ error: 'costos_fijos es requerido y debe ser un número' });
    }

    const [rows] = await pool.query('CALL sp_analisis_punto_equilibrio(?)', [
      Number(costos_fijos),
    ]);
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener punto de equilibrio' });
  }
};

exports.getEstacionalidadCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_analisis_estacionalidad_categorias()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estacionalidad por categorías' });
  }
};