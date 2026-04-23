const AppError = require('../errors/AppError');

// Errores conocidos de MySQL mapeados a mensajes genéricos en español
const MYSQL_ERROR_MESSAGES = {
  1062: 'Ya existe un registro con esos datos.',
  1452: 'El registro referenciado no existe.',
  1451: 'No se puede eliminar porque tiene registros asociados.',
  1406: 'El valor ingresado supera el límite permitido.',
  1048: 'Falta un campo requerido.',
};

const sanitizeDbError = (err) => {
  // Errores lanzados por stored procedures con SIGNAL SQLSTATE '45000'
  // son mensajes de negocio intencionales, se pasan al cliente tal cual
  if (err.sqlState === '45000') throw new AppError(err.message, 400);

  const mensaje = MYSQL_ERROR_MESSAGES[err.errno] ?? 'Error en la base de datos';
  throw new AppError(mensaje, 500);
};

module.exports = { sanitizeDbError };
