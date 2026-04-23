const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

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

const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxFiles: '14d',
      zippedArchive: true,
    }),
    new transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

module.exports = logger;
