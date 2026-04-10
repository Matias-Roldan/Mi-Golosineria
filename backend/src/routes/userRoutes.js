const router = require('express').Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const ctrl = require('../controllers/userController');

router.get('/', auth, isAdmin, ctrl.getClientes);
router.post('/', auth, isAdmin, ctrl.crearCliente);
router.get('/:id/perfil', auth, isAdmin, ctrl.getPerfilCliente);
router.put('/:id', auth, isAdmin, ctrl.editarCliente);

module.exports = router;