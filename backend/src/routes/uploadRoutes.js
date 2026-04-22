const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de subida, intentá más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', auth, uploadRateLimit, upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  res.json({ url: req.file.path });
});

module.exports = router;