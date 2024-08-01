import winston from 'winston';

const getFileName = (path, name) => {
  const date = new Date().toISOString().split('T')[0];
  return `${path}/${date}-${name}`;
};
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: getFileName('logs/error', 'error.log'), level: 'error',
    }),
    new winston.transports.File({ filename: getFileName('logs/info', 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: getFileName('logs/combined', 'combined.log') }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
export default logger;
