const logger = require('../config/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - start}ms`,
    });
  });

  next();
}

module.exports = requestLogger;
