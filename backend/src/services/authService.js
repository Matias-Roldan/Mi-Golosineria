const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const authRepo = require('../repositories/authRepository');

const login = async (email, password) => {
  if (!email || !password)
    throw new AppError('Email y contraseña requeridos', 400);

  const admin = await authRepo.findByEmail(email);
  if (!admin)
    throw new AppError('Credenciales inválidas', 401);

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid)
    throw new AppError('Credenciales inválidas', 401);

  const token = jwt.sign(
    { id: admin.id, email: admin.email, nombre: admin.nombre, rol: admin.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol },
  };
};

module.exports = { login };
