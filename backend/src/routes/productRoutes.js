const router = require('express').Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const ctrl = require('../controllers/productController');

// Públicas (tienda)
router.get('/', ctrl.getProductosDisponibles);
router.get('/categoria/:id', ctrl.filtrarPorCategoria);

// Admin (protegidas: autenticación + rol admin)
router.get('/admin', auth, isAdmin, ctrl.getProductosAdmin);
router.post('/admin', auth, isAdmin, ctrl.crearProducto);
router.put('/admin/:id', auth, isAdmin, ctrl.editarProducto);
router.delete('/admin/:id', auth, isAdmin, ctrl.eliminarProducto);
router.patch('/admin/:id/visibilidad', auth, isAdmin, ctrl.toggleVisibilidad);

module.exports = router;