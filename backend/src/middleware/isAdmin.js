module.exports = (req, res, next) => {
  const { rol } = req.admin;
  if (rol === 'superadmin' || rol === 'admin') return next();
  res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
};