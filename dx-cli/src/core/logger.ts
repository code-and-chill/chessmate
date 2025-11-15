// Provide a lightweight logger implementation for Jest (ESM packages like chalk break Jest by default).
// In normal runtime we use pino + chalk; under Jest we export a minimal console-backed logger.

const isJest = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID;

let logger: any;
let serviceLoggerFn: ((serviceName: string) => any) | null = null;

if (isJest) {
  logger = {
    info: (msg: string, ...args: any[]) => console.log(msg, ...args),
    debug: (msg: string, ...args: any[]) => console.debug(msg, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(msg, ...args),
    error: (msg: string, ...args: any[]) => console.error(msg, ...args),
    success: (msg: string, ...args: any[]) => console.log(msg, ...args),
  };

  serviceLoggerFn = (serviceName: string) => {
    const prefix = `[${serviceName}]`;
    return {
      info: (msg: string) => logger.info(`${prefix} ${msg}`),
      debug: (msg: string) => logger.debug(`${prefix} ${msg}`),
      warn: (msg: string) => logger.warn(`${prefix} ${msg}`),
      error: (msg: string, err?: Error) => logger.error(`${prefix} ${msg}`, err),
      success: (msg: string) => logger.success(`${prefix} ${msg}`),
    };
  };
} else {
  // Normal runtime: use pino and chalk
  const pino = require('pino');

  const isDev = process.env.NODE_ENV === "development";
  const logLevel = process.env.DX_LOG_LEVEL || "info";

  const transport = pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      singleLine: false,
      customLevels: {
        success: 25,
      },
    },
  });

  logger = pino(
    {
      level: logLevel,
      customLevels: {
        success: 25,
      },
      useOnlyCustomLevels: false,
    },
    transport
  );

  // Add a success level helper using info (color handled by pino-pretty)
  const successFn = (msg: string, ...args: any[]) => {
    logger.info(msg, ...args);
  };

  (logger as any).success = successFn;

  /**
   * Log with service prefix
   */
  serviceLoggerFn = (serviceName: string) => {
    const prefix = `[${serviceName}]`;
    return {
      info: (msg: string) => logger.info(`${prefix} ${msg}`),
      debug: (msg: string) => logger.debug(`${prefix} ${msg}`),
      warn: (msg: string) => logger.warn(`${prefix} ${msg}`),
      error: (msg: string, err?: Error) => logger.error(`${prefix} ${msg}`, err),
      success: (msg: string) => (logger.success as any)(`${prefix} ${msg}`),
    };
  };
}

export { logger };
export function serviceLogger(serviceName: string) {
  return serviceLoggerFn ? serviceLoggerFn(serviceName) : logger;
}
