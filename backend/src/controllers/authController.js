const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios_admin WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nombre: admin.nombre, rol: admin.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.me = (req, res) => {
  res.json({ admin: req.admin });
};