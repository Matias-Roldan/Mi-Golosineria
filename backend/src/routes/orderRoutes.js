const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

// Pública (tienda)
router.post('/', ctrl.registrarPedido);

// Admin (protegidas)
router.get('/admin', auth, ctrl.getPedidosAdmin);
router.get('/admin/:id', auth, ctrl.getDetallePedido);
router.patch('/admin/:id/estado', auth, ctrl.cambiarEstado);

module.exports = router;