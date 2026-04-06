const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/', auth, ctrl.getClientes);
router.post('/', auth, ctrl.crearCliente); 
router.get('/:id/perfil', auth, ctrl.getPerfilCliente);
router.put('/:id', auth, ctrl.editarCliente);


module.exports = router;