const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'hustlehub-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, meta }) => {
          return `[${timestamp}] ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
        })
      )
    }),
    new transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '../logs/combined.log') })
  ]
});

// Safe Cloud Logging Transport (Logtail)
if (process.env.LOGTAIL_TOKEN) {
  try {
    const { Logtail } = require('@logtail/node');
    const { LogtailTransport } = require('@logtail/winston');
    const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
    logger.add(new LogtailTransport(logtail));
  } catch (err) {
    console.warn('Logtail optional dependencies not loaded, falling back to local transports.');
  }
}

module.exports = logger;