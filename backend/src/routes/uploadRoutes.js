const router = require('express').Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const imageService = require('../services/imageService');
const { success, error } = require('../utils/response');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const uploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de subida, intentá más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', auth, uploadRateLimit, upload.single('imagen'), async (req, res, next) => {
  if (!req.file) return error(res, 'No se recibió ninguna imagen', 400);
  try {
    const { url } = await imageService.upload(req.file.buffer);
    success(res, { url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
