const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/productController');

// Públicas (tienda)
router.get('/', ctrl.getProductosDisponibles);
router.get('/categoria/:categoria', ctrl.filtrarPorCategoria);

// Admin (protegidas)
router.get('/admin', auth, ctrl.getProductosAdmin);
router.post('/admin', auth, ctrl.crearProducto);
router.put('/admin/:id', auth, ctrl.editarProducto);
router.delete('/admin/:id', auth, ctrl.eliminarProducto);
router.patch('/admin/:id/visibilidad', auth, ctrl.toggleVisibilidad);

module.exports = router;