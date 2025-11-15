import pino from "pino";
import chalk from "chalk";

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

const logger = pino(
  {
    level: logLevel,
    customLevels: {
      success: 25,
    },
    useOnlyCustomLevels: false,
  },
  transport
);

// Add a success level helper using info with prefix
const successFn = (msg: string, ...args: any[]) => {
  logger.info(chalk.green(msg), ...args);
};

(logger as any).success = successFn;

export { logger };

/**
 * Log with service prefix
 */
export function serviceLogger(serviceName: string) {
  const prefix = chalk.dim(`[${serviceName}]`);
  return {
    info: (msg: string) => logger.info(`${prefix} ${msg}`),
    debug: (msg: string) => logger.debug(`${prefix} ${msg}`),
    warn: (msg: string) => logger.warn(`${prefix} ${msg}`),
    error: (msg: string, err?: Error) => logger.error(`${prefix} ${msg}`, err),
    success: (msg: string) => (logger.success as any)(`${prefix} ${msg}`),
  };
}
