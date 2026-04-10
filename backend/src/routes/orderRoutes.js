const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const ctrl = require('../controllers/orderController');

// Rate limit para endpoints públicos de la tienda
const publicLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20,
  message: { error: 'Demasiadas solicitudes, intentá más tarde.' },
});

// Pública (tienda)
router.post('/', publicLimiter, ctrl.registrarPedido);
router.post('/validar-cupon', publicLimiter, ctrl.validarCupon);

// Admin (protegidas: autenticación + rol admin)
router.get('/admin', auth, isAdmin, ctrl.getPedidosAdmin);
router.get('/admin/:id', auth, isAdmin, ctrl.getDetallePedido);
router.patch('/admin/:id/estado', auth, isAdmin, ctrl.cambiarEstado);
router.put('/admin/:id', auth, isAdmin, ctrl.editarPedido);

module.exports = router;