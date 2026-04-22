const VARIABLES_REQUERIDAS = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

function validateEnv() {
  const faltantes = VARIABLES_REQUERIDAS.filter((v) => process.env[v] === undefined);

  if (faltantes.length > 0) {
    console.error('ERROR: Faltan variables de entorno requeridas:');
    faltantes.forEach((v) => console.error(`  - ${v}`));
    console.error('Revisá el archivo .env y asegurate de definir todas las variables.');
    process.exit(1);
  }
}

module.exports = { validateEnv };
