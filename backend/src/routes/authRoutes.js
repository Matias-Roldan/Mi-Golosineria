const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { login, me } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos de login. Esperá 1 minuto.' },
});

router.post('/login', loginLimiter, login);
router.get('/me', auth, me);

module.exports = router;