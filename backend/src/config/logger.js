const { createLogger, format, transports } = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

const productionFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const developmentFormat = format.combine(
  format.timestamp({ format: 'HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${extras}`;
  })
);

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? productionFormat : developmentFormat,
  transports: [new transports.Console()],
});

module.exports = logger;
