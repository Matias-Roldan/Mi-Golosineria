const router = require('express').Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/', auth, upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  res.json({ url: req.file.path });
});

module.exports = router;