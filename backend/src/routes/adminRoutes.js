const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

// ─── Rutas existentes ──────────────────────────────────────────────────────

router.get('/kpis',           auth, ctrl.getKpis);
router.get('/ventas-diarias', auth, ctrl.getVentasDiarias);
router.get('/top-productos',  auth, ctrl.getTopProductos);
router.get('/heatmap',        auth, ctrl.getHeatmapHorarios);
router.get('/categorias',     auth, ctrl.getCategorias);

// ─── Nuevas rutas ──────────────────────────────────────────────────────────

router.get('/analisis/pareto',                    auth, ctrl.getAnalisisPareto);
router.get('/analisis/rfm',                       auth, ctrl.getAnalisisRFM);
router.get('/analisis/stock',                     auth, ctrl.getSaludStock);
router.get('/analisis/elasticidad/:producto_id',  auth, ctrl.getElasticidadPrecio);
router.get('/analisis/cross-selling',             auth, ctrl.getCrossSelling);
router.get('/analisis/punto-equilibrio',          auth, ctrl.getPuntoEquilibrio);
router.get('/analisis/estacionalidad',            auth, ctrl.getEstacionalidadCategorias);

module.exports = router;