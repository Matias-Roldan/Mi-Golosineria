const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('./logger');

const RECONNECTABLE_CODES = new Set(['PROTOCOL_CONNECTION_LOST', 'ECONNREFUSED']);
const MAX_RETRIES = 3;

const createPool = () =>
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let pool = createPool();

const attachErrorHandler = (targetPool, attempt = 0) => {
  targetPool.pool.on('error', async (err) => {
    logger.error('MySQL pool error', { code: err.code, message: err.message });

    if (!RECONNECTABLE_CODES.has(err.code)) return;

    if (attempt >= MAX_RETRIES) {
      logger.error('MySQL reconnection failed after max retries — shutting down', { attempts: MAX_RETRIES });
      process.exit(1);
    }

    const delay = Math.pow(2, attempt) * 1000;
    logger.warn(`MySQL reconnecting in ${delay}ms`, { attempt: attempt + 1, maxRetries: MAX_RETRIES });
    await sleep(delay);

    pool = createPool();
    attachErrorHandler(pool, attempt + 1);
  });
};

attachErrorHandler(pool);

module.exports = pool;
