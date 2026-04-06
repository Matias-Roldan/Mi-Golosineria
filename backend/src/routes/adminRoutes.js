const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.get('/kpis', auth, ctrl.getKpis);
router.get('/ventas-diarias', auth, ctrl.getVentasDiarias);
router.get('/top-productos', auth, ctrl.getTopProductos);
router.get('/heatmap', auth, ctrl.getHeatmapHorarios);
router.get('/categorias', auth, ctrl.getCategorias);

module.exports = router;